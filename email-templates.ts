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
const innerDivider = `<tr><td style="padding:24px 0 0;"><hr style="border:none;border-top:1px solid ${BORDER_COLOR};margin:0;" /></td></tr>`;

// ─── Feature Row Helper ────────────────────────────────
const featureRow = (emoji: string, bgColor: string, title: string, description: string) => `
  <tr>
    <td style="padding:12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:44px;vertical-align:top;">
            <div style="width:36px;height:36px;background:${bgColor};border-radius:10px;text-align:center;line-height:36px;font-size:18px;">${emoji}</div>
          </td>
          <td style="padding-left:12px;">
            <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};">${title}</p>
            <p style="margin:4px 0 0;font-size:13px;color:${TEXT_SECONDARY};">${description}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

// ─── Info Row Helper ───────────────────────────────────
const infoRow = (label: string, value: string) => `
  <tr>
    <td style="padding:6px 0;font-size:14px;color:${TEXT_SECONDARY};width:140px;vertical-align:top;">
      <strong style="color:${TEXT_PRIMARY};">${label}</strong>
    </td>
    <td style="padding:6px 0;font-size:14px;color:${TEXT_PRIMARY};">
      ${value}
    </td>
  </tr>
`;

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
            ${featureRow("📊", "#fef2f2", "Real-Time Vital Monitoring", "Track heart rate and SpO2 for every member live on your dashboard.")}
            ${featureRow("🚨", "#f0fdf4", "Emergency Alert System", "Auto-notify emergency contacts via email, SMS, and voice call when vitals go critical.")}
            ${featureRow("🤖", "#eff6ff", "AI-Powered Insights", "Generate smart health and engagement insights for each member with Gemini AI.")}
          </table>

          ${innerDivider}
          
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
// 2. MEMBER WELCOME EMAIL (Premium HTML)
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
        <td style="background:linear-gradient(135deg, #059669 0%, #047857 100%);padding:44px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:44px;">💪</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Welcome, ${member.name}!</h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.9);max-width:420px;margin:0 auto;">Your gym membership at HealthSync has been confirmed. We're excited to have you on board!</p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <!-- Your Profile Section -->
          <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Your Profile</p>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:16px;padding:4px;">
            <tr>
              ${statBox("Name", member.name, "#ffffff")}
              ${member.age ? statBox("Age", `${member.age} yrs`, "#ffffff") : ""}
              ${member.gender ? statBox("Gender", member.gender, "#ffffff") : ""}
            </tr>
            <tr>
              ${member.bloodGroup ? statBox("Blood Group", member.bloodGroup, "#fef2f2", "#dc2626") : ""}
              ${statBox("Email", member.email, "#ffffff")}
            </tr>
          </table>

          ${innerDivider}

          <!-- Emergency Contact Section -->
          ${member.emergencyContact ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Your Emergency Contact</p>
              </td>
            </tr>
            <tr>
              <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;color:${TEXT_PRIMARY};line-height:2;">
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

          ${innerDivider}

          <!-- What We Monitor Section -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td>
                <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Your Safety at the Gym</p>
              </td>
            </tr>
            ${featureRow("❤️", "#fef2f2", "Heart Rate Monitoring", "Your heart rate is tracked in real-time during every session to detect anomalies.")}
            ${featureRow("🫁", "#eff6ff", "SpO2 Tracking", "Blood oxygen saturation is monitored to ensure you're breathing safely during workouts.")}
            ${featureRow("🚨", "#fef9c3", "Instant Emergency Alerts", "If vitals become critical, your emergency contact will be instantly notified via email, SMS, and voice call.")}
          </table>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr>
              <td style="background:linear-gradient(135deg, #059669 0%, #047857 100%);border-radius:16px;padding:24px;text-align:center;">
                <p style="margin:0 0 4px;font-size:20px;">🏋️</p>
                <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">You're All Set!</p>
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.9);line-height:1.6;">
                  No action is required from you. Your trainer will handle the monitoring.<br/>
                  Just focus on your fitness — we've got your safety covered.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  const text = `Hello ${member.name},

Welcome to HealthSync! Your gym membership has been confirmed.

Your Profile:
  Name        : ${member.name}
  Age         : ${member.age || 'N/A'}
  Gender      : ${member.gender || 'N/A'}
  Blood Group : ${member.bloodGroup || 'N/A'}
  Email       : ${member.email}

