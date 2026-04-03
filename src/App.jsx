import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPanel from "./components/AuthPanel";
import Sidebar from "./components/Sidebar";
import InboxList from "./components/InboxList";
import ReaderPanel from "./components/ReaderPanel";
import ComposePanel from "./components/ComposePanel";

const PAGE_SIZE = 10;

export default function App() {
  const [session, setSession] = useState(null);
  const [profileLabel, setProfileLabel] = useState("");
  const [status, setStatus] = useState({ inbox: "", compose: "" });
  const [emails, setEmails] = useState([]);
  const [selectedUid, setSelectedUid] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [page, setPage] = useState(0);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showCompose, setShowCompose] = useState(true);

  useEffect(() => {
    bootstrap();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        await loadProfile(nextSession.user.id, nextSession.user.email);
        await loadInbox(0);
      } else {
        resetMailUI();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const selectedIndex = useMemo(
    () => emails.findIndex((item) => String(item.uid) === String(selectedUid)),
    [emails, selectedUid]
  );

  async function bootstrap() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("SESSION ERROR:", error.message);
      return;
    }

    setSession(data.session);

    if (data.session?.user) {
      await loadProfile(data.session.user.id, data.session.user.email);
      await loadInbox(0);
    }
  }

  async function loadProfile(userId, fallbackEmail) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("PROFILE LOAD ERROR:", error.message);
      setProfileLabel(fallbackEmail || "");
      return;
    }

    if (data?.full_name) {
      setProfileLabel(`${data.full_name} • ${data.email}`);
    } else {
      setProfileLabel(fallbackEmail || "");
    }
  }

  function resetMailUI() {
    setProfileLabel("");
    setEmails([]);
    setSelectedUid("");
    setSelectedEmail(null);
    setPage(0);
    setStatus({ inbox: "", compose: "" });
  }

  async function loadInbox(nextPage = page) {
    setLoadingInbox(true);
    setStatus((prev) => ({ ...prev, inbox: "Loading inbox..." }));

    try {
      const response = await fetch(`/.netlify/functions/readInbox?limit=${PAGE_SIZE}&page=${nextPage}`);
      const raw = await response.text();
      const data = JSON.parse(raw);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load inbox.");
      }

      setEmails(data.emails || []);
      setPage(data.page ?? nextPage);
      setStatus((prev) => ({
        ...prev,
        inbox: `Loaded ${data.count} email(s) on page ${Number(data.page) + 1}.`
      }));

      if (data.emails?.length) {
        const firstUid = String(data.emails[0].uid);
        setSelectedUid(firstUid);
        await openEmail(firstUid);
      } else {
        setSelectedUid("");
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error("INBOX ERROR:", error);
      setEmails([]);
      setSelectedUid("");
      setSelectedEmail(null);
      setStatus((prev) => ({ ...prev, inbox: error.message || "Failed to load inbox." }));
    } finally {
      setLoadingInbox(false);
    }
  }

  async function openEmail(uid) {
    setLoadingEmail(true);
    try {
      const response = await fetch(`/.netlify/functions/readEmail?uid=${encodeURIComponent(uid)}`);
      const raw = await response.text();
      const data = JSON.parse(raw);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load email.");
      }

      setSelectedUid(String(uid));
      setSelectedEmail(data.email);
    } catch (error) {
      console.error("READ EMAIL ERROR:", error);
      setSelectedEmail({
        subject: "Error",
        from: "System",
        date: "",
        text: error.message || "Failed to load email.",
        html: null
      });
    } finally {
      setLoadingEmail(false);
    }
  }

  async function nextEmail() {
    if (selectedIndex === -1) return;

    if (selectedIndex < emails.length - 1) {
      const nextUid = String(emails[selectedIndex + 1].uid);
      await openEmail(nextUid);
      return;
    }

    await loadInbox(page + 1);
  }

  async function previousEmail() {
    if (selectedIndex === -1) return;

    if (selectedIndex > 0) {
      const prevUid = String(emails[selectedIndex - 1].uid);
      await openEmail(prevUid);
      return;
    }

    if (page > 0) {
      const previousPage = page - 1;
      setLoadingInbox(true);
      try {
        const response = await fetch(`/.netlify/functions/readInbox?limit=${PAGE_SIZE}&page=${previousPage}`);
        const raw = await response.text();
        const data = JSON.parse(raw);

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load previous page.");
        }

        setEmails(data.emails || []);
        setPage(data.page ?? previousPage);
        setStatus((prev) => ({
          ...prev,
          inbox: `Loaded ${data.count} email(s) on page ${Number(data.page) + 1}.`
        }));

        if (data.emails?.length) {
          const lastUid = String(data.emails[data.emails.length - 1].uid);
          await openEmail(lastUid);
        } else {
          setSelectedUid("");
          setSelectedEmail(null);
        }
      } catch (error) {
        console.error("PREVIOUS PAGE ERROR:", error);
        setStatus((prev) => ({ ...prev, inbox: error.message || "Failed to load previous page." }));
      } finally {
        setLoadingInbox(false);
      }
    }
  }

  async function handleSignup({ fullName, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async function handleLogin({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function handleSendEmail(payload) {
    setStatus((prev) => ({ ...prev, compose: "Sending email..." }));

    const response = await fetch("/.netlify/functions/sendMail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    const data = JSON.parse(raw);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to send email.");
    }

    setStatus((prev) => ({ ...prev, compose: "Email sent successfully." }));
    return data;
  }

  return (
    <div className="app-shell">
      <Sidebar
        isLoggedIn={Boolean(session?.user)}
        profileLabel={profileLabel}
        onRefresh={() => loadInbox(page)}
        onToggleCompose={() => setShowCompose((prev) => !prev)}
        onLogout={handleLogout}
      />

      <main className="main-grid">
        {!session?.user ? (
          <AuthPanel onSignup={handleSignup} onLogin={handleLogin} />
        ) : (
          <>
            <InboxList
              emails={emails}
              selectedUid={selectedUid}
              loading={loadingInbox}
              status={status.inbox}
              page={page}
              onOpenEmail={openEmail}
              onLoadPreviousPage={() => page > 0 && loadInbox(page - 1)}
              onLoadNextPage={() => loadInbox(page + 1)}
            />

            <ReaderPanel
              email={selectedEmail}
              loading={loadingEmail}
              canGoPrevious={selectedIndex > 0 || page > 0}
              canGoNext={emails.length > 0}
              onPrevious={previousEmail}
              onNext={nextEmail}
            />

            {showCompose && (
              <ComposePanel
                status={status.compose}
                onSend={handleSendEmail}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
