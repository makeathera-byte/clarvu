# DayFlow API - Quick Reference

## 🚀 Quick Start

All endpoints are prefixed with `/api` and require authentication (except AI endpoints use service role).

### Authentication

**User Endpoints:** Use Supabase session cookies (automatically sent with `credentials: 'include'`)

**AI Endpoints:** Use service role key in header:
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

---

## 📋 Endpoint List

### Logs
- `POST /api/logs/start` - Start activity
- `POST /api/logs/end` - End activity
- `GET /api/logs/today` - Get today's logs
- `GET /api/logs/range?start=&end=` - Get logs in range

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `DELETE /api/categories/[id]` - Delete category

### Settings
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

### AI (Internal Only)
- `POST /api/ai/daily` - Save daily summary
- `POST /api/ai/weekly` - Save weekly summary
- `POST /api/ai/monthly` - Save monthly summary

---

## 📝 Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🔍 Status Codes

- `200` - Success (GET, POST updates)
- `201` - Created (POST creates)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate, in use)
- `500` - Server Error

---

## 💡 Example Usage

```typescript
// Start activity
const response = await fetch('/api/logs/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    activity: 'Working on project',
    category_id: 'uuid-here'
  })
});

const result = await response.json();
if (result.success) {
  console.log(result.data);
}
```

---

For full documentation, see `API_DOCUMENTATION.md`

