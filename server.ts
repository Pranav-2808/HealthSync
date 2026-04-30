import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data.json");
const SECRET_KEY = process.env.JWT_SECRET || "healthsync-super-secret";
const GYM_OWNER_PHONE = "+919209133079";

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initial data structure
const initialData = {
  trainers: [],
  members: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      age: 28,
      height: 180,
      weight: 75,
      gender: "Male",
      bloodGroup: "O+",
      medicalHistory: "None",
      feesStatus: "PAID",
      attendance: [],
      emergencyContact: { name: "Jane Doe", email: "jane@example.com", phone: "+911234567890" },
      healthData: { hr: 72, spo2: 98 }
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah@example.com",
      age: 35,
      height: 165,
      weight: 60,
      gender: "Female",
      bloodGroup: "A+",
      medicalHistory: "BP issues",
      feesStatus: "UNPAID",
      attendance: [],
      emergencyContact: { name: "Bob Smith", email: "bob@example.com", phone: "+919876543210" },
      healthData: { hr: 110, spo2: 94 } // Critical initially for demo
    }
  ],
  attendance: {} // { date: { memberId: boolean } }
};

// Database utility
const getDB = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

const saveDB = (data: any) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const getEmailConfig = () => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "HealthSync";

  return { apiKey, from, fromName };
};

const getEmailConfigError = () => {
  const { apiKey, from } = getEmailConfig();
  if (!apiKey) {
    return "Email is not configured. Set BREVO_API_KEY in .env.";
  }
  if (!from || !from.includes("@")) {
    return "EMAIL_FROM must be a sender email verified in Brevo.";
  }
  return null;
};

const isEmailProviderError = (error: unknown) => {
  return error instanceof Error && error.message.startsWith("Brevo email failed:");
};

const emailProviderMessage =
  "Brevo rejected the email request. Check BREVO_API_KEY and make sure EMAIL_FROM is verified in Brevo.";

const getEmailErrorMessage = (error: unknown) => {
  if (isEmailProviderError(error) && error instanceof Error) {
    return error.message;
  }
  return error instanceof Error ? error.message : "Failed to send email";
};

let emailAuthBlocked = false;
let emailAuthBlockedLogged = false;
let smsProviderBlocked = false;
let smsProviderBlockedLogged = false;

const logEmailAuthBlocked = (context: string) => {
  if (!emailAuthBlockedLogged) {
    console.error(`${context}: ${emailProviderMessage}`);
    emailAuthBlockedLogged = true;
  }
};

const isTwilioDailyLimitError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as any).code === 63038
  );
};

const logSmsProviderBlocked = (message: string) => {
  if (!smsProviderBlockedLogged) {
    console.error(message);
    smsProviderBlockedLogged = true;
  }
};

const sendEmail = async (email: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const { apiKey, from, fromName } = getEmailConfig();
  const configError = getEmailConfigError();

  if (configError || !apiKey || !from) {
    console.log("MOCK EMAIL SENT:", { from, fromName, ...email });
    return { id: "mock-email-id" };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: { email: from, name: fromName },
      to: [{ email: email.to }],
      subject: email.subject,
      textContent: email.text,
      htmlContent: email.html
    })
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result?.message === "string"
        ? result.message
        : typeof result?.code === "string"
          ? result.code
          : response.statusText;
    throw new Error(`Brevo email failed: ${message}`);
  }

  return { id: result?.messageId || "brevo-email-id" };
};

// Twilio Helper
const sendEmergencySMS = async (to: string, message: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (smsProviderBlocked) {
    return;
  }

  if (accountSid && authToken && from) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: message,
        from: from,
        to: to
      });
      console.log("Twilio SMS sent to:", to);
    } catch (error) {
      if (isTwilioDailyLimitError(error)) {
        smsProviderBlocked = true;
        logSmsProviderBlocked("SMS disabled: Twilio account exceeded the 50 daily messages limit.");
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to send SMS";
      console.error("Twilio Error:", message);
    }
  } else {
    console.log("MOCK SMS SENT to:", to, "| Message:", message);
  }
};

