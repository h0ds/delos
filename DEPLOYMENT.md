# Deployment Guide

## Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup

```bash
git clone https://github.com/yourusername/sigint.git
cd sigint
npm install
```

### Environment Configuration

Create `.env` files from examples:

```bash
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env
```

Configure for your setup:

**`packages/server/.env`:**
```bash
NODE_ENV=development
PORT=3333
CORS_ORIGIN=http://localhost:5173
NEWS_API_KEY=your_key_from_newsapi.org
```

**`packages/client/.env`:**
```bash
VITE_SOCKET_URL=http://localhost:3333
```

### Running

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3333

---

## Docker Deployment (Recommended)

### Build Images

```bash
docker-compose build
```

### Run Stack

```bash
export NEWS_API_KEY=your_key
docker-compose up -d
```

Accessing:
- Client: http://localhost:5173
- Server: http://localhost:3333

### View Logs

```bash
docker-compose logs -f server
docker-compose logs -f client
```

---

## Production Deployment

### Requirements

- Server with 2GB+ RAM (t3.small or similar)
- Docker & Docker Compose installed
- Domain name with SSL certificate

### Environment Setup

Create `.env` for production:

```bash
NODE_ENV=production
PORT=3333
CORS_ORIGIN=https://yourdomain.com
NEWS_API_KEY=your_production_key
```

### Deployment Steps

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/sigint.git
   cd sigint
   ```

2. **Build Docker images:**
   ```bash
   docker-compose build
   ```

3. **Run with environment variables:**
   ```bash
   docker-compose up -d
   ```

4. **Configure reverse proxy (Nginx):**
   ```nginx
   upstream sigint_api {
     server localhost:3333;
   }

   upstream sigint_web {
     server localhost:5173;
   }

   server {
     listen 443 ssl http2;
     server_name yourdomain.com;

     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;

     location /api {
       proxy_pass http://sigint_api;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }

     location /socket.io {
       proxy_pass http://sigint_api;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_buffering off;
     }

     location / {
       proxy_pass http://sigint_web;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

5. **Verify deployment:**
   ```bash
   curl https://yourdomain.com/api/status
   ```

### Environment Variables Reference

**Server (`.env`):**
| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3333` |
| `CORS_ORIGIN` | Allowed origins | `https://yourdomain.com` |
| `NEWS_API_KEY` | NewsAPI key | (get from newsapi.org) |

**Client (build-time):**
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SOCKET_URL` | API server URL | `https://yourdomain.com` |

### Monitoring

```bash
# Check container status
docker ps

# View logs
docker logs sigint-server
docker logs sigint-client

# Restart services
docker-compose restart
```

### Updates

To deploy updates:

```bash
git pull origin main
docker-compose build
docker-compose up -d
```

---

## Platform-Specific Guides

### Heroku

Create `Procfile`:
```
web: node packages/server/dist/index.js
```

Deploy:
```bash
heroku create your-app-name
heroku config:set NEWS_API_KEY=your_key
heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com
git push heroku main
```

### AWS (EC2 + RDS Optional)

1. Launch t3.small EC2 instance (Ubuntu 22.04)
2. SSH and install Docker/Docker Compose
3. Clone repo and follow Docker deployment steps
4. Use AWS Route53 for domain + ACM for SSL

### DigitalOcean App Platform

1. Connect GitHub repo
2. Set environment variables in App Platform dashboard
3. Deploy from `main` branch

### Vercel (Frontend Only)

Build client separately:

```bash
npm --workspace=@sigint/client run build
# Deploy `packages/client/dist` to Vercel
```

Point `VITE_SOCKET_URL` to your backend server.

---

## Troubleshooting

### Connection Issues

Check `CORS_ORIGIN` matches your frontend URL:
```bash
curl -H "Origin: http://localhost:5173" http://localhost:3333/api/status
```

### Missing API Key

If `NEWS_API_KEY` is empty, Google News and Reddit sources still work. Get a free key at [newsapi.org](https://newsapi.org)

### Port Already in Use

```bash
# Find process using port 3333
lsof -i :3333

# Kill process
kill -9 <PID>
```

---

## Support

For issues or questions:
- GitHub Issues: [project/issues](https://github.com/yourusername/sigint/issues)
- Discussions: [project/discussions](https://github.com/yourusername/sigint/discussions)
