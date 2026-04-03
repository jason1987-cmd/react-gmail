const imaps = require("imap-simple");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { success: false, message: "Method Not Allowed" });
  }

  let connection;

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return jsonResponse(500, {
        success: false,
        message: "Missing Gmail environment variables."
      });
    }

    const limit = Math.max(1, parseInt(event.queryStringParameters?.limit || "10", 10));
    const page = Math.max(0, parseInt(event.queryStringParameters?.page || "0", 10));

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
      ["ALL"],
      {
        bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)"],
        struct: true,
        markSeen: false
      }
    );

    const start = Math.max(0, messages.length - (page + 1) * limit);
    const end = Math.max(0, messages.length - page * limit);
    const pageMessages = messages.slice(start, end).reverse();

    const emails = pageMessages.map((item) => {
      const headerPart = item.parts.find(
        (part) => typeof part.which === "string" && part.which.includes("HEADER.FIELDS")
      );
      const body = headerPart?.body || {};

      return {
        uid: item.attributes.uid,
        from: Array.isArray(body.from) ? body.from[0] : "Unknown sender",
        subject: Array.isArray(body.subject) ? body.subject[0] : "(No Subject)",
        date: Array.isArray(body.date) ? body.date[0] : ""
      };
    });

    safeClose(connection);

    return jsonResponse(200, {
      success: true,
      count: emails.length,
      page,
      limit,
      total: messages.length,
      emails
    });
  } catch (error) {
    console.error("IMAP ERROR:", error);
    safeClose(connection);
    return jsonResponse(500, {
      success: false,
      message: "Failed to read inbox.",
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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
