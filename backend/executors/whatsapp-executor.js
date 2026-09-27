/**
 * whatsapp-executor.js — ActOn's WhatsApp Web executor
 *
 * First run: opens WhatsApp Web, you scan the QR code once.
 * Session is saved to whatsapp-session.json so future runs skip the QR.
 *
 * sendWhatsAppMessage() finds the contact, types the message, then
 * PAUSES for a manual confirmation in the terminal before actually
 * clicking send — this is the "Risk Gate" for the risky step.
 */

const { chromium } = require("playwright");
const path = require("path");
const readline = require("readline");

const SESSION_FILE = path.join(__dirname, "..", "whatsapp-session.json");

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

/**
 * Open WhatsApp Web, find a contact, type a message, and (after
 * human approval) send it.
 * @param {string} contact - exact or partial name as it appears in WhatsApp
 * @param {string} message - text to send
 */
async function sendWhatsAppMessage(contact, message) {
  const fs = require("fs");
  const hasSession = fs.existsSync(SESSION_FILE);

  const browser = await chromium.launch({ headless: false }); // visible browser, so you can see it working
  const context = await browser.newContext(
    hasSession ? { storageState: SESSION_FILE } : {}
  );
  const page = await context.newPage();

  console.log("Opening WhatsApp Web...");
  await page.goto("https://web.whatsapp.com");

  if (!hasSession) {
    console.log("\n📱 Scan the QR code with your phone (WhatsApp > Linked Devices).");
    console.log("Waiting for you to log in...\n");
  }

  // Wait until the chat list/search box is visible = logged in
  await page.waitForSelector('[aria-label="Search input textbox"], [contenteditable="true"][data-tab="3"]', {
    timeout: 120000, // 2 min to scan QR if needed
  });

  // Save session so next run skips the QR code
  await context.storageState({ path: SESSION_FILE });
  console.log("Logged in. Session saved.\n");

  // Search for the contact
  console.log(`Searching for contact: ${contact}`);
  const searchBox = page.locator('[aria-label="Search input textbox"]').first();
  await searchBox.click();
  await searchBox.fill(contact);
  await page.waitForTimeout(1500); // let search results render

  // Click the first matching chat result
  const firstResult = page.locator('[aria-label="Search results."] >> role=listitem').first();
  await firstResult.click();
  await page.waitForTimeout(1000);

  // Type the message into the message box (does NOT send yet)
  console.log(`Typing message: "${message}"`);
  const messageBox = page.locator('[contenteditable="true"][data-tab="10"], [aria-label="Type a message"]').first();
  await messageBox.click();
  await messageBox.fill(message);

  // === RISK GATE ===
  // This is the step that must not run without human approval.
  console.log("\n🛑 RISKY STEP: about to SEND this message.");
  const approved = await askConfirmation(`Send this message to "${contact}"? (y/n): `);

  if (!approved) {
    console.log("❌ Rejected by user. Message left drafted, NOT sent.");
    await browser.close();
    return { sent: false, reason: "rejected_by_user" };
  }

  await page.keyboard.press("Enter");
  console.log("✅ Message sent.");

  await page.waitForTimeout(1500); // let the send finish before closing
  await browser.close();
  return { sent: true };
}

module.exports = { sendWhatsAppMessage };
