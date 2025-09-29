const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendWelcomeMail = async ({ to, name }: { to: string; name: string }) => {
  const info = await transporter.sendMail({
    from: `"Cosmoscope Team" <${process.env.SMTP_USER}>`,
    to,
    subject: "🚀 Welcome to Cosmoscope!",
    html: `
      <div style="
        font-family: Arial, Helvetica, sans-serif;
        background: linear-gradient(to bottom, #0f172a, #000);
        color: #e2e8f0;
        padding: 2rem;
        border-radius: 8px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h1 style="color:#38bdf8; font-size: 2rem; margin:0;">Cosmoscope</h1>
          <p style="font-size:0.9rem; color:#94a3b8; margin:0;">Explore the universe, one click at a time</p>
        </div>

        <h2 style="color:#f8fafc; font-size:1.5rem;">Hi ${name},</h2>
        <p style="line-height:1.6; font-size:1rem; margin-top:1rem;">
          We’re thrilled to welcome you to <strong>Cosmoscope</strong>!  
          Your journey among the stars starts now. 🚀
        </p>

        <p style="line-height:1.6; font-size:1rem;">
          Head to your dashboard to explore planets, NASA’s APOD, and live ISRO launches.
          Let your curiosity orbit the cosmos.
        </p>
        <p style="font-size:0.85rem; color:#94a3b8;">
          — Kaushik patil 
        </p>
      </div>
    `,
  });

  return info;
};


export {sendWelcomeMail}
