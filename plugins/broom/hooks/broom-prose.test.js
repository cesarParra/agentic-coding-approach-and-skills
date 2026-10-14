const test = require("node:test");
const assert = require("node:assert/strict");
const { sentences, mechanical, check, proseOf } = require("./broom-prose.js");

const KEY = process.env.TYPESAFE_API_KEY;

const MUST_FLAG = [
  "GA4 works on a Fonteva portal before FP16, and almost none of the fix is Salesforce code.",
  "Everything here comes from the AMIA-95 proof of concept (Fonteva 21Winter, Aura portal) run in October 2026.",
  "Check this first, so you don't spend a day on it like everyone before us.",
  "We did exactly that once on AMIA, for one page view, before we found the second place the ID hides.",
  "Both guesses are wrong, and the time goes into chasing them.",
];

const MUST_PASS = [
  "GTM loads on every page of the portal, logged in or not.",
  "Clear the Google Analytics Tracking ID in Experience Builder, then publish the site.",
  "Set the receipt's posted flag to true and the order turns Paid.",
  "Fonteva fires two history events for every page change, so the trigger listens to popstate only.",
  "Measurement Protocol answers 204 even when the ID or the secret is wrong, so check the Realtime report.",
  "Here is a breakdown of what it would take to implement the different requests.",
  "Most of these are independent, so we can deliver 1 and 2 first.",
  "We may need a few more details for the purchase event, but nothing that would prevent us from starting the work.",
  "The page doesn't reload when the member opens Subscriptions.",
  "Don't track purchases in the browser; send them from Salesforce when the order is paid.",
];

test("sentences drops code and keeps prose from lists, headings and tables", () => {
  const md = "## Fix the trigger now\n\n- Add the `popstate` condition to the trigger.\n\n```js\nconst a = 1;\n```\n\n| Symptom | Fix |\n| --- | --- |\n| Two page views per click | Trigger on popstate only |";
  assert.deepEqual(sentences(md), [
    "Fix the trigger now",
    "Add the `x` condition to the trigger.",
    "Two page views per click",
    "Trigger on popstate only",
  ]);
});

test("sentences joins hard-wrapped lines of a paragraph and a list item", () => {
  const md = "A guide is built on the generic path, and cleanup for\nearlier attempts sits in its own section.\n\n- First item that wraps\n  onto a second line.\n- Second item stays on its own.";
  assert.deepEqual(sentences(md), [
    "A guide is built on the generic path, and cleanup for earlier attempts sits in its own section.",
    "First item that wraps onto a second line.",
    "Second item stays on its own.",
  ]);
});

test("mechanical tells are caught without Jev", () => {
  const tells = mechanical(["The setting lives in bootstrap.js — not the head markup.", "Let's dive in to the setup steps."]).map((f) => f.tell);
  assert.deepEqual(tells, ["dash as punctuation", "throat-clearing"]);
});

test("Claude Docs payloads are read for their markdown", () => {
  const prose = proseOf({ tool_name: "mcp__claude_ai_Claude_Docs__update", tool_input: { payload: { ops: [{ with: { from: { kind: "inline", content: "One honest caveat about the setting." } } }] } } });
  assert.equal(prose.text, "One honest caveat about the setting.");
  assert.equal(proseOf({ tool_name: "Write", tool_input: { file_path: "a.js", content: "x" } }), null);
  assert.equal(proseOf({ tool_name: "Write", tool_input: { file_path: "/Users/x/.claude/projects/p/memory/note.md", content: "We learned this the hard way." } }), null);
});

test("Jev flags each tell in a clean paragraph and passes clean prose", { skip: !KEY && "TYPESAFE_API_KEY is not set" }, async () => {
  const clean = await check(MUST_PASS.join(" "), KEY);
  assert.ok(clean.judged, "Jev did not answer");
  assert.deepEqual(clean.found.map((f) => `${f.tell} ${f.p?.toFixed(2)}: ${f.sentence}`), []);
  for (const s of MUST_FLAG) {
    const { found } = await check(`${MUST_PASS[0]} ${s} ${MUST_PASS[1]}`, KEY);
    assert.ok(found.some((f) => f.sentence === s), `not flagged: ${s}`);
  }
});