Emergency Contact: ${member.emergencyContact?.name || 'N/A'}
  Phone : ${member.emergencyContact?.phone || 'N/A'}
  Email : ${member.emergencyContact?.email || 'N/A'}

Your Safety at the Gym:
- Your heart rate and blood oxygen (SpO2) will be monitored in real time during sessions.
- If your vitals become critical, your emergency contact will be notified immediately via email, SMS, and voice call.

No action is required from you. Just focus on your fitness — we've got your safety covered!

Regards,
HealthSync Gym Management`;

  return {
    subject: `💪 Welcome to HealthSync, ${member.name}! — Membership Confirmed`,
    text,
    html,
  };
};

// =====================================================
// 3. EMERGENCY CONTACT WELCOME EMAIL (Premium HTML)
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
        <td style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%);padding:44px 32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:44px;">🛡️</p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Important: You're an Emergency Contact</h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.9);max-width:420px;margin:0 auto;">
            <strong>${member.name}</strong> has listed you as their emergency contact at HealthSync Gym.
          </p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.7;">
            Hello <strong>${contactName}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:${TEXT_SECONDARY};line-height:1.7;">
            <strong>${member.name}</strong> has joined our gym and has designated you as their emergency contact. 
            This means you will be <strong>immediately notified</strong> if their health vitals become critical during a gym session. 
            We take member safety very seriously and want to keep you informed.
          </p>

          <!-- Member Details -->
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Member Details</p>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:16px;padding:4px;">
            <tr>
              ${statBox("Name", member.name, "#ffffff")}
              ${member.age ? statBox("Age", `${member.age} yrs`, "#ffffff") : ""}
              ${member.gender ? statBox("Gender", member.gender, "#ffffff") : ""}
            </tr>
            <tr>
              ${member.bloodGroup ? statBox("Blood Group", member.bloodGroup, "#fef2f2", "#dc2626") : ""}
              ${statBox("Medical History", member.medicalHistory || "None", member.medicalHistory && member.medicalHistory !== "None" ? "#fef2f2" : "#ffffff", member.medicalHistory && member.medicalHistory !== "None" ? "#dc2626" : TEXT_PRIMARY)}
            </tr>
          </table>

          ${innerDivider}

          <!-- How You'll Be Notified -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td>
                <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">How You Will Be Notified in an Emergency</p>
              </td>
            </tr>
            ${featureRow("📧", "#fef2f2", "Email Alert", "A detailed health alert with vital signs, member info, and hospital contacts will be sent to this email address.")}
            ${featureRow("💬", "#f0fdf4", "SMS Alert", "An urgent text message with critical vitals and emergency instructions will be sent to your phone.")}
            ${featureRow("📞", "#eff6ff", "Voice Call", "An automated emergency voice call will be placed to your phone, speaking the alert details clearly.")}
            ${featureRow("🔊", "#fefce8", "Browser Voice Alert", "The trainer's device will also play an audible voice alert to ensure immediate in-gym response.")}
          </table>

          <!-- Important Note -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="background:linear-gradient(135deg, #059669 0%, #047857 100%);border-radius:16px;padding:24px;text-align:center;">
                <p style="margin:0 0 4px;font-size:20px;">✅</p>
                <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#ffffff;">No Action Required Right Now</p>
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.9);line-height:1.6;">
                  You will only be contacted if a health emergency arises during ${member.name}'s gym session.<br/>
                  Thank you for being there for ${member.name}'s safety.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  const text = `Hello ${contactName},

This is an important notification from HealthSync Gym Management.

${member.name} has registered at our gym and has listed you as their emergency contact. This means you will be notified immediately if their health vitals become critical during a gym session.

Member Details:
  Name         : ${member.name}
  Age          : ${member.age || 'N/A'}
  Gender       : ${member.gender || 'N/A'}
  Blood Group  : ${member.bloodGroup || 'N/A'}
  Med. History : ${member.medicalHistory || 'None'}

How you will be notified if an emergency occurs:
  📧 Email  — A detailed health alert will be sent to this email address.
  💬 SMS    — An urgent text message will be sent to your phone.
  📞 Call   — An automated emergency voice call will be placed to your phone.
  🔊 Voice  — The trainer's device will also play an audible voice alert in the gym.

No action is required from you right now. You will only be contacted if a health emergency arises.

