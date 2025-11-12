#!/bin/bash

# Teammate Change Monitoring Script
# Quickly view teammate's changes in the content branch

echo "👥 Checking teammate's changes..."
echo "================================"

# Fetch latest information
git fetch origin > /dev/null 2>&1

# Check if teammate's branch exists
if ! git show-ref --verify --quiet refs/remotes/origin/content/text-updates; then
    echo "❌ Teammate's branch content/text-updates does not exist or hasn't been pushed"
    exit 1
fi

echo "📍 Branch comparison info:"
echo "   - Your branch: feature/functionality-updates"
echo "   - Teammate's branch: content/text-updates"
echo ""

# Show latest commits from teammate's branch
echo "📝 Teammate's latest commits (last 5):"
git log origin/content/text-updates --oneline -5 --pretty=format:"   %C(yellow)%h%C(reset) - %C(green)%an%C(reset) - %s %C(blue)(%cr)%C(reset)"
echo ""
echo ""

# Compare teammate's branch with develop branch
CHANGES=$(git diff --name-only origin/develop..origin/content/text-updates)
if [ -z "$CHANGES" ]; then
    echo "💡 Teammate hasn't made any changes yet"
else
    echo "📋 Files modified by teammate:"
    echo "$CHANGES" | while read file; do
        echo "   📄 $file"
    done

    echo ""
    echo "🔍 Detailed changes:"
    git diff --stat origin/develop..origin/content/text-updates

    echo ""
    echo "📖 To view specific changes, run:"
    echo "   git diff origin/develop..origin/content/text-updates"
fi

# Check for potential conflicts
echo ""
echo "⚠️  Conflict warning:"
YOUR_CHANGES=$(git diff --name-only origin/develop..origin/feature/functionality-updates)
TEAMMATE_CHANGES=$(git diff --name-only origin/develop..origin/content/text-updates)

if [ -z "$YOUR_CHANGES" ] && [ -z "$TEAMMATE_CHANGES" ]; then
    echo "   ✅ Neither party has made changes yet"
elif [ -z "$TEAMMATE_CHANGES" ]; then
    echo "   ✅ Teammate hasn't made changes, no conflict risk"
elif [ -z "$YOUR_CHANGES" ]; then
    echo "   ✅ You haven't made changes, no conflict risk"
else
    # Check if same files were modified
    COMMON_FILES=$(comm -12 <(echo "$YOUR_CHANGES" | sort) <(echo "$TEAMMATE_CHANGES" | sort))
    if [ -z "$COMMON_FILES" ]; then
        echo "   ✅ Both parties modified different files, no conflict risk"
    else
        echo "   🚨 Potential conflict! Both parties modified the following files:"
        echo "$COMMON_FILES" | while read file; do
            echo "      ⚠️  $file"
        done
        echo "   💬 Recommend immediate communication with teammate"
    fi
fi

echo ""
echo "🔄 To monitor teammate's changes in real-time, run:"
echo "   watch -n 30 './check-teammate.sh'"