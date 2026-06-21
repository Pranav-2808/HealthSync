<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5a0d704f-755d-4ef9-b727-7ab8e17c5f05

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure your environment in `.env`:
   - `GEMINI_API_KEY` for Gemini API calls
   - `EMAIL_USERNAME` and `EMAIL_PASSWORD` for Gmail SMTP delivery
   - `EMAIL_FROM` with your sender email address
   - `EMAIL_FROM_NAME` for the sender display name
   - `TWILIO_ACCOUNT_SID` for your Twilio account SID
   - `TWILIO_AUTH_TOKEN` for your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER` for your Twilio Phone Number
3. Run the app:
   `npm run dev`

## Email

Fees reminders and emergency emails are sent through Gmail using `EMAIL_USERNAME` and `EMAIL_PASSWORD`.
SMS alerts are sent via Twilio using `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
