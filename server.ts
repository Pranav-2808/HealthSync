import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import twilio from "twilio";
import { AppData, Member, Trainer, AttendanceRecord } from "./src/types"; // Assuming types.ts is in src/
import nodemailer from "nodemailer";
import {
  trainerWelcomeEmail,
  memberWelcomeEmail,
  emergencyContactWelcomeEmail,
  emergencyAlertEmail,
  emergencySmsMessage,
  emergencyVoiceCallMessage,
} from "./email-templates";

dotenv.config(); //

const app = express();
const PORT = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url); // Get current file path in ES module
const __dirname = path.dirname(__filename); // Get current directory path
const DATA_FILE = path.join(__dirname, "data.json");
const SECRET_KEY = process.env.JWT_SECRET || "healthsync-super-secret";
const GYM_OWNER_PHONE = "+919209133079";

const getTrainerIdFromRequest = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return null;

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    return typeof payload === "object" && payload !== null && "id" in payload
      ? String((payload as any).id)
      : null;
  } catch (error) {
    console.error("Invalid auth token:", error);
    return null;
  }
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initial data structure
const initialData: AppData = {
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
      healthData: { hr: 110, spo2: 92 } // Ensure critical initially for demo (SpO2 < 93)
    }
  ]
  // Removed global attendance object, now stored within each member
};

// Database utility
const getDB = (): AppData => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  let currentData;
  try {
    currentData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (error) {
    console.error("Error parsing data.json, file might be corrupted. Re-initializing data.json.", error);
    // If the file is corrupted, delete it and write initial data
    fs.unlinkSync(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    currentData = initialData;
  }

  // Ensure Sarah Smith (or any demo critical member with id "2") is always critical on load, only if data is valid
  if (currentData && currentData.members) {
    const sarah = currentData.members.find((m: Member) => m.id === "2");
    if (sarah) {
      // Force Sarah's vitals to be critical if they are not already
      // Thresholds: HR > 105 or HR < 50 or SpO2 < 93
      if (!sarah.healthData || (sarah.healthData.hr <= 105 && sarah.healthData.hr >= 50 && sarah.healthData.spo2 >= 93)) {
        sarah.healthData = { hr: 110, spo2: 92 }; // Set to critical values
        console.log("Forcing Sarah Smith's healthData to critical on load.");
        saveDB(currentData); // Save the updated critical state to data.json
      }
    }
  }
  return currentData;
};

const saveDB = (data: AppData) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const getEmailConfig = () => {
  const emailUser = process.env.EMAIL_USERNAME?.trim();
  const emailPass = process.env.EMAIL_PASSWORD?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "HealthSync";

  return { 
    emailUser,
    emailPass,
    from, 
    fromName 
  };
};

const getEmailConfigError = () => {
  const { emailUser, emailPass } = getEmailConfig();
  
  if (emailUser && emailPass) return null;
  
  return "Email is not configured. Set EMAIL_USERNAME and EMAIL_PASSWORD in .env.";
};

const isEmailProviderError = (error: unknown) => {
  return error instanceof Error && error.message.includes("Invalid login");
};

const isEmailConfigErrorThrown = (error: unknown) => {
  return error instanceof Error && error.message.includes("Email is not configured.");
};

const emailProviderMessage =
  "Email provider rejected the email request. Check EMAIL_USERNAME and EMAIL_PASSWORD.";

const getEmailErrorMessage = (error: unknown) => {
  if (isEmailProviderError(error) && error instanceof Error) {
    return error.message;
  }
  if (isEmailConfigErrorThrown(error) && error instanceof Error) {
    return error.message;
  }
  return error instanceof Error ? error.message : "Failed to send email";
};

const isTwilioDailyLimitError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as any).code === 63038
  );
};

const isTwilioAuthError = (error: unknown) => {
  return (
    error instanceof Error &&
    (error.message.includes("Authenticate") ||
      ("status" in error && (error as any).status === 401) ||
      ("code" in error && (error as any).code === 20003))
  );
};

