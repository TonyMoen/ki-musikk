"""
BMAD Session Logger - Capture Module
Session capture and preprocessing logic.
"""

import re
import logging
from typing import Dict, List, Optional
from datetime import datetime

from session_db import SessionDB, SessionDBError


# Configure logging
logger = logging.getLogger("bmad.session_logger.capture")


def preprocess_conversation(raw_text: str) -> str:
    """Clean and standardize conversation text before storage.

    Rules:
    1. Strip leading/trailing whitespace
    2. Normalize line endings to \n
    3. Remove excessive blank lines (max 2 consecutive)
    4. Preserve markdown formatting
    5. Remove null bytes (can break SQLite)

    Args:
        raw_text: Raw conversation text

    Returns:
        Cleaned text ready for storage
    """
    if not raw_text:
        return ""

    # Strip whitespace
    text = raw_text.strip()

    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove null bytes (can break SQLite)
    text = text.replace('\x00', '')

    return text


def extract_topics(conversation_text: str, max_topics: int = 5) -> List[str]:
    """Extract key topics from conversation text.

    Simple keyword extraction based on frequency and markdown headers.

    Args:
        conversation_text: Full conversation text
        max_topics: Maximum topics to extract

    Returns:
        List of topic keywords
    """
    topics = []

    # Extract from markdown headers
    headers = re.findall(r'^#{1,3}\s+(.+)$', conversation_text, re.MULTILINE)
    topics.extend([h.strip().lower() for h in headers[:max_topics]])

    # Extract from bold/emphasis
    bold_terms = re.findall(r'\*\*(.+?)\*\*', conversation_text)
    topics.extend([t.strip().lower() for t in bold_terms[:max_topics]])

    # Remove duplicates and limit
    unique_topics = []
    seen = set()
    for topic in topics:
        if topic not in seen and len(unique_topics) < max_topics:
            unique_topics.append(topic)
            seen.add(topic)

    return unique_topics


def capture_session_on_exit(
    agent_context: Dict,
    conversation_log: str,
    db_path: str = None
) -> Optional[str]:
    """Called by agent on exit. Captures and saves session.

    Args:
        agent_context: Dict with keys:
            - agent_name: str (required)
            - agent_persona: str (required)
            - project_name: str (required)
            - workflow: str (optional, default: "none")
            - topics: List[str] (optional)
            - artifacts: List[str] (optional)
            - start_time: datetime (optional)
            - end_time: datetime (optional)
        conversation_log: Full conversation text
        db_path: Database path (optional, uses default if None)

    Returns:
        session_id of saved session, or None if failed

    Note:
        Fails gracefully - logs errors but doesn't crash agent
    """
    try:
        # Validate required fields
        required_fields = ["agent_name", "agent_persona", "project_name"]
        for field in required_fields:
            if field not in agent_context:
                logger.error(f"Missing required field in agent_context: {field}")
                return None

        # Preprocess conversation
        cleaned_text = preprocess_conversation(conversation_log)

        if not cleaned_text:
            logger.warning("Empty conversation after preprocessing, skipping save")
            return None

        # Extract topics if not provided
        topics = agent_context.get("topics")
        if not topics:
            topics = extract_topics(cleaned_text)

        # Initialize database
        db = SessionDB(db_path=db_path)

        # Save session
        session_id = db.save_session(
            conversation_text=cleaned_text,
            agent_name=agent_context["agent_name"],
            agent_persona=agent_context["agent_persona"],
            project_name=agent_context["project_name"],
            workflow=agent_context.get("workflow", "none"),
            topics=topics,
            artifacts=agent_context.get("artifacts", []),
            start_time=agent_context.get("start_time"),
            end_time=agent_context.get("end_time")
        )

        logger.info(f"Successfully captured session: {session_id}")
        return session_id

    except SessionDBError as e:
        logger.error(f"Failed to capture session (database error): {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error capturing session: {e}", exc_info=True)
        return None


def estimate_session_duration(conversation_text: str) -> int:
    """Estimate session duration in minutes based on conversation length.

    Simple heuristic: ~1 minute per message exchange.

    Args:
        conversation_text: Full conversation text

    Returns:
        Estimated duration in minutes
    """
    # Count exchanges
    user_messages = conversation_text.count("User:")
    assistant_messages = conversation_text.count("Assistant:")

    # Estimate 1-2 minutes per exchange
    exchanges = max(user_messages, assistant_messages)
    estimated_minutes = max(5, exchanges * 2)  # Minimum 5 minutes

    return estimated_minutes
