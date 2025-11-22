"""
BMAD Session Logger - Query Module
Simplified query interface for agents to retrieve relevant context.
"""

import logging
from typing import List, Optional

from session_db import SessionDB


# Configure logging
logger = logging.getLogger("bmad.session_logger.query")


def format_session_for_context(session_data: dict, max_chars: int = 500) -> str:
    """Format a single session result for context display.

    Args:
        session_data: Session dict with conversation, metadata, relevance_score
        max_chars: Maximum characters to include from conversation

    Returns:
        Formatted string for display
    """
    metadata = session_data["metadata"]
    relevance = session_data["relevance_score"] * 100  # Convert to percentage

    # Extract conversation excerpt
    conversation = session_data["conversation"]
    if len(conversation) > max_chars:
        excerpt = conversation[:max_chars] + "..."
    else:
        excerpt = conversation

    # Format output
    output = f"""
### Session: {metadata['start_time'][:10]} - {metadata['agent_persona']} ({metadata['agent_name']}) - {metadata['workflow']}
Relevance: {relevance:.0f}%

{excerpt}
"""
    return output


def get_relevant_context(
    query: str,
    current_agent: str = None,
    current_workflow: str = None,
    max_sessions: int = 3,
    min_relevance: float = 0.3,
    db_path: str = None
) -> str:
    """Simplified query interface for agents to get context.

    Args:
        query: Natural language question
        current_agent: Current agent name (optional filter)
        current_workflow: Current workflow (optional filter)
        max_sessions: Maximum sessions to return
        min_relevance: Minimum relevance threshold (0.0-1.0)
        db_path: Database path (optional)

    Returns:
        Formatted context string ready to inject into agent prompt.

        Format:
        ```
        ## Relevant Past Discussions

        ### Session: 2025-01-15 - Architect (Winston) - create-architecture
        Relevance: 85%

        [Conversation excerpt...]

        ### Session: 2025-01-10 - PM (Morgan) - prd
        Relevance: 72%

        [Conversation excerpt...]
        ```

        Returns empty string if no relevant sessions found.
    """
    try:
        # Initialize database
        db = SessionDB(db_path=db_path)

        # Query for relevant sessions
        results = db.query_sessions(
            query_text=query,
            n_results=max_sessions,
            agent_name=current_agent,
            workflow=current_workflow,
            min_relevance=min_relevance
        )

        if not results:
            logger.info(f"No relevant sessions found for query: {query[:50]}...")
            return ""

        # Format results
        context_parts = ["## Relevant Past Discussions\n"]
        for session in results:
            context_parts.append(format_session_for_context(session))

        formatted_context = "\n".join(context_parts)

        logger.info(f"Retrieved {len(results)} relevant sessions for context")
        return formatted_context

    except Exception as e:
        logger.error(f"Failed to get relevant context: {e}", exc_info=True)
        return ""


def search_sessions(
    query: str,
    filters: dict = None,
    max_results: int = 5,
    db_path: str = None
) -> List[dict]:
    """Direct search interface returning raw session data.

    Args:
        query: Search query
        filters: Dict with optional keys: agent_name, workflow, project_name
        max_results: Maximum results
        db_path: Database path (optional)

    Returns:
        List of session dicts with full data
    """
    try:
        db = SessionDB(db_path=db_path)

        filters = filters or {}
        results = db.query_sessions(
            query_text=query,
            n_results=max_results,
            agent_name=filters.get("agent_name"),
            workflow=filters.get("workflow"),
            project_name=filters.get("project_name")
        )

        return results

    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        return []


def get_recent_sessions(
    agent_name: str = None,
    workflow: str = None,
    limit: int = 5,
    db_path: str = None
) -> List[dict]:
    """Get recent sessions without semantic search.

    Args:
        agent_name: Filter by agent (optional)
        workflow: Filter by workflow (optional)
        limit: Maximum results
        db_path: Database path (optional)

    Returns:
        List of session metadata (without full conversation text)
    """
    try:
        db = SessionDB(db_path=db_path)

        sessions = db.list_sessions(
            agent_name=agent_name,
            workflow=workflow,
            limit=limit
        )

        return sessions

    except Exception as e:
        logger.error(f"Failed to get recent sessions: {e}", exc_info=True)
        return []
