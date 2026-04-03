const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { success: false, message: "Method Not Allowed" });
  }

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return jsonResponse(500, {
        success: false,
        message: "Missing Gmail environment variables."
      });
    }

    const { to, subject, message } = JSON.parse(event.body || "{}");

    if (!to || !subject || !message) {
      return jsonResponse(400, {
        success: false,
        message: "Fields 'to', 'subject', and 'message' are required."
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message
    });

    return jsonResponse(200, {
      success: true,
      message: "Email sent successfully."
    });
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      message: "Failed to send email.",
      error: error.message
    });
  }
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
}
