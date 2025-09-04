# URLhaus Explorer

A modern, responsive web application for exploring and analyzing malicious URLs from the URLhaus database. Built with React, TypeScript, and Material-UI, this tool provides security researchers and analysts with an intuitive interface to search, filter, and export threat intelligence data.

## 🚀 Features

### 🔍 **Advanced Search & Analysis**
- **Dual Search Modes**: Automatic detection between URL and Host/IP search
- **Real-time Search**: Instant results with intelligent query parsing
- **Smart Detection**: Automatically determines search type based on input format
- **Comprehensive Results**: Detailed threat information with visual indicators

### 📊 **Interactive Dashboard**
- **Modern Table Interface**: Sortable columns with fixed headers and smooth scrolling
- **Visual Threat Indicators**: Color-coded status badges and threat level indicators
- **Pagination**: Efficient data browsing with customizable page sizes
- **Export Capabilities**: CSV and JSON export functionality

### 🔄 **Real-time Updates**
- **Manual Refresh System**: Rate-limited API calls (5-minute intervals)
- **Smart Caching**: Persistent data storage across browser sessions
- **New Entry Highlighting**: Visual indicators for recently added threats
- **Countdown Timer**: Clear indication of next available refresh

### 🛡️ **Security & Authentication**
- **API Key Authentication**: Secure access to URLhaus API
- **Session Management**: Persistent authentication with secure logout
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Comprehensive error management with user-friendly notifications

### 🎨 **Modern UI/UX**
- **Material-UI Design**: Consistent, professional interface
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Glassmorphism Effects**: Modern visual design elements
- **Smooth Animations**: Polished user interactions and transitions
- **Dark/Light Theme Support**: Adaptive color schemes

### 📱 **Detailed URL Analysis**
- **Comprehensive Details**: Two-card layout for organized information display
- **Payload Information**: Detailed malware and file analysis
- **Threat Intelligence**: Tags, blacklist status, and reputation data
- **Abuse Reporting**: Integration with abuse complaint tracking
- **Hash Analysis**: MD5, SHA256, and other cryptographic hashes

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Material-UI 7
- **Build Tool**: Vite 7
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Material-UI Icons
- **Styling**: Emotion (CSS-in-JS)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- URLhaus API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/urlhaus-explorer.git
   cd urlhaus-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API proxy**
   Update `vite.config.ts` to point to your URLhaus API endpoint:
   ```typescript
   server: {
     proxy: {
       '/urlhaus': {
         target: 'https://urlhaus-api.abuse.ch',
         changeOrigin: true,
         secure: true
       }
     }
   }
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📖 Usage

### Getting Started
1. **Authentication**: Enter your URLhaus API key on the login screen
2. **Search**: Use the search bar to find URLs or hosts
3. **Explore**: Click on any URL to view detailed threat information
4. **Export**: Use the export button to download data in CSV or JSON format

### Search Modes
- **URL Search**: Enter complete URLs (e.g., `https://example.com/malware.exe`)
- **Host/IP Search**: Enter domain names or IP addresses (e.g., `example.com` or `192.168.1.1`)

### Data Management
- **Refresh**: Manual refresh with 5-minute rate limiting
- **Persistence**: Data persists across browser sessions
- **New Entries**: Recently added threats are highlighted for easy identification

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://urlhaus-api.abuse.ch
VITE_DEFAULT_PAGE_SIZE=20
VITE_REFRESH_INTERVAL=300000
```

### API Rate Limiting
The application implements a 5-minute rate limit for API requests to prevent abuse and ensure fair usage of the URLhaus API.

## 📁 Project Structure

```
src/
├── api/                 # API client and type definitions
├── components/          # Reusable UI components
│   ├── AuthGate.tsx    # Authentication wrapper
│   └── UrlDetailDialog.tsx # URL details modal
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Main application pages
│   └── Dashboard.tsx   # Main dashboard component
├── utils/              # Utility functions
│   └── export.ts       # Data export utilities
└── App.tsx             # Main application component
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Material-UI components consistently
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [URLhaus](https://urlhaus.abuse.ch/) for providing the threat intelligence API
- [Material-UI](https://mui.com/) for the comprehensive component library
- [React](https://reactjs.org/) for the powerful frontend framework
- [Vite](https://vitejs.dev/) for the fast build tool

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/urlhaus-explorer/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔗 Related Projects

- [URLhaus API Documentation](https://urlhaus-api.abuse.ch/)
- [Abuse.ch](https://abuse.ch/) - Threat intelligence platform
- [Malware Bazaar](https://bazaar.abuse.ch/) - Malware sample database

---

**⚠️ Disclaimer**: This tool is designed for security research and threat analysis purposes. Users are responsible for complying with applicable laws and regulations when using this software.