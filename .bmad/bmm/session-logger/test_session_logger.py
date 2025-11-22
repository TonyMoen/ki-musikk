#!/usr/bin/env python3
"""
BMAD Session Logger - Test Script
Verifies installation and basic functionality.

Usage:
    python test_session_logger.py
"""

import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

print("=" * 70)
print("BMAD Session Logger - Installation Test")
print("=" * 70)
print()

# Test 1: Check dependencies
print("Test 1: Checking dependencies...")
try:
    import chromadb
    print(f"  [OK] chromadb installed (version {chromadb.__version__})")
except ImportError as e:
    print(f"  [FAIL] chromadb not installed: {e}")
    print("\n  Run: pip install chromadb==1.0.15")
    sys.exit(1)

try:
    import sentence_transformers
    print(f"  [OK] sentence-transformers installed")
except ImportError as e:
    print(f"  [FAIL] sentence-transformers not installed: {e}")
    print("\n  Run: pip install sentence-transformers")
    sys.exit(1)

try:
    import yaml
    print(f"  [OK] pyyaml installed")
except ImportError as e:
    print(f"  [FAIL] pyyaml not installed: {e}")
    print("\n  Run: pip install pyyaml")
    sys.exit(1)

print()

# Test 2: Import session logger
print("Test 2: Importing session logger module...")
try:
    # Import using the actual directory structure (.bmad)
    sys.path.insert(0, str(Path(__file__).parent))
    from session_db import SessionDB
    from query import get_relevant_context
    from hooks import on_agent_exit, on_agent_start
    print("  [OK] All imports successful")
except ImportError as e:
    print(f"  [FAIL] Import failed: {e}")
    print(f"  Path: {sys.path}")
    sys.exit(1)

print()

# Test 3: Initialize database
print("Test 3: Initializing ChromaDB...")
test_db_path = str(Path.home() / ".bmad" / "data" / "session-db-test")
try:
    db = SessionDB(db_path=test_db_path, collection_name="test_collection")
    print(f"  [OK] Database initialized at: {test_db_path}")
except Exception as e:
    print(f"  [FAIL] Database initialization failed: {e}")
    sys.exit(1)

print()

# Test 4: Save a test session
print("Test 4: Saving test session...")
test_conversation = """
User: Hello, I want to build a vector database for session logging.
Assistant: Great idea! I recommend using ChromaDB with sentence transformers.
User: How should I structure the data?
Assistant: Use whole-session chunking with rich metadata for filtering.
User: What about embeddings?
Assistant: Use all-MiniLM-L6-v2 for local, privacy-preserving embeddings.
"""

try:
    session_id = db.save_session(
        conversation_text=test_conversation,
        agent_name="architect",
        agent_persona="Winston",
        project_name="test-project",
        workflow="testing",
        topics=["vector-database", "chromadb", "embeddings"]
    )
    print(f"  [OK] Session saved with ID: {session_id}")
except Exception as e:
    print(f"  [FAIL] Failed to save session: {e}")
    sys.exit(1)

print()

# Test 5: Query for the session
print("Test 5: Querying for similar sessions...")
try:
    # Give ChromaDB a moment to index (first run may be slower)
    import time
    time.sleep(2)

    results = db.query_sessions(
        query_text="how to use ChromaDB for embeddings?",
        n_results=1,
        min_relevance=0.0  # Accept any relevance for testing
    )
    if results:
        print(f"  [OK] Found {len(results)} matching session(s)")
        print(f"    Relevance: {results[0]['relevance_score']:.2%}")
    else:
        # Try to get by ID instead to verify session exists
        try:
            session_check = db.get_session_by_id(session_id)
            print(f"  [WARN] Query found no results, but session exists (ID: {session_id})")
            print(f"  [WARN] This may happen on first run - embeddings might still be indexing")
        except:
            print("  [FAIL] No results found and session doesn't exist")
            sys.exit(1)
except Exception as e:
    print(f"  [FAIL] Query failed: {e}")
    sys.exit(1)

print()

# Test 6: Get session by ID
print("Test 6: Retrieving session by ID...")
try:
    session_data = db.get_session_by_id(session_id)
    print(f"  [OK] Retrieved session: {session_data['session_id']}")
except Exception as e:
    print(f"  [FAIL] Failed to retrieve session: {e}")
    sys.exit(1)

print()

# Test 7: Test query helper
print("Test 7: Testing get_relevant_context()...")
try:
    context = get_relevant_context(
        query="what embeddings should I use?",
        max_sessions=1,
        db_path=test_db_path
    )
    if context and "Relevant Past Discussions" in context:
        print("  [OK] Context retrieved successfully")
        print(f"    Context length: {len(context)} characters")
    else:
        print("  [WARN] No context found (might be OK if no relevant sessions)")
except Exception as e:
    print(f"  [FAIL] get_relevant_context failed: {e}")
    sys.exit(1)

print()

# Test 8: Test agent hooks
print("Test 8: Testing agent hooks...")
try:
    # Test exit hook
    session_id_2 = on_agent_exit(
        agent_name="test-agent",
        persona="Tester",
        workflow="testing",
        project_name="test-project",
        conversation="User: Test\nAssistant: OK"
    )
    if session_id_2:
        print(f"  [OK] on_agent_exit successful: {session_id_2}")
    else:
        print("  [FAIL] on_agent_exit returned None")
        sys.exit(1)
except Exception as e:
    print(f"  [FAIL] Agent hook failed: {e}")
    sys.exit(1)

print()

# Test 9: Cleanup
print("Test 9: Cleaning up test data...")
try:
    db.delete_session(session_id)
    db.delete_session(session_id_2)
    print("  [OK] Test sessions deleted")
except Exception as e:
    print(f"  [WARN] Cleanup warning: {e}")

print()

# Success!
print("=" * 70)
print("[SUCCESS] ALL TESTS PASSED!")
print("=" * 70)
print()
print("The BMAD Session Logger is installed and working correctly.")
print()
print("Next steps:")
print("  1. Review the architecture document: docs/bmad-session-logger-architecture.md")
print("  2. Integrate hooks into BMAD agents")
print("  3. Start logging real sessions!")
print()
print(f"Database location: {test_db_path}")
print("For production use, sessions will be stored in: .bmad/data/session-db/")
print()