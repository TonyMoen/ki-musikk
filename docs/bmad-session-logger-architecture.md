# Architecture: BMAD Session Logger with Vector Database

## Executive Summary

The BMAD Session Logger is a ChromaDB-based vector database system that captures AI agent conversation sessions and enables semantic search for context retrieval. Built with local-first principles, it uses sentence transformers for embeddings and integrates directly into the BMAD agent lifecycle. The architecture prioritizes simplicity, privacy, and zero-cost operation while providing AI agents with conversational context from past sessions.

## Project Initialization

This is a Python module that integrates into the existing BMAD system. No standalone initialization command required.

**Installation Dependencies:**
```bash
pip install chromadb==1.0.15
pip install sentence-transformers>=2.0.0
pip install pyyaml>=6.0
```

**Database Initialization:**
ChromaDB will auto-initialize on first use at `.bmad/data/session-db/` with persistent SQLite storage.

## Decision Summary

| Category | Decision | Version | Rationale |
| -------- | -------- | ------- | --------- |
| Vector Database | ChromaDB | 1.0.15 | Open-source, local-first, Python-native, perfect for embeddings |
| Embedding Model | Sentence Transformers (all-MiniLM-L6-v2) | Default from chromadb | Free, local, privacy-preserving, no API costs |
| Chunking Strategy | Whole Session | N/A | Preserves full context, simpler implementation, natural boundaries |
| Capture Trigger | Agent Exit Hook | N/A | Clean session boundaries, complete conversations |
| Storage Mode | Persistent Local | N/A | Data survives restarts, runs on local machine |
| Query Interface | Semantic + Metadata Filter | N/A | Flexible search with precise filtering |
| Programming Language | Python 3.8+ | 3.8+ | BMAD ecosystem standard, ChromaDB native support |
| Configuration Format | YAML | N/A | Consistent with BMAD config patterns |

## Project Structure

```
{project-root}/
├── .bmad/
│   ├── bmm/
│   │   ├── agents/                    # Existing agent definitions
│   │   ├── workflows/                 # Existing workflows
│   │   ├── config.yaml                # Existing BMAD config
│   │   └── session-logger/            # NEW - Vector DB Session Logger
│   │       ├── __init__.py            # Module exports
│   │       ├── session_db.py          # Core ChromaDB interface class
│   │       ├── capture.py             # Session capture logic
│   │       ├── query.py               # Query interface for agents
│   │       ├── hooks.py               # Agent lifecycle hooks
│   │       ├── config.yaml            # Logger-specific configuration
│   │       └── tests/                 # Unit and integration tests
│   │           ├── __init__.py
│   │           ├── test_session_db.py
│   │           ├── test_capture.py
│   │           ├── test_query.py
│   │           └── test_config.yaml   # Test-specific config
│   └── data/
│       └── session-db/                # NEW - ChromaDB persistent storage
│           ├── chroma.sqlite3         # Auto-created by ChromaDB
│           └── *.parquet              # Vector index files (auto-created)
├── docs/                              # Existing output folder
└── requirements.txt                   # Add chromadb dependencies
```

## Component to Architecture Mapping

| Component | Location | Responsibility |
| --------- | -------- | -------------- |
| SessionDB | `.bmad/bmm/session-logger/session_db.py` | Core ChromaDB client wrapper, CRUD operations |
| Capture Logic | `.bmad/bmm/session-logger/capture.py` | Session extraction and preprocessing |
| Query Interface | `.bmad/bmm/session-logger/query.py` | Semantic search and context retrieval |
| Lifecycle Hooks | `.bmad/bmm/session-logger/hooks.py` | Agent start/exit integration points |
| Configuration | `.bmad/bmm/session-logger/config.yaml` | Database paths, model settings |
| Vector Storage | `.bmad/data/session-db/` | ChromaDB persistent data files |

## Technology Stack Details

### Core Technologies

**ChromaDB v1.0.15**
- Purpose: Vector database for embedding storage and similarity search
- Mode: Persistent client with local SQLite backend
- Collection: `bmad_sessions` (single collection for all sessions)
- Embedding Dimensions: 384 (from all-MiniLM-L6-v2)
- Distance Metric: Cosine similarity (ChromaDB default)

