import sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / '.bmad' / 'bmm' / 'session-logger'))

from hooks import on_agent_exit

# Capture current conversation
conversation = """User: Invoked /bmad:bmm:workflows:architecture

System: Architecture workflow started, loaded configuration and workflow files.

Workflow: Executing Step 0 - Validate workflow readiness
- Checked for workflow status file: Not found
- Checked for PRD files: Not found
- Found existing architecture documents:
  * bmad-session-logger-architecture.md
  * bmad-session-logger-architecture-validation.md

Workflow: Presented options to user:
- Exit and run workflow-init for proper project tracking
- Continue in standalone mode
- Provide PRD or create one first
- Revise existing architecture documents

User: Switched to analyst agent - /bmad:bmm:agents:analyst

Assistant (Mary): Loaded analyst agent persona, greeted user BIP, displayed main menu.

User: "Tell me more about what your purpose is."

Assistant (Mary): Explained role as Strategic Business Analyst and Requirements Expert:
- Discovery & Research capabilities
- Requirements Elicitation expertise
- Strategic Analysis skills
- Workflow guidance for starting projects

User: Invoked /save-session command"""

# Save session
session_id = on_agent_exit(
    agent_name="analyst",
    persona="Mary (Business Analyst)",
    workflow="architecture-attempted",
    project_name="ibe160",
    conversation=conversation,
    topics=["architecture-workflow", "prd-requirements", "workflow-validation", "agent-introduction", "analyst-role"],
    artifacts=[]
)

print(f"✓ Session saved to vector database!")
print(f"  Session ID: {session_id}")
print(f"  Agent: analyst (Mary)")
print(f"  Workflow: architecture-attempted")
print(f"  Database: .bmad/data/session-db/")
print(f"\nYou can now query this session with semantic search!")
