# BorsaAPI — Full Plan 🎯

---

## The Product
A currency and commodity prices API serving real-time data from Kurdistan & Iraq local markets (Erbil, Baghdad, Sulaymaniyah, Duhok, Kirkuk). Targeting developers building apps that need local market rates.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend + API | Next.js |
| Hosting | Vercel (free) |
| Database | Supabase — PostgreSQL (free) |
| Auth | Google OAuth — your own Console credentials, your branding |
| Scraper | Oracle Cloud VM — free forever |
| Scraper Library | Telethon (Python) |

---

## Data Flow
```
Telegram Channel (not yours)
        ↓
Oracle VM — Telethon running 24/7
Listens, parses price from message
        ↓
Supabase — inserts price row
        ↓
BorsaAPI (Next.js on Vercel)
Dev hits endpoint with Bearer token
        ↓
Returns price + created_at
```

---

## Auth Flow
```
User lands on borsaapi.com
        ↓
Sign in with Google (your logo, your brand)
        ↓
Account created in Supabase
        ↓
Unique API token generated
        ↓
Dev uses: Authorization: Bearer TOKEN
```

---

## API Design
```
GET /api/v2/get-price?item=usd&location=erbil
Authorization: Bearer YOUR_TOKEN

Response:
{
  "value": 154700,
  "location": "erbil",
  "item": "usd",
  "created_at": "2026-04-03T19:00:00Z",
  "is_stale": false
}
```

---

## Pricing Tiers

| Plan | Price | Limit |
|------|-------|-------|
| Free | $0 | 30 req/min |
| Pro | 5,000 IQD/month | 120 req/min |

---

## Items Tracked
- USD (100 dollar)
- EUR (100 euro)
- GBP (100 pound)
- Turkish Lira (100)
- Iranian Toman (100,000)
- Gold 18 karat
- Gold 21 karat
- Gold 24 karat

---

## Cities
Erbil · Baghdad · Sulaymaniyah · Duhok · Kirkuk

---

## Infrastructure Cost
**$0** until you scale and start making money.

---

## Build Order
1. Oracle VM → Telethon scraper → writing to Supabase
2. Supabase schema (prices, users, tokens)
3. Next.js — Google OAuth + token generation
4. Next.js — API routes with token validation
5. Next.js — Landing page, docs, pricing
6. Deploy to Vercel → point `borsaapi.com`

---

Ready. Where do you want to start — Oracle VM setup or Supabase schema?