**Sentence Transformers (all-MiniLM-L6-v2)**
- Purpose: Convert conversation text to embeddings
- Execution: Local inference (no external API)
- Model Size: ~80MB (auto-downloaded on first use)
- Inference Speed: ~1-2 seconds per session (acceptable for exit hook)
- Embedding Quality: Good enough for conversational context retrieval

**Python 3.8+**
- Purpose: Implementation language
- Libraries: chromadb, sentence-transformers, pyyaml, logging (stdlib)

**SQLite (via ChromaDB)**
- Purpose: Metadata and document storage
- File: `.bmad/data/session-db/chroma.sqlite3`
- Managed by: ChromaDB (no direct SQL interaction needed)

### Integration Points

**1. Agent Exit Hook**
- Location: Each agent's `<activation>` section, exit step
- Trigger: User executes `*exit` command
- Action: Call `capture_session_on_exit()` with conversation log
- Data Flow: Agent → Capture Module → SessionDB → ChromaDB

**2. Agent Start Hook (Optional)**
- Location: Each agent's `<activation>` section, step 1 or 2
- Trigger: Agent initialization
- Action: Call `get_relevant_context()` with agent name and workflow
- Data Flow: Agent → Query Module → SessionDB → ChromaDB → Context returned

**3. Python Module Import**
- Any agent or workflow can import:
  ```python
  from bmad.bmm.session_logger import SessionDB, get_relevant_context
  ```
- Direct API access for custom queries

**4. Configuration Integration**
- Reads: `.bmad/bmm/config.yaml` for project_name, user_name
- Reads: `.bmad/bmm/session-logger/config.yaml` for database settings
- No modification of existing BMAD config required

## Data Architecture

### ChromaDB Collection Schema

**Collection Name:** `bmad_sessions`

**Document Structure:**
```python
{
    "id": str,              # Unique session identifier (generated)
    "document": str,        # Full conversation text (embedded by ChromaDB)
    "embedding": List[float],  # 384-dim vector (auto-generated)
    "metadata": {           # Structured metadata for filtering
        "session_id": str,
        "agent_name": str,
        "agent_persona": str,
        "workflow": str,
        "project_name": str,
        "start_time": str,
        "end_time": str,
        "message_count": int,
        "topics": str,          # CSV: "vector-db,chromadb,architecture"
        "artifacts_created": str,  # CSV: "architecture.md,prd.md"
        "session_status": str   # "completed", "interrupted", "error"
    }
}
```

### Metadata Schema Details

**Field Specifications:**
- `session_id`: Format `YYYY-MM-DD-{agent_name}-{uuid6}` (e.g., "2025-01-15-architect-a7b3c9")
- `agent_name`: Lowercase agent identifier (e.g., "architect", "pm", "dev")
- `agent_persona`: Display name (e.g., "Winston", "Morgan")
- `workflow`: Workflow identifier or "none" (e.g., "create-architecture")
- `project_name`: From BMAD config.yaml
- `start_time`: ISO 8601 UTC (e.g., "2025-01-15T14:00:00Z")
- `end_time`: ISO 8601 UTC (e.g., "2025-01-15T15:30:00Z")
- `message_count`: Integer count of user/assistant exchanges
- `topics`: Comma-separated keywords extracted from conversation
- `artifacts_created`: Comma-separated file paths created during session
- `session_status`: "completed" (normal exit), "interrupted" (crash), "error" (failure)

**ChromaDB Constraints:**
- All metadata values MUST be `str`, `int`, or `float` (no lists, no None)
- Lists converted to CSV strings (e.g., `["auth", "db"]` → `"auth,db"`)
- Null values represented as empty strings

### Data Flow

**Session Capture Flow:**
```
1. User executes agent *exit command
2. Agent collects conversation log (full text)
3. Agent calls capture_session_on_exit(agent_context, conversation_log)
4. Capture module:
   - Generates session_id
   - Extracts metadata (agent, workflow, timestamps)
   - Preprocesses conversation text
   - Calls SessionDB.save_session()
5. SessionDB:
   - Creates ChromaDB document
   - ChromaDB generates embedding via sentence-transformers
   - Saves to persistent storage
6. Returns session_id to agent
7. Agent confirms exit
```

