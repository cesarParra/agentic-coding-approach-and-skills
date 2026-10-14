const test = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const { titleIn } = require("./broom-title.js");

const title = (command) => titleIn(command).title;

test("a commit title keeps an apostrophe inside double quotes", () => {
  assert.equal(title(`git commit -m "Skip Claude's memory notes in broom-prose"`), "Skip Claude's memory notes in broom-prose");
});

test("a commit title keeps double quotes inside single quotes", () => {
  assert.equal(title(`git commit -m 'Fix the "Paid" status check'`), 'Fix the "Paid" status check');
});

test("the first -m is the title and later -m flags are the body", () => {
  assert.equal(title(`git add . && git commit -q -m "Add the prose judge" -m "Body that isn't the title."`), "Add the prose judge");
});

test("a heredoc elsewhere in the command is not read as the title", () => {
  const command = `python3 - <<'EOF'\nprint("x")\nEOF\ngit commit -m "Add the prose judge"`;
  assert.equal(title(command), "Add the prose judge");
});

test("a heredoc inside -m gives its first line", () => {
  const command = `git commit -m "$(cat <<'EOF'\nAdd the prose judge\n\nBody text.\nEOF\n)"`;
  assert.equal(title(command), "Add the prose judge");
});

test("-F reads the title from the message file", () => {
  const file = join(mkdtempSync(join(tmpdir(), "broom-title-")), "msg.txt");
  writeFileSync(file, "Add the prose judge\n\nBody text.\n");
  assert.equal(title(`git commit -q -F ${file}`), "Add the prose judge");
});

test("a pull request title is read from --title", () => {
  assert.equal(title(`gh pr create --title "Teach the bot to cite Radical One's guides" --body "x"`), "Teach the bot to cite Radical One's guides");
});
