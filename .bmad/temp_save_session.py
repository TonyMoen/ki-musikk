import sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".bmad" / "bmm" / "session-logger"))

from hooks import on_agent_exit

# Session conversation summary
conversation = """
Story 1.6: Set Up Database Schema with Supabase Migrations - Implementation Session

=== WORKFLOW EXECUTION ===
Workflow: /bmad:bmm:workflows:dev-story
Story: 1-6-set-up-database-schema-with-supabase-migrations
Status: ready-for-dev → in-progress → review

=== IMPLEMENTATION SUMMARY ===

Assistant executed the complete database schema setup workflow:

1. Loaded workflow configuration and story context
2. Read complete database schema from architecture.md (5 tables, RLS policies, indexes, stored procedures)
3. Created comprehensive migration file: supabase/migrations/20251120_initial_schema.sql (280 lines)
   - user_profile, song, credit_transaction, genre, mastering_request tables
   - Row Level Security policies with auth.uid() = user_id pattern
   - Performance indexes on user_id, created_at DESC, status
   - deduct_credits() stored procedure for atomic credit operations
   - Genre seed data (4 Norwegian song genres)

4. User manually applied migration via Supabase dashboard SQL Editor

5. Generated TypeScript types manually in src/types/supabase.ts
   - Database interface with all 5 tables
   - Row/Insert/Update types for type-safe queries
   - Functions type for stored procedures

6. Updated Supabase clients with Database generic type
   - src/lib/supabase/client.ts: Added <Database> generic
   - src/lib/supabase/server.ts: Added <Database> generic

7. Created test page src/app/test-database/page.tsx to verify:
   - RLS policies working correctly
   - TypeScript autocomplete functional
   - Genre seed data loaded

8. Build verification: npm run build succeeded twice (with test page, after cleanup)
9. Updated story file with all tasks completed
10. Updated sprint-status.yaml: story moved to 'review' status

=== KEY ACHIEVEMENTS ===
✅ All 10 acceptance criteria met
✅ Type-safe database queries with full TypeScript support
✅ Row Level Security enforcing multi-tenant data isolation
✅ Atomic credit deduction with race condition prevention
✅ Zero TypeScript errors in production build
✅ Comprehensive documentation in migration file

=== USER QUESTIONS ===

User asked: "Good for now. Should i do a complete code review since we are done with the first epic?"

Assistant recommended:
- Option A: Run code-review on story 1.6, then retrospective (Recommended)
- Epic 1 Status: 5/6 stories completed (1.5 skipped due to permissions)
- Code review workflow: /bmad:bmm:workflows:code-review
- Retrospective workflow: /bmad:bmm:workflows:retrospective
- Rationale: Epic 1 is foundational, better to ensure solid foundation before Epic 2

User asked: "What if i want to change the genres and so on later? Is that hard to do?"

Assistant explained:
- Very easy - genres are data in database table, not hardcoded
- Option 1: Supabase Dashboard Table Editor (easiest, no code)
- Option 2: SQL queries (UPDATE/INSERT/DELETE)
- Option 3: Future admin UI (Story 8.8)
- Genre table has no RLS restrictions (public reference data)
- No code changes or migrations needed to modify genres
- Safe changes: Add genres, edit display names, emojis, prompts, sort order
- Potentially breaking: Changing 'name' field (songs reference it)

User then called: /save-session to save this conversation to vector database
"""

# Save session to vector database
session_id = on_agent_exit(
    agent_name="dev",
    persona="Developer Agent",
    workflow="dev-story",
    project_name="ibe160",
    conversation=conversation,
    topics=[
        "database-schema",
        "supabase-migrations",
        "row-level-security",
        "typescript-types",
        "epic-1-foundation",
        "story-1-6",
        "sql-migration",
        "deduct-credits-procedure",
        "genre-seed-data"
    ],
    artifacts=[
        "supabase/migrations/20251120_initial_schema.sql",
        "src/types/supabase.ts",
        "src/lib/supabase/client.ts",
        "src/lib/supabase/server.ts",
        "docs/sprint-artifacts/1-6-set-up-database-schema-with-supabase-migrations.md"
    ]
)

print(f"✓ Session saved to vector database!")
print(f"  Session ID: {session_id}")
print(f"  Agent: dev (Developer Agent)")
print(f"  Workflow: dev-story")
print(f"  Story: 1.6 - Database Schema Setup")
print(f"  Database: .bmad/data/session-db/")
print()
print("You can now query this session with semantic search:")
print("  - 'How did we set up the database schema?'")
print("  - 'What TypeScript types were generated?'")
print("  - 'How do I modify genres later?'")
print("  - 'What RLS policies were created?'")