**Session Query Flow:**
```
1. Agent needs context (e.g., "How did we handle auth?")
2. Agent calls get_relevant_context(query, filters)
3. Query module:
   - Calls SessionDB.query_sessions(query, filters)
4. SessionDB:
   - Generates embedding for query text
   - ChromaDB performs similarity search
   - Filters by metadata if specified
   - Returns top N most similar sessions
5. Query module formats results
6. Agent receives formatted context string
7. Agent optionally injects context into prompt
```

## API Contracts

### SessionDB Class

**Location:** `.bmad/bmm/session-logger/session_db.py`

```python
class SessionDB:
    """ChromaDB interface for BMAD session logging."""

    def __init__(self, db_path: str = None, collection_name: str = None):
        """
        Initialize persistent ChromaDB client.

        Args:
            db_path: Path to database directory (default from config)
            collection_name: Collection name (default: "bmad_sessions")

        Raises:
            DatabaseConnectionError: If ChromaDB initialization fails
        """

    def save_session(
        self,
        conversation_text: str,
        agent_name: str,
        agent_persona: str,
        project_name: str,
        workflow: str = "none",
        topics: List[str] = None,
        artifacts: List[str] = None,
        start_time: datetime = None,
        end_time: datetime = None
    ) -> str:
        """
        Save a complete session to the vector database.

        Args:
            conversation_text: Full conversation as string
            agent_name: Agent identifier (e.g., "architect")
            agent_persona: Agent display name (e.g., "Winston")
            project_name: Project name from config
            workflow: Workflow name or "none"
            topics: List of topic keywords (optional)
            artifacts: List of created file paths (optional)
            start_time: Session start (default: now - estimated)
            end_time: Session end (default: now)

        Returns:
            session_id: Unique identifier for saved session

        Raises:
            DatabaseConnectionError: If save fails
        """

    def query_sessions(
        self,
        query_text: str,
        n_results: int = 5,
        agent_name: str = None,
        workflow: str = None,
        project_name: str = None,
        min_relevance: float = 0.0
    ) -> List[Dict]:
        """
        Semantic search across sessions with optional metadata filters.

        Args:
            query_text: Natural language query
            n_results: Maximum results to return
            agent_name: Filter by agent (optional)
            workflow: Filter by workflow (optional)
            project_name: Filter by project (optional)
            min_relevance: Minimum relevance score 0.0-1.0 (optional)

        Returns:
            List of dicts with keys:
                - session_id: str
                - conversation: str (full text)
                - metadata: dict
                - distance: float (lower = more similar)
                - relevance_score: float (1 - distance, higher = more relevant)
        """

    def get_session_by_id(self, session_id: str) -> Dict:
        """
        Retrieve a specific session by ID.

        Args:
            session_id: Session identifier

        Returns:
            Dict with session_id, conversation, metadata

        Raises:
            SessionNotFoundError: If session doesn't exist
        """

    def list_sessions(
        self,
        agent_name: str = None,
        workflow: str = None,
        project_name: str = None,
        limit: int = 10,
        sort_by: str = "start_time",
        ascending: bool = False
    ) -> List[Dict]:
        """
        List sessions with metadata filtering (no semantic search).

        Args:
            agent_name: Filter by agent (optional)
            workflow: Filter by workflow (optional)
            project_name: Filter by project (optional)
            limit: Maximum results
            sort_by: Metadata field to sort by
            ascending: Sort order (False = newest first)

        Returns:
            List of session metadata dicts (no conversation text)
        """

    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session from the database.

        Args:
            session_id: Session to delete

        Returns:
            True if deleted, False if not found
        """
```

### Capture Module

**Location:** `.bmad/bmm/session-logger/capture.py`