Thank you for being an emergency contact for ${member.name}.

Regards,
HealthSync Gym Management`;

  return {
    subject: `🛡️ HealthSync: You are ${member.name}'s Emergency Contact`,
    text,
    html,
  };
};

// =====================================================
// 4. EMERGENCY ALERT EMAIL (Premium — Urgent Design)
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

  // Build specific danger warnings
  const dangers: string[] = [];
  if (vitals.hr > 105) dangers.push(`Heart rate is dangerously high at <strong>${vitals.hr} BPM</strong> (normal: 60–100 BPM)`);
  if (vitals.hr < 50) dangers.push(`Heart rate is dangerously low at <strong>${vitals.hr} BPM</strong> (normal: 60–100 BPM)`);
  if (vitals.spo2 < 93) dangers.push(`Blood oxygen is critically low at <strong>${vitals.spo2}%</strong> (normal: 95–100%)`);

  const dangerList = dangers.map(d => `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:#991b1b;line-height:1.5;">
        <span style="color:#dc2626;font-weight:800;">⚠</span>&nbsp; ${d}
      </td>
    </tr>
  `).join("");

  const html = baseLayout(`
    <!-- URGENT Banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);padding:44px 32px;text-align:center;">
          <p style="margin:0 0 12px;font-size:56px;">🚨</p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:2px;">Urgent Health Alert</h1>
          <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#fecaca;">${member.name} needs immediate attention</p>
          <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">${timestamp}</p>
        </td>
      </tr>
    </table>

    <!-- Body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px;">
          <!-- Dear Emergency Contact -->
          ${member.emergencyContact?.name ? `
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_PRIMARY};line-height:1.7;">
            Dear <strong>${member.emergencyContact.name}</strong>,
          </p>
          ` : ""}
          
          <p style="margin:0 0 24px;font-size:14px;color:#991b1b;line-height:1.7;background:#fef2f2;border-left:4px solid #dc2626;padding:16px 20px;border-radius:0 12px 12px 0;">
            This is an <strong>urgent automated alert</strong> from HealthSync Gym. 
            <strong>${member.name}</strong> is experiencing <strong>critical health vitals</strong> during their gym session. 
            Please take immediate action.
          </p>

          <!-- What's Wrong -->
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#dc2626;">⚠ What's Happening</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${dangerList}
          </table>

          <!-- Vitals Cards -->
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Current Vital Signs</p>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
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

          ${innerDivider}

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
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9f1239;">⚕️ Medical History</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#881337;">${member.medicalHistory}</p>
                </div>
              </td>
            </tr>
            ` : ""}
          </table>

          ${innerDivider}

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
                    <td style="font-size:14px;color:${TEXT_PRIMARY};line-height:2;">
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

          <!-- Notification Channels -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td><p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${TEXT_SECONDARY};">Alert Sent Via</p></td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px;">
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;text-align:center;">
                        <p style="margin:0;font-size:16px;">📧</p>
                        <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:#16a34a;">Email</p>
                      </div>
                    </td>
                    <td style="padding:4px;">
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;text-align:center;">
                        <p style="margin:0;font-size:16px;">💬</p>
                        <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:#16a34a;">SMS</p>
                      </div>
                    </td>
                    <td style="padding:4px;">
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;text-align:center;">
                        <p style="margin:0;font-size:16px;">📞</p>
                        <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:#16a34a;">Voice Call</p>
                      </div>
                    </td>
                    <td style="padding:4px;">
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;text-align:center;">
                        <p style="margin:0;font-size:16px;">🔊</p>
                        <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:#16a34a;">In-Gym Alert</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Action Required -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%);border-radius:16px;padding:28px;text-align:center;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">🏥 Immediate Action Required</p>
                <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.7;">
                  Please try to reach <strong>${member.name}</strong> or come to the gym immediately.<br/>
                  The gym trainer has also been alerted and is attending to ${member.name}.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="padding:4px 8px;">
                      <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;">
                        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">Ambulance</p>
                        <p style="margin:2px 0 0;font-size:18px;font-weight:900;color:#ffffff;">📞 102</p>
                      </div>
                    </td>
                    <td style="padding:4px 8px;">
                      <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;">
                        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">Emergency</p>
                        <p style="margin:2px 0 0;font-size:18px;font-weight:900;color:#ffffff;">📞 911</p>
                      </div>
                    </td>
                    <td style="padding:4px 8px;">
                      <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;">
                        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">Nearest Hospital</p>
                        <p style="margin:2px 0 0;font-size:14px;font-weight:800;color:#ffffff;">🏥 City General</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);

  return {
    subject: `Health Alert: ${member.name} — Immediate Attention Required`,
    text: `URGENT HEALTH ALERT\n\n${member.emergencyContact?.name ? `Dear ${member.emergencyContact.name},\n\n` : ""}This is an urgent automated alert from HealthSync Gym. ${member.name} is experiencing critical health vitals during their gym session.\n\nWhat's Happening:\n${vitals.hr > 105 ? `- Heart rate is dangerously HIGH at ${vitals.hr} BPM (normal: 60-100 BPM)\n` : ""}${vitals.hr < 50 ? `- Heart rate is dangerously LOW at ${vitals.hr} BPM (normal: 60-100 BPM)\n` : ""}${vitals.spo2 < 93 ? `- Blood oxygen is critically LOW at ${vitals.spo2}% (normal: 95-100%)\n` : ""}\nCurrent Vitals:\n- Heart Rate: ${vitals.hr} BPM (${hrStatus})\n- SpO2: ${vitals.spo2}% (${spo2Status})\n\nMember Details:\n- Name: ${member.name}\n- Age: ${member.age || "N/A"}\n- Blood Group: ${member.bloodGroup || "N/A"}\n- Medical History: ${member.medicalHistory || "None"}\n\nEmergency Contact:\n- Name: ${member.emergencyContact?.name || "N/A"}\n- Phone: ${member.emergencyContact?.phone || "N/A"}\n- Email: ${member.emergencyContact?.email || "N/A"}\n\nAction Required:\nPlease try to reach ${member.name} or come to the gym immediately.\nThe gym trainer has been notified and is attending to them.\n\nNearest Hospital: City General Hospital\nAmbulance: 102 | Emergency: 911\n\n— HealthSync Emergency System`,
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

// =====================================================
// 6. EMERGENCY VOICE CALL MESSAGE (TwiML)
// Used by Twilio to speak to the emergency contact
// =====================================================
export const emergencyVoiceCallMessage = (
  member: {
    name: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    medicalHistory?: string;
    emergencyContact?: { name?: string };
  },
  vitals: { hr: number; spo2: number }
) => {
  const contactName = member.emergencyContact?.name || "Emergency Contact";
  const hrDesc = vitals.hr > 105 ? "dangerously high" : vitals.hr < 50 ? "dangerously low" : "abnormal";
  const spo2Desc = vitals.spo2 < 93 ? "critically low" : "within normal range";

  // Build specific danger descriptions
  const dangers: string[] = [];
  if (vitals.hr > 105 || vitals.hr < 50) {
    dangers.push(`Their heart rate is ${hrDesc}, at ${vitals.hr} beats per minute.`);
  }
  if (vitals.spo2 < 93) {
    dangers.push(`Their blood oxygen level is ${spo2Desc}, at ${vitals.spo2} percent.`);
  }

  const medHistory = member.medicalHistory && member.medicalHistory.toLowerCase() !== "none" && member.medicalHistory.toLowerCase() !== "n/a"
    ? `They have a medical history of ${member.medicalHistory}.`
    : "";

  // Compose the full spoken message
  const message = [
    // Greeting and urgency
    `Hello ${contactName}.`,
    `This is an urgent emergency call from HealthSync Gym.`,
    ``,
    // Who is in danger
    `${member.name}${member.age ? `, aged ${member.age},` : ""} is currently experiencing a health emergency at the gym.`,
    ``,
    // What's wrong
    ...dangers,
    ``,
    // Medical context
    member.bloodGroup ? `Their blood group is ${member.bloodGroup}.` : "",
    medHistory,
    ``,
    // What to do
    `Please try to reach ${member.name} or come to the gym immediately.`,
    `The gym trainer has been alerted and is attending to ${member.name} right now.`,
    ``,
    // Emergency contacts
    `If needed, call an ambulance at 102, or emergency services at 911.`,
    `The nearest hospital is City General Hospital.`,
    ``,
    // Repeat key info
    `I repeat, ${member.name} needs your immediate attention. Please act now.`,
    `This was an automated emergency call from HealthSync. Thank you.`,
  ].filter(line => line !== "").join(" ");

  return message;
};
