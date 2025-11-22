# Story 1.5: Configure Deployment on Vercel

Status: ready-for-dev

## Story

As a developer,
I want the application automatically deployed to Vercel with continuous deployment from Git,
so that every commit to main triggers a production deployment and the application is publicly accessible via HTTPS.

## Acceptance Criteria

1. **Vercel Account Connected**: GitHub repository connected to Vercel account with deployment permissions
2. **Project Configured**: Vercel project created with Next.js framework preset and correct build settings
3. **Environment Variables Set**: All Supabase environment variables configured in Vercel dashboard for Production, Preview, and Development
4. **Automatic Deployment Works**: Push to main branch triggers automatic build and deployment to production URL
5. **Preview Deployments Active**: Pull requests automatically create preview deployments with unique URLs
6. **Production URL Accessible**: Application accessible via HTTPS at Vercel-provided URL (*.vercel.app)
7. **Build Logs Available**: Vercel dashboard shows build logs and deployment status
8. **Deployment Verified**: Test deployment by pushing a commit, verify build succeeds and site is live

## Tasks / Subtasks

- [ ] Task 1: Create Vercel Account and Connect GitHub (AC: #1)
  - [ ] Sign up or log in to Vercel (https://vercel.com)
  - [ ] Click "Add New Project"
  - [ ] Connect GitHub account if not already connected
  - [ ] Authorize Vercel to access GitHub repositories
  - [ ] Select the Musikkfabrikken repository (ibe160)

- [ ] Task 2: Configure Vercel Project (AC: #2)
  - [ ] Verify Framework Preset: Next.js (should auto-detect)
  - [ ] Verify Root Directory: `.` (project root)
  - [ ] Verify Build Command: `npm run build` (default for Next.js)
  - [ ] Verify Output Directory: `.next` (default for Next.js)
  - [ ] Verify Install Command: `npm install` (default)
  - [ ] Set Node.js Version: 20.x (or 18.x LTS)
  - [ ] Name the project: `musikkfabrikken` (or similar)

- [ ] Task 3: Configure Environment Variables (AC: #3)
  - [ ] Navigate to Project Settings → Environment Variables
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL`:
    - Value: `https://<project-ref>.supabase.co` (from Story 1.3)
    - Environments: Production, Preview, Development (all selected)
  - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
    - Value: `<anon-key>` (from Story 1.3)
    - Environments: Production, Preview, Development (all selected)
  - [ ] Add `SUPABASE_SERVICE_ROLE_KEY`:
    - Value: `<service-role-key>` (from Story 1.3)
    - Environments: Production, Preview, Development (all selected)
    - Note: Mark as "Sensitive" to hide value in UI
  - [ ] Verify all 3 environment variables are saved

- [ ] Task 4: Trigger Initial Deployment (AC: #4)
  - [ ] Click "Deploy" button in Vercel dashboard
  - [ ] Wait for build to complete (may take 1-3 minutes)
  - [ ] Monitor build logs in real-time
  - [ ] Verify build succeeds with exit code 0

- [ ] Task 5: Verify Production Deployment (AC: #6)
  - [ ] Copy production URL from Vercel dashboard (e.g., musikkfabrikken.vercel.app)
  - [ ] Open production URL in browser
  - [ ] Verify HTTPS is active (padlock icon in address bar)
  - [ ] Verify application loads without errors
  - [ ] Check browser console for any errors
  - [ ] Verify environment variables are accessible (Supabase should connect)

- [ ] Task 6: Test Automatic Deployment (AC: #4, #8)
  - [ ] Make a small change locally (e.g., update page.tsx with a comment)
  - [ ] Commit change: `git commit -m "test: verify Vercel auto-deployment"`
  - [ ] Push to main: `git push origin main`
  - [ ] Watch Vercel dashboard for automatic deployment trigger
  - [ ] Wait for deployment to complete
  - [ ] Verify new deployment shows in deployment list with "Ready" status
  - [ ] Visit production URL and verify change is live

- [ ] Task 7: Test Preview Deployment (AC: #5)
  - [ ] Create a new branch: `git checkout -b test-preview-deployment`
  - [ ] Make a test change (e.g., add comment to layout.tsx)
  - [ ] Commit and push branch: `git push origin test-preview-deployment`
  - [ ] Create Pull Request on GitHub
  - [ ] Verify Vercel bot comments on PR with preview URL
  - [ ] Visit preview URL and verify it's a separate deployment
  - [ ] Close PR (don't merge) and delete branch

- [ ] Task 8: Review Deployment Settings (AC: #7)
  - [ ] Navigate to Vercel dashboard → Deployments tab
  - [ ] Click on latest deployment
  - [ ] Review build logs (should show npm install, npm run build, deployment steps)
  - [ ] Verify no errors or warnings in build logs
  - [ ] Check deployment details (build time, region, Node version)
  - [ ] Verify deployment source (branch, commit hash, commit message)

- [ ] Task 9: Configure Domain Settings (Optional, Future)
  - [ ] Note: Custom domain (musikkfabrikken.no) will be configured post-MVP
  - [ ] Current URL: musikkfabrikken.vercel.app is sufficient for development
  - [ ] Document custom domain setup process in README for future reference

- [ ] Task 10: Document Deployment Process
  - [ ] Update README.md with deployment information:
    - Production URL: https://musikkfabrikken.vercel.app
    - Deployment: Automatic on push to main
    - Preview deployments: Automatic on PRs
    - Environment variables: Configured in Vercel dashboard
  - [ ] Add note about Vercel CLI for local preview (optional)
  - [ ] Commit README updates

- [ ] Task 11: Verify Build Success (AC: #8)
  - [ ] Ensure latest production deployment shows "Ready" status
  - [ ] Verify no build errors or failures
  - [ ] Check deployment took <3 minutes (typical Next.js build time)
  - [ ] Confirm application is accessible and functional

## Dev Notes

### Architecture Alignment

**From `/docs/architecture.md` - Deployment Architecture:**

**Hosting: Vercel (Seamless Next.js Integration)**
- **Regions**: US/EU (closest to Supabase region), Edge Functions globally
- **CI/CD**: Git push to main → Automatic deployment
- **Preview Deployments**: Automatic for PRs with unique URLs
- **Rollback Capability**: One-click rollback to previous deployments
- **Environment Management**: Production, Preview, Development environments

**Deployment Strategy:**
- **Production**: `main` branch → musikkfabrikken.vercel.app (or custom domain)
- **Staging**: `staging` branch → staging-musikkfabrikken.vercel.app (optional)
- **Development**: Local (`npm run dev`)
- **Preview**: PR branches → unique preview URLs

**Monitoring:**
- Vercel Analytics for performance (automatic)
- Build logs captured in Vercel dashboard
- Console logs → Vercel Logs
- Error tracking: Sentry (optional, Epic 2+)

**Performance:**
- Automatic CDN distribution
- Edge Functions for auth checks (fast worldwide)
- Automatic code splitting (Next.js default)
- Image optimization via next/image

**From `/docs/architecture.md` - Environment Variables:**

**Environment Variable Strategy:**
- `.env.local` for local development (gitignored)
- Vercel dashboard for production secrets
- All environments (Production, Preview, Development) should have same variables
- Sensitive keys marked as "Sensitive" in Vercel UI (hides value)

**Required Variables (from Story 1.3):**
- `NEXT_PUBLIC_SUPABASE_URL` - Public, safe for client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public, safe for client (RLS enforced)
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only, sensitive, admin access

**Future Variables (Prepared for Epic 2+):**
- Stripe keys (Epic 2)
- OpenAI API key (Epic 3)
- Suno API key (Epic 3)
- Google AI API key (Epic 6)

**From `/docs/architecture.md` - Build Configuration:**

**Build Settings (Vercel Auto-Detects for Next.js):**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x or 20.x (LTS recommended)

**Build Performance:**
- Target: <2 minutes for initial build (architecture NFR)
- Vercel builds run on dedicated build infrastructure
- Turbopack available for local dev, not used in production builds yet
- Next.js automatic optimizations (code splitting, image optimization)

### Project Structure Notes

**Files to Create:**
- None (Vercel configuration is dashboard-based)

**Files to Modify:**
- `README.md` - Add deployment documentation section
- Optional: `.vercelignore` - Exclude files from deployment (usually not needed)

**Files to Review:**
- `next.config.js` (or .mjs) - Verify Next.js configuration is production-ready
- `package.json` - Verify build script exists and is correct

**Vercel-Generated Files (Auto-Created, Gitignored):**
- `.vercel/` directory - Project configuration (should be in .gitignore from Story 1.1)

### Learnings from Previous Story

**From Story 1-2-configure-tailwind-with-playful-nordic-theme (Status: done)**

- **Build Verification Working**:
  - `npm run build` succeeds locally
  - No TypeScript errors
  - No ESLint errors (warnings acceptable)
  - This confirms Vercel builds should succeed

- **Norwegian Language Configured**:
  - HTML lang="nb" in layout.tsx
  - Metadata in Norwegian (Bokmål)
  - Should be preserved in production deployment

- **Tailwind Theme Ready**:
  - Playful Nordic colors configured
  - Production build includes optimized Tailwind CSS
  - Vercel serves optimized CSS bundle via CDN

[Source: docs/sprint-artifacts/1-2-configure-tailwind-with-playful-nordic-theme.md#Dev-Agent-Record]

**From Story 1-3 (Ready for Dev, Not Yet Done):**

Story 1-3 sets up Supabase environment variables that **must be configured in Vercel** for this story. Dependencies:

- ⚠️ **PREREQUISITE**: Story 1-3 must be completed BEFORE deploying to Vercel
- Reason: Vercel deployment needs Supabase environment variables
- Without these variables, application will fail to connect to Supabase in production
- Order: Complete 1-3 (Supabase setup) → Then do 1-5 (Vercel deployment)

### Technical Context

**Vercel Project Configuration:**

When creating project, Vercel auto-detects:
- Framework: Next.js (from package.json)
- Build command: `npm run build` (from package.json scripts)
- Output directory: `.next` (Next.js standard)
- Install command: `npm install` (default)

**No manual configuration needed unless:**
- Using custom build command
- Using monorepo structure
- Requiring specific Node.js version

**Environment Variable Scope:**

Vercel offers 3 environment scopes:
- **Production**: Used for production deployments (main branch)
- **Preview**: Used for preview deployments (PR branches)
- **Development**: Used with Vercel CLI locally (optional)

**Best Practice**: Select all 3 scopes for each variable to ensure consistency across environments.

**Deployment Triggers:**

Automatic deployments triggered by:
- Push to main → Production deployment
- Push to any branch with open PR → Preview deployment
- Manual trigger from Vercel dashboard

**Deployment Verification:**

After deployment, verify:
1. ✅ Build succeeded (green checkmark in Vercel)
2. ✅ Deployment status: "Ready"
3. ✅ Production URL accessible via HTTPS
4. ✅ No console errors in browser
5. ✅ Supabase connection works (if Story 1-3 complete)

**Rollback Strategy:**

If deployment fails or has issues:
- Vercel dashboard → Deployments → Previous deployment → "Promote to Production"
- Instant rollback, no rebuild required
- Previous deployment becomes live immediately

**Build Logs:**

Vercel provides comprehensive build logs:
- Install phase: `npm install` output
- Build phase: `npm run build` output
- Deployment phase: File upload and CDN distribution
- Errors highlighted in red
- Warnings in yellow

**Preview Deployment URLs:**

Format: `<project>-<branch>-<team>.vercel.app`
- Example: `musikkfabrikken-test-feature-bip.vercel.app`
- Unique URL for each PR/branch
- Automatically commented on GitHub PRs by Vercel bot

### References

- [Architecture Document - Deployment Architecture](../architecture.md#deployment-architecture)
- [Architecture Document - Environment Variables](../architecture.md#secrets-management)
- [Epic 1 Tech Spec - Vercel Configuration](tech-spec-epic-1.md#vercel-story-15)
- [Vercel Documentation - Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Documentation - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Documentation - Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)

## Change Log

**2025-11-20 - Story Created (drafted status)**
- Story drafted by SM agent (Bob) in YOLO mode
- Extracted from Epic 1: Foundation & Infrastructure
- Source: docs/sprint-artifacts/tech-spec-epic-1.md
- **IMPORTANT PREREQUISITE**: Story 1-3 (Supabase) must be completed BEFORE this story
- Reason: Vercel deployment requires Supabase environment variables from Story 1-3
- Story 1-4 (shadcn/ui) is independent and can be done in any order
- Includes learnings from Story 1-2 (build verification, Norwegian language)
- Next step: Complete Story 1-3 first, then run story-context for 1-5, or proceed to development

## Dev Agent Record

### Context Reference

- [Story Context File](1-5-configure-deployment-on-vercel.context.xml) - Generated 2025-11-20

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**2025-11-20 - Story Started**
- Started implementation of Vercel deployment configuration
- Marked story in-progress in sprint-status.yaml

**2025-11-20 - BLOCKER IDENTIFIED**
- **Issue**: User is not the GitHub repository owner
- **Impact**: Cannot authorize Vercel to access the repository (required for Task 1)
- **Blocker Type**: Permission/Access issue
- **Resolution Required**: Repository owner must either:
  1. Set up Vercel deployment themselves, OR
  2. Transfer repository ownership to user, OR
  3. Grant user admin permissions on the repository
- **Decision**: Story marked as blocked, deferred to later in sprint
- **Note**: This story is NOT blocking for other Epic 1 stories (1.6 Database Schema can proceed)

### Completion Notes List

Story not completed - blocked by repository access permissions.

### File List