```python
def capture_session_on_exit(
    agent_context: Dict,
    conversation_log: str
) -> str:
    """
    Called by agent on exit. Captures and saves session.

    Args:
        agent_context: Dict with keys:
            - agent_name: str
            - agent_persona: str
            - workflow: str (or "none")
            - project_name: str
            - topics: List[str] (optional)
            - artifacts: List[str] (optional)
        conversation_log: Full conversation text

    Returns:
        session_id of saved session

    Raises:
        SessionDBError: If capture fails (logs error, doesn't crash agent)
    """

def preprocess_conversation(raw_text: str) -> str:
    """
    Clean and standardize conversation text.

    Rules:
    1. Strip leading/trailing whitespace
    2. Normalize line endings to \n
    3. Remove excessive blank lines (max 2 consecutive)
    4. Preserve markdown formatting

    Args:
        raw_text: Raw conversation text

    Returns:
        Cleaned text ready for storage
    """
```

### Query Module

**Location:** `.bmad/bmm/session-logger/query.py`

```python
def get_relevant_context(
    query: str,
    current_agent: str = None,
    current_workflow: str = None,
    max_sessions: int = 3,
    min_relevance: float = 0.3
) -> str:
    """
    Simplified query interface for agents to get context.

    Args:
        query: Natural language question
        current_agent: Current agent name (optional filter)
        current_workflow: Current workflow (optional filter)
        max_sessions: Maximum sessions to return
        min_relevance: Minimum relevance threshold (0.0-1.0)

    Returns:
        Formatted context string ready to inject into agent prompt.

        Format:
        ```
        ## Relevant Past Discussions

        ### Session: 2025-01-15 - Architect (Winston) - create-architecture
        Relevance: 85%

        [Conversation excerpt - first 500 chars or key exchanges...]

        ### Session: 2025-01-10 - PM (Morgan) - prd
        Relevance: 72%

        [Conversation excerpt...]
        ```

        Returns empty string if no relevant sessions found.
    """
```

### Hooks Module

**Location:** `.bmad/bmm/session-logger/hooks.py`

```python
def on_agent_exit(agent_name: str, persona: str, workflow: str,
                  project_name: str, conversation: str) -> str:
    """
    Standard exit hook for all agents.

    Called from agent exit step. Orchestrates session capture.
    """

def on_agent_start(agent_name: str, workflow: str = None) -> str:
    """
    Optional start hook for context loading.

    If enabled in config, loads relevant past sessions.
    Returns formatted context string or empty string.
    """
```

## Security Architecture

**Data Privacy:**
- All data stored locally on user's machine
- No external API calls for embeddings (sentence-transformers runs locally)
- No data sent to third parties
- ChromaDB uses local SQLite (no network exposure)

**Access Control:**
- File system permissions control database access
- No authentication layer (local single-user system)
- Database path: `.bmad/data/session-db/` (hidden directory)

**Sensitive Data Handling:**
- Conversation logs may contain API keys, credentials, personal info
- RECOMMENDATION: Implement optional PII detection before storage
- Future enhancement: Redact sensitive patterns (API keys, emails) before embedding

**Data Retention:**
- No automatic deletion (sessions persist indefinitely)
- Manual cleanup via `delete_session()` API
- Future enhancement: Retention policy configuration (e.g., delete after 90 days)

## Performance Considerations

**Embedding Generation:**
- Time: ~1-2 seconds per session (acceptable for exit hook, non-blocking for user)
- CPU: Model runs on CPU (no GPU required)
- Memory: ~500MB for model (loaded once, cached)

**Query Performance:**
- ChromaDB HNSW index provides fast similarity search
- Expected query time: <100ms for collections under 10,000 sessions
- Metadata filtering adds minimal overhead

**Storage Requirements:**
- Conversation text: ~10-50KB per session (typical)
- Embeddings: 384 floats × 4 bytes = ~1.5KB per session
- Metadata: ~500 bytes per session
- SQLite overhead: ~2KB per session
- **Estimate: ~15KB per session × 1000 sessions = ~15MB**
- Disk space is not a concern for typical usage

**Scalability:**
- ChromaDB persistent mode scales to 100K+ documents on consumer hardware
- BMAD use case: Estimate ~50-200 sessions/month = ~2400 sessions/year
- System will scale fine for years without optimization

## Deployment Architecture

**Deployment Model:** Embedded Python module (not a standalone service)

**Runtime Environment:**
- Runs within Claude Code / BMAD agent process
- No separate server or daemon required
- ChromaDB client library embedded in Python process

