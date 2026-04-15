---
name: architectural-review
description: Perform a full fledged architectural review of the recent commits.
---

Time for a periodic general architectural and quality check.

  I want you to do a review of the entire codebase from the following sides:
  * Architectural
  * Code Quality
  * Test Quality

  I want you to review:
  * Correctness
  * Are our tests good? Not brittle, enough test that validate as much blast radius as possible, appropriate coverage, etc.
  - Code style and formatting
  - Code quality and readability
  - Shallow modules. I will check if the code is organized in a way that promotes separation of concerns and modularity. I will look for deep modules that encapsulate related functionality and avoid shallow modules that
  scatter code across multiple files or classes.
  - DRY violations and any other code smells and issues. I will look for instances of duplicated code, long methods, large classes, and other signs of poor design that can make the code harder to maintain and understand.
  - Tight coupling
  - Scalability given the future roadmap
  - Using the latest [programming language of choice] features and patterns

  Spawn different agents to check for different areas of the code. Once all agents have completed and come back with their results, then prioritize all issues and tackle them one by one, ensuring the quality and correctness
  gates pass after each change/modification you make.

  You do not need my review after any of these steps. You will provide me a full report once everything is done and complete and I will do a final review and then either do one of the following: ask for additional changes,
  OR approve and take care of committing and pushing to source control myself (you are not allowed to do that).

  What you ARE allowed to do is search for Git history to understand changes over time. Changes (new features, bug fixes, etc) might have caused the quality to drift, so this can give you important context when deciding
  what and how to fix things.

  The final result is that the codebase is in a cohesive state, looking like it has been developed top-to-bottom with a single and unified vision in mind, by a single top-notch developer (or a team of like-minded developers that follow the same patterns). Someone looking at the code from the outside should see that: Quality is high, compromises make sense, decisions have a solid reason behind it, and adding new features is easy because the code is composed in a way that makes sense and everything is in the right place
