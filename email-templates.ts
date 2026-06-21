// =====================================================
// HealthSync — Premium Email Templates
// =====================================================

const BRAND_COLOR = "#e11d48"; // Rose-600
const BRAND_GRADIENT = "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)";
const DARK_BG = "#0f172a"; // Slate-900
const LIGHT_BG = "#f8fafc"; // Slate-50
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#64748b";
const BORDER_COLOR = "#e2e8f0";

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HealthSync</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${BRAND_GRADIENT};padding:14px 28px;border-radius:16px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">❤️ HealthSync</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:#ffffff;border-radius:24px;box-shadow:0 4px 24px rgba(0,0,0,0.06);overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:${TEXT_SECONDARY};line-height:1.6;">
                This is an automated message from <strong>HealthSync</strong>.<br/>
                Please do not reply to this email.
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">
                © ${new Date().getFullYear()} HealthSync Gym Management System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Stat Box Helper ───────────────────────────────────
const statBox = (label: string, value: string, bgColor = "#f1f5f9", textColor = TEXT_PRIMARY) => `
  <td style="padding:4px;">
    <div style="background:${bgColor};border-radius:14px;padding:16px;text-align:center;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">${label}</p>
      <p style="margin:0;font-size:18px;font-weight:800;color:${textColor};">${value}</p>
    </div>
  </td>
`;

// ─── Divider ───────────────────────────────────────────
const divider = `<tr><td style="padding:24px 32px 0;"><hr style="border:none;border-top:1px solid ${BORDER_COLOR};margin:0;" /></td></tr>`;

