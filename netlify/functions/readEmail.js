const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { success: false, message: "Method Not Allowed" });
  }

  let connection;

  try {
    const uid = event.queryStringParameters?.uid;
    if (!uid) {
      return jsonResponse(400, { success: false, message: "Missing email UID." });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return jsonResponse(500, {
        success: false,
        message: "Missing Gmail environment variables."
      });
    }

    const config = {
      imap: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        authTimeout: 10000,
        connTimeout: 10000,
        tlsTimeout: 10000,
        keepalive: false,
        tlsOptions: {
          rejectUnauthorized: false
        }
      }
    };

    connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    const messages = await connection.search(
      [["UID", uid]],
      {
        bodies: [""],
        markSeen: false,
        struct: true
      }
    );

    if (!messages.length) {
      safeClose(connection);
      return jsonResponse(404, { success: false, message: "Email not found." });
    }

    const all = messages[0].parts.find((part) => part.which === "");
    const parsed = await simpleParser(all.body);

    safeClose(connection);

    return jsonResponse(200, {
      success: true,
      email: {
        from: parsed.from?.text || "Unknown sender",
        subject: parsed.subject || "(No Subject)",
        date: parsed.date ? new Date(parsed.date).toLocaleString() : "",
        text: parsed.text || "",
        html: parsed.html || null
      }
    });
  } catch (error) {
    console.error("READ EMAIL ERROR:", error);
    safeClose(connection);
    return jsonResponse(500, {
      success: false,
      message: "Failed to read email.",
      error: error.message
    });
  }
};

function safeClose(connection) {
  if (!connection) return;
  try {
    connection.end();
  } catch {}
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
}
