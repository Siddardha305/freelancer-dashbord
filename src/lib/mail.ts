import { Resend } from 'resend';

// Accessing the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function sendWelcomeEmail(clientEmail: string, clientName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'FreelanceOS <onboarding@resend.dev>', // Replace with your verified domain in production
      to: [clientEmail],
      subject: 'Welcome to FreelanceOS | Let\'s build something great',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .container {
                font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 24px;
                overflow: hidden;
              }
              .header {
                background-color: #4f46e5;
                padding: 40px;
                text-align: center;
              }
              .logo {
                width: 48px;
                height: 48px;
                background: #ffffff;
                border-radius: 12px;
                display: inline-block;
                line-height: 48px;
                font-weight: bold;
                color: #4f46e5;
                font-size: 24px;
                margin-bottom: 16px;
              }
              .content {
                padding: 40px;
                color: #1e293b;
                line-height: 1.6;
              }
              .footer {
                padding: 30px;
                background-color: #f8fafc;
                text-align: center;
                font-size: 12px;
                color: #64748b;
                border-top: 1px solid #f1f5f9;
              }
              .button {
                display: inline-block;
                padding: 14px 28px;
                background-color: #4f46e5;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 12px;
                font-weight: bold;
                margin-top: 24px;
              }
              .badge {
                display: inline-block;
                padding: 4px 12px;
                background-color: #e0e7ff;
                color: #4338ca;
                border-radius: 100px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-bottom: 16px;
              }
            </style>
          </head>
          <body style="background-color: #f1f5f9; padding: 40px 0;">
            <div class="container">
              <div class="header">
                <div class="logo">F</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; tracking: -0.025em;">FreelanceOS Premium</h1>
              </div>
              <div class="content">
                <div class="badge">New Client Onboarding</div>
                <h2 style="font-size: 28px; margin: 0 0 16px 0; color: #0f172a;">Welcome, ${clientName}!</h2>
                <p style="font-size: 16px; margin-bottom: 24px;">
                  We are thrilled to have you on board. Your profile has been successfully integrated into our 
                  <strong>Professional Management System</strong>.
                </p>
                <p style="font-size: 16px; margin-bottom: 24px;">
                  From now on, you will receive real-time updates on your project status, invoices, and deliverables directly through this system. 
                  Our goal is to provide you with the most transparent and efficient service possible.
                </p>
                <p style="font-size: 14px; color: #64748b; font-style: italic;">
                  "Turning visions into digital reality with professional precision."
                </p>
                <a href="#" class="button">Access Client Portal</a>
              </div>
              <div class="footer">
                <p style="margin: 0 0 8px 0;">&copy; 2024 FreelanceOS Dashboard. All rights reserved.</p>
                <p style="margin: 0;">Sent via FreelanceOS Automated Workflow Service</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email processing failed:", err);
    return { success: false, error: err };
  }
}