// =====================================================
// 1. TRAINER WELCOME EMAIL
// =====================================================
export const trainerWelcomeEmail = (trainerName: string, trainerEmail: string) => {
  const html = baseLayout(`
    <!-- Hero -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:${BRAND_GRADIENT};padding:48px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:48px;">🎉</p>
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Welcome Aboard, ${trainerName}!</h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);max-width:400px;margin:0 auto;">Your trainer dashboard is ready. Start managing your gym members' health in real time.</p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:${TEXT_PRIMARY};">Here's what you can do:</h2>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:44px;vertical-align:top;">
                      <div style="width:36px;height:36px;background:#fef2f2;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">📊</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">Real-Time Vital Monitoring</p>
                      <p style="margin:4px 0 0;font-size:13px;color:${TEXT_SECONDARY};">Track heart rate and SpO2 for every member live on your dashboard.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:44px;vertical-align:top;">
                      <div style="width:36px;height:36px;background:#f0fdf4;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">🚨</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">Emergency Alert System</p>
                      <p style="margin:4px 0 0;font-size:13px;color:${TEXT_SECONDARY};">Auto-notify emergency contacts via email, SMS, and voice call when vitals go critical.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:44px;vertical-align:top;">
                      <div style="width:36px;height:36px;background:#eff6ff;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">🤖</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">AI-Powered Insights</p>
                      <p style="margin:4px 0 0;font-size:13px;color:${TEXT_SECONDARY};">Generate smart health and engagement insights for each member with Gemini AI.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${divider.replace('<tr><td style="padding:24px 32px 0;">','<tr><td style="padding:24px 0 0;">')}
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="background:#f8fafc;border-radius:16px;padding:20px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${TEXT_SECONDARY};">Your Account</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:${TEXT_PRIMARY};">${trainerEmail}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: "🎉 Welcome to HealthSync — Your Dashboard is Ready!",
    text: `Hello ${trainerName},\n\nWelcome to HealthSync! Your trainer dashboard is now ready.\n\nYou can monitor real-time member vitals, manage attendance & fees, and receive emergency alerts automatically.\n\nBest regards,\nHealthSync Team`,
    html,
  };
};

// =====================================================
// 2. MEMBER WELCOME EMAIL
// =====================================================
export const memberWelcomeEmail = (member: {
  name: string;
  email: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: { name?: string; phone?: string; email?: string };
}) => {
  const html = baseLayout(`
    <!-- Hero -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:${BRAND_GRADIENT};padding:48px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:48px;">🏋️</p>
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Welcome to HealthSync, ${member.name}!</h1>
          <p style="margin:0 auto;font-size:15px;color:rgba(255,255,255,0.85);max-width:420px;">You've been successfully registered. Your health journey starts now — your trainer is ready to monitor and support you.</p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.7;">
            Hello <strong style="color:${TEXT_PRIMARY};">${member.name}</strong>, your account at 
            <strong style="color:${TEXT_PRIMARY};">HealthSync Gym</strong> has been successfully created. 
            Your trainer will monitor your health vitals in real time during gym sessions.
          </p>

          <!-- Member Details -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Your Profile</p>
              </td>
            </tr>
            <tr>
              ${member.age ? statBox("Age", `${member.age} yrs`) : ""}
              ${member.gender ? statBox("Gender", member.gender) : ""}
              ${member.bloodGroup ? statBox("Blood Group", member.bloodGroup, "#fef2f2", BRAND_COLOR) : ""}
            </tr>
          </table>

          <!-- Emergency Contact -->
          ${member.emergencyContact?.name ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#166534;">🛡️ Emergency Contact Registered</p>
                <p style="margin:0;font-size:14px;color:#15803d;line-height:1.7;">
                  <strong>${member.emergencyContact.name}</strong> has been listed as your emergency contact.
                  They will be notified immediately if your health vitals reach critical levels.
                </p>
              </td>
            </tr>
          </table>
          ` : ""}

          <!-- What to Expect -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">What to Expect</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:44px;vertical-align:top;">
                      <div style="width:36px;height:36px;background:#fef2f2;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">❤️</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">Real-Time Vital Monitoring</p>
                      <p style="margin:4px 0 0;font-size:13px;color:${TEXT_SECONDARY};">Your heart rate and blood oxygen (SpO2) are monitored live during sessions.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:44px;vertical-align:top;">
                      <div style="width:36px;height:36px;background:#fef2f2;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">🚨</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">Automatic Emergency Alerts</p>
                      <p style="margin:4px 0 0;font-size:13px;color:${TEXT_SECONDARY};">If vitals go critical, your emergency contact is alerted instantly via email, SMS & call.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Account Info -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="background:#f8fafc;border-radius:16px;padding:20px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${TEXT_SECONDARY};">Your Registered Email</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:${TEXT_PRIMARY};">${member.email}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  const plainText = `Hello ${member.name},

Your account at HealthSync has been successfully created.

Your Profile:
- Age: ${member.age || "N/A"}
- Gender: ${member.gender || "N/A"}
- Blood Group: ${member.bloodGroup || "N/A"}

Emergency Contact: ${member.emergencyContact?.name || "N/A"} (${member.emergencyContact?.phone || "N/A"})

Your trainer will monitor your health vitals in real time during sessions. If your vitals reach critical levels, your emergency contact will be alerted immediately.

Best regards,
HealthSync Team`;

  return {
    subject: "🏋️ Welcome to HealthSync — Your Membership is Active!",
    text: plainText,
    html,
  };
};

// =====================================================
// 3. EMERGENCY CONTACT WELCOME EMAIL
// =====================================================
export const emergencyContactWelcomeEmail = (
  contactName: string,
  contactEmail: string,
  member: {
    name: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    medicalHistory?: string;
  }
) => {
  const html = baseLayout(`
    <!-- Hero -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:48px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:48px;">🛡️</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Hello ${contactName},</h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.75);">You've been listed as an emergency contact on HealthSync</p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.7;">
            <strong style="color:${TEXT_PRIMARY};">${member.name}</strong> has registered at 
            <strong style="color:${TEXT_PRIMARY};">HealthSync Gym</strong> and listed you as their 
            <strong style="color:${BRAND_COLOR};">emergency contact</strong>.
          </p>

          <!-- What This Means -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#fef2f2;border:1px solid #fecdd3;border-radius:16px;padding:24px;">
                <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#9f1239;">⚡ What does this mean?</h3>
                <p style="margin:0;font-size:13px;color:#881337;line-height:1.7;">
                  HealthSync monitors gym members' health vitals (heart rate and blood oxygen) in real time. 
                  If <strong>${member.name}</strong>'s vitals reach critical levels during a gym session, 
                  you will be <strong>immediately notified</strong> via:
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#9f1239;">
                      <span style="display:inline-block;width:24px;text-align:center;">📧</span> <strong>Email</strong> — Detailed alert to this address
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#9f1239;">
                      <span style="display:inline-block;width:24px;text-align:center;">📱</span> <strong>SMS</strong> — Urgent text message to your phone
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#9f1239;">
                      <span style="display:inline-block;width:24px;text-align:center;">📞</span> <strong>Voice Call</strong> — Automated emergency voice call
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${divider.replace('<tr><td style="padding:24px 32px 0;">','<tr><td style="padding:24px 0 0;">')}

          <!-- Member Details -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Member Details</p>
              </td>
            </tr>
            <tr>
              ${statBox("Name", member.name)}
              ${member.age ? statBox("Age", `${member.age} yrs`) : ""}
              ${member.bloodGroup ? statBox("Blood Group", member.bloodGroup, "#fef2f2", BRAND_COLOR) : ""}
            </tr>
            ${member.medicalHistory ? `
            <tr>
              <td colspan="3" style="padding:8px 4px 0;">
                <div style="background:#f1f5f9;border-radius:14px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Medical History</p>
                  <p style="margin:0;font-size:14px;color:${TEXT_PRIMARY};">${member.medicalHistory}</p>
                </div>
              </td>
            </tr>
            ` : ""}
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="padding:16px;background:#eff6ff;border-radius:14px;border:1px solid #bfdbfe;">
                <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
                  <strong>No action is needed from you right now.</strong><br/>
                  You'll only be contacted if an emergency situation arises. Thank you for being there for ${member.name}! 🙏
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `🛡️ You're Listed as Emergency Contact for ${member.name} — HealthSync`,
    text: `Hello ${contactName},\n\n${member.name} has registered at HealthSync Gym and listed you as their emergency contact.\n\nWhat this means: If ${member.name}'s health vitals (heart rate, blood oxygen) reach critical levels during a gym session, you will be immediately notified via email, SMS, and voice call.\n\nMember Details:\n- Name: ${member.name}\n- Age: ${member.age || "N/A"}\n- Blood Group: ${member.bloodGroup || "N/A"}\n- Medical History: ${member.medicalHistory || "None"}\n\nNo action is needed from you right now. You'll only be contacted if an emergency arises.\n\nThank you,\nHealthSync Team`,
    html,
  };
};

// =====================================================
// 4. EMERGENCY ALERT EMAIL (Enhanced)
// =====================================================
export const emergencyAlertEmail = (
  member: {
    name: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    medicalHistory?: string;
    emergencyContact?: { name?: string; phone?: string; email?: string };
  },
  vitals: { hr: number; spo2: number }
) => {
  const hrStatus = vitals.hr > 105 ? "⚠️ HIGH" : vitals.hr < 50 ? "⚠️ LOW" : "✅ Normal";
  const spo2Status = vitals.spo2 < 93 ? "⚠️ LOW" : "✅ Normal";
  const timestamp = new Date().toLocaleString("en-IN", { 
    timeZone: "Asia/Kolkata", 
    dateStyle: "medium", 
    timeStyle: "short" 
  });

  const html = baseLayout(`
    <!-- URGENT Banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%);padding:40px 32px;text-align:center;">
          <p style="margin:0 0 12px;font-size:56px;">🚨</p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:2px;">Urgent Health Alert</h1>
          <p style="margin:0;font-size:16px;font-weight:600;color:rgba(255,255,255,0.9);">${member.name} needs immediate attention</p>
          <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">${timestamp}</p>
        </td>
      </tr>
    </table>

    <!-- Vitals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Current Vital Signs</p>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr>
              <td style="padding:4px;">
                <div style="background:${vitals.hr > 105 || vitals.hr < 50 ? '#fef2f2' : '#f0fdf4'};border:2px solid ${vitals.hr > 105 || vitals.hr < 50 ? '#fecaca' : '#bbf7d0'};border-radius:16px;padding:20px;text-align:center;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Heart Rate</p>
                  <p style="margin:8px 0 4px;font-size:36px;font-weight:900;color:${vitals.hr > 105 || vitals.hr < 50 ? '#dc2626' : '#16a34a'};">${vitals.hr}</p>
                  <p style="margin:0;font-size:12px;font-weight:600;color:${TEXT_SECONDARY};">BPM · ${hrStatus}</p>
                </div>
              </td>
              <td style="padding:4px;">
                <div style="background:${vitals.spo2 < 93 ? '#fef2f2' : '#f0fdf4'};border:2px solid ${vitals.spo2 < 93 ? '#fecaca' : '#bbf7d0'};border-radius:16px;padding:20px;text-align:center;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Blood Oxygen (SpO2)</p>
                  <p style="margin:8px 0 4px;font-size:36px;font-weight:900;color:${vitals.spo2 < 93 ? '#dc2626' : '#16a34a'};">${vitals.spo2}%</p>
                  <p style="margin:0;font-size:12px;font-weight:600;color:${TEXT_SECONDARY};">${spo2Status}</p>
                </div>
              </td>
            </tr>
          </table>

          ${divider.replace('<tr><td style="padding:24px 32px 0;">','<tr><td style="padding:24px 0 0;">')}

          <!-- Member Details -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td><p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Member Information</p></td>
            </tr>
            <tr>
              ${statBox("Name", member.name)}
              ${member.age ? statBox("Age", `${member.age} yrs`) : ""}
              ${member.bloodGroup ? statBox("Blood Group", member.bloodGroup, "#fef2f2", "#dc2626") : ""}
            </tr>
            ${member.medicalHistory ? `
            <tr>
              <td colspan="3" style="padding:8px 4px 0;">
                <div style="background:#fef2f2;border:1px solid #fecdd3;border-radius:14px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9f1239;">Medical History</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#881337;">${member.medicalHistory}</p>
                </div>
              </td>
            </tr>
            ` : ""}
          </table>

          ${divider.replace('<tr><td style="padding:24px 32px 0;">','<tr><td style="padding:24px 0 0;">')}

          <!-- Emergency Contact Details -->
          ${member.emergencyContact ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td><p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Emergency Contact (You)</p></td>
            </tr>
            <tr>
              <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;color:${TEXT_PRIMARY};line-height:1.8;">
                      <strong>👤 Name:</strong> ${member.emergencyContact.name || "N/A"}<br/>
                      <strong>📱 Phone:</strong> ${member.emergencyContact.phone || "N/A"}<br/>
                      <strong>📧 Email:</strong> ${member.emergencyContact.email || "N/A"}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          ` : ""}

          <!-- Action Required -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="background:#dc2626;border-radius:16px;padding:24px;text-align:center;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">🏥 Immediate Action Required</p>
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.9);line-height:1.6;">
                  The gym trainer has been notified. Nearest Hospital: <strong>City General Hospital</strong>.<br/>
                  Ambulance: <strong>102</strong> · Emergency: <strong>911</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `🚨 URGENT: Health Alert for ${member.name} — Immediate Attention Required`,
    text: `URGENT HEALTH ALERT\n\n${member.name} is experiencing critical health vitals at the gym.\n\nCurrent Vitals:\n- Heart Rate: ${vitals.hr} BPM (${hrStatus})\n- SpO2: ${vitals.spo2}% (${spo2Status})\n\nMember Details:\n- Blood Group: ${member.bloodGroup || "N/A"}\n- Medical History: ${member.medicalHistory || "None"}\n\nEmergency Contact:\n- Name: ${member.emergencyContact?.name || "N/A"}\n- Phone: ${member.emergencyContact?.phone || "N/A"}\n- Email: ${member.emergencyContact?.email || "N/A"}\n\nAction: The trainer has been notified. Nearest Hospital: City General Hospital. Ambulance: 102/911.\n\n— HealthSync Emergency System`,
    html,
  };
};

