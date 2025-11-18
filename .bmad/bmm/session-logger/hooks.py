"""
BMAD Session Logger - Agent Lifecycle Hooks
Integration points for BMAD agent start and exit events.
"""

import logging
from typing import Optional
from datetime import datetime

from capture import capture_session_on_exit
from query import get_relevant_context


# Configure logging
logger = logging.getLogger("bmad.session_logger.hooks")


def on_agent_exit(
    agent_name: str,
    persona: str,
    workflow: str,
    project_name: str,
    conversation: str,
    artifacts: list = None,
    topics: list = None,
    start_time: datetime = None
) -> Optional[str]:
    """Standard exit hook for all agents.

    Called from agent exit step. Orchestrates session capture.

    Args:
        agent_name: Agent identifier (e.g., "architect")
        persona: Agent persona name (e.g., "Winston")
        workflow: Workflow identifier or "none"
        project_name: Project name
        conversation: Full conversation log
        artifacts: List of files created (optional)
        topics: List of topics discussed (optional)
        start_time: When agent started (optional)

    Returns:
        session_id if saved successfully, None if failed
    """
    logger.info(f"Agent exit hook triggered: {agent_name} ({persona})")

    agent_context = {
        "agent_name": agent_name,
        "agent_persona": persona,
        "project_name": project_name,
        "workflow": workflow,
        "artifacts": artifacts or [],
        "topics": topics or [],
        "start_time": start_time,
        "end_time": datetime.utcnow()
    }

    session_id = capture_session_on_exit(agent_context, conversation)

    if session_id:
        logger.info(f"Session captured successfully: {session_id}")
        return session_id
    else:
        logger.warning("Session capture failed (see previous errors)")
        return None


def on_agent_start(
    agent_name: str,
    workflow: str = None,
    project_name: str = None,
    context_query: str = None,
    max_sessions: int = 3
) -> str:
    """Optional start hook for context loading.

    If enabled in config, loads relevant past sessions for context.

    Args:
        agent_name: Current agent name
        workflow: Current workflow (optional)
        project_name: Current project (optional)
        context_query: Custom query for context (optional, default: workflow-based)
        max_sessions: Maximum past sessions to load

    Returns:
        Formatted context string or empty string if disabled/no results
    """
    logger.info(f"Agent start hook triggered: {agent_name}")

    # Default query if not provided
    if not context_query:
        if workflow:
            context_query = f"past discussions about {workflow}"
        else:
            context_query = f"past sessions with {agent_name}"

    # Get relevant context
    context = get_relevant_context(
        query=context_query,
        current_agent=agent_name,
        current_workflow=workflow,
        max_sessions=max_sessions
    )

    if context:
        logger.info(f"Loaded context from {context.count('### Session:')} past sessions")
    else:
        logger.info("No relevant context found")

    return context


# Convenience function for simple exit capture
def save_agent_session(
    agent_name: str,
    conversation: str,
    **kwargs
) -> Optional[str]:
    """Simplified session save for agents.

    Args:
        agent_name: Agent identifier
        conversation: Full conversation text
        **kwargs: Additional optional fields (persona, workflow, project_name, etc.)

    Returns:
        session_id or None
    """
    # Set defaults
    defaults = {
        "persona": agent_name.title(),
        "workflow": "none",
        "project_name": "default"
    }

    # Merge with provided kwargs
    for key, value in defaults.items():
        if key not in kwargs:
            kwargs[key] = value

    return on_agent_exit(
        agent_name=agent_name,
        conversation=conversation,
        **kwargs
    )
