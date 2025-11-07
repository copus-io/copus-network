# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Copus Internet Treasure Map** - A decentralized social content platform that empowers creators and connects communities. Built with React, TypeScript, Vite, and Tailwind CSS.

### Core Concept
"Internet Treasure Map" - In an AI-saturated era, Copus emphasizes human curation and judgment for discovering and sharing valuable content through a "Treasury" collection system.

## Branch Structure & Deployment

- **`main`** - Production environment (copus.network)
- **`develop`** - Test environment (test.copus.network)
- **`feature/functionality-updates`** - Local development branch for functional code changes
- **`content/text-updates`** - Content/copy updates branch (managed by teammate)

### Workflow Rules
- Work directly on `feature/functionality-updates` branch (no sub-branches)
- Only pull when explicitly requested (not automatically)
- Use English-only commit messages following conventional commits format
- Create PRs to merge into `develop` branch for testing

## Development Commands

### Environment Setup
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm run dev                    # Development mode (localhost:5177)
npm run dev:staging            # Staging environment
npm run dev:prod               # Production environment preview
```

### Build
```bash
npm run build                  # Production build
npm run build:staging          # Staging build
npm run build:development      # Development build
```

### Helper Scripts
```bash
./start-work.sh                # Start work (switch branch & sync)
./smart-push.sh                # Intelligent push (recommended)
./check-teammate.sh            # Check teammate's changes
```

## Architecture

### Tech Stack
- **Frontend**: React 18.2 + TypeScript 5.9
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 3.4 + Radix UI components
- **State Management**: React Context + TanStack Query (React Query)
- **Authentication**: Web3 (Metamask) + Email/Password
- **Payment**: x402 Protocol + ERC-3009 (gasless USDC payments)

### API Configuration
- **Development**: `https://api.test.copus.io/copusV2`
- **Staging**: `https://api.test.copus.io/copusV2`
- **Production**: `https://api.copus.io/copusV2`

Environment-specific settings are in `.env.development`, `.env.staging`, and `.env.production`.

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── ImageUploader/  # Image upload functionality
│   ├── SocialLinksManager/
│   ├── WalletSignInModal/    # Wallet selection for payments
│   └── PayConfirmModal/      # Payment confirmation UI
├── screens/            # Page-level components (routes)
│   ├── Discovery/      # Content discovery page
│   ├── Treasury/       # User's saved content collection
│   ├── Content/        # Article detail view (includes x402 payment flow)
│   ├── MainFrame/      # Main layout wrapper
│   ├── UserProfile/    # User profile page
│   ├── Notification/   # Notifications page
│   └── Setting/        # Settings page
├── services/           # API service layer
│   ├── api.ts          # Core API request handler
│   ├── authService.ts  # Authentication APIs
│   ├── articleService.ts    # Article APIs
│   ├── categoryService.ts   # Category APIs
│   └── notificationService.ts
├── hooks/              # Custom React hooks
│   ├── queries/        # TanStack Query hooks
│   ├── useArticles.ts
│   ├── useAuthForm.ts
│   └── useCategories.ts
├── contexts/           # React Context providers
│   ├── UserContext.tsx
│   ├── CategoryContext.tsx
│   ├── NotificationContext.tsx
│   └── ImagePreviewContext.tsx
├── types/              # TypeScript type definitions
│   ├── article.ts      # Includes x402 payment types
│   ├── category.ts
│   └── notification.ts
├── utils/              # Utility functions
│   ├── validation.ts
│   ├── categoryStyles.ts
│   ├── imageUtils.ts
│   ├── apiUtils.ts
│   └── x402Utils.ts    # x402 payment protocol utilities
└── config/             # App configuration
    └── app.ts
```

## Key Architecture Patterns

### Service Layer Pattern
All API calls go through centralized service layers in `src/services/`:

```typescript
// Example: Using AuthService
import { AuthService } from './services/authService';

const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password'
});
```

### API Request Handler
The `apiRequest` function in `src/services/api.ts` handles:
- Bearer token authentication (stored in `localStorage.copus_token`)
- Automatic token validation (JWT format checking)
- Error handling for 401/403 (auto-logout)
- Content-Type management (JSON vs FormData)
- CORS error detection

### State Management
- **TanStack Query** for server state (articles, notifications, etc.)
- **React Context** for global UI state (user, categories, notifications)
- **Local State** (useState) for component-specific state

### Form Validation
Centralized validation in `src/utils/validation.ts`:
```typescript
import { FormValidator, VALIDATION_RULES } from './utils/validation';

const errors = FormValidator.validateForm(values, VALIDATION_RULES);
```

### Toast Notifications
Replaced all `alert()` calls with toast system:
```typescript
import { showToast } from './components/ui/toast';

