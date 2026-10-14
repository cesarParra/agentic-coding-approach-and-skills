#!/usr/bin/env node
const { readFileSync } = require("node:fs");

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
const JEV_MODEL = "jev-1.13.0";
const THRESHOLD = 0.5;
const CHUNK = 20;

const PATTERNS = [
  { tell: "dash as punctuation", fix: "use a comma, a period, a colon or parentheses", re: /—|\s–\s/ },
  { tell: "not X, it's Y", fix: "state the positive claim on its own", re: /\b(?:is|'s|are|was|were)\s+not\s+[^.?!,;]{1,60}[,;]\s*(?:it|they|this|that)(?:'s|\s+is|\s+are)\b|\bnot\s+(?:just|only|merely)\b[^.?!]{1,60}\bbut\b|\b(?:isn'?t|is not)\s+about\b|^less\s+\w[^.]*,\s*more\b/i },
  { tell: "buzzword", fix: "use the plain word", re: /\b(?:leverag(?:e|es|ed|ing)|robust|seamless(?:ly)?|utiliz(?:e|es|ed|ing)|delve|synerg(?:y|ies)|best-in-class|cutting-edge|game[- ]changer|empower(?:s|ing)?|unlock(?:s|ing)?|tapestry|holistic)\b/i },
  { tell: "throat-clearing", fix: "delete it and start with the point", re: /\b(?:it'?s worth (?:noting|knowing|remembering)|let'?s dive in|read that again|this is the part to read|in this (?:guide|document|article|post),? (?:we|you)|this (?:document|guide) (?:outlines|describes|explains)|in short|to sum up|in summary|the (?:key|main) takeaway)\b/i },
  { tell: "intensifier", fix: "delete the word", re: /\b(?:genuinely|exactly|simply|quietly|cheerfully|importantly|obviously|of course|in other words|note that|it should be noted|actually|really)\b/i },
];

const TELLS = [
  {
    id: "contrast",
    tell: "contrast framing",
    fix: "state the fact directly and drop the foil",
    ask: "frames its point against a foil: it pairs its claim with something it negates, minimises or calls wrong (often joined by 'and almost none', 'and very little', 'not', 'rather than', 'instead of', or a following sentence that dismisses an expectation), so the claim reads as a reveal instead of a plain statement",
    yes: "Sets up something to knock down: 'The tool is fast, and almost none of its cost is compute', 'It's not a bug, it's a feature', 'The network isn't the problem; the cache is', 'That assumption is wrong', 'Most people think X'.",
    no: "States a fact or gives an instruction, including plain negatives ('The cache doesn't persist.', 'Don't log the token.'), a fact with its condition ('The API returns 200 even when the payload is empty'), and a scoping caveat ('We may need more input later, but that won't delay the start').",
  },
  {
    id: "backstory",
    tell: "backstory",
    fix: "delete it; keep only what a reader needs to act",
    ask: "tells where the content came from or how it was learned: a project, ticket, proof of concept, client engagement, or an episode from the past",
    yes: "'These notes come from the billing migration last spring', 'We learned this the hard way on a client project', 'after the first attempt failed', 'this guide grew out of a support ticket'.",
    no: "Describes how the system behaves or what to do, with no origin story. A version number or a date the reader needs is not backstory.",
  },
  {
    id: "commentary",
    tell: "color commentary",
    fix: "delete it or replace it with the fact behind it",
    ask: "is an editorial aside to the reader that adds no fact or instruction: drama about effort, scene-setting, a joke, or a verdict on how hard or surprising something is",
    yes: "'Read this part twice, it will save you an afternoon of grief', 'Every team hits this sooner or later', 'Here comes the fun part', 'A quick word of warning', 'which nobody enjoys'.",
    no: "Carries a fact, a step, a condition or a consequence the reader needs, or plainly introduces what follows ('Below are the steps for each environment.', 'Here are the costs per option.').",
  },
  {
    id: "hedging",
    tell: "hedging",
    fix: "commit to the claim or cut it",
    ask: "softens its own claim with qualifiers that carry no information",
    yes: "'arguably', 'it may be worth', 'somewhat', 'generally speaking', 'in most cases this tends to', 'it could be said'.",
    no: "States the claim plainly, or names a real condition under which it does not hold.",
  },
];

const readInput = () => JSON.parse(readFileSync(0, "utf8"));

function collect(value, out = []) {
  if (typeof value === "string") return out;
  if (Array.isArray(value)) {
    value.forEach((v) => collect(v, out));
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if ((key === "content" || key === "markdown") && typeof v === "string") out.push(v);
      else collect(v, out);
    }
  }
  return out;
}

function proseOf(input) {
  const tool = input.tool_name ?? "";
  const ti = input.tool_input ?? {};
  if (tool.startsWith("mcp__claude_ai_Claude_Docs__")) {
    return { target: "the doc", text: collect(ti).join("\n\n") };
  }
  const file = ti.file_path ?? "";
  if (!/\.(md|markdown)$/i.test(file) || /\/broom\/skills\/writing\/SKILL\.md$/.test(file)) return null;
  const text = ti.content ?? ti.new_string ?? (ti.edits ?? []).map((e) => e.new_string).join("\n");
  return { target: file.split("/").pop(), text };
}

function sentences(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\?claude block \w+\?>/g, " ")
    .replace(/`[^`\n]*`/g, "`x`")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "URL");
  const blocks = [];
  let open = false;
  for (const line of plain.split("\n")) {
    if (!line.trim()) {
      open = false;
    } else if (/^\s*\|/.test(line)) {
      if (!/^\s*\|[\s|:-]+\|\s*$/.test(line)) blocks.push(...line.split("|").map((c) => c.trim()));
      open = false;
    } else if (/^\s*#{1,6}\s+/.test(line)) {
      blocks.push(line.replace(/^\s*#{1,6}\s+/, ""));
      open = false;
    } else if (open && !/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) {
      blocks[blocks.length - 1] += ` ${line.replace(/^\s*>?\s*/, "")}`;
    } else {
      blocks.push(line.replace(/^\s*(?:>\s*|[-*+]\s+(?:\[[ x]\]\s+)?|\d+\.\s+)/, ""));
      open = true;
    }
  }
  return blocks
    .map((b) => b.replace(/\*\*|__/g, ""))
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=["'(*A-Z0-9])/))
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4);
}

function mechanical(list) {
  return list.flatMap((sentence) =>
    PATTERNS.filter((p) => p.re.test(sentence)).map((p) => ({ sentence, tell: p.tell, fix: p.fix })),
  );
}

async function judge(list, key) {
  const chunks = [];
  for (let i = 0; i < list.length; i += CHUNK) chunks.push(list.slice(i, i + CHUNK));
  const answers = await Promise.all(chunks.map(async (chunk) => {
    const questions = {};
    chunk.forEach((_, i) => {
      for (const t of TELLS) {
        questions[`${t.id}_${i}`] = {
          type: "noul",
          instructions: `Read \`sentences[${i}]\` in the context of its neighbours. Does \`sentences[${i}]\` itself ${t.ask}?`,
          criteria: { true: t.yes, false: t.no },
        };
      }
    });
    const res = await fetch(JEV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: JEV_MODEL, state: { sentences: chunk }, questions }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`Jev ${res.status}`);
    const { answers: a } = await res.json();
    return chunk.flatMap((sentence, i) =>
      TELLS.filter((t) => (a[`${t.id}_${i}`]?.noul ?? 0) >= THRESHOLD)
        .map((t) => ({ sentence, tell: t.tell, fix: t.fix, p: a[`${t.id}_${i}`].noul })),
    );
  }));
  return answers.flat();
}

async function check(text, key) {
  const list = sentences(text);
  const found = mechanical(list);
  let judged = true;
  if (key && list.length) {
    try {
      found.push(...(await judge(list, key)));
    } catch {
      judged = false;
    }
  } else {
    judged = false;
  }
  return { found, judged };
}

function report(target, found) {
  const shown = (s) => (s.length > 160 ? `${s.slice(0, 157)}...` : s);
  const lines = found.map((f) => `- [${f.tell}] "${shown(f.sentence)}" → ${f.fix}`);
  return `broom read ${target} and rejects ${found.length} sentence${found.length === 1 ? "" : "s"}.\nLoad the broom:writing skill if it is not loaded, rewrite each one, then retry the write:\n${lines.join("\n")}\n`;
}

async function main() {
  const prose = proseOf(readInput());
  if (!prose || !prose.text.trim()) process.exit(0);
  const { found } = await check(prose.text, process.env.TYPESAFE_API_KEY);
  if (!found.length) process.exit(0);
  process.stderr.write(report(prose.target, found));
  process.exit(2);
}

if (require.main === module) main().catch(() => process.exit(0));

module.exports = { sentences, mechanical, check, proseOf, TELLS, JEV_URL, JEV_MODEL };
