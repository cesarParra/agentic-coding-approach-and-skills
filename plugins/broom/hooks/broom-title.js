#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const MODEL = "claude-haiku-4-5-20251001";
const VERB = /^(add|fix|remove|rename|move|run|make|give|store|replace|reorder|transfer|host|finish|drop|update|support|allow|prevent|split|extract|document|migrate|close|record|rewrite|send|handle|accept|refuse|publish|install|deploy|report|verify|check|catch|delete|create|introduce|enable|disable|expose|limit|guard|port|convert|refactor|inline|cover|skip|stop|start|keep|clear|restrict|research|design|teach|wire|pin|seed|show|hide|log|cache|narrow|widen|bump|use|write|read|return|raise|sweep|track|let)\b/i;
const SKIP = /^(merge |revert |fixup!|squash!|wip\b|bump\b|v?\d+\.\d+\.\d+)/i;

function argAfter(command, flags) {
  const flag = command.match(new RegExp(`(?:^|\\s)(?:${flags})(?:=|\\s+)`));
  if (!flag) return null;
  const rest = command.slice(flag.index + flag[0].length);
  const heredoc = rest.match(/^"\$\(cat\s+<<-?\s*'?(\w+)'?\n([\s\S]*?)\n\s*\1\b/);
  if (heredoc) return heredoc[2];
  if (rest[0] === "'") return rest.slice(1, rest.indexOf("'", 1));
  if (rest[0] === '"') {
    const m = rest.match(/^"((?:[^"\\]|\\.)*)"/);
    return m ? m[1].replace(/\\(.)/g, "$1") : null;
  }
  return rest.match(/^\S+/)?.[0] ?? null;
}

function fileArg(command) {
  const file = argAfter(command, "-F|--file");
  if (!file || file === "-") return null;
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

const firstLine = (text) => text?.split("\n").find((l) => l.trim())?.trim() ?? null;

function titleIn(command) {
  if (/\bgh\s+(pr|issue)\s+(create|edit)\b/.test(command)) {
    return { kind: "a pull request or issue title", title: firstLine(argAfter(command, "--title|-t")) };
  }
  if (/\bgit\s+commit\b/.test(command)) {
    return { kind: "a commit subject", title: firstLine(argAfter(command, "-m|--message") ?? fileArg(command)) };
  }
  if (/\btatr\s+new\b/.test(command)) {
    const all = [...command.matchAll(/(["'])([^"']{4,})\1/g)].map((m) => m[2]);
    return { kind: "a backlog task title", title: all[all.length - 1] ?? null };
  }
  return { kind: null, title: null };
}

function main() {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const { kind, title } = titleIn(input.tool_input?.command ?? "");
  if (!title || SKIP.test(title) || VERB.test(title)) process.exit(0);

  const judge = spawnSync("claude", [
    "-p", "--model", MODEL, "--tools", "", "--output-format", "json",
    "--settings", '{"disableAllHooks":true}', "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
    "--no-session-persistence", "--disable-slash-commands",
    "--system-prompt-file", path.join(__dirname, "TITLE-JUDGE.md"),
  ], { input: `This is ${kind}:\n\n${title}`, encoding: "utf8", timeout: 40000 });
  if (judge.status !== 0) process.exit(0);

  let result = "";
  try {
    result = JSON.parse(judge.stdout).result ?? "";
  } catch {
    process.exit(0);
  }
  if (!/"ok"\s*:\s*false/.test(result)) process.exit(0);

  let verdict = {};
  try {
    verdict = JSON.parse(result.slice(result.indexOf("{"), result.lastIndexOf("}") + 1));
  } catch {
    process.exit(0);
  }

  process.stderr.write(
    `broom read this title with no context and rejects it:\n\n  ${title}\n\n${verdict.reason ?? ""}\n` +
      (verdict.rewrite ? `\nIt reads instead:\n\n  ${verdict.rewrite}\n` : "") +
      `\nRewrite the title and run the command again. Do not argue the verdict.\n`,
  );
  process.exit(2);
}

if (require.main === module) main();

module.exports = { titleIn };