let emailAuthBlocked = false;
let emailAuthBlockedLogged = false;
let twilioAuthBlocked = false;
let twilioAuthBlockedLogged = false;
let smsProviderBlocked = false;
let smsProviderBlockedLogged = false;
const alertCooldowns: Record<string, number> = {};
const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const memberTicks: Record<string, number> = {};

const logEmailAuthBlocked = (context: string) => {
  if (!emailAuthBlockedLogged) {
    console.error(`${context}: ${emailProviderMessage}`);
    emailAuthBlockedLogged = true;
  }
};

const logSmsProviderBlocked = (message: string) => {
  if (!smsProviderBlockedLogged) {
    console.error(message);
    smsProviderBlockedLogged = true;
  }
};

const logTwilioAuthBlocked = () => {
  if (!twilioAuthBlockedLogged) {
    console.error("Twilio disabled: authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.");
    twilioAuthBlockedLogged = true;
  }
};

const sendEmail = async (email: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const { emailUser, emailPass, from, fromName } = getEmailConfig();
  const configError = getEmailConfigError();

  if (configError) {
    console.log("MOCK EMAIL SENT (due to missing Email credentials):", { from, fromName, ...email });
    throw new Error(configError);
  }

  const senderAddress = from || emailUser!;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  // Build mail options — avoid aggressive headers that trigger spam filters
  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${fromName}" <${senderAddress}>`,
    replyTo: senderAddress,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  };

  console.log(`Sending email → To: ${email.to} | Subject: ${email.subject}`);
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email accepted by SMTP → MessageID: ${info.messageId} | Response: ${info.response}`);
  return { id: info.messageId };
};

// SMS Helper
const sendEmergencySMS = async (to: string | string[], message: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (smsProviderBlocked) {
    throw new Error("SMS disabled: Twilio account exceeded the 50 daily messages limit.");
  }

  if (twilioAuthBlocked) {
    throw new Error("Twilio disabled: authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.");
  }

  // Normalize 'to' into an array and always include the gym owner by default
  const toArray = Array.isArray(to) ? to : [to];
  const recipients = Array.from(new Set([...toArray, GYM_OWNER_PHONE].filter(Boolean) as string[]));

  if (!accountSid || !authToken || !from) {
    // If Twilio credentials are not set, throw an error instead of just mocking
    console.log("MOCK SMS SENT (due to missing Twilio credentials):", { recipients, message });
    throw new Error("Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.");
  }

  try {
      const client = twilio(accountSid, authToken);
      await Promise.all(recipients.map(async (phone) => {
        const response = await client.messages.create({
          body: message,
          from: from,
          to: phone
        });
        console.log("Twilio SMS sent to:", phone, "| SID:", response.sid);
      }));
    } catch (error) {
      if (isTwilioDailyLimitError(error)) {
        smsProviderBlocked = true;
        logSmsProviderBlocked("SMS disabled: Twilio account exceeded the 50 daily messages limit.");
        throw new Error("SMS disabled: Twilio account exceeded the 50 daily messages limit.");
      }
      if (isTwilioAuthError(error)) {
        twilioAuthBlocked = true;
        logTwilioAuthBlocked();
        throw new Error("Twilio disabled: authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.");
      }
      const errMessage = error instanceof Error ? error.message : "Failed to send SMS";
      console.error("Twilio Error:", errMessage);
      throw error;
    }
};

// Voice Call Helper
// Sanitize text for TwiML to prevent XML injection from member names
const sanitizeForTwiml = (text: string): string => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

const sendEmergencyVoiceCall = async (to: string, message: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.log("MOCK VOICE CALL (due to missing Twilio credentials):", { to, message });
    throw new Error("Twilio Voice is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.");
  }

  if (twilioAuthBlocked) {
    throw new Error("Twilio disabled: authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.");
  }

  try {
    const client = twilio(accountSid, authToken);
    const safeMessage = sanitizeForTwiml(message);
    const call = await client.calls.create({
      twiml: `<Response><Pause length="1"/><Say voice="alice" language="en-IN">${safeMessage}</Say><Pause length="1"/><Say voice="alice" language="en-IN">I repeat. ${safeMessage}</Say></Response>`,
      to: to,
      from: from,
    });
    console.log("Twilio Voice Call initiated to:", to, "| SID:", call.sid);
  } catch (error) {
    if (isTwilioAuthError(error)) {
      twilioAuthBlocked = true;
      logTwilioAuthBlocked();
      throw new Error("Twilio disabled: authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.");
    }
    const errMessage = error instanceof Error ? error.message : "Failed to initiate voice call";
    console.error("Twilio Voice Call Error:", errMessage);
    throw error;
  }
};

// AUTH ROUTES
app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters" });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const db = getDB();
  if (db.trainers.find((t: Trainer) => t.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newTrainer: Trainer = { id: Date.now().toString(), name, email, password: hashedPassword };
  db.trainers.push(newTrainer);
  saveDB(db);
  try {
    const welcomeEmail = trainerWelcomeEmail(name, email);
    await sendEmail({
      to: email,
      subject: welcomeEmail.subject,
      text: welcomeEmail.text,
      html: welcomeEmail.html,
    });
    console.log(`Trainer welcome email sent to ${email}`);
  } catch (error) {
    console.error("Trainer welcome email skipped:", getEmailErrorMessage(error));
  }
  const token = jwt.sign({ id: newTrainer.id, email }, SECRET_KEY);
  res.json({ token, user: { id: newTrainer.id, name, email } });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
    return res.status(400).json({ error: "Enter a valid email and password" });
  }

  const db = getDB();
  const trainer = db.trainers.find((t: Trainer) => t.email === email);
  if (!trainer || !(await bcrypt.compare(password, trainer.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: trainer.id, email }, SECRET_KEY);
  res.json({ token, user: { id: trainer.id, name: trainer.name, email } });
});

// MEMBERS API
app.get("/api/members", (req, res) => {
  const db = getDB();
  const trainerId = getTrainerIdFromRequest(req);
  // Return members belonging to this trainer, OR members with no trainer assigned (demo/seed data)
  const members: Member[] = trainerId
    ? db.members.filter((member: Member) => !member.trainerId || member.trainerId === trainerId)
    : db.members;
  res.json(members);
});

app.post("/api/members", async (req, res) => {
  const db = getDB();
  const trainerId = getTrainerIdFromRequest(req);
  const newMember = {
    ...req.body,
    id: Date.now().toString(),
    trainerId: trainerId || req.body.trainerId,
    attendance: [], // AttendanceRecord[]
    healthData: { hr: 75, spo2: 99 },
  };
  db.members.push(newMember);
  saveDB(db);

  let memberEmailSent = false;
  let emergencyEmailSent = false;
  let memberEmailError = "";
  let emergencyEmailError = "";

  // 1. Send welcome email to the member
  if (newMember.email) {
    try {
      const welcomeEmail = memberWelcomeEmail({
        name: newMember.name,
        email: newMember.email,
        age: newMember.age,
        gender: newMember.gender,
        bloodGroup: newMember.bloodGroup,
        emergencyContact: newMember.emergencyContact,
      });
      await sendEmail({
        to: newMember.email,
        subject: welcomeEmail.subject,
        text: welcomeEmail.text,
        html: welcomeEmail.html,
      });
      memberEmailSent = true;
      console.log(`Welcome email sent to member: ${newMember.email}`);
    } catch (error) {
      memberEmailError = getEmailErrorMessage(error);
      console.error(`Failed to send welcome email to ${newMember.email}:`, memberEmailError);
    }
  }

  // 2. Send notification email to the emergency contact
  if (newMember.emergencyContact?.email && newMember.emergencyContact?.name) {
    try {
      const ecWelcome = emergencyContactWelcomeEmail(
        newMember.emergencyContact.name,
        newMember.emergencyContact.email,
        {
          name: newMember.name,
          age: newMember.age,
          gender: newMember.gender,
          bloodGroup: newMember.bloodGroup,
          medicalHistory: newMember.medicalHistory,
        }
      );
      await sendEmail({
        to: newMember.emergencyContact.email,
        subject: ecWelcome.subject,
        text: ecWelcome.text,
        html: ecWelcome.html,
      });
      emergencyEmailSent = true;
      console.log(`Emergency contact welcome email sent to: ${newMember.emergencyContact.email}`);
    } catch (error) {
      emergencyEmailError = getEmailErrorMessage(error);
      console.error(`Failed to send emergency contact welcome email:`, emergencyEmailError);
    }
  }

  res.json({
    ...newMember,
    _emailStatus: {
      memberEmailSent,
      emergencyEmailSent,
      memberEmailError: memberEmailError || undefined,
      emergencyEmailError: emergencyEmailError || undefined,
    },
  });
});

app.put("/api/members/:id", (req, res) => {
  const db = getDB();
  const trainerId = getTrainerIdFromRequest(req);
  // Allow update if: id matches AND (no trainer context OR trainer owns the member OR member has no trainer assigned)
  const index = db.members.findIndex((m: Member) =>
    m.id === req.params.id && (!trainerId || !m.trainerId || m.trainerId === trainerId)
  );
  if (index === -1) return res.status(404).json({ error: "Member not found" });
  db.members[index] = { ...db.members[index], ...req.body };
  saveDB(db);
  res.json(db.members[index]);
});

app.delete("/api/members/:id", (req, res) => {
  const db = getDB();
  const trainerId = getTrainerIdFromRequest(req);
  const before = db.members.length;
  // Keep a member if: its id is different OR (ids match but it belongs to a DIFFERENT trainer)
  db.members = db.members.filter((m: Member) => {
    if (m.id !== req.params.id) return true; // Keep — different member
    // This IS the target member. Delete it unless it belongs to a different trainer.
    if (trainerId && m.trainerId && m.trainerId !== trainerId) return true; // Keep — owned by another trainer
    return false; // Delete
  });
  const deleted = before - db.members.length;
  saveDB(db);
  res.json({ success: true, deleted });
});

// ATTENDANCE APIs

// Get attendance for a specific member on a specific date
app.get("/api/attendance/:memberId/:date", (req, res) => {
  const { memberId, date } = req.params;
  const db = getDB();
  const trainerId = getTrainerIdFromRequest(req);
  const member = db.members.find((m: Member) => (
    m.id === memberId && (!trainerId || m.trainerId === trainerId)
  ));

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  const attendanceRecord = member.attendance.find((a: AttendanceRecord) => a.date === date);
  if (attendanceRecord) {
    res.json({ status: attendanceRecord.status });
  } else {
    res.json({ status: false }); // Default to absent if no record
  }
});

// Update or create attendance for a specific member on a specific date
app.put("/api/attendance/:memberId", (req, res) => {
  const { memberId } = req.params;
  const { date, status } = req.body;
  const db = getDB();
  const trainerId = getTrainerIdFromRequest(req);
  const member = db.members.find((m: Member) => (
    m.id === memberId && (!trainerId || m.trainerId === trainerId)
  ));

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  const existingIndex = member.attendance.findIndex((a: AttendanceRecord) => a.date === date);
  if (existingIndex !== -1) {
    member.attendance[existingIndex].status = status;
  } else {
    member.attendance.push({ date, status });
  }

  saveDB(db);
  res.json({ success: true, memberAttendance: member.attendance });
});

// Get all attendance history
app.get("/api/attendance/history", (req, res) => {
  const db = getDB();
  const allAttendance: { memberId: string; memberName: string; date: string; status: boolean }[] = [];

  db.members.forEach((member: Member) => {
    member.attendance.forEach((record: AttendanceRecord) => {
      allAttendance.push({
        memberId: member.id,
        memberName: member.name,
        date: record.date,
        status: record.status,
      });
    });
  });

  res.json(allAttendance);
});

// FEES API
app.post("/api/fees/remind", async (req, res) => {
  try {
    const { memberId, dueDate, pendingFees } = req.body;
    let member = req.body.member;

    if (!member && memberId) {
      const db = getDB();
      member = db.members.find((m: Member) => m.id === memberId);
    }

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

    // Send to both the member and the gym owner (if different)
    const emailRecipients = member.email;

    const amount = Number(pendingFees || 0).toLocaleString("en-IN");
    const paymentDueDate = dueDate || "the due date";

    const emailResult = await sendEmail({
      // Send to both the member and the gym owner (if different)
      to: emailRecipients,
      subject: "Fees Payment Reminder",
      text: `Hello ${member.name}, this is a reminder that your gym fees of Rs. ${amount} are due by ${paymentDueDate}. Please clear them at the earliest.`,
      html: `
        <p>Hello ${member.name},</p>
        <p>This is a reminder that your gym fees of <strong>Rs. ${amount}</strong> are due by <strong>${paymentDueDate}</strong>.</p>
        <p>Please clear them at the earliest.</p>
        <p>Regards,<br/>HealthSync Gym</p>
      `
    });

    console.log("Fees reminder accepted by email provider:", {
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

// EMERGENCY ALERT API
app.post("/api/emergency/alert", async (req, res) => {
  const { memberId, hr, spo2 } = req.body;
  let member = req.body.member;

  if (!member && memberId) {
    const db = getDB();
    member = db.members.find((m: Member) => m.id === memberId);
  }
  if (!member) return res.status(404).json({ error: "Member not found" });

  // Check for alert cooldown
  const now = Date.now();
  if (alertCooldowns[member.id] && now - alertCooldowns[member.id] < ALERT_COOLDOWN_MS) {
    console.log(`Emergency alert for ${member.name} is on cooldown.`);
    return res.status(429).json({ error: "Emergency alert is on cooldown. Please wait before sending another." });
  }
  if (!member.emergencyContact?.email && !member.emergencyContact?.phone) {
    return res.status(400).json({ error: "Emergency contact email or phone is required" });
  }

  // Initialize status and error messages for both email and SMS
  let emailSentSuccessfully = false;
  let smsSentSuccessfully = false;
  let voiceCallSentSuccessfully = false; // New: Voice call status
  let voiceCallErrorMessage = ""; // Initialize voiceCallErrorMessage
  let emailErrorMessage = "";
  let smsErrorMessage = "";

  // Check email configuration upfront to set initial error message if not configured
  const initialEmailConfigError = getEmailConfigError();
  if (initialEmailConfigError) emailErrorMessage = initialEmailConfigError;

  try {
    // 1. Send Email
    if (member.emergencyContact?.email && !emailAuthBlocked && !initialEmailConfigError) {
      try {
        const alertEmail = emergencyAlertEmail(
          {
            name: member.name,
            age: member.age,
            gender: member.gender,
            bloodGroup: member.bloodGroup,
            medicalHistory: member.medicalHistory,
            emergencyContact: member.emergencyContact,
          },
          { hr, spo2 }
        );
        await sendEmail({
          to: member.emergencyContact.email,
          subject: alertEmail.subject,
          text: alertEmail.text,
          html: alertEmail.html,
        });
        emailSentSuccessfully = true;
        console.log(`✅ Emergency alert email SENT to ${member.emergencyContact.email} for member ${member.name}`);
      } catch (error) {
        if (isEmailProviderError(error)) {
          emailAuthBlocked = true;
          logEmailAuthBlocked("Alert email disabled");
          emailErrorMessage = emailProviderMessage;
        } else if (isEmailConfigErrorThrown(error)) { // Catch config errors thrown by sendEmail
          emailErrorMessage = (error as Error).message;
        } else {
          // Re-throw other unexpected errors to be caught by the outer catch
          throw error;
        }
      }
    } else if (emailAuthBlocked) { // If email was already blocked from a previous attempt
      emailErrorMessage = emailProviderMessage;
    } else if (!member.emergencyContact?.email) { // If no emergency email is provided
      emailErrorMessage = "No emergency contact email provided.";
    } else if (initialEmailConfigError) { // If email was not configured from the start
      emailErrorMessage = initialEmailConfigError;
    }

    // 2. Send SMS via Twilio (gym owner included by default)
    const smsMessage = emergencySmsMessage(
      {
        name: member.name,
        bloodGroup: member.bloodGroup,
        medicalHistory: member.medicalHistory,
        emergencyContact: member.emergencyContact,
      },
      { hr, spo2 }
    );

    // Pass member phone (if exists) and emergency contact
    try {
      await sendEmergencySMS([member.emergencyContact?.phone].filter(Boolean) as string[], smsMessage);
      console.log(`Emergency alert SMS processed for ${member.name}`);
      smsSentSuccessfully = true;
    } catch (error) {
      if (error instanceof Error) {
        smsErrorMessage = error.message;
      } else {
        smsErrorMessage = String(error);
      }
    }

    // 3. Make Voice Call via Twilio — personalized message to emergency contact
    const voiceCallMessage = emergencyVoiceCallMessage(
      {
        name: member.name,
        age: member.age,
        gender: member.gender,
        bloodGroup: member.bloodGroup,
        medicalHistory: member.medicalHistory,
        emergencyContact: member.emergencyContact,
      },
      { hr, spo2 }
    );
    if (member.emergencyContact?.phone) {
      try {
        await sendEmergencyVoiceCall(member.emergencyContact.phone, voiceCallMessage);
        console.log(`Emergency voice call initiated for ${member.name} → ${member.emergencyContact.phone}`);
        voiceCallSentSuccessfully = true;
      } catch (error) {
        if (error instanceof Error) {
          voiceCallErrorMessage = error.message;
        } else {
          voiceCallErrorMessage = String(error);
        }
      }
    } else {
      voiceCallErrorMessage = "No emergency contact phone number provided for voice call.";
    }

    // Determine overall success and response
    if (emailSentSuccessfully || smsSentSuccessfully || voiceCallSentSuccessfully) { // Updated condition
      res.json({
        alertCooldowns: alertCooldowns[member.id] = now, // Set cooldown on successful alert
        success: true,
        emailStatus: emailSentSuccessfully ? "sent" : (emailErrorMessage ? "failed" : "skipped"),
        smsStatus: smsSentSuccessfully ? "sent" : (smsErrorMessage ? "failed" : "skipped"),
        voiceCallStatus: voiceCallSentSuccessfully ? "initiated" : (voiceCallErrorMessage ? "failed" : "skipped"), // New
        emailError: emailErrorMessage || undefined,
        smsError: smsErrorMessage || undefined,
        voiceCallError: voiceCallErrorMessage || undefined, // New
      });
    } else {
      // If neither email nor SMS could be sent, return a 500
      res.status(500).json({
        error: "Failed to send any emergency alerts.",
        emailStatus: "failed",
        smsStatus: "failed",
        voiceCallStatus: "failed", // New
        emailError: emailErrorMessage || "Email not attempted or failed.",
        smsError: smsErrorMessage || "SMS not attempted or failed.",
        voiceCallError: voiceCallErrorMessage || "Voice call not attempted or failed.", // New
      });
    }
  } catch (error) {
    // This catch block will only be hit by truly unexpected errors not handled above
    let unexpectedErrorMessage = "An unexpected error occurred during alert processing.";
    if (error instanceof Error) {
      unexpectedErrorMessage = error.message;
    } else {
      unexpectedErrorMessage = String(error);
    }
    console.error("Unexpected Alert route error:", unexpectedErrorMessage);
    res.status(500).json({ error: unexpectedErrorMessage });
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
    
    // Track ticks to guarantee a spike every 2.5 minutes (50 ticks * 3 seconds)
    if (memberTicks[m.id] === undefined) {
      memberTicks[m.id] = Math.floor(Math.random() * 40); // Stagger initial alerts
    }
    memberTicks[m.id]++;

    // Normal safe fluctuation
    let newHr = clamp(currentHr + randomStep(2, 3), 60, 100);
    let newSpo2 = clamp(currentSpo2 + randomStep(0, 1), 94, 100);

    // Deterministic spike to critical levels every ~50 ticks (2.5 mins)
    if (memberTicks[m.id] >= 50) {
      newHr = 106 + Math.floor(Math.random() * 10); // 106-115 BPM
      newSpo2 = 90 + Math.floor(Math.random() * 3); // 90-92%
      memberTicks[m.id] = 0; // Reset timer
    }

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
    // Serve index.html for all non-API routes (SPA client-side routing)
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
