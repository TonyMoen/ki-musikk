# Story 8.1: Implement Basic Error Logging

Status: drafted

## Story

As a **developer/founder**,
I want errors logged so I can diagnose production issues,
So that I can identify and fix problems quickly when users experience failures.

## Acceptance Criteria

1. **Given** The application is running in production
   **When** Any error occurs (client-side or server-side)
   **Then** Error is logged with context: Error message, Stack trace, User ID (if authenticated), Timestamp

2. **And** Client errors are caught by Error Boundary components

3. **And** API errors are caught in try-catch blocks

4. **And** Logs are viewable in Vercel Dashboard (free tier)

5. **And** Sensitive data is never logged (passwords, API keys, PII)

6. **And** Logs include structured context: route/page, component name, user action

## Tasks / Subtasks

- [ ] Task 1: Create error logging utility (AC: #1, #4, #5)
  - [ ] Create `/src/lib/utils/logger.ts` with structured logging functions
  - [ ] Implement `logError(error, context)` function with standard format
  - [ ] Include timestamp, error message, stack trace, route/component
  - [ ] Add user ID from auth session (if available)
  - [ ] Ensure sensitive data filtering (API keys, passwords, tokens)
  - [ ] Use `console.error()` with JSON structure for Vercel Logs

- [ ] Task 2: Implement React Error Boundary (AC: #2, #6)
  - [ ] Create `/src/components/error-boundary.tsx` component
  - [ ] Wrap critical page sections with Error Boundary
  - [ ] Log caught errors with component context
  - [ ] Display user-friendly Norwegian error message
  - [ ] Include "Prøv igjen" (Try again) recovery action
  - [ ] Add Error Boundary to root layout for global catch

- [ ] Task 3: Add client-side global error handler (AC: #1, #2)
  - [ ] Add `window.onerror` handler in `/src/app/layout.tsx`
  - [ ] Add `window.onunhandledrejection` for Promise errors
  - [ ] Log unhandled errors with page context
  - [ ] Prevent duplicate logging (dedupe mechanism)

- [ ] Task 4: Add API route error handling pattern (AC: #3, #5)
  - [ ] Create API error handler utility `/src/lib/utils/api-error-handler.ts`
  - [ ] Implement try-catch wrapper for API routes
  - [ ] Log API errors with request context (method, path, query params)
  - [ ] Return consistent error response format
  - [ ] Never expose internal error details to client

- [ ] Task 5: Apply error handling to existing API routes (AC: #3)
  - [ ] Update `/src/app/api/songs/route.ts`
  - [ ] Update `/src/app/api/songs/[id]/route.ts`
  - [ ] Update `/src/app/api/songs/generate/route.ts`
  - [ ] Update `/src/app/api/credits/route.ts`
  - [ ] Update `/src/app/api/webhooks/stripe/route.ts`
  - [ ] Update `/src/app/api/webhooks/suno/route.ts`
  - [ ] Ensure all routes use consistent error handling

- [ ] Task 6: Testing and validation
  - [ ] Test client-side error boundary triggers correctly
  - [ ] Test API error logging captures context
  - [ ] Verify logs appear in Vercel Dashboard
  - [ ] Test sensitive data is NOT logged
  - [ ] Test error recovery flow works
  - [ ] Verify Norwegian error messages display correctly

## Dev Notes

### Requirements Context

**From Epic 8 (System Resilience & Operations):**
- Story 8.1 establishes foundational error logging for the entire application
- No prerequisites - this is a foundational story
- Enables monitoring and debugging of production issues
- FRs Covered: FR66-FR70 (Error Handling)

**Functional Requirements (PRD):**
- FR66: System gracefully handles API failures with user-friendly error messages
- FR67: System implements automatic retry logic for transient failures
- FR68: System maintains session state during API downtime
- FR69: System provides fallback mechanisms for webhook failures
- FR70: System prevents double-charging on concurrent requests

**Architecture Context (from docs/architecture.md):**

**Error Handling Pattern:**
```typescript
try {
  const result = await riskyOperation()
  return { data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { error: { code: 'OPERATION_FAILED', message: 'Friendly message' } }
}
```

**Logging Strategy (from Architecture):**
- Log Levels: ERROR (always), WARN (unexpected but handled), INFO (business events), DEBUG (dev only)
- Log Format:
```typescript
{
  timestamp: '2025-11-19T12:34:56Z',
  level: 'ERROR',
  message: 'Song generated successfully',
  context: {
    userId: '...',
    songId: '...',
    route: '/api/songs/generate'
  }
}
```

**What to Log:**
- All API calls (request/response)
- Credit transactions
- Song generation events
- Authentication events
- Errors and exceptions

**What NOT to Log:**
- Passwords
- API keys
- PII (personal identifiable information)
- Full credit card numbers
- Auth tokens

### Learnings from Previous Stories

**From Story 4.1 (My Songs Page) - Status: done**

- **Supabase Integration Pattern**:
  - Server-side: Use `createServerComponentClient` from `@supabase/auth-helpers-nextjs`
  - Client-side: Use `createClientComponentClient`
  - Get current user: `const { data: { session } } = await supabase.auth.getSession()`
  - User ID available from: `session?.user?.id`

- **Norwegian UI Text Patterns**:
  - Error messages: "Noe gikk galt med..." (Something went wrong with...)
  - Recovery actions: "Prøv igjen" (Try again), "Last inn på nytt" (Reload)
  - Generic error: "Beklager, noe gikk galt. Vennligst prøv igjen."

- **File Organization**:
  - Utility functions in `/src/lib/utils/[utility-name].ts`
  - Components in `/src/components/[component-name].tsx`
  - API routes in `/src/app/api/[route]/route.ts`

- **Component Structure**:
  - Import from `@/components/ui/[component]` for shadcn/ui
  - Use Tailwind classes for styling
  - Follow Playful Nordic theme colors

[Source: docs/sprint-artifacts/4-1-create-my-songs-page-with-track-list.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- `/src/lib/utils/logger.ts` - Centralized logging utility
- `/src/lib/utils/api-error-handler.ts` - API route error handling wrapper
- `/src/components/error-boundary.tsx` - React Error Boundary component

**Files to Modify:**
- `/src/app/layout.tsx` - Add global error handlers and Error Boundary
- `/src/app/api/songs/route.ts` - Apply error handling pattern
- `/src/app/api/songs/[id]/route.ts` - Apply error handling pattern
- `/src/app/api/songs/generate/route.ts` - Apply error handling pattern
- `/src/app/api/credits/route.ts` - Apply error handling pattern
- `/src/app/api/webhooks/stripe/route.ts` - Apply error handling pattern
- `/src/app/api/webhooks/suno/route.ts` - Apply error handling pattern

**Files to Reference:**
- `/src/lib/supabase/server.ts` - For getting user session context
- `/docs/architecture.md` - Error handling patterns and logging strategy

### Technical Implementation Notes

**Logging Utility:**
```typescript
// /src/lib/utils/logger.ts
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

interface LogContext {
  userId?: string
  route?: string
  component?: string
  action?: string
  [key: string]: unknown
}

function sanitize(data: unknown): unknown {
  // Filter sensitive keys: password, token, apiKey, secret, authorization
  // Return sanitized object
}

export function logError(message: string, error?: Error, context?: LogContext) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR' as LogLevel,
    message,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined,
    context: sanitize(context)
  }
  console.error(JSON.stringify(logEntry))
}

export function logWarn(message: string, context?: LogContext) { ... }
export function logInfo(message: string, context?: LogContext) { ... }
```

**React Error Boundary:**
```typescript
// /src/components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { logError } from '@/lib/utils/logger'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    logError('React Error Boundary caught error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-4">Beklager, noe gikk galt</h2>
          <p className="text-gray-600 mb-4">Prøv å laste siden på nytt</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Prøv igjen
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**API Error Handler:**
```typescript
// /src/lib/utils/api-error-handler.ts
import { NextResponse } from 'next/server'
import { logError } from './logger'

export function handleApiError(error: unknown, context: { route: string; method: string }) {
  const err = error instanceof Error ? error : new Error(String(error))

  logError('API error', err, {
    route: context.route,
    action: context.method
  })

  // Return safe error response (don't expose internal details)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  )
}
```

**Testing Strategy:**
- Unit tests: Logger utility sanitizes sensitive data correctly
- Unit tests: Error boundary catches and logs errors
- Integration tests: API routes log errors with context
- Manual tests: Verify logs appear in Vercel Dashboard
- Manual tests: Verify error recovery works (Error Boundary reset)

### References

- [Epic 8 - Story 8.1](C:/Users/tony-/SG-Tony/docs/epics/epic-8-system-resilience-operations.md#story-81-implement-basic-error-logging)
- [Architecture - Error Handling Patterns](C:/Users/tony-/SG-Tony/docs/architecture.md#error-handling)
- [Architecture - Logging Strategy](C:/Users/tony-/SG-Tony/docs/architecture.md#logging-strategy)
- [PRD - Error Handling Requirements](C:/Users/tony-/SG-Tony/docs/prd.md#error-handling--resilience)

## Change Log

**2025-11-26 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 8: System Resilience & Operations
- Source: docs/epics/epic-8-system-resilience-operations.md#story-81
- No prerequisites (foundational story)
- Provides error logging foundation for entire application
- Next step: Run story-context workflow to generate technical context XML, then mark ready for development

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
