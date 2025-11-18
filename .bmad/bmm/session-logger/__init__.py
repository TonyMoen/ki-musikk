"""
BMAD Session Logger
Vector database for AI agent conversation sessions with semantic search.

This module provides ChromaDB-backed session logging and retrieval
for BMAD agents to maintain conversational context across sessions.

Basic Usage:
    from bmad.bmm.session_logger import SessionDB, get_relevant_context

    # Save a session
    db = SessionDB()
    session_id = db.save_session(
        conversation_text="User: Hello\nAssistant: Hi!",
        agent_name="architect",
        agent_persona="Winston",
        project_name="myproject"
    )

    # Query for context
    context = get_relevant_context("what did we discuss about authentication?")
    print(context)

Agent Integration:
    from bmad.bmm.session_logger import on_agent_exit, on_agent_start

    # On agent start (optional)
    context = on_agent_start(agent_name="architect", workflow="create-architecture")

    # On agent exit
    session_id = on_agent_exit(
        agent_name="architect",
        persona="Winston",
        workflow="create-architecture",
        project_name="myproject",
        conversation=full_conversation_log
    )
"""

import logging

# Configure module logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Public API exports
from session_db import (
    SessionDB,
    SessionDBError,
    SessionNotFoundError,
    DatabaseConnectionError,
    ConfigurationError
)

from query import (
    get_relevant_context,
    search_sessions,
    get_recent_sessions
)

from hooks import (
    on_agent_exit,
    on_agent_start,
    save_agent_session
)

from capture import (
    capture_session_on_exit,
    preprocess_conversation
)


__version__ = "1.0.0"
__author__ = "BMAD / Winston (Architect)"

__all__ = [
    # Core database interface
    "SessionDB",

    # Exceptions
    "SessionDBError",
    "SessionNotFoundError",
    "DatabaseConnectionError",
    "ConfigurationError",

    # Query interface
    "get_relevant_context",
    "search_sessions",
    "get_recent_sessions",

    # Agent hooks
    "on_agent_exit",
    "on_agent_start",
    "save_agent_session",

    # Capture functions
    "capture_session_on_exit",
    "preprocess_conversation",
]
