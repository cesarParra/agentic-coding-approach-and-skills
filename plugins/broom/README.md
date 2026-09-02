# broom

Sweeps comments out of every edit.

- **SessionStart** puts the rule in context: a comment is a link, a platform trap, a dense regex, a directive's reason, or a public contract, two lines at most.
- **PostToolUse** on Edit and Write looks for comment lines in the written text and, only when there are some, sends the text to a headless Haiku with no conversation context, no hooks and no MCP. It quotes each comment that fails and says DELETE or CUT TO, and the writer applies the verdict. A comment-free edit costs nothing.
- **Stop** lists every comment line the working tree adds over HEAD and blocks the stop once per distinct list, so the turn reviews them before it ends.
- `/broom` runs the same list on demand.

Needs `node` and a logged-in `claude` on the PATH.

```bash
claude plugin marketplace add cesarParra/agentic-coding-approach-and-skills
claude plugin install broom@agentic-coding
```
