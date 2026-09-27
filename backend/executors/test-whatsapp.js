/**
 * test-whatsapp.js — manual test for the WhatsApp executor
 *
 * Run: node executors/test-whatsapp.js "Neeraj" "Hi, just checking in!"
 */

const { sendWhatsAppMessage } = require("./whatsapp-executor");

const contact = process.argv[2];
const message = process.argv[3];

if (!contact || !message) {
  console.log('Usage: node executors/test-whatsapp.js "ContactName" "Message text"');
  process.exit(1);
}

(async () => {
  const result = await sendWhatsAppMessage(contact, message);
  console.log("\nResult:", result);
})();