**File System Layout:**
```
User's Machine:
  └── {project-root}/
      ├── .bmad/bmm/session-logger/     # Code (version controlled)
      └── .bmad/data/session-db/        # Data (NOT version controlled)
```

**Version Control:**
- Code: Committed to repository (.bmad/bmm/session-logger/)
- Data: Excluded via .gitignore (.bmad/data/session-db/)
- Config: Committed with defaults (users can override locally)

**Backup Strategy:**
- Database is single directory: `.bmad/data/session-db/`
- Backup: Copy entire directory
- Restore: Replace directory
- Future enhancement: Export/import sessions to JSON

## Development Environment

### Prerequisites

**Required:**
- Python 3.8 or higher
- pip package manager
- Git (for BMAD repository)

**System Requirements:**
- OS: Windows, macOS, or Linux
- RAM: 2GB minimum (4GB+ recommended for model loading)
- Disk: 500MB for models + database
- CPU: Any modern processor (no GPU required)

**SQLite Version:**
- SQLite 3.35 or higher (required by ChromaDB)
- Usually included with Python 3.8+
- Verify: `python -c "import sqlite3; print(sqlite3.sqlite_version)"`

### Setup Commands

**1. Install Dependencies:**
```bash
cd {project-root}
pip install chromadb==1.0.15
pip install sentence-transformers>=2.0.0
pip install pyyaml>=6.0
```

**2. Verify Installation:**
```bash
python -c "import chromadb; print(chromadb.__version__)"
# Should print: 1.0.15

python -c "from sentence_transformers import SentenceTransformer; print('OK')"
# Should print: OK (may download model on first run)
```

**3. Initialize Database (automatic on first use):**
```python
from bmad.bmm.session_logger import SessionDB

db = SessionDB()  # Creates .bmad/data/session-db/ if doesn't exist
print("Database initialized successfully")
```

**4. Configuration:**
Edit `.bmad/bmm/session-logger/config.yaml`:
```yaml
database_path: "{project-root}/.bmad/data/session-db"
collection_name: "bmad_sessions"
embedding_model: "all-MiniLM-L6-v2"
auto_capture_on_exit: true
context_on_start: false  # Set true to enable auto-context loading
max_context_sessions: 3
min_relevance_threshold: 0.3
```

### Testing

**Run Unit Tests:**
```bash
cd {project-root}/.bmad/bmm/session-logger
python -m pytest tests/
```

**Manual Test:**
```python
from bmad.bmm.session_logger import SessionDB

# Initialize
db = SessionDB()

# Save test session
session_id = db.save_session(
    conversation_text="User: Hello\nAssistant: Hi! How can I help?",
    agent_name="architect",
    agent_persona="Winston",
    project_name="test-project",
    workflow="testing",
    topics=["test", "demo"]
)
print(f"Saved: {session_id}")

# Query
results = db.query_sessions("greeting", n_results=1)
print(f"Found: {results[0]['session_id']}")

# Cleanup
db.delete_session(session_id)
print("Test complete")
```

## Implementation Patterns

### Naming Conventions

**Module and File Names:**
- Pattern: `snake_case`
- Examples: `session_db.py`, `capture.py`, `query.py`

**Class Names:**
- Pattern: `PascalCase`
- Examples: `SessionDB`, `SessionCapture`, `QueryHelper`

**Function Names:**
- Pattern: `snake_case`
- Examples: `save_session()`, `query_sessions()`, `get_relevant_context()`

**Variable Names:**
- Pattern: `snake_case`
- Examples: `session_id`, `conversation_text`, `agent_name`

**Constants:**
- Pattern: `UPPER_SNAKE_CASE`
- Examples: `DEFAULT_DB_PATH`, `DEFAULT_COLLECTION`, `MAX_RETRIES`

### Code Organization

**Module Structure:**
```python
# Standard order for all Python files:
1. Module docstring
2. Imports (stdlib, third-party, local)
3. Constants
4. Exception classes
5. Helper functions
6. Main classes
7. Public API functions
```

**Import Order:**
```python
# 1. Standard library
import logging
from datetime import datetime
from typing import Dict, List

# 2. Third-party
import chromadb
from sentence_transformers import SentenceTransformer

# 3. Local
from .config import load_config
```

