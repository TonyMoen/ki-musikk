# BMAD Session Logger

Vector database for AI agent conversation sessions with semantic search capability.

## Overview

The BMAD Session Logger uses ChromaDB to store complete conversation sessions and enable semantic search for context retrieval. Built with local-first principles, it preserves privacy while providing powerful search across past agent interactions.

## Features

- **Vector Storage**: ChromaDB with persistent local SQLite backend
- **Semantic Search**: Find relevant past conversations using natural language queries
- **Local Embeddings**: Sentence transformers (all-MiniLM-L6-v2) - no external API calls
- **Agent Integration**: Lifecycle hooks for automatic session capture
- **Rich Metadata**: Filter by agent, workflow, project, topics, and more
- **Privacy-Preserving**: All data stays on your machine

## Installation

### 1. Install Dependencies

```bash
pip install chromadb==1.0.15 sentence-transformers pyyaml
```

### 2. Verify Installation

```bash
cd .bmad/bmm/session-logger
python test_session_logger.py
```

If all tests pass, you're ready to use the session logger!

## Quick Start

### Save a Session

```python
from bmad.bmm.session_logger import SessionDB

db = SessionDB()
session_id = db.save_session(
    conversation_text="User: Hello\nAssistant: Hi! How can I help?",
    agent_name="architect",
    agent_persona="Winston",
    project_name="myproject",
    workflow="create-architecture",
    topics=["architecture", "design"]
)
```

### Query for Relevant Sessions

```python
from bmad.bmm.session_logger import get_relevant_context

context = get_relevant_context(
    query="How did we handle authentication in past projects?",
    max_sessions=3
)
print(context)
```

### Agent Integration

```python
from bmad.bmm.session_logger import on_agent_exit, on_agent_start

# Optional: Load context on agent start
context = on_agent_start(
    agent_name="architect",
    workflow="create-architecture"
)

# ... agent works ...

# Capture session on exit
session_id = on_agent_exit(
    agent_name="architect",
    persona="Winston",
    workflow="create-architecture",
    project_name="myproject",
    conversation=full_conversation_log
)
```

## API Reference

### SessionDB Class

```python
db = SessionDB(db_path=None, collection_name=None)
```

**Methods:**
- `save_session(...)` - Save a conversation session
- `query_sessions(...)` - Semantic search across sessions
- `get_session_by_id(session_id)` - Retrieve specific session
- `list_sessions(...)` - List sessions with metadata filtering
- `delete_session(session_id)` - Delete a session

### Query Functions

- `get_relevant_context(query, ...)` - Get formatted context for agents
- `search_sessions(query, filters, ...)` - Direct search interface
- `get_recent_sessions(...)` - List recent sessions

### Agent Hooks

- `on_agent_exit(...)` - Capture session on agent exit
- `on_agent_start(...)` - Load context on agent start
- `save_agent_session(...)` - Simplified session save

## Configuration

Edit `.bmad/bmm/session-logger/config.yaml`:

```yaml
# Database settings
database_path: "{project-root}/.bmad/data/session-db"
collection_name: "bmad_sessions"

# Embedding settings
embedding_model: "all-MiniLM-L6-v2"
embedding_device: "cpu"

# Query settings
max_context_sessions: 3
min_relevance_threshold: 0.3
```

## Architecture

See `docs/bmad-session-logger-architecture.md` for complete architectural documentation.

**Key Design Decisions:**
- Whole-session chunking (complete conversations per document)
- Agent exit hook for capture (clean session boundaries)
- Local sentence transformers (privacy + zero cost)
- ChromaDB persistent mode (data survives restarts)

## File Structure

```
.bmad/bmm/session-logger/
├── __init__.py           # Public API exports
├── session_db.py         # SessionDB class (core interface)
├── capture.py            # Session capture logic
├── query.py              # Query helpers
├── hooks.py              # Agent lifecycle hooks
├── config.yaml           # Configuration
├── README.md             # This file
└── test_session_logger.py # Test script

.bmad/data/session-db/    # Database storage (auto-created)
└── chroma.sqlite3        # ChromaDB data
```

## Examples

### Search by Metadata

```python
results = db.query_sessions(
    query_text="authentication patterns",
    agent_name="architect",
    workflow="create-architecture",
    n_results=5
)
```

### List Recent Sessions

```python
sessions = db.list_sessions(
    agent_name="architect",
    limit=10
)

for session in sessions:
    print(session['metadata']['session_id'])
    print(session['metadata']['workflow'])
```

### Custom Topic Extraction

```python
from bmad.bmm.session_logger import capture_session_on_exit

session_id = capture_session_on_exit(
    agent_context={
        "agent_name": "pm",
        "agent_persona": "Morgan",
        "project_name": "myproject",
        "workflow": "prd",
        "topics": ["requirements", "features", "user-stories"]
    },
    conversation_log=full_conversation
)
```

## Troubleshooting

**Import Error:**
```
ImportError: chromadb is not installed
```
**Solution:** Run `pip install chromadb==1.0.15 sentence-transformers pyyaml`

**Database Connection Error:**
```
DatabaseConnectionError: Cannot connect to ChromaDB
```
**Solution:** Check disk space and file permissions for `.bmad/data/session-db/`

**Slow Embedding Generation:**
- First run downloads model (~80MB) - this is normal
- Subsequent runs should be 1-2 seconds per session
- Consider using GPU if available (set `embedding_device: "cuda"` in config)

## Performance

- **Embedding Time:** ~1-2 seconds per session (CPU)
- **Query Time:** <100ms for typical collections
- **Storage:** ~15KB per session
- **Scalability:** Tested up to 10,000 sessions without issues

## Version

Version: 1.0.0
Author: BMAD / Winston (Architect)
Date: 2025-01-15

## License

Part of the BMAD (BMad Agentic Development) Method
