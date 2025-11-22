"""
BMAD Session Logger - ChromaDB Interface
Core vector database operations for session storage and retrieval.
"""

import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

try:
    import chromadb
    from chromadb.utils import embedding_functions
except ImportError:
    chromadb = None
    embedding_functions = None


# Configure logging
logger = logging.getLogger("bmad.session_logger")


# Custom Exceptions
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


# Helper Functions
def generate_session_id(agent_name: str) -> str:
    """Generate unique session ID with timestamp and agent name.

    Format: YYYY-MM-DD-{agent_name}-{uuid6}
    Example: 2025-01-15-architect-a7b3c9
    """
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    short_uuid = str(uuid.uuid4())[:6]
    return f"{date_str}-{agent_name}-{short_uuid}"


def get_utc_timestamp() -> str:
    """Get current UTC timestamp in ISO 8601 format.

    Format: YYYY-MM-DDTHH:MM:SSZ
    Example: 2025-01-15T14:30:00Z
    """
    return datetime.utcnow().isoformat() + "Z"


def list_to_csv(items: Optional[List[str]]) -> str:
    """Convert list to comma-separated string for ChromaDB metadata."""
    return ",".join(items) if items else ""


def csv_to_list(csv_str: str) -> List[str]:
    """Convert comma-separated string to list."""
    return [s.strip() for s in csv_str.split(",") if s.strip()]


