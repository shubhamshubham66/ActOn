/**
 * planner.js — ActOn's "Brain"
 *
 * Takes a plain-language goal and returns a structured step-by-step plan
 * that the executor (Playwright) can run. Any step that sends/submits/
 * changes something in a real app is marked risky: true, so the Risk Gate
 * can pause for human approval before it runs.
 */

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the planning module of "ActOn", an autonomous agent
that completes goals inside everyday apps (WhatsApp Web, Gmail, Google Calendar).

Given a user's goal in plain language, break it into an ordered list of steps.

Rules:
- Each step must be one atomic action (e.g. "open a chat", "type a message", "click send").
- Mark a step "risky": true if it sends, submits, deletes, or changes anything
  in a real app in a way that cannot be easily undone (sending a message,
  sending an email, creating a calendar event that notifies people, etc).
- Mark a step "risky": false if it's just reading, searching, or drafting
  (nothing is sent/submitted yet).
- Only use one of these "app" values: "whatsapp", "gmail", "calendar".
- Respond with ONLY valid JSON, no other text, no markdown code fences.

Output JSON shape:
{
  "goal": "<the original goal>",
  "app": "whatsapp" | "gmail" | "calendar",
  "steps": [
    { "id": 1, "action": "short_snake_case_name", "description": "human readable description", "risky": false, "params": { } }
  ]
}`;

/**
 * Turn a plain-language goal into a structured plan.
 * @param {string} goalText - e.g. "Neeraj ko WhatsApp pe follow-up bhejo"
 * @returns {Promise<object>} parsed plan JSON
 */
async function planGoal(goalText) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: `Goal: ${goalText}` },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Planner returned invalid JSON. Raw response:\n${rawText}\n\nParse error: ${err.message}`
    );
  }
}

module.exports = { planGoal };