showToast('Success message', 'success');
showToast('Error message', 'error');
```

## Important Conventions

### Component Structure
- **Screens**: Full page components in `src/screens/[ScreenName]/`
- **Sections**: Page sections in `src/screens/[ScreenName]/sections/`
- Each major component has its own directory with `.tsx` file

### Styling
- **Tailwind CSS**: Primary styling method
- **Design tokens**: Consistent spacing (15px, 30px), colors (#f23a00 for primary red)
- **Radix UI**: Base components for accessibility
- **Responsive**: Mobile-first design approach

### Authentication Flow
1. User logs in via email/password or Metamask
2. Token stored in `localStorage.copus_token`
3. User data stored in `localStorage.copus_user`
4. Token sent as `Authorization: Bearer {token}` header
5. Invalid tokens trigger auto-logout and redirect

### Categories
Supported categories with color coding (in `src/utils/categoryStyles.ts`):
- Art (green)
- Sports (blue)
- Technology (yellow)
- Life (pink)

### Image Handling
- Images uploaded through `ImageUploader` component
- Lazy loading via `lazy-image` component
- Global preview modal via `ImagePreviewContext`

## Testing & Validation

### Manual Testing Checklist
Before pushing changes:
- Page loads without errors
- Core functionality works (login, article display, treasury, etc.)
- No console errors
- Responsive design works on different screen sizes
- API calls succeed with proper authentication

### Local Development Server
- Runs on `http://localhost:5177`
- Hot Module Replacement (HMR) enabled
- TypeScript type checking in real-time

## Common Tasks

### Adding a New API Endpoint
1. Define types in `src/types/`
2. Create service method in appropriate `src/services/` file
3. Create custom hook in `src/hooks/` (if using TanStack Query)
4. Use in component

### Adding a New Page
1. Create directory in `src/screens/[PageName]/`
2. Create sections in `src/screens/[PageName]/sections/`
3. Add route in main routing configuration
4. Update navigation if needed

### Modifying Authentication
- All auth logic in `src/services/authService.ts`
- Token management in `src/contexts/UserContext.tsx`
- Login UI in `src/screens/MainFrame/sections/HeaderSection/`

### Working with x402 Payments

Copus uses the x402 protocol for pay-per-view content with gasless USDC payments on Base mainnet.

**Key Concepts**:
- **Gasless payments**: Users sign a message (no transaction), server pays gas
- **ERC-3009**: TransferWithAuthorization standard for meta-transactions
- **Fast**: 2-3 seconds vs 60+ seconds for regular blockchain transactions

**Files**:
- `src/utils/x402Utils.ts` - Core payment utilities (nonce generation, signing, header creation)
- `src/screens/Content/Content.tsx` - Payment flow implementation
- `src/components/WalletSignInModal/` - Wallet selection UI
- `src/components/PayConfirmModal/` - Payment confirmation UI
- `src/types/article.ts` - Payment type definitions (PriceInfo, X402PaymentInfo)

**Payment Flow**:
1. User clicks "Unlock now" → fetch payment info from x402 API
2. User selects wallet (MetaMask) → connect and fetch USDC balance
3. User clicks "Pay now" → sign EIP-712 authorization (NO transaction!)
4. Send signed authorization to server → server executes transfer and pays gas
5. Content unlocked → user accesses premium content

**Important Functions**:
```typescript
import {
  generateNonce,
  signTransferWithAuthorization,
  createX402PaymentHeader
} from './utils/x402Utils';

// Generate unique nonce
const nonce = generateNonce();

// Sign authorization (shows MetaMask popup)
const signedAuth = await signTransferWithAuthorization({
  from, to, value, validAfter, validBefore, nonce
}, window.ethereum);

// Create X-PAYMENT header
const paymentHeader = createX402PaymentHeader(signedAuth, network, asset);
```

**For detailed documentation**, see:
- `X402_PAYMENT.md` - Complete integration guide
- Inline comments in `src/screens/Content/Content.tsx`
- JSDoc in `src/utils/x402Utils.ts`

**Testing**:
- Network: Base mainnet (chainId: 8453 / 0x2105)
- USDC Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- Get test USDC from faucet (see X402_PAYMENT.md)

## Git Commit Format

Use conventional commits with English only:

```
<type>(<scope>): <description>

feat(auth): add OAuth login functionality
fix(api): resolve 404 error in article endpoint
docs(readme): update installation instructions
style(components): improve button hover effects
refactor(utils): simplify date formatting logic
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## Environment Variables

Required environment variables (see `.env.example`):
- `VITE_API_BASE_URL` - Backend API base URL
- Token and user data are stored in localStorage (not env vars)
