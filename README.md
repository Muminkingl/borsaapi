Bro this looks CLEAN. Well done. Now let's make that analytics page actually live.

---

## The Problem First

Your `usage_logs` table already exists from the schema plan. That's your single source of truth for everything on this page. You just need to query it smartly.

---

## Table Check

Make sure `usage_logs` has this exactly:
```sql
CREATE TABLE usage_logs (
  id            BIGSERIAL PRIMARY KEY,
  token_id      UUID REFERENCES api_tokens(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  item_slug     TEXT,
  city_slug     TEXT,
  requested_at  TIMESTAMPTZ DEFAULT now(),
  response_ms   INT
);

-- These 2 indexes are critical for performance:
CREATE INDEX idx_usage_token_time 
  ON usage_logs(token_id, requested_at DESC);

CREATE INDEX idx_usage_user_time 
  ON usage_logs(user_id, requested_at DESC);
```

Add `user_id` if it's not there — makes queries faster without joining through tokens.

---

## Every Metric Mapped to a Query

**API Calls Today:**
```sql
SELECT COUNT(*) FROM usage_logs
WHERE user_id = $userId
AND requested_at >= CURRENT_DATE;
```

**API Calls This Month:**
```sql
SELECT COUNT(*) FROM usage_logs
WHERE user_id = $userId
AND requested_at >= date_trunc('month', now());
```

**Last Used (for API keys page):**
```sql
SELECT requested_at FROM usage_logs
WHERE token_id = $tokenId
ORDER BY requested_at DESC
LIMIT 1;
```

**Bar Chart — last 6 months:**
```sql
SELECT 
  date_trunc('month', requested_at) as month,
  COUNT(*) as total
FROM usage_logs
WHERE user_id = $userId
AND requested_at >= now() - interval '6 months'
GROUP BY month
ORDER BY month ASC;
```

**Rate limit check (per minute):**
```sql
SELECT COUNT(*) FROM usage_logs
WHERE token_id = $tokenId
AND requested_at > now() - interval '1 minute';
```

---

## New API Route

**GET `/api/user/analytics`**
```javascript
// Returns everything the dashboard needs in one call:
{
  "calls_today": 142,
  "calls_this_month": 3821,
  "last_used": "2026-04-04T10:23:00Z",  // or null
  "rate_limit": 30,                      // based on plan
  "chart": [
    { "month": "2025-11", "total": 821 },
    { "month": "2025-12", "total": 1203 },
    { "month": "2026-01", "total": 956 },
    { "month": "2026-02", "total": 1102 },
    { "month": "2026-03", "total": 2341 },
    { "month": "2026-04", "total": 142 }
  ]
}
```

One endpoint. One fetch. Everything loads at once.

---

## Log Every API Request

This is the most important part. Inside your `/api/v2/get-price` route, after returning the price, log it:

```javascript
// At the END of your get-price handler (don't await it, don't slow the response):
fetch('/api/internal/log', {
  method: 'POST',
  body: JSON.stringify({
    token_id: tokenId,
    user_id: userId,
    item_slug: item,
    city_slug: location,
    response_ms: Date.now() - startTime
  })
});
// Fire and forget — user gets their price response instantly
```

Or insert directly via Supabase client without awaiting:
```javascript
supabase.from('usage_logs').insert({
  token_id, user_id, item_slug, city_slug, response_ms
}); // no await intentionally
```

---

## Last Used on API Keys Page

Update `api_tokens` table:
```sql
ALTER TABLE api_tokens 
ADD COLUMN last_used_at TIMESTAMPTZ;
```

On every API request, update it:
```javascript
supabase.from('api_tokens')
  .update({ last_used_at: new Date().toISOString() })
  .eq('id', tokenId); // no await
```

This is cheaper than querying `usage_logs` just for last used timestamp.

---

## Chart Fix

Your chart currently says "Bar Chart — January to June 2024" — that's hardcoded placeholder. Replace with real data:

```javascript
// Fetch from /api/user/analytics
// Map chart array to your charting library format
const chartData = analytics.chart.map(row => ({
  name: new Date(row.month).toLocaleString('en', { month: 'short' }),
  calls: row.total
}));
```

---

## Smart "Trending" Line

You have "Trending up by 5.2% this month" at the bottom. Make it real:

```javascript
const thisMonth = chart[chart.length - 1].total;
const lastMonth = chart[chart.length - 2].total;
const trend = lastMonth === 0 ? 0 : 
  (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1);
const direction = trend >= 0 ? 'up' : 'down';
// "Trending up by 5.2% this month"
```

---

## Build Order

```
1. Confirm usage_logs table has user_id column + both indexes
2. Add last_used_at to api_tokens table
3. Add logging inside /api/v2/get-price (fire and forget)
4. Add last_used_at update inside /api/v2/get-price
5. Build GET /api/user/analytics with all 4 queries
6. Connect dashboard to /api/user/analytics
7. Replace hardcoded chart data with real chart array
8. Make trending line dynamic
9. Test: hit your API 10 times → check dashboard updates
```

---

## One Warning

Supabase free tier has **500MB storage**. `usage_logs` will grow fast if you get real traffic. Add a cleanup job later:

```sql
-- Delete logs older than 6 months (run monthly)
DELETE FROM usage_logs 
WHERE requested_at < now() - interval '6 months';
```

For now don't worry about it. When you hit 400MB we'll talk.

---

Start with step 3 — logging inside get-price. Everything else depends on data actually being written. Go.