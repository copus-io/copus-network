#!/bin/bash

# Copus Project Start Work Script
# Automatically switch to correct branch and sync latest code

echo "🚀 Preparing to start Copus project development..."

# Check if we're in the project directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Show current status
echo "📍 Current status:"
echo "   - Project directory: $(pwd)"
echo "   - Current branch: $(git branch --show-current)"

# Ensure we have the latest remote information
echo ""
echo "🔄 Fetching latest remote updates..."
git fetch origin

# Switch to feature development branch
echo ""
echo "🌟 Switching to feature development branch..."
git checkout feature/functionality-updates

# Sync latest changes from develop branch
echo ""
echo "🔀 Syncing latest changes from develop branch..."
git checkout develop
git pull origin develop
git checkout feature/functionality-updates
git merge develop

if [ $? -eq 0 ]; then
    echo "✅ Code sync successful!"
else
    echo "⚠️ Encountered conflicts during merge, please resolve manually before continuing"
    echo "💡 After resolving conflicts, run: git add . && git commit -m 'Resolve merge conflicts'"
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now safely start coding"
echo ""
echo "📝 Remember:"
echo "   - Run ./git-backup.sh frequently to save progress"
echo "   - Create PR to develop branch after completing features"
echo "   - Communicate with teammates promptly if issues arise"
echo ""
echo "Happy coding! 🎨"