/**
 * test-planner.js — quick manual test for planner.js
 *
 * Run: node planner/test-planner.js "Neeraj ko WhatsApp pe follow-up bhejo"
 */

require("dotenv").config();
const { planGoal } = require("./planner");

const goal = process.argv[2] || "Send a WhatsApp follow-up message to Neeraj";

(async () => {
  console.log(`\nGoal: ${goal}\n`);
  try {
    const plan = await planGoal(goal);
    console.log("Generated plan:\n");
    console.log(JSON.stringify(plan, null, 2));
  } catch (err) {
    console.error("Planner failed:", err.message);
  }
})();