// =====================================================
// 5. ENHANCED EMERGENCY SMS MESSAGE
// =====================================================
export const emergencySmsMessage = (
  member: {
    name: string;
    bloodGroup?: string;
    medicalHistory?: string;
    emergencyContact?: { name?: string; phone?: string; email?: string };
  },
  vitals: { hr: number; spo2: number }
) => {
  const lines = [
    `🚨 HEALTHSYNC EMERGENCY ALERT`,
    ``,
    `${member.name} has CRITICAL vitals at the gym:`,
    `❤️ HR: ${vitals.hr} BPM | 🫁 SpO2: ${vitals.spo2}%`,
    `🩸 Blood: ${member.bloodGroup || "N/A"}`,
  ];

  if (member.medicalHistory) {
    lines.push(`📋 History: ${member.medicalHistory}`);
  }

  lines.push(``);
  lines.push(`Emergency Contact: ${member.emergencyContact?.name || "N/A"}`);
  if (member.emergencyContact?.phone) {
    lines.push(`📱 ${member.emergencyContact.phone}`);
  }
  if (member.emergencyContact?.email) {
    lines.push(`📧 ${member.emergencyContact.email}`);
  }

  lines.push(``);
  lines.push(`🏥 Nearest: City General Hospital`);
  lines.push(`🚑 Ambulance: 102 | Emergency: 911`);
  lines.push(`— HealthSync`);

  return lines.join("\n");
};
