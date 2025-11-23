import sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".bmad" / "bmm" / "session-logger"))

from hooks import on_agent_exit

# Session conversation summary
conversation = """
Story 2.3: Implement Credit Purchase Flow with Stripe Checkout - Implementation & Testing Session

=== WORKFLOW EXECUTION ===
Workflow: /bmad:bmm:workflows:dev-story
Story: 2-3-implement-credit-purchase-flow-with-stripe-checkout
Status: ready-for-dev → in-progress → review → DONE (E2E tested)

=== IMPLEMENTATION SUMMARY ===

Completed all 10 tasks for Stripe Checkout integration:

1. Installed Stripe SDK packages (stripe, @stripe/stripe-js)
2. Created credit package constants (Starter $15/500cr, Pro $25/1000cr, Premium $50/2500cr)
3. Built Stripe client initialization with TypeScript
4. Implemented credit purchase API route with authentication and validation
5. Created Stripe webhook handler for payment confirmation
6. Built credit purchase modal UI with Playful Nordic theme
7. Integrated purchase modal into Settings page
8. Added payment success/cancel redirect handling with toasts
9. Configured Stripe test keys and webhook endpoint
10. Verified production build and lint (all passed)

=== KEY FILES CREATED ===
- src/lib/constants.ts (Credit packages & costs)
- src/lib/stripe.ts (Stripe client initialization)
- src/app/api/credits/purchase/route.ts (Purchase API)
- src/app/api/webhooks/stripe/route.ts (Webhook handler)
- src/components/credit-purchase-modal.tsx (Modal UI)
- supabase/migrations/20251122_add_user_profile_trigger.sql (Auto-create user profiles)

=== CRITICAL BUG FIX ===
Issue: Webhook failed with 500 error - "Cannot coerce result to single JSON object"
Root Cause: Webhook using authenticated Supabase client, blocked by Row Level Security
Solution: Changed webhook to use service role key (bypasses RLS)
File Modified: src/app/api/webhooks/stripe/route.ts
Result: Webhooks now successfully add credits to user accounts

=== DATABASE IMPROVEMENTS ===
Created trigger for automatic user_profile creation on signup:
- Function: handle_new_user()
- Trigger: on_auth_user_created (AFTER INSERT on auth.users)
- Prevents missing user_profile errors for new Google OAuth users

=== END-TO-END TESTING ===
✅ User configured Stripe test API keys
✅ User set up webhook endpoint in Stripe Dashboard
✅ Tested Starter package purchase ($15, 500 credits)
✅ Payment completed successfully with test card (4242...)
✅ Credits added to account (verified in Supabase)
✅ Transaction record created in credit_transaction table
✅ Success toast displayed in UI
✅ Balance updated immediately without refresh

=== ACCEPTANCE CRITERIA VERIFICATION ===
✅ Click "Purchase Credits" button → Modal opens
✅ See 3 credit packages with pricing
✅ "MOST POPULAR" badge on Pro package
✅ Select package → Redirect to Stripe Checkout
✅ Complete payment → Redirect back to app
✅ Credit balance updates immediately
✅ Success toast: "✓ Credits added to your account!"
✅ Transaction record created in database

=== USER INTERACTIONS ===

User provided Stripe API keys:
- Publishable key and Secret key configured in .env.local
- User selected "Option C" (Stripe Dashboard) for webhook setup
- Webhook secret configured: whsec_035f...

First test payment failed with error:
User: "I get green confirm but no redirect and no credits"
Error: "Failed to fetch user profile: Cannot coerce result to single JSON object"

Assistant diagnosed RLS permission issue and fixed webhook handler.

Second test payment successful:
User: "Perfect, let's wrap up if everything looks ok? Works fine here"
Result: Credits added, transaction created, all features working

User then called /save-session to save this conversation
"""

# Save session to vector database
session_id = on_agent_exit(
    agent_name="dev",
    persona="Developer Agent",
    workflow="dev-story",
    project_name="ibe160",
    conversation=conversation,
    topics=[
        "stripe-checkout-integration",
        "credit-purchase-flow",
        "webhook-handler",
        "payment-processing",
        "row-level-security-fix",
        "service-role-key",
        "database-trigger",
        "user-profile-creation",
        "e2e-testing",
        "epic-2-authentication"
    ],
    artifacts=[
        "src/lib/constants.ts",
        "src/lib/stripe.ts",
        "src/app/api/credits/purchase/route.ts",
        "src/app/api/webhooks/stripe/route.ts",
        "src/components/credit-purchase-modal.tsx",
        "src/app/settings/page.tsx",
        "supabase/migrations/20251122_add_user_profile_trigger.sql",
        "docs/sprint-artifacts/2-3-implement-credit-purchase-flow-with-stripe-checkout.md",
        ".env.local"
    ]
)

print(f"✓ Session saved to vector database!")
print(f"  Session ID: {session_id}")
print(f"  Agent: dev (Developer Agent)")
print(f"  Workflow: dev-story")
print(f"  Story: 2.3 - Stripe Credit Purchase Flow")
print(f"  Database: .bmad/data/session-db/")
print()
print("You can now query this session with semantic search:")
print("  - 'How did we implement Stripe checkout?'")
print("  - 'What was the webhook RLS bug and how was it fixed?'")
print("  - 'How do I test credit purchases with Stripe?'")
print("  - 'What files were created for payment processing?'")
