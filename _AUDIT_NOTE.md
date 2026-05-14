# Audit Note — AICemeteryMemorialParkManager

Source: `_AUDIT/reports/batch_01.md` (Project 18)

## Maturity: TEMPLATE-CLONE (7 routes, 7 AI endpoints, deps installed)

## Original audit recommendations

### Gaps & Opportunities
- **Limited AI Coverage:** Few endpoints; expand AI to cover scheduling, optimization, forecasting, or content generation.

### Strategic Feature Suggestions
1. Agentic Workflow Orchestration: Multi-agent system for domain tasks with human-in-the-loop feedback.
2. RAG over Domain Documents: Retrieval-augmented generation trained on org's playbooks and historical data.
3. Real-time Anomaly Detection: Stream monitoring with automated alerts and corrective action recommendations.
4. White-label/Reseller Platform.

## Categorization
- **MECHANICAL:** None obviously safe; existing AI endpoints already cover obituary, inscription, maintenance, genealogy, history, memorial-page, bereavement.
- **NEEDS-PRODUCT-DECISION:** All four strategic suggestions (agentic, RAG, real-time anomaly, white-label) require architecture-level design.
- **TOO-RISKY:** Adding a new AI endpoint without a clear product spec would just create a stub.

## Implementations applied
- None this round. The existing AI router already covers all the core domain operations (history, obituary, inscription, maintenance-prediction, genealogy, memorial-page, bereavement) plus 4 in `aiNew.js` (virtual-tour, monument-designer, burial-site-recommender, legacy-document-advisor). Notifications subsystem (notifications.js) is already present.

## Backlog (prioritized)

### High priority
- **Stream-based maintenance anomaly detection** — when sensor/IoT integration is decided, add `/api/ai/anomaly-stream` (SSE) feeding from grounds-maintenance schedule + weather forecast.
- **RAG over historical interment & deed records** — vector DB choice + ingestion pipeline.

### Medium priority
- **Agentic workflow** for end-to-end pre-need contract intake → background-check → plot recommendation → quote generation.
- **Donor/family member white-label portal** that reseller cemeteries can rebrand.

### Low priority
- Multi-language obituary/inscription generation hooks (already supported via prompt; expose UI knobs).

## Apply pass 3 (frontend)

LEFT-AS-IS — frontend was already wired for every backend AI endpoint.

- Verified the FE (React/CRA pages or Next.js dynamic AI tool registry) calls every AI route exposed by the backend.
- Auth pattern (JWT in localStorage with axios `Authorization: Bearer` interceptor for the React projects, cookie-based JWT middleware for the Next.js project) is already in place.
- 503/no-key error responses surface to the user via existing error rendering.
- No edits made; idempotence rule applied.

See `_AUDIT/apply3_logs/ab3_53.md` for the full per-project breakdown.

## Apply pass 4 (mechanical backlog)

SKIPPED — every backlog item in the original audit is categorized as NEEDS-PRODUCT-DECISION or TOO-RISKY (anomaly stream needs IoT integration decision, RAG needs vector-DB choice, agentic workflow needs end-to-end product spec, white-label needs reseller architecture). No mechanical work to apply this pass.
