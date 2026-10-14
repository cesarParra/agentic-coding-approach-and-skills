---
name: writing
description: Rules for writing documentation others will read, adapted from Michael Lynch's Refactoring English. Load before writing or rewriting a guide, README, design doc, how-to, client email or any Markdown or Claude Docs document, and whenever broom rejects prose.
---

# Writing documentation

Source: *Refactoring English*, Michael Lynch (v1.0.4). These rules are a working summary; the book has the reasoning and the examples.

## Open with what the reader gets

1. The first two sentences answer "is this for me?" and "is it worth my time?". Name the reader's goal and the result.
2. Put the action first and the theory after. A reader who can do the thing cares about the architecture; a reader who can't, doesn't yet.
3. Write inverted-pyramid: the conclusion, then the detail that supports it.
4. The title promises a concrete outcome and leads with its key terms.

## Structure for a reader who skims

1. Headings state the point ("Clear the Tracking ID so GTM loads once"), never just the topic ("Tracking ID").
2. Headings alone tell a skimmer what the document covers.
3. Early sections work for every expected reader; later sections may assume more.
4. A procedure longer than 7 steps splits into sections of at most 7.
5. Action items go last, under their own heading, one owner each.

## Explain before you use

1. Define a term the first time it appears, inline. A link is no substitute for an explanation.
2. When unsure whether readers know something, explain it. Experts skip a sentence; beginners can't skip an unknown term.
3. Teach one concept at a time.

## Make examples copy-pasteable

1. No `$` prompts in commands meant to be copied, no line numbers, long flags (`--yes`), commands joined with `&& \`.
2. Put values the reader sets in variables at the top, with a "replace with" note.
3. Use example values that look like real data and can't be mistaken for keywords.
4. Give the full path of every file to edit and show where the change goes.
5. End by showing it working.

## Cut

Ask of every word, sentence, paragraph and section: does the meaning change without it? If not, delete it.

- No backstory: where the knowledge came from, which project taught it, what happened the first time. A reader a year from now gains nothing from it.
- No color commentary: drama about effort, scene-setting, verdicts on how hard something was.
- No recap of what was just said, and no announcement of what comes next.
- A story or rant, if it must exist, goes at the end and is marked as an aside.

## Sentences

1. Verbs carry the sentence. "The app had two crashes" becomes "The app crashed twice." "Provides authentication for" becomes "authenticates".
2. Phrase positively: "fails", not "does not succeed".
3. Name the actor. Passive voice hides who does what; use it only when the actor is irrelevant.
4. Delete filler: very, really, just, actually, pretty, quite.
5. Use short words: "use", not "utilize".
6. Give every pronoun one possible referent, and repeat the noun after a heading or paragraph break.
7. Write at your real level of expertise: no apology, no false authority, no hedging.
8. Read it aloud. Edit wherever you stumble or get bored.

## Tells broom rejects

| Tell | Example | Fix |
| --- | --- | --- |
| Contrast framing | "X works, and almost none of the fix is Y" / "It's not X, it's Y" | State the fact on its own |
| Backstory | "Everything here comes from the proof of concept" | Delete |
| Color commentary | "so you don't spend a day on it like everyone before us" | Delete, or keep the fact behind it |
| Hedging | "arguably", "it may be worth" | Commit to the claim or cut it |
| Recap | "In short", "To sum up", "The key takeaway" | Delete |
| Dash as punctuation | an em dash, or a spaced en dash | Comma, period, colon or parentheses |
| Intensifier | genuinely, simply, obviously, actually | Delete |
| Buzzword | leverage, robust, seamless | The plain word |