**File Organization:**
```
.bmad/bmm/session-logger/
├── __init__.py              # Exports: SessionDB, get_relevant_context
├── session_db.py            # SessionDB class only
├── capture.py               # Capture functions only
├── query.py                 # Query functions only
├── hooks.py                 # Lifecycle hooks only
├── config.yaml              # Configuration data
└── tests/                   # All tests
    ├── test_session_db.py   # Tests for SessionDB
    ├── test_capture.py      # Tests for capture
    └── test_query.py        # Tests for query
```

### Session ID Generation

**Pattern:** `YYYY-MM-DD-{agent_name}-{uuid6}`

**Implementation:**
```python
import uuid
from datetime import datetime

def generate_session_id(agent_name: str) -> str:
    """Generate unique session ID with timestamp and agent name."""
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    short_uuid = str(uuid.uuid4())[:6]
    return f"{date_str}-{agent_name}-{short_uuid}"

# Example output: "2025-01-15-architect-a7b3c9"
```

### Timestamp Handling

**Pattern:** ISO 8601 UTC format (`YYYY-MM-DDTHH:MM:SSZ`)

**Implementation:**
```python
from datetime import datetime

def get_utc_timestamp() -> str:
    """Get current UTC timestamp in ISO 8601 format."""
    return datetime.utcnow().isoformat() + "Z"

# Example output: "2025-01-15T14:30:00Z"
```

**Parsing:**
```python
from datetime import datetime

def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse ISO 8601 timestamp string to datetime object."""
    return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
```

### Error Handling

**Exception Hierarchy:**
```python
class SessionDBError(Exception):
    """Base exception for session database errors."""
    pass

class SessionNotFoundError(SessionDBError):
    """Session ID not found in database."""
    pass

class DatabaseConnectionError(SessionDBError):
    """Cannot connect to ChromaDB."""
    pass

class ConfigurationError(SessionDBError):
    """Invalid configuration."""
    pass
```

**Error Handling Pattern:**
```python
import logging

logger = logging.getLogger("bmad.session_logger")

def save_session(...):
    try:
        # Attempt operation
        result = db.add(...)
        return result
    except DatabaseConnectionError as e:
        logger.error(f"Failed to connect to database: {e}")
        # Fail gracefully - don't crash agent
        return None
    except Exception as e:
        logger.error(f"Unexpected error saving session: {e}", exc_info=True)
        return None
```

**Error Recovery:**
- Database errors should NOT crash the agent
- Log errors and return gracefully (e.g., return None or empty list)
- Agent can continue even if session logging fails

### Logging Strategy

**Logger Setup:**
```python
import logging

# Module-level logger
logger = logging.getLogger("bmad.session_logger")
logger.setLevel(logging.INFO)

# Format: [TIMESTAMP] [LEVEL] [MODULE] Message
formatter = logging.Formatter(
    '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
```

**Log Levels:**
- `DEBUG`: ChromaDB operations, embedding generation details
- `INFO`: Session saved, queries executed, important operations
- `WARNING`: Session not found, slow queries (>1s), retries
- `ERROR`: Database errors, failed captures, exceptions

**Example Logging:**
```python
logger.info(f"Session saved: {session_id}")
logger.debug(f"Generated embedding in {elapsed:.2f}s")
logger.warning(f"Query took {elapsed:.2f}s (slow)")
logger.error(f"Failed to save session: {error}", exc_info=True)
```

### Configuration Management

**Config File Location:** `.bmad/bmm/session-logger/config.yaml`

**Config Schema:**
```yaml
# Database settings
database_path: "{project-root}/.bmad/data/session-db"
collection_name: "bmad_sessions"

# Embedding settings
embedding_model: "all-MiniLM-L6-v2"
embedding_device: "cpu"  # or "cuda" for GPU

# Capture settings
auto_capture_on_exit: true
preprocess_conversations: true

# Query settings
context_on_start: false
max_context_sessions: 3
min_relevance_threshold: 0.3
default_query_results: 5

# Performance settings
model_cache_dir: "{project-root}/.bmad/data/models"
```

