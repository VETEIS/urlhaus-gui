# URLhaus Backend API

Backend API for the URLhaus threat intelligence application, providing secure access to URLhaus data with caching, rate limiting, and authentication.

## 🚀 Features

- **URLhaus API Integration**: Secure proxy to URLhaus threat intelligence API
- **Intelligent Caching**: Redis-based caching with TTL for optimal performance
- **Rate Limiting**: Built-in protection against API abuse (5-minute intervals)
- **Authentication**: API key-based authentication
- **Error Handling**: Comprehensive error management and logging
- **Security**: Helmet.js security headers and CORS protection
- **TypeScript**: Full type safety and IntelliSense support

## 🛠️ Tech Stack

- **Node.js** + **Express.js** - Web framework
- **TypeScript** - Type safety and development experience
- **Redis** - Caching and session storage
- **Axios** - HTTP client for URLhaus API
- **JWT** - Authentication tokens
- **Helmet** - Security headers
- **Morgan** - Request logging
- **CORS** - Cross-origin resource sharing

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   URLHAUS_API_URL=https://urlhaus-api.abuse.ch
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start Redis server:**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine
   
   # Or install Redis locally
   # Windows: Download from https://redis.io/download
   # macOS: brew install redis
   # Linux: sudo apt-get install redis-server
   ```

## 🚀 Development

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - API health status

### URLhaus Integration
- `GET /api/v1/recent?limit=20` - Get recent URLs
- `POST /api/v1/search/url` - Search by URL
- `POST /api/v1/search/host` - Search by host/IP
- `GET /api/v1/detail/:url` - Get URL details
- `POST /api/v1/cache/clear` - Clear cache

### Authentication
All API endpoints require an `Auth-Key` header with your URLhaus API key.

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `URLHAUS_API_URL` | https://urlhaus-api.abuse.ch | URLhaus API base URL |
| `URLHAUS_API_TIMEOUT` | 30000 | API timeout in milliseconds |
| `REDIS_URL` | redis://localhost:6379 | Redis connection URL |
| `JWT_SECRET` | - | JWT signing secret |
| `RATE_LIMIT_WINDOW_MS` | 300000 | Rate limit window (5 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | 10 | Max requests per window |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |

### Rate Limiting

- **URLhaus API calls**: 10 requests per 5 minutes per IP
- **General API calls**: 100 requests per 15 minutes per IP
- **Caching**: Reduces actual API calls to URLhaus

## 🏗️ Architecture

```
src/
├── controllers/     # Request handlers
├── middleware/      # Authentication, rate limiting
├── routes/         # API route definitions
├── services/       # Business logic (URLhaus integration)
├── types/          # TypeScript type definitions
├── utils/          # Utilities (Redis, caching)
└── index.ts        # Application entry point
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin protection
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Request validation
- **Error Handling**: Secure error responses
- **Logging**: Request/response logging

## 📊 Caching Strategy

- **Recent URLs**: 5 minutes TTL
- **Search Results**: 1 hour TTL
- **URL Details**: 1 hour TTL
- **Cache Keys**: Namespaced by operation and parameters

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup
1. Set production environment variables
2. Ensure Redis is accessible
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL/TLS certificates
5. Configure monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the logs for error details
- Verify Redis connection
- Check URLhaus API status

---

**⚠️ Disclaimer**: This backend is designed for security research and threat analysis purposes. Users are responsible for complying with applicable laws and regulations when using this software.
