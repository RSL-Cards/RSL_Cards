# AI Narrative Service API

**Port:** `3007` · **Swagger UI:** `http://localhost:3007/docs`  
**Nginx path:** `/v1/narratives/*` → `auth-service:3000` (gateway) → `ai-narrative-service:3000`  
**Auth:** Bearer JWT (validated by gateway). `x-service-key` injected for all routes.

---

## Endpoints

### Card Scanning (Gemini Vision)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/narratives/scan-card` | Bearer | Scan card image with Gemini Vision AI |

**Request:**
```json
{
  "image": "<base64 string — no data URI prefix>",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "card": {
    "player_name": "Patrick Mahomes",
    "year": 2017,
    "set_name": "Panini Prizm",
    "variation": "Silver Prizm",
    "sport": "football",
    "card_number": "269",
    "grading": { "company": "PSA", "grade": "10", "cert_number": "12345678" },
    "confidence": 0.95
  },
  "confidence": 0.95
}
```

**Model fallback chain:** `gemini-2.5-flash` → `gemini-2.5-flash-lite-preview-06-17` → `gemini-2.0-flash` → `gemini-1.5-flash`

**Error codes:**
- `400` — `image` field missing
- `429` — Gemini rate limit hit (wait 30–60s)
- `503` — `GOOGLE_GEN_AI_KEY` not configured

---

### Narrative Feed

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/narratives/feed` | Service Key | Paginated AI narrative feed |
| `GET` | `/v1/narratives/inventory` | Service Key | Narratives for dealer's inventory |
| `GET` | `/v1/narratives/daily-insight` | Service Key | Today's AI market insight |
| `GET` | `/v1/narratives/weekly-recap` | Service Key | Weekly performance recap |

### Card & Player Narratives

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/narratives/player/:playerName` | Service Key | All narratives for a player |
| `GET` | `/v1/narratives/card/:cardId` | Service Key | Narratives for a specific card |
| `GET` | `/v1/narratives/:id` | Service Key | Single narrative by ID |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST`  | `/v1/narratives/admin/generate` | Service Key | Manually trigger narrative generation |
| `PATCH` | `/v1/narratives/admin/:id/approve` | Service Key | Approve narrative for publishing |
| `PATCH` | `/v1/narratives/admin/:id/reject` | Service Key | Reject narrative |
| `PATCH` | `/v1/narratives/admin/:id` | Service Key | Edit narrative content |

### Health & Ops

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/narratives/ping` | None | Service health + DB/Redis/Gemini status |
| `GET` | `/v1/narratives/trigger-ingestion` | None | Manually queue narrative ingestion job |

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `GOOGLE_GEN_AI_KEY` | Gemini API key from Google AI Studio |
| `ANTHROPIC_API_KEY` | Claude key (optional, for narrative generation) |

---

## Notes

- `scan-card` is the **only route callable from the dealer-app with a Bearer JWT**.
- All other routes require `x-service-key` (internal service-to-service only).
- The gateway proxy injects `x-service-key` automatically — dealer-app never sends it.
- Narrative generation runs on a BullMQ cron job, not per-request.
