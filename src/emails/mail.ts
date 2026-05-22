import { Resend } from 'resend';

// Accessing the API key from environment variables
const resend = new Resend((process.env.RESEND_API_KEY || 're_placeholder').trim());

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

export async function sendUserWelcomeEmail(userEmail: string, userName: string) {
  try {
    console.log("\n========================================================");
    console.log(`👋 WELCOME EMAIL DISPATCHED TO: ${userName} (${userEmail})`);
    console.log("========================================================\n");

    const { data, error } = await resend.emails.send({
      from: 'FreelanceOS <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Welcome to FreelanceOS | Your Private Workspace is Ready!',
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
                background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
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
                box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
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
                background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 12px;
                font-weight: bold;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
              }
              .feature-list {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 16px;
                padding: 20px;
                margin: 24px 0;
              }
              .feature-item {
                margin-bottom: 12px;
                font-size: 14px;
              }
              .feature-item strong {
                color: #4f46e5;
              }
            </style>
          </head>
          <body style="background-color: #f8fafc; padding: 40px 0; margin: 0;">
            <div class="container">
              <div class="header">
                <div class="logo">F</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; tracking: -0.025em; font-weight: 800;">FreelanceOS Premium</h1>
              </div>
              <div class="content">
                <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #0f172a; font-weight: 800;">Welcome to the Elite Workspace!</h2>
                <p style="font-size: 15px; color: #475569;">
                  Hello <strong>${userName}</strong>,
                </p>
                <p style="font-size: 15px; color: #475569;">
                  Thank you for creating your account. Your private, database-isolated freelance environment has been fully initialized. You now have complete access to run your operations at maximum speed with zero third-party telemetry.
                </p>
                
                <div class="feature-list">
                  <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 800; uppercase tracking-wider;">Your Workspace Highlights</h4>
                  <div class="feature-item">
                    👉 <strong>Scoped CRM Pipeline</strong>: Flat-rate Retainers and Unit-based Thumbnail contract logs.
                  </div>
                  <div class="feature-item">
                    👉 <strong>Interactive Kanban Workboard</strong>: Track delivery hours, client sign-offs, and revision logs.
                  </div>
                  <div class="feature-item">
                    👉 <strong>Automated Financial Ledger</strong>: Sequential GST/VAT invoices with tax and discount math.
                  </div>
                  <div class="feature-item">
                    👉 <strong>Crypto AES-256 Sessions</strong>: Maximum security protecting your corporate database listings.
                  </div>
                </div>

                <p style="font-size: 15px; color: #475569;">
                  Get ready to save time, optimize billing lifecycles, and impress your clients.
                </p>
                
                <center>
                  <a href="http://localhost:3000/dashboard" class="button">Launch Your Workspace</a>
                </center>
              </div>
              <div class="footer">
                <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} FreelanceOS Dashboard. All rights reserved.</p>
                <p style="margin: 0;">Sent via FreelanceOS Automated Authentication Service</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend Welcome Email Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("User welcome email failed:", err);
    return { success: false, error: err };
  }
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  try {
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    console.log("\n========================================================");
    console.log(`🔑 PASSWORD RESET LINK GENERATED FOR: ${userEmail}`);
    console.log(`🔗 LINK: ${resetLink}`);
    console.log("========================================================\n");

    const { data, error } = await resend.emails.send({
      from: 'FreelanceOS <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'FreelanceOS | Reset Your Workspace Password',
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
                background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
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
                color: #ef4444;
                font-size: 24px;
                margin-bottom: 16px;
                box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
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
                background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 12px;
                font-weight: bold;
                margin-top: 24px;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
              }
              .warning {
                background-color: #fff1f2;
                border: 1px solid #ffe4e6;
                color: #be123c;
                border-radius: 16px;
                padding: 16px;
                font-size: 13px;
                margin: 24px 0;
              }
            </style>
          </head>
          <body style="background-color: #f8fafc; padding: 40px 0; margin: 0;">
            <div class="container">
              <div class="header">
                <div class="logo">F</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; tracking: -0.025em; font-weight: 800;">FreelanceOS Security</h1>
              </div>
              <div class="content">
                <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #0f172a; font-weight: 800;">Password Reset Request</h2>
                <p style="font-size: 15px; color: #475569;">
                  We received a request to reset the password associated with your FreelanceOS workspace account.
                </p>
                <p style="font-size: 15px; color: #475569;">
                  To complete this action and configure a new secure password, please click the button below:
                </p>
                
                <center>
                  <a href="${resetLink}" class="button">Reset My Password</a>
                </center>

                <div class="warning">
                  ⚠️ <strong>Security Advisory</strong>: This reset link is highly confidential and will expire in <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email; your current password remains fully secure and encrypted.
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} FreelanceOS Dashboard. All rights reserved.</p>
                <p style="margin: 0;">Sent via FreelanceOS Automated Security Service</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend Reset Password Email Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Password reset email failed:", err);
    return { success: false, error: err };
  }
}