// AUTH ROUTES
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const db = getDB();
  if (db.trainers.find((t: any) => t.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newTrainer = { id: Date.now().toString(), name, email, password: hashedPassword };
  db.trainers.push(newTrainer);
  saveDB(db);
  const token = jwt.sign({ id: newTrainer.id, email }, SECRET_KEY);
  res.json({ token, user: { id: newTrainer.id, name, email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  const trainer = db.trainers.find((t: any) => t.email === email);
  if (!trainer || !(await bcrypt.compare(password, trainer.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: trainer.id, email }, SECRET_KEY);
  res.json({ token, user: { id: trainer.id, name: trainer.name, email } });
});

// MEMBERS API
app.get("/api/members", (req, res) => {
  const db = getDB();
  res.json(db.members);
});

// TEST SMS ENDPOINT - Send SMS to member's emergency contact
app.post("/api/sms/test", async (req, res) => {
  const { memberId, message } = req.body;
  const db = getDB();
  const member = db.members.find((m: any) => m.id === memberId);
  
  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }
  
  if (!member.emergencyContact?.phone) {
    return res.status(400).json({ error: "No emergency contact phone found" });
  }
  
  const smsMessage = message || `Hello from HealthSync Gym. This is a test message for ${member.emergencyContact.name}.`;
  
  try {
    await sendEmergencySMS(member.emergencyContact.phone, smsMessage);
    res.json({ 
      success: true, 
      message: "SMS sent successfully",
      sentTo: member.emergencyContact.phone,
      emergencyContact: member.emergencyContact.name
    });
  } catch (error) {
    console.error("SMS Test Error:", error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

app.post("/api/members", (req, res) => {
  const db = getDB();
  const newMember = { ...req.body, id: Date.now().toString(), attendance: [], healthData: { hr: 75, spo2: 99 } };
  db.members.push(newMember);
  saveDB(db);
  res.json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const db = getDB();
  const index = db.members.findIndex((m: any) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Member not found" });
  db.members[index] = { ...db.members[index], ...req.body };
  saveDB(db);
  res.json(db.members[index]);
});

app.delete("/api/members/:id", (req, res) => {
  const db = getDB();
  db.members = db.members.filter((m: any) => m.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// ATTENDANCE API
app.get("/api/attendance", (req, res) => {
  const db = getDB();
  res.json(db.attendance);
});

app.post("/api/attendance", (req, res) => {
  const { date, memberId, status } = req.body;
  const db = getDB();
  if (!db.attendance[date]) db.attendance[date] = {};
  db.attendance[date][memberId] = status;
  
  // Also track in member object for detail page history
  const member = db.members.find((m: any) => m.id === memberId);
  if (member) {
    const existing = member.attendance.findIndex((a: any) => a.date === date);
    if (existing !== -1) member.attendance[existing].status = status;
    else member.attendance.push({ date, status });
  }
  
  saveDB(db);
  res.json({ success: true });
});

// FEES API
app.post("/api/fees/remind", async (req, res) => {
  try {
    const { memberId, dueDate, pendingFees } = req.body;

    const db = getDB();
    const member = db.members.find((m: any) => m.id === memberId);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (!member.email) {
      return res.status(400).json({ error: "Member email missing" });
    }

    const emailConfigError = getEmailConfigError();
    if (emailConfigError) {
      return res.status(500).json({ error: emailConfigError });
    }

    const amount = Number(pendingFees || 0).toLocaleString("en-IN");
    const paymentDueDate = dueDate || "the due date";

    const emailResult = await sendEmail({
      to: member.email,
      subject: "Fees Payment Reminder",
      text: `Hello ${member.name}, this is a reminder that your gym fees of Rs. ${amount} are due by ${paymentDueDate}. Please clear them at the earliest.`,
      html: `
        <p>Hello ${member.name},</p>
        <p>This is a reminder that your gym fees of <strong>Rs. ${amount}</strong> are due by <strong>${paymentDueDate}</strong>.</p>
        <p>Please clear them at the earliest.</p>
        <p>Regards,<br/>HealthSync Gym</p>
      `
    });

    console.log("Fees reminder accepted by Brevo:", {
      to: member.email,
      messageId: emailResult.id
    });

    res.json({
      success: true,
      message: `Reminder sent to ${member.email}`,
      messageId: emailResult.id
    });
  } catch (error) {
    const message = getEmailErrorMessage(error);
    console.error("Fees reminder email error:", message);
    res.status(500).json({ error: message });
  }
});

app.post("/api/fees/remind-legacy", async (req, res) => {
  const { memberId, dueDate, pendingFees } = req.body;
  const db = getDB();
  const member = db.members.find((m: any) => m.id === memberId);
  if (!member) return res.status(404).json({ error: "Member not found" });
  if (!member.email) return res.status(400).json({ error: "Member email is missing" });
  const emailConfigError = getEmailConfigError();
  if (emailConfigError) {
    return res.status(500).json({ error: emailConfigError });
  }

  try {
    const amount = Number(pendingFees || 0).toLocaleString("en-IN");
    const paymentDueDate = dueDate || "the due date";

    const emailResult = await sendEmail({
      to: member.email,
      subject: "Fees Payment Reminder",
      text: `Hello ${member.name}, this is a reminder that your gym fees of Rs. ${amount} are due by ${paymentDueDate}. Please clear them at the earliest.`
    });
    console.log("Legacy fees reminder accepted by Brevo:", {
      to: member.email,
      messageId: emailResult.id
    });
    res.json({ success: true, messageId: emailResult.id });
  } catch (error) {
    const message = getEmailErrorMessage(error);
    console.error("Legacy fees reminder email error:", message);
    res.status(500).json({ error: message });
  }
});

// EMERGENCY ALERT API
app.post("/api/emergency/alert", async (req, res) => {
  const { memberId, hr, spo2 } = req.body;
  const db = getDB();
  const member = db.members.find((m: any) => m.id === memberId);
  if (!member) return res.status(404).json({ error: "Member not found" });
  if (!member.emergencyContact?.email && !member.emergencyContact?.phone) {
    return res.status(400).json({ error: "Emergency contact email or phone is required" });
  }

  const emailConfigError = getEmailConfigError();

  try {
    // 1. Send Email
    if (member.emergencyContact?.email && !emailAuthBlocked && !emailConfigError) {
      try {
        await sendEmail({
          to: member.emergencyContact.email,
          subject: "URGENT HEALTH ALERT",
          html: `
            <h2>Urgent Health Alert for ${member.name}</h2>
            <p>Your emergency contact ${member.name} is currently experiencing abnormal health vital signs at the gym.</p>
            <ul>
              <li><strong>Current Heart Rate:</strong> ${hr} BPM</li>
              <li><strong>Current SpO2:</strong> ${spo2}%</li>
              <li><strong>Blood Group:</strong> ${member.bloodGroup}</li>
              <li><strong>Medical History:</strong> ${member.medicalHistory}</li>
            </ul>
            <p><strong>Suggested Action:</strong> We have notified the trainer. Nearby Hospital: City General Hospital. Ambulance: 911 / 102.</p>
          `
        });
      } catch (error) {
        if (!isEmailProviderError(error)) throw error;
        emailAuthBlocked = true;
        logEmailAuthBlocked("Alert email disabled");
      }
    } else if (emailConfigError) {
      emailAuthBlocked = true;
      logEmailAuthBlocked("Alert email disabled");
    }

    // 2. Send SMS via Twilio to emergency contact and gym owner
    const smsMessage = `URGENT: ${member.name} has critical health vitals at the gym. HR: ${hr}, SpO2: ${spo2}%. Please respond immediately. - HealthSync Team`;
    const smsRecipients = Array.from(new Set([
      member.emergencyContact?.phone,
      GYM_OWNER_PHONE
    ].filter(Boolean)));

    await Promise.all(smsRecipients.map((phone) => sendEmergencySMS(phone as string, smsMessage)));

    res.json({ success: true });
  } catch (error) {
    const message = isEmailProviderError(error) && error instanceof Error ? error.message : "Failed to send alert";
    console.error("Alert route error:", message);
    res.status(500).json({ error: message });
  }
});

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const randomStep = (min: number, max: number) => {
  const direction = Math.random() < 0.5 ? -1 : 1;
  return direction * Math.floor(Math.random() * (max - min + 1) + min);
};

// Real-time Pulse Simulation
// In a real app, this might be a background job or periodic request from client.
// We'll providing an endpoint for the client to "poll" or "simulate" health updates.
app.get("/api/health-pulse", (req, res) => {
  const db = getDB();
  db.members = db.members.map((m: any) => {
    const currentHr = Number(m.healthData?.hr || 75);
    const currentSpo2 = Number(m.healthData?.spo2 || 98);
    const newHr = clamp(currentHr + randomStep(2, 3), 60, 105);
    const newSpo2 = clamp(currentSpo2 + randomStep(0, 1), 94, 100);
    return { ...m, healthData: { hr: newHr, spo2: newSpo2 } };
  });
  // Note: We don't save these simulated values to DB to avoid IO thrashing.
  res.json(db.members.map((m: any) => ({ id: m.id, healthData: m.healthData })));
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
