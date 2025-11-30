# DayFlow API Documentation

Complete REST API layer for DayFlow using Next.js 15 Route Handlers.

## Overview

All API endpoints follow a consistent structure:
- **Base URL**: `/api`
- **Authentication**: Supabase session cookies (except AI routes)
- **Response Format**: `{ success: boolean, data?: any, error?: string }`

## Authentication

Most endpoints require authentication via Supabase session cookies. Unauthenticated requests return:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```
**Status Code**: `401`

---

## 📝 Logs Endpoints

### POST `/api/logs/start`

Start a new activity log.

**Request Body:**
```json
{
  "activity": "Working on project",
  "category_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "activity": "Working on project",
    "category_id": "uuid",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": null,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Success
- `400` - Invalid request data
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/logs/end`

End an existing activity log.

**Request Body:**
```json
{
  "logId": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "end_time": "2024-01-01T11:30:00Z",
    ...
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request data
- `401` - Unauthorized
- `404` - Log not found
- `500` - Server error

---

### GET `/api/logs/today`

Get all activity logs for today.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "activity": "Working on project",
      "start_time": "2024-01-01T10:00:00Z",
      "end_time": "2024-01-01T11:30:00Z",
      "categories": {
        "id": "uuid",
        "name": "Work",
        "color": "#4f46e5",
        "icon": null
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### GET `/api/logs/range?start=<ISO_DATE>&end=<ISO_DATE>`

Get activity logs within a date range.

**Query Parameters:**
- `start` (required) - ISO 8601 datetime string
- `end` (required) - ISO 8601 datetime string

**Example:**
```
GET /api/logs/range?start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z
```

**Response:**
Same format as `/api/logs/today`

**Status Codes:**
- `200` - Success
- `400` - Invalid date range
- `401` - Unauthorized
- `500` - Server error

---

## 🏷️ Categories Endpoints

### GET `/api/categories`

Get all categories (default + user's custom categories).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Work",
      "color": "#4f46e5",
      "icon": null,
      "user_id": null
    },
    {
      "id": "uuid",
      "name": "Custom Category",
      "color": "#ff0000",
      "icon": "🎨",
      "user_id": "uuid"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/categories`

Create a custom category.

**Request Body:**
```json
{
  "name": "Custom Category",
  "color": "#ff0000",
  "icon": "🎨"
}
```

**Fields:**
- `name` (required) - Category name (1-100 characters)
- `color` (required) - Hex color code (e.g., `#ff0000`)
- `icon` (optional) - Icon/emoji (max 10 characters)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Custom Category",
    "color": "#ff0000",
    "icon": "🎨",
    "user_id": "uuid",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Success
- `400` - Invalid request data
- `401` - Unauthorized
- `409` - Category name already exists
- `500` - Server error

---

### DELETE `/api/categories/[id]`

Delete a user-created category.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid category ID
- `401` - Unauthorized
- `403` - Cannot delete default categories or other users' categories
- `404` - Category not found
- `409` - Category is in use by activity logs
- `500` - Server error

**Note:** Cannot delete:
- Default categories (`user_id` is `null`)
- Categories owned by other users
- Categories that are being used in activity logs

---

## ⚙️ Settings Endpoint

### GET `/api/settings`

Get user settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "reminder_interval": 30
  }
}
```

**Default Values:**
- `reminder_interval: 30` (if no settings exist)

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/settings`

Update user settings.

**Request Body:**
```json
{
  "reminder_interval": 60
}
```

**Fields:**
- `reminder_interval` (required) - Integer between 15 and 60 (minutes)

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "reminder_interval": 60,
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request data
- `401` - Unauthorized
- `500` - Server error

---

## 🤖 AI Endpoints (Internal Use Only)

These endpoints are for **internal use only** by Edge Functions. They require service role authentication.

**⚠️ WARNING:** These endpoints should **NEVER** be called from the frontend.

### Authentication

All AI endpoints require:
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

### POST `/api/ai/daily`

Save a daily summary generated by Edge Function.

**Request Headers:**
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "date": "2024-01-01",
  "summary": "Productive day focused on...",
  "focus_score": 85,
  "insights": "Key insights here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "date": "2024-01-01",
    "summary": "Productive day focused on...",
    "focus_score": 85,
    "insights": "Key insights here..."
  }
}
```

**Status Codes:**
- `201` - Success
- `400` - Invalid request data
- `403` - Forbidden (missing/invalid service role key)
- `500` - Server error

---

### POST `/api/ai/weekly`

Save a weekly summary generated by Edge Function.

**Request Headers:**
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "week_start": "2024-01-01",
  "summary": "Weekly summary...",
  "insights": "Weekly insights..."
}
```

**Status Codes:** Same as `/api/ai/daily`

---

### POST `/api/ai/monthly`

Save a monthly summary generated by Edge Function.

**Request Headers:**
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "month": "2024-01-01",
  "summary": "Monthly summary...",
  "insights": "Monthly insights..."
}
```

**Status Codes:** Same as `/api/ai/daily`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Status Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate category)
- `500` - Internal Server Error

---

## Validation

All inputs are validated using Zod schemas:

- **UUIDs** - Must be valid UUID format
- **Dates** - Must be ISO 8601 datetime strings
- **Colors** - Must be hex color codes (`#RRGGBB`)
- **Strings** - Length constraints enforced
- **Numbers** - Range constraints enforced

---

## Example Usage

### Starting an Activity

```typescript
const response = await fetch('/api/logs/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    activity: 'Working on project',
    category_id: 'category-uuid-here'
  }),
  credentials: 'include' // Important for cookies
});

const result = await response.json();
if (result.success) {
  console.log('Activity started:', result.data);
}
```

### Fetching Today's Logs

```typescript
const response = await fetch('/api/logs/today', {
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  console.log('Today\'s logs:', result.data);
}
```

---

## Notes

- All endpoints require authentication except for documentation
- Session cookies are managed by Supabase auth
- Use `credentials: 'include'` in fetch requests to send cookies
- AI endpoints are protected by service role key and should never be exposed to frontend
- All timestamps are in ISO 8601 format
- Timezone handling should be done client-side

---

## File Structure

```
/app/api/
  /logs/
    /start/route.ts
    /end/route.ts
    /today/route.ts
    /range/route.ts
  /categories/
    /route.ts
    /[id]/route.ts
  /settings/
    /route.ts
  /ai/
    /daily/route.ts
    /weekly/route.ts
    /monthly/route.ts
```

---

## Support

For issues or questions about the API:
1. Check validation errors in response
2. Verify authentication status
3. Check server logs for detailed error messages
4. Ensure environment variables are configured

