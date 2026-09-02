# broom

Sweeps comments out of every edit.

- **SessionStart** puts the rule in context: a comment is a link, a platform trap, a dense regex, a directive's reason, or a public contract, two lines at most.
- **PostToolUse** on Edit and Write sends the written text to a fresh Haiku with no conversation context. It quotes each comment that fails and says DELETE or CUT TO. The writer applies the verdict.
- **Stop** lists every comment line the working tree adds over HEAD and blocks the stop once per distinct list, so the turn reviews them before it ends.
- `/broom` runs the same list on demand.

```bash
claude plugin marketplace add cesarParra/agentic-coding-approach-and-skills
claude plugin install broom@agentic-coding
```
