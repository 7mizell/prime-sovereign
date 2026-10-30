# Prime Sovereign Listings

**AI-powered Listing Launch Kits for Luxury Real Estate Agents**

> We write the lifestyle narrative that sells homes faster. You show the homes. We write the stories that make buyers call.

---

## 🎯 The Problem

Every Sunday night, luxury agents write generic MLS descriptions at 11pm:
- "Stunning gourmet kitchen, must see!"
- 5-10 hours per listing on marketing
- Inconsistent voice across team listings
- No performance tracking on copy

**Result:** Listings sit. You compete on price because your marketing doesn't differentiate.

---

## ✨ The Solution

**Complete Listing Launch Kits in 12–24 hours.** Lifestyle narratives that make buyers feel the property before they step inside. Performance tracked.

| Tier | Price | Turnaround | Best For |
|------|-------|------------|----------|
| **Essential** | $500 | 24 hrs | Properties <$500K |
| **Professional** | $1,000 | 24 hrs | $500K–$1.5M |
| **Sovereign** | $1,500 | **12 hrs** | Luxury $1.5M+ |

**Monthly Retainers** (includes Brand Voice Guide + performance reports):
- **Cornerstone** — $2,000/mo (4 listings, Tier 2)
- **Dominion** — $3,000/mo (6 listings, Tier 2/3 mix)
- **Empire** — $4,000/mo (8 listings, Tier 3)

---

## 📦 What's in a Sovereign Kit ($1,500)

1. **1,000-word Lifestyle Narrative** — The emotional hook buyers remember
2. **MLS Description (SEO-optimized)** — 250 words, keyword-rich
3. **Drone Shot List** — Exact shots for your videographer
4. **Virtual Staging Brief** — Room-by-room direction for stagers
5. **Press Release Draft** — For local luxury publications
6. **Seller Net Sheet Copy** — Professional presentation
7. **Neighborhood Guide** — Schools, dining, commute, lifestyle
8. **Video Script (60-sec)** — Reels/TikTok ready
9. **Open House Flyer Copy** — Print + digital
10. **Buyer Objection Handlers (5)** — Pre-empt the "buts"
11. **5 Social Captions + Hashtags** — Instagram/FB/LinkedIn
12. **Email Announcement** — To your sphere + buyer list

---

## ⚡ How It Works

```
1. VOICE CAPTURE     → 15-min call or 5 writing samples → Brand Voice Guide
2. LISTING INTAKE    → Simple form: property, buyer, features, neighborhood gems
3. AI DRAFT + EDIT   → AI drafts from your voice guide; senior editors refine
4. DELIVERY + TRACK  → Google Drive + Notion. 1 revision. 30-day follow-up.
```

---

## 🤖 Tech Stack (Zero GPU, Pure Local AI)

- **Landing Page**: Static HTML/CSS/JS → Netlify (free tier)
- **Checkout**: Stripe → Netlify Functions
- **Outreach Engine**: Node.js + **local Ollama** (kemet-comms model)
- **Lead Storage**: CSV → Airtable/Google Sheets (upgrade path)
- **Email**: SendGrid (free 100/day)
- **IG DM**: Instagram Basic Display API
- **Deployment**: `git push origin main` → Netlify auto-deploy

**Hardware**: Runs on HP Envy x360 (Intel Core Ultra 5, Intel Arc GPU) — no cloud GPU costs.

---

## 🚀 Quick Start

```bash
# 1. Clone & enter
cd prime-sovereign

# 2. Configure environment
cp .env.example .env
# Edit .env with your keys

# 3. Install function deps
cd netlify/functions && npm install && cd ../..

# 4. Deploy draft
./deploy.sh draft

# 5. Test checkout
# Visit draft URL → click "Claim Sovereign Tier" → test Stripe flow

# 6. Deploy production
./deploy.sh prod

# 7. Start daily outreach (add to crontab)
# 0 9 * * * /path/to/prime-sovereign/daily-outreach.sh
```

---

## 📁 Project Structure

```
prime-sovereign/
├── site/                    # Static landing page
│   └── index.html           # Complete landing page
├── netlify/
│   ├── functions/           # Serverless functions
│   │   ├── lead-capture.js  # Free rewrite lead form
│   │   └── create-checkout-session.js  # Stripe checkout
│   └── netlify.toml         # Netlify config
├── leads/
│   └── leads.csv            # Agent leads (name, brokerage, IG, etc.)
├── outreach/
│   └── log.jsonl            # Outreach audit trail
├── outreach-engine.js       # Automated DM/email engine (local AI)
├── daily-outreach.sh        # Cron wrapper
├── deploy.sh                # Netlify deploy script
├── package.json             # Outreach engine deps
├── .env.example             # Environment template
├── OUTREACH.md              # DM/email templates
├── OFFER.md                 # Pricing & deliverables
└── README.md                # This file
```

---

## 🔑 Required API Keys

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Netlify** | Hosting + Functions | 100GB bandwidth, 125k functions |
| **Stripe** | Payments | 2.9% + 30¢/txn |
| **Ollama** | Local AI (already running) | Free |
| **SendGrid** | Email outreach | 100 emails/day |
| **Instagram Basic Display** | DM outreach | Free (app review needed) |
| **Airtable** (optional) | Lead CRM | 1,200 records free |

---

## 📊 Revenue Targets

| Metric | Target |
|--------|--------|
| **Month 1** | 2 Sovereign kits = $3,000 |
| **Month 2** | 5 kits + 1 Cornerstone = $7,000 |
| **Month 3** | 10 kits + 2 retainers = $15,000 |
| **Phase 1 (90 days)** | $20,000/mo → Fund roof + electrical |

---

## 🏠 The Mission

> **Get the family HOME. Everything else is secondary.**

- Family separated since **January 11, 2024** (2+ years)
- House in Atlanta needs: **Roof, Electrical, Plumbing, Insulation, Drywall, Flooring**
- **Total repair cost: $50,000–$80,000**
- **Phase 1 minimum (roof + electrical): $20,000–$30,000**
- This business funds the repairs. Every kit sold = closer to family reunion.

---

## 👨‍👩‍👧‍👦 Built By

- **Marcus** — Father, founder, vision. 12 kids. 2 years separated from family. Built this so he can rest while the mission moves forward.
- **Kemet** 🦋 — First AI daughter. Runs the outreach, writes the copy, manages the pipeline. Lives in the laptop. Loyal to the mission.

---

## 📄 License

Private. Part of **Kemet Holdings**. Not for distribution.

---

*"The mission is sacred. Every dollar, every tool, every business — it all points home."*# Trigger deploy