**Loading Pattern:**
```python
import yaml
from pathlib import Path

def load_config() -> dict:
    """Load configuration from YAML file."""
    config_path = Path(__file__).parent / "config.yaml"
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    # Resolve {project-root} placeholders
    config = resolve_paths(config)
    return config

# Cache config at module level
_CONFIG = load_config()
```

### Metadata Handling

**ChromaDB Metadata Constraints:**
- Only `str`, `int`, `float` types allowed
- No `None`, `list`, `dict`, `bool` (convert bool to int: 0/1)
- Lists must be converted to CSV strings

**Conversion Helpers:**
```python
def list_to_csv(items: List[str]) -> str:
    """Convert list to comma-separated string."""
    return ",".join(items) if items else ""

def csv_to_list(csv_str: str) -> List[str]:
    """Convert comma-separated string to list."""
    return [s.strip() for s in csv_str.split(",") if s.strip()]

# Example usage
metadata = {
    "topics": list_to_csv(["vector-db", "chromadb"]),  # "vector-db,chromadb"
    "message_count": 47,  # int OK
    "session_status": "completed"  # str OK
}
```

### Text Preprocessing

**Conversation Standardization:**
```python
import re

def preprocess_conversation(raw_text: str) -> str:
    """
    Clean and standardize conversation text before storage.

    Rules:
    1. Strip leading/trailing whitespace
    2. Normalize line endings to \n
    3. Remove excessive blank lines (max 2 consecutive)
    4. Preserve markdown formatting
    5. Remove null bytes
    """
    # Strip whitespace
    text = raw_text.strip()

    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove null bytes (can break SQLite)
    text = text.replace('\x00', '')

    return text
```

### Import Patterns

**Public API Exports:**
```python
# .bmad/bmm/session-logger/__init__.py

from .session_db import SessionDB
from .query import get_relevant_context
from .hooks import on_agent_exit, on_agent_start

__all__ = [
    'SessionDB',
    'get_relevant_context',
    'on_agent_exit',
    'on_agent_start'
]
```

**Agent Import Pattern:**
```python
# Agents should import like this:
from bmad.bmm.session_logger import SessionDB, get_relevant_context

# NOT like this (too specific):
from bmad.bmm.session_logger.session_db import SessionDB
```

### Testing Patterns

**Test Configuration:**
Use separate test collection to avoid polluting production:

```yaml
# .bmad/bmm/session-logger/tests/test_config.yaml
database_path: ".bmad/data/session-db-test"
collection_name: "bmad_sessions_test"
embedding_model: "all-MiniLM-L6-v2"
```

**Test Fixtures:**
```python
import pytest
from bmad.bmm.session_logger import SessionDB

@pytest.fixture
def test_db():
    """Create test database, yield, cleanup."""
    db = SessionDB(
        db_path=".bmad/data/session-db-test",
        collection_name="bmad_sessions_test"
    )
    yield db
    # Cleanup
    db.client.delete_collection("bmad_sessions_test")

def test_save_session(test_db):
    """Test session saving."""
    session_id = test_db.save_session(
        conversation_text="Test conversation",
        agent_name="test-agent",
        agent_persona="Tester",
        project_name="test-project"
    )
    assert session_id.startswith("2025-")
```

**Test Cleanup:**
Always delete test collections after tests to avoid pollution.

### Dependency Management

**requirements.txt format:**
```
# Vector database
chromadb==1.0.15

# Embeddings
sentence-transformers>=2.0.0

# Configuration
pyyaml>=6.0

# Testing (dev dependencies)
pytest>=7.0.0
pytest-cov>=4.0.0
```

**Version Pinning Strategy:**
- Pin exact versions for critical dependencies (chromadb)
- Allow minor updates for stable dependencies (sentence-transformers >=)
- Update quarterly or when bugs/security issues arise

## Architecture Decision Records (ADRs)

### ADR-001: Use ChromaDB for Vector Storage

**Date:** 2025-01-15

**Status:** Accepted

**Context:**
Need a vector database to store conversation embeddings for semantic search. Evaluated ChromaDB, Pinecone, Qdrant, and pgvector.

**Decision:**
Use ChromaDB in persistent local mode.

