# 🚀 URLhaus Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp config.env .env

# Edit .env with your settings (optional for basic testing)
# The default values should work for development
```

### 3. Start the Server

**Option A: Development Mode (with auto-reload)**
```bash
npm run dev
```

**Option B: Production Mode**
```bash
npm run build
npm start
```

### 4. Test the API
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test with your API key
curl -H "Auth-Key: YOUR_API_KEY" http://localhost:3001/api/v1/recent
```

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3001                          # Server port
NODE_ENV=development               # Environment mode
URLHAUS_API_URL=https://urlhaus-api.abuse.ch  # URLhaus API URL
REDIS_URL=redis://localhost:6379   # Redis connection (optional for basic testing)
JWT_SECRET=your-secret-key         # JWT signing secret
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

### Redis Setup (Optional)
The backend works without Redis, but caching is disabled. For full functionality:

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Using Local Installation:**
- Windows: Download from https://redis.io/download
- macOS: `brew install redis && brew services start redis`
- Linux: `sudo apt-get install redis-server`

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/api/v1/recent` | Get recent URLs | Yes (Auth-Key header) |
| POST | `/api/v1/search/url` | Search by URL | Yes (Auth-Key header) |
| POST | `/api/v1/search/host` | Search by host/IP | Yes (Auth-Key header) |
| GET | `/api/v1/detail/:url` | Get URL details | Yes (Auth-Key header) |
| POST | `/api/v1/cache/clear` | Clear cache | No |

## 🔑 Authentication

All API endpoints (except health and cache clear) require an `Auth-Key` header with your URLhaus API key:

```bash
curl -H "Auth-Key: your-urlhaus-api-key" http://localhost:3001/api/v1/recent
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/health

# Recent URLs (replace YOUR_API_KEY)
curl -H "Auth-Key: YOUR_API_KEY" http://localhost:3001/api/v1/recent

# Search URL
curl -X POST -H "Auth-Key: YOUR_API_KEY" -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/malware.exe"}' \
  http://localhost:3001/api/v1/search/url
```

### Automated Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test recent URLs (replace YOUR_API_KEY)
curl -H "Auth-Key: YOUR_API_KEY" http://localhost:3001/api/v1/recent
```

## 🐛 Troubleshooting

### Server Won't Start
1. Check if port 3001 is available: `netstat -an | findstr :3001`
2. Verify Node.js version: `node --version` (should be 16+)
3. Check for TypeScript errors: `npm run build`

### API Calls Failing
1. Verify server is running: `curl http://localhost:3001/health`
2. Check CORS settings in config.env
3. Verify Auth-Key header is included
4. Check URLhaus API key validity

### Redis Connection Issues
1. Verify Redis is running: `redis-cli ping`
2. Check REDIS_URL in config.env
3. Backend works without Redis (caching disabled)

## 🔄 Integration with Frontend

### Update Frontend API Client
In your frontend `src/api/client.ts`, change the baseURL:

```typescript
const instance = axios.create({
  baseURL: 'http://localhost:3001/api/v1', // Backend API
  headers: authKey ? { 'Auth-Key': authKey } : {},
  timeout: 20000,
});
```

### CORS Configuration
The backend is configured to accept requests from `http://localhost:5173` (Vite default). Update `CORS_ORIGIN` in config.env if your frontend runs on a different port.

## 📊 Monitoring

### Logs
The server logs all requests and errors. Check the console output for:
- Server startup messages
- Request logs (morgan)
- Error messages
- Cache hit/miss information

### Health Check
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "success": true,
  "message": "URLhaus Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper `CORS_ORIGIN`
4. Set up Redis for caching
5. Use reverse proxy (nginx/Apache)
6. Set up SSL/TLS

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start:prod"]
```

## 📝 Next Steps

1. **Test the API** with your URLhaus API key
2. **Update frontend** to use the backend API
3. **Configure Redis** for full caching functionality
4. **Set up monitoring** and logging
5. **Deploy to production** when ready

---

**🎉 Your URLhaus Backend API is ready!** The backend provides a secure, cached, and rate-limited interface to the URLhaus threat intelligence API.
