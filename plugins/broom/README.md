# broom

Sweeps comments out of every edit, and titles that say nothing off every commit, pull request and task.

- **SessionStart** puts the rule in context: a comment is a link, a platform trap, a dense regex, a directive's reason, or a public contract, two lines at most. A title leads with the verb and names the thing it changes.
- **PostToolUse** on Edit and Write looks for comment lines in the written text and, only when there are some, sends the text to a headless Haiku with no conversation context, no hooks and no MCP. It quotes each comment that fails and says DELETE or CUT TO, and the writer applies the verdict. A comment-free edit costs nothing.
- **PreToolUse** on Bash reads the title out of `git commit`, `gh pr create`, `gh issue create` and `tatr new`. A title already leading with a verb costs nothing; anything else goes to the same headless Haiku, which quotes it, says what a reader cannot learn from it, and gives the line it should have been. The command is blocked until it is rewritten. Merges, reverts, fixups and version bumps pass untouched.
- **Stop** lists every comment line the working tree adds over HEAD and blocks the stop once per distinct list, so the turn reviews them before it ends.
- `/broom` runs the same list on demand.

The verb check is a cost saver, not the standard: `Fix the bug` leads with a verb and reaches nobody's judge. A title is only as good as the identifier in it.

Needs `node` and a logged-in `claude` on the PATH.

```bash
claude plugin marketplace add cesarParra/agentic-coding-approach-and-skills
claude plugin install broom@agentic-coding
```