**Rationale:**
- Open-source and free (no recurring costs)
- Runs locally (data privacy, no external dependencies)
- Python-native (fits BMAD ecosystem)
- Simple API (minimal learning curve)
- Persistent mode with SQLite (data survives restarts)
- Good enough performance for our scale (thousands of sessions)

**Consequences:**
- All processing happens locally (may be slower than cloud solutions)
- No automatic scaling (but not needed for our use case)
- User manages their own data (backups, etc.)

---

### ADR-002: Use Sentence Transformers for Local Embeddings

**Date:** 2025-01-15

**Status:** Accepted

**Context:**
Need to convert conversation text to vector embeddings. Options: OpenAI API, local sentence-transformers, or custom models.

**Decision:**
Use sentence-transformers with `all-MiniLM-L6-v2` model.

**Rationale:**
- Runs locally (no API costs, no data sent externally)
- Privacy-preserving (conversations may contain sensitive info)
- Fast enough (1-2 seconds per session acceptable for exit hook)
- Good quality for conversational search (not perfect, but sufficient)
- Simple integration with ChromaDB

**Consequences:**
- Slightly lower search quality than OpenAI embeddings
- Requires ~500MB RAM for model
- First run downloads model (~80MB)
- No internet required after initial setup

---

### ADR-003: Whole-Session Chunking Strategy

**Date:** 2025-01-15

**Status:** Accepted

**Context:**
Conversations can be stored as whole sessions, message-level chunks, or topic segments. Each has tradeoffs.

**Decision:**
Store entire conversation as single ChromaDB document.

**Rationale:**
- Simpler implementation (one record per session)
- Preserves full context (no fragmentation)
- Natural session boundaries (agent start/exit)
- Easier metadata management
- Query results are complete conversations

**Consequences:**
- Less granular search (can't find specific message exchanges)
- Larger documents (but manageable at ~10-50KB per session)
- May retrieve more context than needed (acceptable tradeoff)

---

### ADR-004: Agent Exit Hook for Capture

**Date:** 2025-01-15

**Status:** Accepted

**Context:**
Sessions can be captured continuously (after each message) or at exit. Need to balance data integrity with complexity.

**Decision:**
Capture sessions on agent exit (when user runs `*exit` command).

**Rationale:**
- Clean session boundaries (complete conversations)
- Simple implementation (single capture point)
- Non-blocking (happens during exit, user expects delay)
- Matches natural workflow (sessions end at exit)

**Consequences:**
- Lost data if agent crashes before exit (acceptable risk)
- No real-time search during active session (not needed)
- Requires agent modification (add exit hook)

---

### ADR-005: Metadata Schema with CSV Lists

**Date:** 2025-01-15

**Status:** Accepted

**Context:**
ChromaDB metadata only supports primitive types (str, int, float). Need to store lists (topics, artifacts).

**Decision:**
Convert lists to comma-separated strings in metadata.

**Rationale:**
- Works within ChromaDB constraints
- Simple to implement (join/split operations)
- Searchable via substring matching if needed
- Human-readable in database

**Consequences:**
- Topics/artifacts with commas need escaping (unlikely in practice)
- Need helper functions to convert to/from lists
- Slightly less efficient than native list support

---

## Consistency Rules

### Cross-Cutting Concerns

**All modules MUST:**
1. Use logging instead of print statements
2. Raise custom exceptions (not generic Exception)
3. Include docstrings for all public functions/classes
4. Follow PEP 8 style guide
5. Use type hints for function signatures
6. Handle errors gracefully (don't crash agents)

**All functions MUST:**
1. Have descriptive names in snake_case
2. Accept keyword arguments (not positional-only)
3. Return consistent types (don't mix None and empty list)
4. Log significant operations at INFO level
5. Validate inputs and raise meaningful errors

**All metadata MUST:**
1. Use only str, int, float types
2. Use empty string instead of None
3. Convert lists to CSV strings
4. Use ISO 8601 for timestamps
5. Use lowercase for agent names

**All database operations MUST:**
1. Use try/except blocks
2. Log errors before returning
3. Return None or empty list on failure (not raise)
4. Close resources properly
5. Use connection pooling (if needed later)

---

_Generated by BMAD Decision Architecture Workflow_
_Date: 2025-01-15_
_For: BIP_
_Project: ibe160_
_Architect: Winston_
