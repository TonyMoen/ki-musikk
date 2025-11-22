# Save Current Session to Vector Database

You are helping the user save the current conversation session to the BMAD Session Logger vector database.

## Your Task

1. **Gather Session Information:**
   - Ask the user which agent this session was with (or infer from context if obvious)
   - Ask which workflow was being executed (if any)
   - Identify key topics discussed (extract from conversation)
   - Note any artifacts/files created during the session

2. **Capture the Conversation:**
   - You have access to the full conversation history
   - Format it as a string with proper "User:" and "Assistant:" prefixes

3. **Save to Database:**
   Execute this Python code to save the session:

   ```python
   import sys
   from pathlib import Path
   sys.path.insert(0, str(Path.home() / ".bmad" / "bmm" / "session-logger"))

   from hooks import on_agent_exit
   from datetime import datetime

   # Capture current conversation
   conversation = """
   [FULL CONVERSATION TEXT HERE]
   """

   # Save session
   session_id = on_agent_exit(
       agent_name="[AGENT_NAME]",
       persona="[AGENT_PERSONA]",
       workflow="[WORKFLOW_NAME or 'none']",
       project_name="ibe160",
       conversation=conversation,
       topics=["topic1", "topic2", "topic3"],
       artifacts=["file1.md", "file2.py"]  # if any
   )

   print(f"✓ Session saved to vector database!")
   print(f"  Session ID: {session_id}")
   print(f"  Agent: [AGENT_NAME] ([AGENT_PERSONA])")
   print(f"  Workflow: [WORKFLOW_NAME]")
   print(f"  Database: .bmad/data/session-db/")
   ```

4. **Confirm to User:**
   - Show the session ID
   - Confirm what was saved
   - Explain they can now query this session with semantic search

## Agent Mappings

Common agents in BMAD:
- `architect` → Winston
- `pm` → Morgan
- `dev` → Developer
- `tea` → Test Engineer
- `sm` → Scrum Master
- `ux-designer` → UX Designer

## Example Session Save

If the user was working with the Architect (Winston) on creating an architecture:

```python
session_id = on_agent_exit(
    agent_name="architect",
    persona="Winston",
    workflow="create-architecture",
    project_name="ibe160",
    conversation=full_conversation_text,
    topics=["vector-database", "chromadb", "architecture"],
    artifacts=["docs/bmad-session-logger-architecture.md"]
)
```

## Important Notes

- Always use Python 3.11: `C:\Users\tony-\AppData\Local\Python\pythoncore-3.11-64\python.exe`
- The conversation should include the ENTIRE session from start to current point
- Topics should be 3-5 keywords that describe what was discussed
- Artifacts should be file paths that were created/modified during the session
- Project name is currently "ibe160" (from config)

## After Saving

Remind the user they can now:
- Query this session: `get_relevant_context("what did we discuss about X?")`
- List recent sessions with filters
- Search semantically across all saved conversations
