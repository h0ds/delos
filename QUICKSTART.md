# Quick Start Guide

## 60 Seconds to Demo

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm run dev

# 3. Open browser
# http://localhost:5173
```

**That's it!** Search for anything:
- `bitcoin`
- `fed rates`
- `nvidia`
- `election`

You'll see:
- Real-looking signal cards
- Interactive analytics dashboard
- 5 types of charts & visualizations
- Sentiment/impact scoring

---

## Running with Real Data

1. **Get API Key** (2 minutes)
   - Visit https://newsapi.org (free tier)
   - Copy your API key

2. **Configure Server**
   ```bash
   # Edit packages/server/.env
   NEWS_API_KEY=your_key_here
   ```

3. **Start Both Services**
   ```bash
   # Terminal 1
   npm run dev:server
   
   # Terminal 2
   npm run dev:client
   ```

4. **Search** — Now fetches real news from APIs

**Fallback**: If server unavailable, auto-switches to demo mode.

---

## Docker Deployment

```bash
# Build images
docker-compose build

# Run containers
docker-compose up

# Access
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3333
```

---

## Project Structure

```
packages/
├── server/     TypeScript + Socket.io (port 3333)
└── client/     React + Vite (port 5173)
```

---

## Key Commands

```bash
npm run dev              # Dev mode (both server & client)
npm run dev:server       # Backend only
npm run dev:client       # Frontend only
npm run build            # Production build
npm run build --workspaces
```

---

## Troubleshooting

**Port already in use?**
```bash
lsof -i :3333  # Kill port 3333
lsof -i :5173  # Kill port 5173
```

**npm install fails?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Charts not showing?**
- Check browser console for errors
- Recharts requires DOM width
- Try refreshing

---

## Next Steps

1. **Explore the UI** — Try different searches, toggle analytics
2. **Customize colors** — Edit `packages/client/src/index.css`
3. **Add API key** — See "Running with Real Data" above
4. **Read docs** — See README.md, DEMO.md, DEPLOYMENT.md
5. **Contribute** — See CONTRIBUTING.md

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  - Search interface                     │
│  - Signal cards                         │
│  - Analytics dashboard                  │
│  - Chart visualizations                 │
└────────────┬────────────────────────────┘
             │ WebSocket
             ↓
┌─────────────────────────────────────────┐
│  Backend (Express + Socket.io)          │
│  - Signal aggregation                   │
│  - NewsAPI, Google News, Reddit         │
│  - Sentiment & impact analysis          │
│  - Real-time streaming                  │
└─────────────────────────────────────────┘
```

---

## Demo Features

✅ 25 signals per search  
✅ Realistic sentiment/impact scores  
✅ Multi-source (Reuters, Bloomberg, Reddit, etc.)  
✅ Market tagging (BTC, ETH, FED, TECH, etc.)  
✅ 5 interactive charts  
✅ Key metrics dashboard  
✅ Responsive design (mobile/tablet/desktop)  
✅ Dark theme  
✅ Works offline

---

**Ready?** Run `npm run dev` and start exploring! 🚀
