---
name: broom
description: Sweep the comments out of the working tree on demand. Use when asked to "broom", "sweep the comments", "audit the comments", or before a commit.
---

Run:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/hooks/broom-list.sh"
```

Every line it prints is a comment the working tree adds over HEAD. Each one stays only if it is a link, a platform trap, a regex too dense to read, a directive's one-line reason, or a public contract, and is two lines at most. Delete the rest. A comment that could be a name becomes the name, and the comment goes.

Report what was cut, one line per file, and nothing about what was kept.
