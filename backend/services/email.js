// ============================================
// EMAIL SERVICE — SolarIQ
// Handles all email notifications:
// 1. Critical fault alerts
// 2. System offline alerts  
// 3. Weekly summary reports
// ============================================

// Import nodemailer — Node.js email sending library
// Used to connect to Gmail SMTP and send emails
const nodemailer = require('nodemailer');

// ============================================
// CREATE TRANSPORTER
// Transporter = courier company
// Knows HOW and WHERE to deliver emails
// Created once, reused for all emails
// ============================================
const transporter = nodemailer.createTransport({

  // Gmail's SMTP server address
  // Every email provider has its own SMTP server:
  // Gmail   → smtp.gmail.com
  // Yahoo   → smtp.mail.yahoo.com
  // Outlook → smtp.office365.com
  host: "smtp.gmail.com",

  // Port 465 = SSL door (most secure)
  // Port 587 = STARTTLS door (also secure)
  // Port 25  = old plain text (never use)
  // We use 465 because it encrypts immediately
  port: 465,

  // secure: true  = encrypted from first moment (use with port 465)
  // secure: false = starts plain, upgrades later (use with port 587)
  secure: true,

  // Login credentials for Gmail SMTP server
  auth: {
    // Gmail address — who is sending the email
    // Loaded from .env file — never hardcode in code!
    user: process.env.EMAIL_USER,

    // 16-digit Google App Password
    // NOT your real Gmail password!
    // App Password = limited key (can only send emails)
    // Gmail Password = master key (full account access)
    // Even if App Password is stolen → attacker cannot login to Gmail
    pass: process.env.EMAIL_PASS
  },

  // Connection pooling = reuse connections instead of creating new ones
  // Without pool → new connection for every email → slow
  // With pool    → reuse existing connections → fast
  // Like hiring 5 waiters once instead of hiring/firing for each customer
  pool: true,

  // Maximum 5 simultaneous connections to Gmail server
  // Good for sending bulk emails (weekly reports to many users)
  maxConnections: 5,

  // ⚠️  DEVELOPMENT ONLY — REMOVE IN PRODUCTION!
  // debug: true → prints what YOUR APP sends to Gmail in terminal
  // Example output:
  //   > AUTH LOGIN
  //   > MAIL FROM: <fsagheer11@gmail.com>
  //   > RCPT TO: <recipient@gmail.com>
  debug: true,

  // ⚠️  DEVELOPMENT ONLY — REMOVE IN PRODUCTION!
  // logger: true → prints what GMAIL sends back in terminal
  // Example output:
  //   < 220 smtp.gmail.com ready
  //   < 235 Authentication successful
  //   < 250 OK
  // WARNING: Exposing these logs in production can leak credentials!
  logger: true
});

// ============================================
// VERIFY CONNECTION ON STARTUP
// Tests Gmail connection when server starts
// Like calling post office to confirm they're open
// before sending any letters
// ============================================
transporter.verify((error, success) => {
  if (error) {
    // Connection failed — check credentials in .env
    console.error('❌ Email service error:', error.message);
  } else {
    // Connection successful — ready to send emails
    console.log('✅ Email service ready');
  }
});

// ============================================
// 1️⃣  CRITICAL FAULT EMAIL
// Triggered when: fault.severity === 'critical'
// Called from: socket/live.js → maybeGenerateFault()
// Parameters:
//   fault  → fault document from MongoDB
//   system → system document from MongoDB
// ============================================
async function sendCriticalFaultEmail(fault, system) {
  try {
    await transporter.sendMail({

      // Sender — "Display Name" <email>
      // Recipient sees "SolarIQ Alerts" as sender name
      from: `"SolarIQ Alerts" <${process.env.EMAIL_USER}>`,

      // Recipient email — loaded from .env
      to: process.env.EMAIL_TO,

      // Email subject line
      // ${system.name} injects real system name
      // Example: "🚨 Critical Fault — Islamabad Solar Plant 1"
      subject: `🚨 Critical Fault — ${system.name}`,

      // HTML email body
      // HTML allows colors, tables, styled text
      // Plain text emails look boring and unprofessional
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          
          <!-- Red header bar -->
          <div style="background: #E24B4A; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🚨 Critical Fault Detected</h1>
          </div>

          <!-- Email body -->
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
            
            <!-- System name as heading -->
            <h2 style="color: #333;">${system.name}</h2>
            
            <!-- Fault details table -->
            <table style="width:100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; color: #666;">Location</td>
                <!-- ${system.city} injects real city name -->
                <td style="padding: 8px; font-weight: bold;">📍 ${system.city}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 8px; color: #666;">Fault Type</td>
                <!-- ${fault.type} injects fault type e.g. "inverter_failure" -->
                <td style="padding: 8px; font-weight: bold;">⚠️ ${fault.type}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #666;">Severity</td>
                <!-- .toUpperCase() converts "critical" to "CRITICAL" -->
                <td style="padding: 8px; font-weight: bold; color: #E24B4A;">
                  ${fault.severity.toUpperCase()}
                </td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 8px; color: #666;">Message</td>
                <!-- Human readable fault description -->
                <td style="padding: 8px;">${fault.message}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #666;">Detected At</td>
                <!-- toLocaleString() formats date nicely: "5/16/2026, 3:45:00 PM" -->
                <td style="padding: 8px;">${new Date(fault.detectedAt).toLocaleString()}</td>
              </tr>
            </table>

            <!-- Warning box at bottom -->
            <div style="margin-top: 24px; padding: 16px; background: #fff3f3; border-radius: 8px;">
              <p style="color: #E24B4A; margin: 0;">
                ⚡ Immediate action required — please inspect the system.
              </p>
            </div>

          </div>
        </div>
      `
    });

    // Log success with system name for easy debugging
    console.log(`📧 Critical fault email sent for ${system.name}`);

  } catch (err) {
    // Log error but DON'T crash server
    // Email failure should never stop the main app
    console.error('❌ Email send error:', err.message);
  }
}

// ============================================
// 2️⃣  SYSTEM OFFLINE EMAIL
// Triggered when: system.status changes to 'offline'
// Called from: socket/live.js
// Parameters:
//   system → system document from MongoDB
// ============================================
async function sendSystemOfflineEmail(system) {
  try {
    await transporter.sendMail({
      from: `"SolarIQ Alerts" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,

      // Example: "📴 System Offline — Karachi Solar Plant 3"
      subject: `📴 System Offline — ${system.name}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

          <!-- Orange header for offline (less severe than critical red) -->
          <div style="background: #EF9F27; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">📴 System Gone Offline</h1>
          </div>

          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">${system.name}</h2>
            <table style="width:100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; color: #666;">Location</td>
                <td style="padding: 8px; font-weight: bold;">📍 ${system.city}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 8px; color: #666;">Capacity</td>
                <!-- Shows how much power is being lost -->
                <td style="padding: 8px;">${system.capacity} kW</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #666;">Time</td>
                <!-- new Date() = current time when email is sent -->
                <td style="padding: 8px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>

            <!-- Action required box -->
            <div style="margin-top: 24px; padding: 16px; background: #fff8f0; border-radius: 8px;">
              <p style="color: #EF9F27; margin: 0;">
                🔧 Please check system connectivity and power supply.
              </p>
            </div>
          </div>
        </div>
      `
    });

    console.log(`📧 Offline alert email sent for ${system.name}`);

  } catch (err) {
    console.error('❌ Email send error:', err.message);
  }
}

