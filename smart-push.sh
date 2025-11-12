#!/bin/bash

# Smart Push Script
# Only push to remote when there are meaningful changes

echo "🔍 Checking if push to remote is needed..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📝 Found uncommitted changes, committing locally first..."

    # Show change summary
    echo ""
    echo "📋 Change summary:"
    git status --porcelain

    # Ask whether to commit
    echo ""
    read -p "💾 Commit these changes? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .

        # Ask for commit message
        echo "✏️  Enter commit message (press Enter for default):"
        read -r COMMIT_MSG

        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="🔨 Local development progress save - $(date '+%Y-%m-%d %H:%M')"
        fi

        git commit -m "$COMMIT_MSG"
        echo "✅ Local commit completed"
    else
        echo "❌ Operation cancelled"
        exit 1
    fi
fi

# Check difference with remote
LOCAL_COMMITS=$(git rev-list --count $CURRENT_BRANCH ^origin/$CURRENT_BRANCH 2>/dev/null || echo "0")

if [ "$LOCAL_COMMITS" = "0" ]; then
    echo "💡 No new local commits to push"
    exit 0
fi

echo ""
echo "📊 Found $LOCAL_COMMITS local commits to push"

# Show commits to be pushed
echo ""
echo "📝 Commits to be pushed:"
git log --oneline origin/$CURRENT_BRANCH..$CURRENT_BRANCH

# Ask for push strategy
echo ""
echo "🚀 Push options:"
echo "1. Push now (push now)"
echo "2. Push later (push later)"
echo "3. Show detailed diff (show diff)"
echo "4. Cancel (cancel)"
echo ""
read -p "Please select (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "🌐 Pushing to remote repository..."
        git push origin $CURRENT_BRANCH

        if [ $? -eq 0 ]; then
            echo "✅ Push successful!"
            echo ""
            echo "📊 Push statistics:"
            echo "   - Branch: $CURRENT_BRANCH"
            echo "   - Number of commits: $LOCAL_COMMITS"
            echo "   - Latest commit: $(git log -1 --pretty=format:'%h - %s')"
        else
            echo "❌ Push failed, please check network or permissions"
            exit 1
        fi
        ;;
    2)
        echo "⏰ Push later, local changes saved"
        echo "💡 Tip: Next time you run ./smart-push.sh or ./git-backup.sh, you'll be asked again"
        ;;
    3)
        echo "📖 Showing detailed diff:"
        git diff origin/$CURRENT_BRANCH..$CURRENT_BRANCH --stat
        echo ""
        read -p "Push now? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin $CURRENT_BRANCH
            echo "✅ Push completed!"
        else
            echo "⏰ Push later"
        fi
        ;;
    4)
        echo "❌ Push cancelled"
        ;;
    *)
        echo "❌ Invalid selection"
        ;;
esac

echo ""
echo "🎉 Operation completed!"