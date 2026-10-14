#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const MODEL = "claude-haiku-4-5-20251001";
const HASH_EXT = /^(py|rb|sh|bash|zsh|fish|yaml|yml|toml|cfg|ini|conf|r|pl|pm|ex|exs|nix|tf|hcl|gitignore|gitattributes|env|properties)$/;
const HASH_FILE = /^(Dockerfile|Makefile|Rakefile|Gemfile|Justfile|\.gitignore|\.env.*)$/;
const SKIP_EXT = /^(json|lock|csv|svg|png|jpg|woff|woff2|txt|md|markdown)$/;

const input = JSON.parse(readFileSync(0, "utf8"));
const file = input.tool_input?.file_path ?? "";
const text = input.tool_input?.content ?? input.tool_input?.new_string ??
  (input.tool_input?.edits ?? []).map(e => e.new_string).join("\n");
if (!file || !text) process.exit(0);

const base = path.basename(file);
const ext = base.includes(".") ? base.split(".").pop().toLowerCase() : "";
if (SKIP_EXT.test(ext)) process.exit(0);

const hash = HASH_EXT.test(ext) || HASH_FILE.test(base);
const suspect = text.split("\n").some(line => hash
  ? /^\s*#/.test(line) && !/^#!/.test(line)
  : /^\s*(\/\/|\/\*|\*\s|\*\/|<!--)/.test(line));
if (!suspect) process.exit(0);

const judge = spawnSync("claude", [
  "-p", "--model", MODEL, "--tools", "", "--output-format", "json",
  "--settings", '{"disableAllHooks":true}', "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
  "--no-session-persistence", "--disable-slash-commands",
  "--system-prompt-file", path.join(__dirname, "JUDGE.md"),
], { input: `File: ${file}\n\n${text}`, encoding: "utf8", timeout: 40000 });
if (judge.status !== 0) process.exit(0);

let result = "";
try {
  result = JSON.parse(judge.stdout).result ?? "";
} catch {
  process.exit(0);
}
if (!/"ok"\s*:\s*false/.test(result)) process.exit(0);

let reason;
try {
  reason = JSON.parse(result.slice(result.indexOf("{"), result.lastIndexOf("}") + 1)).reason;
} catch {
  reason = result.replace(/```(json)?/g, "").replace(/^\s*\{\s*"ok"\s*:\s*false\s*,\s*"reason"\s*:\s*"?/, "").replace(/"?\s*\}\s*$/, "").trim();
}

process.stderr.write(`broom read ${base} without any context and rejects:\n${reason}\nApply each verdict now. Do not argue it.\n`);
process.exit(2);