// ============================================
// 3️⃣  WEEKLY REPORT EMAIL
// Triggered by: node-cron every Monday at 9am
// Schedule: '0 9 * * 1' (cron expression)
// Parameters:
//   stats → { total, active, fault, offline, totalPower }
// ============================================
async function sendWeeklyReportEmail(stats) {
  try {
    await transporter.sendMail({
      from: `"SolarIQ Reports" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,

      // Includes current date in subject
      // Example: "📊 SolarIQ Weekly Report — Mon May 16 2026"
      subject: `📊 SolarIQ Weekly Report — ${new Date().toDateString()}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

          <!-- Green header (positive/informational) -->
          <div style="background: #1D9E75; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">☀️ Weekly Solar Report</h1>
            <!-- Current date in header -->
            <p style="color: #e0f7f0; margin: 8px 0 0 0;">
              ${new Date().toDateString()}
            </p>
          </div>

          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">System Summary</h2>

            <!-- Stats table — ${stats.xxx} injects real numbers from MongoDB -->
            <table style="width:100%; border-collapse: collapse;">
              <tr style="background: #e8f5f0;">
                <td style="padding: 12px; color: #666;">Total Systems</td>
                <!-- stats.total = 50 -->
                <td style="padding: 12px; font-weight: bold; font-size: 18px;">
                  ${stats.total}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #666;">Active Systems</td>
                <!-- Green color = good news -->
                <td style="padding: 12px; font-weight: bold; color: #1D9E75; font-size: 18px;">
                  ${stats.active}
                </td>
              </tr>
              <tr style="background: #e8f5f0;">
                <td style="padding: 12px; color: #666;">Systems with Faults</td>
                <!-- Red color = needs attention -->
                <td style="padding: 12px; font-weight: bold; color: #E24B4A; font-size: 18px;">
                  ${stats.fault}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; color: #666;">Offline Systems</td>
                <!-- Orange = warning -->
                <td style="padding: 12px; font-weight: bold; color: #EF9F27; font-size: 18px;">
                  ${stats.offline}
                </td>
              </tr>
              <tr style="background: #e8f5f0;">
                <td style="padding: 12px; color: #666;">Total Power Output</td>
                <!-- Total kW from all active systems -->
                <td style="padding: 12px; font-weight: bold; color: #1D9E75; font-size: 18px;">
                  ${stats.totalPower} kW
                </td>
              </tr>
            </table>

            <!-- Footer message -->
            <div style="margin-top: 24px; padding: 16px; 
                        background: #e8f5f0; border-radius: 8px; text-align: center;">
              <p style="color: #1D9E75; margin: 0; font-size: 16px;">
                ☀️ Keep monitoring — SolarIQ Dashboard
              </p>
            </div>
          </div>
        </div>
      `
    });

    console.log('📧 Weekly report email sent!');

  } catch (err) {
    // Log but don't crash — cron job will try again next week
    console.error('❌ Weekly report error:', err.message);
  }
}

// ============================================
// EXPORT FUNCTIONS
// Makes these functions available to other files
// Usage in socket/live.js:
//   const { sendCriticalFaultEmail } = require('../services/email');
//   await sendCriticalFaultEmail(fault, system);
// ============================================
module.exports = { 
  sendCriticalFaultEmail, 
  sendSystemOfflineEmail,
  sendWeeklyReportEmail 
};