class SessionDB:
    """ChromaDB interface for BMAD session logging.

    Provides methods to save, query, and manage conversation sessions
    in a vector database for semantic search.
    """

    def __init__(self, db_path: str = None, collection_name: str = None):
        """Initialize persistent ChromaDB client.

        Args:
            db_path: Path to database directory (default: .bmad/data/session-db)
            collection_name: Collection name (default: bmad_sessions)

        Raises:
            DatabaseConnectionError: If ChromaDB initialization fails
            ImportError: If chromadb is not installed
        """
        if chromadb is None:
            raise ImportError(
                "chromadb is not installed. "
                "Run: pip install chromadb==1.0.15 sentence-transformers pyyaml"
            )

        # Set defaults
        if db_path is None:
            db_path = str(Path.home() / ".bmad" / "data" / "session-db")
        if collection_name is None:
            collection_name = "bmad_sessions"

        self.db_path = db_path
        self.collection_name = collection_name

        try:
            # Initialize ChromaDB persistent client
            self.client = chromadb.PersistentClient(path=db_path)

            # Setup embedding function (sentence transformers)
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )

            logger.info(f"SessionDB initialized: {db_path} / {collection_name}")

        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}", exc_info=True)
            raise DatabaseConnectionError(f"Cannot connect to ChromaDB: {e}")

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
        """Save a complete session to the vector database.

        Args:
            conversation_text: Full conversation as string
            agent_name: Agent identifier (e.g., "architect")
            agent_persona: Agent display name (e.g., "Winston")
            project_name: Project name from config
            workflow: Workflow name or "none"
            topics: List of topic keywords (optional)
            artifacts: List of created file paths (optional)
            start_time: Session start (default: estimated from now)
            end_time: Session end (default: now)

        Returns:
            session_id: Unique identifier for saved session

        Raises:
            DatabaseConnectionError: If save fails
        """
        try:
            # Generate session ID
            session_id = generate_session_id(agent_name)

            # Handle timestamps
            if end_time is None:
                end_time = datetime.utcnow()
            if start_time is None:
                # Estimate start time (assume 30 min conversation)
                from datetime import timedelta
                start_time = end_time - timedelta(minutes=30)

            # Count messages (rough estimate)
            message_count = conversation_text.count("\nUser:") + conversation_text.count("\nAssistant:")

            # Build metadata (ChromaDB requires str, int, float only)
            metadata = {
                "session_id": session_id,
                "agent_name": agent_name,
                "agent_persona": agent_persona,
                "workflow": workflow,
                "project_name": project_name,
                "start_time": start_time.isoformat() + "Z",
                "end_time": end_time.isoformat() + "Z",
                "message_count": message_count,
                "topics": list_to_csv(topics),
                "artifacts_created": list_to_csv(artifacts),
                "session_status": "completed"
            }

            # Add to collection
            self.collection.add(
                ids=[session_id],
                documents=[conversation_text],
                metadatas=[metadata]
            )

            logger.info(f"Session saved: {session_id} ({message_count} messages)")
            return session_id

        except Exception as e:
            logger.error(f"Failed to save session: {e}", exc_info=True)
            raise DatabaseConnectionError(f"Cannot save session: {e}")

    def query_sessions(
        self,
        query_text: str,
        n_results: int = 5,
        agent_name: str = None,
        workflow: str = None,
        project_name: str = None,
        min_relevance: float = 0.0
    ) -> List[Dict]:
        """Semantic search across sessions with optional metadata filters.

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
        try:
            # Build where clause for filtering
            where = {}
            if agent_name:
                where["agent_name"] = agent_name
            if workflow:
                where["workflow"] = workflow
            if project_name:
                where["project_name"] = project_name

            # Query ChromaDB
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where if where else None
            )

            # Format results
            formatted_results = []
            if results and results['ids'] and results['ids'][0]:
                for i in range(len(results['ids'][0])):
                    distance = results['distances'][0][i]
                    relevance = 1.0 - distance

                    # Filter by minimum relevance
                    if relevance >= min_relevance:
                        formatted_results.append({
                            "session_id": results['ids'][0][i],
                            "conversation": results['documents'][0][i],
                            "metadata": results['metadatas'][0][i],
                            "distance": distance,
                            "relevance_score": relevance
                        })

            logger.info(f"Query returned {len(formatted_results)} results")
            return formatted_results

        except Exception as e:
            logger.error(f"Query failed: {e}", exc_info=True)
            return []

    def get_session_by_id(self, session_id: str) -> Dict:
        """Retrieve a specific session by ID.

        Args:
            session_id: Session identifier

        Returns:
            Dict with session_id, conversation, metadata

        Raises:
            SessionNotFoundError: If session doesn't exist
        """
        try:
            results = self.collection.get(ids=[session_id])

            if not results or not results['ids']:
                raise SessionNotFoundError(f"Session not found: {session_id}")

            return {
                "session_id": results['ids'][0],
                "conversation": results['documents'][0],
                "metadata": results['metadatas'][0]
            }

        except SessionNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {e}", exc_info=True)
            raise SessionDBError(f"Cannot retrieve session: {e}")

    def list_sessions(
        self,
        agent_name: str = None,
        workflow: str = None,
        project_name: str = None,
        limit: int = 10
    ) -> List[Dict]:
        """List sessions with metadata filtering (no semantic search).

        Args:
            agent_name: Filter by agent (optional)
            workflow: Filter by workflow (optional)
            project_name: Filter by project (optional)
            limit: Maximum results

        Returns:
            List of session metadata dicts (no conversation text)
        """
        try:
            # Build where clause
            where = {}
            if agent_name:
                where["agent_name"] = agent_name
            if workflow:
                where["workflow"] = workflow
            if project_name:
                where["project_name"] = project_name

            # Get sessions
            results = self.collection.get(
                where=where if where else None,
                limit=limit
            )

            # Format results (metadata only)
            sessions = []
            if results and results['ids']:
                for i in range(len(results['ids'])):
                    sessions.append({
                        "session_id": results['ids'][i],
                        "metadata": results['metadatas'][i]
                    })

            logger.info(f"Listed {len(sessions)} sessions")
            return sessions

        except Exception as e:
            logger.error(f"Failed to list sessions: {e}", exc_info=True)
            return []

    def delete_session(self, session_id: str) -> bool:
        """Delete a session from the database.

        Args:
            session_id: Session to delete

        Returns:
            True if deleted, False if not found
        """
        try:
            self.collection.delete(ids=[session_id])
            logger.info(f"Session deleted: {session_id}")
            return True
        except Exception as e:
            logger.warning(f"Failed to delete session {session_id}: {e}")
            return False
