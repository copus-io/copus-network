# Git Workflow Guide - English Commits Only

## 🚀 Quick Setup Complete!
Your repository is now configured for English-only commits with SSH authentication.

## 📝 Commit Message Format
Use this format for all commits:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## 🏷️ Commit Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

## ✅ Good Examples
```bash
feat(auth): add OAuth login functionality
fix(api): resolve 404 error in article endpoint
docs(readme): update installation instructions
style(components): improve button hover effects
refactor(utils): simplify date formatting logic
perf(database): optimize article query performance
test(auth): add unit tests for login validation
chore(deps): update React to version 18.2.0
```

## 🔄 Workflow Commands
```bash
# Regular workflow
git add .
git commit -m "feat(component): add new feature"
git push

# Using the English template (opens editor)
git add .
git commit-en
git push

# Quick status check
git status
git log --oneline -5
```

## 🛡️ Automatic Protection
- ✅ SSH authentication configured
- ✅ Commit message hook prevents Chinese characters
- ✅ Commit template provides English guidance
- ✅ Minimum message length enforcement

## 🚨 What Happens If You Use Chinese?
The commit will be **rejected** with a helpful error message:
```
❌ ERROR: Commit message contains Chinese characters.
📝 Please use English only for commit messages.
```

## 📋 Quick Reference
| Command | Description |
|---------|-------------|
| `git commit -m "message"` | Regular commit with inline message |
| `git commit-en` | Commit with English template |
| `git push` | Push to GitHub (SSH configured) |
| `git status` | Check working directory status |
| `git log --oneline -5` | View last 5 commits |

---
🎉 **All set!** Your future commits will be properly formatted in English.