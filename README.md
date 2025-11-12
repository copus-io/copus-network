# Copus Network - Internet Treasure Map 🗺️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

> A decentralized social content platform that empowers creators and connects communities through human curation and quality content discovery.

## 📖 About Copus

**Copus Network** is an "Internet Treasure Map" - a platform designed for discovering and sharing valuable content in an AI-saturated era. We emphasize human curation and judgment through our unique "Treasury" collection system, where users curate and share quality content they discover across the web.

### Key Features

- 🗂️ **Treasury Collections**: Curate and organize your favorite web content
- 💰 **x402 Payment Protocol**: Enable pay-per-view content with gasless USDC payments on Base mainnet
- 🔐 **Web3 Authentication**: Metamask wallet integration alongside traditional email/password
- 🎨 **Category System**: Organize content by Technology, Art, Sports, and Life
- 👥 **Social Features**: Follow creators, like content, and engage with the community
- 📱 **Responsive Design**: Optimized for desktop and mobile experiences

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm or pnpm package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_ORG/copus-network.git
   cd copus-network
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Visit [http://localhost:5177](http://localhost:5177)

### Available Scripts

```bash
# Development
npm run dev              # Run development server
npm run dev:staging      # Run with staging environment
npm run dev:prod         # Run with production environment

# Build
npm run build            # Production build
npm run build:staging    # Staging build
npm run build:development # Development build

# Preview
npm run preview          # Preview production build locally
```

## 🏗️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 6.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **Radix UI** - Accessible component primitives

### State Management
- **TanStack Query** - Server state management
- **React Context** - Global UI state

### Authentication & Payments
- **Web3** - Metamask integration
- **x402 Protocol** - Pay-per-view with ERC-3009
- **Base Mainnet** - Gasless USDC transactions

## 📚 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CLAUDE.md](CLAUDE.md)** - Architecture and development guide
- **[X402_PAYMENT.md](X402_PAYMENT.md)** - Payment integration guide
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes following our coding standards
4. Write tests if applicable
5. Submit a pull request to `develop`

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Community

- **Website**: [copus.network](https://copus.network)
- **Documentation**: [docs](https://github.com/YOUR_ORG/copus-network/tree/main/docs)
- **Issues**: [GitHub Issues](https://github.com/YOUR_ORG/copus-network/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_ORG/copus-network/discussions)

## 🙏 Acknowledgments

Built with modern web technologies and open-source tools:
- React & TypeScript
- Tailwind CSS & Radix UI
- TanStack Query
- Vite
- Base blockchain

---

Made with ❤️ by the Copus Network team and contributors
