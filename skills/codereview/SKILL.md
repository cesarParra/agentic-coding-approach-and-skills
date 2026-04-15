---
name: codereview
description: Perform a local code review.
---

## What I do

Reviews the code of a particular branch or Pull Request before merging.

## When to use me

Whenever a branch has local changes headed to main or there is an open PR ready to be merged
into main.

## Description

I will review the code of a particular branch or Pull Request before merging. I will check for
- Code style and formatting
- Code quality and readability
- Shallow modules. I will check if the code is organized in a way that promotes separation of concerns and modularity. I will look for deep modules that encapsulate related functionality and avoid shallow modules that scatter code across multiple files or classes.
- DRY violations and any other code smells and issues. I will look for instances of duplicated code, long methods, large classes, and other signs of poor design that can make the code harder to maintain and understand.
- Tight coupling
- Scalability given the future roadmap
- Language ergonomics, is this easy for a developer to use?
- Using the latest Dart features

**Important**
Ensure a new issue/work item has been created for any:
* TODO identified during development
* Problem outside of the scope of the task at hand
* Things that "work" but could use improvements or could lead to issues in the future
