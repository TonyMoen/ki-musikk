# Notes for Implementation Teams

### For Product Manager (You, BIP!)
- **Priority 1:** Epic 3 (Norwegian Song Creation) - THE CORE VALUE. Don't compromise pronunciation quality!
- **Validate early:** Get 10-20 test users generating songs in Phase 1, gather feedback on pronunciation before Phase 2
- **Watch costs:** API costs can spike. Monitor Story 8.3 (Cost Monitoring) closely from Day 1
- **Founder's expertise:** Your 80k listener experience is the moat. Manual mastering (Story 6.3) is high-value differentiation

### For Developers
- **Architecture is complete:** Reference `/docs/architecture.md` for all technical decisions
- **Follow patterns:** Naming conventions, error handling, API response format ALL documented
- **No shortcuts:** Atomic credit deduction (Story 2.6), Row Level Security (Story 1.6) are CRITICAL for trust
- **Test pronunciation:** Each genre prompt template (Story 3.10) must be validated with real Suno generations

### For UX Designer
- **Mobile-first:** 80% of users will be on mobile at parties/events
- **TikTok-inspired:** Horizontal genre carousel (Story 3.1) should feel native to TikTok users
- **Progressive disclosure:** Simple by default, advanced (per-line override) optional
- **Color system:** Playful Nordic theme (#E94560 red, #0F3460 navy, #FFC93C yellow) - Story 1.2

### For QA/Test Team
- **Pronunciation quality:** #1 priority. Test each genre, multiple lyrics variations
- **Credit flows:** Every credit deduction/refund scenario must be tested (Stories 2.3-2.6)
- **Error handling:** Intentionally break APIs (Suno, OpenAI, Stripe) to test resilience (Epic 8)
- **Cross-browser/device:** Test on iOS Safari, Android Chrome, desktop (Safari, Chrome, Firefox)

---
