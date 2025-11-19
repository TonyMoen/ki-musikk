# FR to Story Traceability Matrix

This matrix ensures EVERY functional requirement is implemented by at least one story.

| FR ID | FR Description | Implemented By | Epic |
|-------|----------------|----------------|------|
| **FR1** | Google OAuth authentication | Story 2.1 | Epic 2 |
| **FR2** | Secure login and sessions | Story 2.1 | Epic 2 |
| **FR3** | View account profile with credit balance | Story 2.2 | Epic 2 |
| **FR4** | Log out from any device | Story 2.2 | Epic 2 |
| **FR5** | Input Norwegian lyrics | Story 3.2 | Epic 3 |
| **FR6** | Select genre/style from templates | Story 3.1, 3.10 | Epic 3 |
| **FR7** | Customize song metadata (title) | Story 4.5 | Epic 4 |
| **FR8** | Preview lyrics before generation | Story 3.2 | Epic 3 |
| **FR9** | Toggle pronunciation optimization on/off | Story 3.3 | Epic 3 |
| **FR10** | Preview phonetic transformations with diff | Story 3.4 | Epic 3 |
| **FR11** | Override phonetic suggestions per-line | Story 3.4 | Epic 3 |
| **FR12** | Automatically apply Norwegian pronunciation rules | Story 3.3 | Epic 3 |
| **FR13** | View pronunciation optimization disclaimers | Story 3.3, 7.1 | Epic 3, 7 |
| **FR14** | Generate 30-second preview clips (free) | Story 3.9 | Epic 3 |
| **FR15** | Generate full-length songs using credits | Story 3.5 | Epic 3 |
| **FR16** | View real-time generation status and progress | Story 3.6 | Epic 3 |
| **FR17** | Cancel pending song generation | Story 3.6 | Epic 3 |
| **FR18** | Automatically deduct credits on success | Story 2.6, 3.5 | Epic 2, 3 |
| **FR19** | Automatically rollback credits on failure | Story 2.6 | Epic 2 |
| **FR20** | Receive notifications when complete | Story 3.6, 3.7 | Epic 3 |
| **FR21** | View all songs in persistent track list | Story 4.1 | Epic 4 |
| **FR22** | Play songs directly in browser | Story 3.8, 4.2 | Epic 3, 4 |
| **FR23** | Download songs in common formats | Story 4.3 | Epic 4 |
| **FR24** | Delete songs from track list | Story 4.4 | Epic 4 |
| **FR25** | Rename/re-title generated songs | Story 4.5 | Epic 4 |
| **FR26** | Persist track list across sessions | Story 4.1 | Epic 4 |
| **FR27** | Automatically delete songs after 14 days | Story 4.6 | Epic 4 |
| **FR28** | View current credit balance at all times | Story 2.2 | Epic 2 |
| **FR29** | Purchase credit packages via Stripe | Story 2.3 | Epic 2 |
| **FR30** | Receive low-balance warnings | Story 2.5 | Epic 2 |
| **FR31** | View credit transaction history | Story 2.4 | Epic 2 |
| **FR32** | Display credit cost before action | Story 2.5, 3.5 | Epic 2, 3 |
| **FR33** | Prevent actions if insufficient credits | Story 2.5 | Epic 2 |
| **FR34** | Request refunds for failed generations | Story 2.6 | Epic 2 |
| **FR35** | Optionally generate visual canvas/album art | Story 6.1 | Epic 6 |
| **FR36** | Provide custom prompts for canvas | Story 6.1 | Epic 6 |
| **FR37** | Auto-generate canvas prompts from metadata | Story 6.1 | Epic 6 |
| **FR38** | Preview and download canvas images | Story 6.2 | Epic 6 |
| **FR39** | Deduct canvas credits separately | Story 6.1 | Epic 6 |
| **FR40** | Book manual mastering service | Story 6.3 | Epic 6 |
| **FR41** | View mastering SLA (24-hour) | Story 6.3 | Epic 6 |
| **FR42** | Binding pre-payment for mastering | Story 6.3 | Epic 6 |
| **FR43** | Receive notifications when mastered ready | Story 6.4 | Epic 6 |
| **FR44** | Download mastered + original versions | Story 6.4 | Epic 6 |
| **FR45** | Free mastering if SLA missed | Story 6.5 | Epic 6 |
| **FR46** | Automatically download and store songs from Suno | Story 3.7 | Epic 3 |
| **FR47** | Provide signed URLs for secure downloads | Story 4.3 | Epic 4 |
| **FR48** | Notify users before 14-day deletion | Story 4.6 | Epic 4 |
| **FR49** | Premium tier: Extended 30-day storage | Story 6.6 | Epic 6 |
| **FR50** | Export/download multiple songs in batch | Story 4.7 | Epic 4 |
| **FR51** | Access genre templates with selection | Story 3.1 | Epic 3 |
| **FR52** | Display helpful tooltips and guidance | Story 7.1 | Epic 7 |
| **FR53** | View examples of phonetic optimization | Story 7.4 | Epic 7 |
| **FR54** | Access FAQ and help documentation | Story 7.3 | Epic 7 |
| **FR55** | Display clear error messages with guidance | Story 7.5 | Epic 7 |
| **FR56** | Share songs to social media platforms | Story 5.2 | Epic 5 |
| **FR57** | Free previews include watermark/branding | Story 5.4 | Epic 5 |
| **FR58** | Generate shareable links for songs | Story 5.3 | Epic 5 |
| **FR59** | Shared songs display attribution | Story 5.3, 5.4 | Epic 5 |
| **FR60** | Log all credit transactions for auditing | Story 8.1 | Epic 8 |
| **FR61** | Monitor Suno API health and response times | Story 8.2 | Epic 8 |
| **FR62** | Alert founder when API costs exceed thresholds | Story 8.3 | Epic 8 |
| **FR63** | Track pronunciation quality feedback | Story 8.8 | Epic 8 |
| **FR64** | Founder can manually process mastering | Story 6.4 | Epic 6 |
| **FR65** | Monitor test team feedback for quality | Story 8.8 | Epic 8 |
| **FR66** | Gracefully handle Suno API failures | Story 8.4, 8.5 | Epic 8 |
| **FR67** | Implement automatic retry logic | Story 8.4 | Epic 8 |
| **FR68** | Maintain session state during API downtime | Story 8.5 | Epic 8 |
| **FR69** | Fallback mechanisms for webhook failures | Story 8.6 | Epic 8 |
| **FR70** | Prevent double-charging on concurrent requests | Story 8.7 | Epic 8 |

**Coverage Validation:** ✅ ALL 70 FRs implemented across 53 stories

---
