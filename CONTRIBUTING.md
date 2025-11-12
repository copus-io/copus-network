# Contributing to Copus Network

Thank you for your interest in contributing to Copus Network! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to maintain a welcoming and inclusive community.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm or pnpm package manager
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/copus-network.git
   cd copus-network
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit [http://localhost:5177](http://localhost:5177) to see your local instance

### Environment Configuration

Create environment files for different environments:
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

See `.env.example` for required variables.

## Development Workflow

### Branch Structure

- `main` - Production environment (copus.network)
- `develop` - Test environment (test.copus.network)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Working on a Feature

1. Create a new branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [Coding Standards](#coding-standards)

3. Test your changes thoroughly:
   - Run `npm run dev` and test manually
   - Check console for errors
   - Test responsive design
   - Verify API integrations work

4. Commit your changes (see [Commit Guidelines](#commit-guidelines))

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request to the `develop` branch

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use type inference where appropriate

### React Components

- Use functional components with hooks
- Follow existing component structure:
  ```
  src/screens/[ScreenName]/
  ├── [ScreenName].tsx
  └── sections/
      ├── SectionOne.tsx
      └── SectionTwo.tsx
  ```
- Use descriptive component names
- Keep components focused and single-purpose

### Styling

- Use Tailwind CSS for styling
- Follow design tokens:
  - Primary red: `#f23a00`
  - Spacing: `15px`, `30px`
- Use Radix UI for accessible base components
- Mobile-first responsive design

### State Management

- **TanStack Query** for server state
- **React Context** for global UI state
- **useState** for component-specific state

### API Integration

- Use service layer pattern (`src/services/`)
- Centralized error handling
- Bearer token authentication
- Proper TypeScript types for requests/responses

### Code Quality

- Write clean, self-documenting code
- Add comments for complex logic
- Use English for all comments and documentation
- Follow existing code patterns in the project

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(auth): add OAuth login functionality
fix(api): resolve 404 error in article endpoint
docs(readme): update installation instructions
style(components): improve button hover effects
refactor(utils): simplify date formatting logic
```

### Important Rules

- Use English only for commit messages
- Keep subject line under 72 characters
- Use present tense ("add feature" not "added feature")
- Don't end subject line with a period
- Separate subject from body with blank line
- Wrap body at 72 characters

## Pull Request Process

### Before Submitting

1. **Test thoroughly**:
   - Page loads without errors
   - Core functionality works
   - No console errors
   - Responsive design works

2. **Update documentation** if needed:
   - Update README.md for new features
   - Add/update comments in code
   - Update CLAUDE.md for architecture changes

3. **Check code quality**:
   - TypeScript type checking passes
   - Code follows project conventions
   - No unused imports or variables

### Submitting PR

1. Create PR against `develop` branch (NOT `main`)

2. Fill out PR template with:
   - **Description**: What does this PR do?
   - **Type of Change**: Feature/Fix/Docs/etc.
   - **Related Issue**: Link to issue if applicable
   - **Testing**: How was this tested?
   - **Screenshots**: For UI changes

3. Request review from maintainers

4. Address review feedback:
   - Make requested changes
   - Push updates to same branch
   - Re-request review when ready

5. PR will be merged to `develop` for testing, then to `main` for production

### PR Title Format

Use conventional commit format for PR titles:
```
feat(auth): implement social login
fix(ui): resolve mobile navigation bug
```

## Reporting Issues

### Bug Reports

Use the issue template and include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: How to trigger the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, device
- **Screenshots**: If applicable
- **Console Errors**: Copy any error messages

### Feature Requests

Include:
- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Other approaches considered
- **Additional Context**: Mockups, examples, etc.

## Questions?

- Check [CLAUDE.md](CLAUDE.md) for architecture details
- Check [X402_PAYMENT.md](X402_PAYMENT.md) for payment integration
- Review existing code for examples
- Ask questions in issue discussions

## Thank You!

Your contributions help make Copus Network better for everyone. We appreciate your time and effort!
