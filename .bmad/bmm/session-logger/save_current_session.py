#!/usr/bin/env python3
"""
Quick Session Saver
Run this script to save the current conversation to the vector database.

Usage:
    python save_current_session.py
"""

import sys
from pathlib import Path
from datetime import datetime

# Setup paths
sys.path.insert(0, str(Path(__file__).parent))

from hooks import on_agent_exit

def save_session():
    """Interactive session saver."""
    print("=" * 70)
    print("BMAD Session Logger - Save Current Session")
    print("=" * 70)
    print()

    # Get agent info
    print("Which agent was this session with?")
    print("  1. architect (Winston)")
    print("  2. pm (Morgan)")
    print("  3. dev (Developer)")
    print("  4. tea (Test Engineer)")
    print("  5. sm (Scrum Master)")
    print("  6. ux-designer (UX Designer)")
    print("  7. other")

    choice = input("\nEnter number (or agent name): ").strip()

    agent_map = {
        "1": ("architect", "Winston"),
        "2": ("pm", "Morgan"),
        "3": ("dev", "Developer"),
        "4": ("tea", "Test Engineer"),
        "5": ("sm", "Scrum Master"),
        "6": ("ux-designer", "UX Designer"),
    }

    if choice in agent_map:
        agent_name, persona = agent_map[choice]
    elif choice == "7":
        agent_name = input("Agent name: ").strip()
        persona = input("Agent persona: ").strip()
    else:
        agent_name = choice
        persona = choice.title()

    print(f"\nAgent: {agent_name} ({persona})")

    # Get workflow
    workflow = input("Workflow (or press Enter for 'none'): ").strip() or "none"

    # Get topics
    topics_input = input("Topics (comma-separated, or press Enter to skip): ").strip()
    topics = [t.strip() for t in topics_input.split(",")] if topics_input else []

    # Get artifacts
    artifacts_input = input("Artifacts/files created (comma-separated, or press Enter to skip): ").strip()
    artifacts = [a.strip() for a in artifacts_input.split(",")] if artifacts_input else []

    # Get conversation
    print("\n" + "=" * 70)
    print("Paste the FULL conversation below.")
    print("When done, type 'END' on a new line and press Enter.")
    print("=" * 70)
    print()

    conversation_lines = []
    while True:
        try:
            line = input()
            if line.strip() == "END":
                break
            conversation_lines.append(line)
        except EOFError:
            break

    conversation = "\n".join(conversation_lines)

    if not conversation.strip():
        print("\n[ERROR] No conversation provided. Exiting.")
        return

    # Save session
    print("\nSaving session to vector database...")
    try:
        session_id = on_agent_exit(
            agent_name=agent_name,
            persona=persona,
            workflow=workflow,
            project_name="ibe160",
            conversation=conversation,
            topics=topics,
            artifacts=artifacts
        )

        print("\n" + "=" * 70)
        print("[SUCCESS] Session saved to vector database!")
        print("=" * 70)
        print(f"  Session ID: {session_id}")
        print(f"  Agent: {agent_name} ({persona})")
        print(f"  Workflow: {workflow}")
        print(f"  Topics: {', '.join(topics) if topics else 'None'}")
        print(f"  Artifacts: {', '.join(artifacts) if artifacts else 'None'}")
        print(f"  Database: .bmad/data/session-db/")
        print()
        print("You can now search this session with semantic queries!")
        print()

    except Exception as e:
        print(f"\n[ERROR] Failed to save session: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    save_session()
