# Better OpenClaw Dashboard 🚀

> A sleek, modern web interface for managing your [OpenClaw](https://openclaw.ai) AI assistant gateway

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-324FFF?logo=lit&logoColor=white)](https://lit.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📖 What is This?

**Better OpenClaw Dashboard** is a user-friendly web application that helps you manage and monitor your OpenClaw AI assistant gateway. Think of it as a control panel for your AI assistant — you can view activity, schedule automated tasks, track costs, and configure settings all in one place.

### Who is this for?

- **Non-technical users**: If you're using OpenClaw and want an easy way to see what your AI assistant is doing, track costs, and manage settings without touching code
- **Developers**: If you're building or extending OpenClaw integrations and need a development dashboard
- **Teams**: Anyone who needs to monitor AI usage, costs, and scheduled tasks across their organization

---

## ✨ Features

### 📊 **Overview Dashboard**
Get a bird's-eye view of your OpenClaw gateway:
- Real-time connection status
- Active sessions count
- Scheduled cron jobs
- System uptime
- Quick health checks

### ⏰ **Cron Jobs Manager**
Automate your AI workflows:
- Create scheduled tasks that run automatically
- Enable/disable jobs with a single click
- Run jobs on-demand for testing
- Support for multiple schedule types:
  - **Every** — Run every X minutes/hours/days (e.g., "every 30 minutes")
  - **At** — Run at specific times (e.g., "daily at 9:00 AM")
  - **Cron** — Advanced cron expressions for power users

### 👥 **Sessions Viewer**
Monitor active AI conversations:
- See all active sessions in real-time
- Filter by type (active, global, unknown)
- View token usage per session
- Track thinking levels and activity

### 💰 **Usage & Costs Analytics**
Keep track of your AI spending:
- Visual daily cost charts
- Token usage breakdown (input/output)
- Cache efficiency metrics (read/write)
- Identify your most-used models
- Monitor error rates
- Track cache hit rates

### ⚙️ **Configuration Editor**
Manage all settings in one place:
- Browse all configuration options by category
- Helpful tooltips explaining each setting
- Edit values with type-safe controls (text, numbers, toggles, dropdowns)
- Organized by sections (Gateway, Models, Sessions, etc.)

### 🔄 **Auto-Detection**
Smart gateway connection:
- Automatically detects when your OpenClaw gateway comes online
- Polls every 5 seconds to maintain connection
- Clear status indicators

---

## 🚀 Quick Start

### For Users (Just Want to Run It)

1. **Install Node.js** (if you don't have it):
   - Download from [nodejs.org](https://nodejs.org/) (get the LTS version)
   - Check installation: open a terminal and type `node --version`

2. **Download this dashboard**:
   ```bash
   # Download the code
   git clone https://github.com/NateSpencerWx/Better-OpenClaw-Dashboard.git
   cd Better-OpenClaw-Dashboard
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the dashboard**:
   ```bash
   npm run dev
   ```

5. **Open in your browser**:
   - Navigate to [http://localhost:5173](http://localhost:5173)
   - You should see the dashboard interface!

6. **Connect to your OpenClaw gateway**:
   - In the Overview tab, enter your gateway URL (e.g., `http://localhost:8080`)
   - Enter your OpenClaw API token (starts with `oc_live_...`)
   - Click "Connect"

That's it! You're ready to manage your OpenClaw gateway. 🎉

---

## 🛠️ For Developers

### Prerequisites

- **Node.js** 18+ and npm
- **OpenClaw Gateway** running locally or remotely
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/NateSpencerWx/Better-OpenClaw-Dashboard.git
cd Better-OpenClaw-Dashboard

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Development server starts at http://localhost:5173
```

The dashboard uses [Vite](https://vitejs.dev/) for blazing-fast hot module replacement during development.

### Building for Production

```bash
# Create optimized production build
npm run build

# Build output goes to dist/ directory
```

To preview the production build locally:

```bash
npm run preview
```

### Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing:

```bash
# Run all tests (headless)
npm test

# Run tests with browser UI visible
npm run test:headed
```

Tests cover:
- Navigation between views
- Gateway connection status
- Cron job management
- Session viewing
- Cost analytics
- Configuration editing
- UI interactions and tooltips

---

## 🏗️ Technology Stack

- **[Lit](https://lit.dev/)** — Fast, lightweight web components
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** — Next-gen build tool and dev server
- **[Playwright](https://playwright.dev/)** — E2E testing framework

---

## 🔧 Configuration

### Connecting to Your Gateway

The dashboard connects to your OpenClaw gateway via HTTP API:

1. **Gateway URL**: The address where your OpenClaw gateway is running
   - Local: `http://localhost:8080`
   - Remote: `https://your-gateway.example.com`

2. **API Token**: Your OpenClaw authentication token
   - Starts with `oc_live_` for production
   - Find this in your OpenClaw gateway settings

### Environment Variables

While not required, you can pre-configure defaults by creating a `.env` file:

```env
VITE_GATEWAY_URL=http://localhost:8080
```

---

## 📂 Project Structure

```
Better-OpenClaw-Dashboard/
├── src/
│   ├── dashboard-app.ts    # Main dashboard component
│   ├── main.ts             # Application entry point
│   └── styles.css          # Global styles
├── tests/
│   └── dashboard.spec.ts   # E2E tests
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── playwright.config.ts    # Test configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure:
- Your code follows the existing style
- Tests pass (`npm test`)
- You've added tests for new features
- Documentation is updated as needed

---

## 🐛 Troubleshooting

### Dashboard won't start

```bash
# Try deleting node_modules and reinstalling
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't connect to gateway

- Verify your gateway is running (`curl http://localhost:8080/health`)
- Check that the URL is correct (include `http://` or `https://`)
- Ensure your API token is valid
- Check browser console for error messages (F12 → Console tab)

### Tests failing

```bash
# Install Playwright browsers
npx playwright install

# Run tests again
npm test
```

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Credits

Built with ❤️ for the OpenClaw community.

- **OpenClaw**: [https://openclaw.ai](https://openclaw.ai)
- **Lit Web Components**: [https://lit.dev](https://lit.dev)

---

## 📬 Support

Having issues? Here's where to get help:

- **Issues**: [GitHub Issues](https://github.com/NateSpencerWx/Better-OpenClaw-Dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NateSpencerWx/Better-OpenClaw-Dashboard/discussions)
- **OpenClaw Docs**: [OpenClaw Documentation](https://openclaw.ai/docs)

---

**Made with TypeScript, Lit, and good vibes** ✨