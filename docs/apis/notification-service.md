# Notification Service API

**Port:** `3008` · **Swagger UI:** `http://localhost:3008/docs`  
**Nginx path:** `/v1/notifications/*` → `notification-service:3000` (direct — JWT validated internally)  
**Auth:** Bearer JWT required on all endpoints except `/health`.

---

## Endpoints

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/v1/notifications` | Bearer | List notifications (paginated) |
| `PATCH`| `/v1/notifications/read-all` | Bearer | Mark all notifications as read |
| `GET`  | `/v1/notifications/unread-count` | Bearer | Count of unread notifications |

### Card Shows

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`    | `/v1/notifications/shows` | Bearer | Browse upcoming card shows |
| `GET`    | `/v1/notifications/shows/:id` | Bearer | Show detail |
| `POST`   | `/v1/notifications/shows/:id/attend` | Bearer | RSVP to attend a show |
| `GET`    | `/v1/notifications/shows/:id/dealers` | Bearer | Dealers attending this show |
| `GET`    | `/v1/notifications/shows/admin` | Admin | All shows (admin view) |
| `PATCH`  | `/v1/notifications/shows/admin/:id` | Admin | Edit show details |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Service health + DB/Redis status |
| `GET` | `/v1/notifications/ping` | None | Ping with connectivity check |

---

## Notification Types

| Type | Trigger |
|------|---------|
| `price_alert` | Card crosses target price threshold |
| `sale_complete` | A listing sold on a connected platform |
| `narrative_ready` | New AI narrative published for a watched player |
| `show_reminder` | Upcoming card show within 7 days |
| `want_list_match` | Inventory item matches another dealer's want list |

---

## Notes

- Notifications are pushed via WebSocket (future) and polled via REST now.
- Show data is seeded from public card show aggregators + manual admin entry.
