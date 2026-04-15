# Approach:

* For any net new feature Claude must produce an ADR (bugs are exempt). The way I have it set up is to do its own research first -> once it thinks its done and ready to write the ADR, pause and use the "grill me" skill to ask me questions -> produce the ADR but in a "Proposed" status.
* The grill me skill makes it ask me a single question at a time until we reach a shared understanding. Each answer to a question might spawn new questions, or might clarify the scope and for things out of scope I ask it to create new tickets
* ADRs go into source control and serve as future context

Once the ADR is approved by me, the agent is able to proceed with the implementation. 

## Implementation

Strict TDD **must** be used: write a failing test first, then the code that makes it pass and so on.

Once the agent tells me the work is done, before committing any code, I start a fresh session and use either a custom code review skill I created or Claude's "/simplify" skill to review the changes.
