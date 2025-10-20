#!/bin/bash

# 同事更改监控脚本
# 快速查看同事在文案分支的更改情况

echo "👥 检查同事的更改情况..."
echo "================================"

# 获取最新信息
git fetch origin > /dev/null 2>&1

# 检查同事分支是否存在
if ! git show-ref --verify --quiet refs/remotes/origin/content/text-updates; then
    echo "❌ 同事的分支 content/text-updates 还不存在或未推送"
    exit 1
fi

echo "📍 分支对比信息："
echo "   - 你的分支: feature/functionality-updates"
echo "   - 同事分支: content/text-updates"
echo ""

# 显示同事分支的最新提交
echo "📝 同事分支最新提交（最近5条）："
git log origin/content/text-updates --oneline -5 --pretty=format:"   %C(yellow)%h%C(reset) - %C(green)%an%C(reset) - %s %C(blue)(%cr)%C(reset)"
echo ""
echo ""

# 比较同事分支与develop分支的差异
CHANGES=$(git diff --name-only origin/develop..origin/content/text-updates)
if [ -z "$CHANGES" ]; then
    echo "💡 同事还没有做任何更改"
else
    echo "📋 同事修改的文件："
    echo "$CHANGES" | while read file; do
        echo "   📄 $file"
    done

    echo ""
    echo "🔍 详细更改内容："
    git diff --stat origin/develop..origin/content/text-updates

    echo ""
    echo "📖 如果需要查看具体更改内容，运行："
    echo "   git diff origin/develop..origin/content/text-updates"
fi

# 检查是否有潜在冲突
echo ""
echo "⚠️  冲突预警："
YOUR_CHANGES=$(git diff --name-only origin/develop..origin/feature/functionality-updates)
TEAMMATE_CHANGES=$(git diff --name-only origin/develop..origin/content/text-updates)

if [ -z "$YOUR_CHANGES" ] && [ -z "$TEAMMATE_CHANGES" ]; then
    echo "   ✅ 双方都还没有更改"
elif [ -z "$TEAMMATE_CHANGES" ]; then
    echo "   ✅ 同事还没有更改，无冲突风险"
elif [ -z "$YOUR_CHANGES" ]; then
    echo "   ✅ 你还没有更改，无冲突风险"
else
    # 检查是否修改了相同文件
    COMMON_FILES=$(comm -12 <(echo "$YOUR_CHANGES" | sort) <(echo "$TEAMMATE_CHANGES" | sort))
    if [ -z "$COMMON_FILES" ]; then
        echo "   ✅ 双方修改不同文件，无冲突风险"
    else
        echo "   🚨 潜在冲突！双方都修改了以下文件："
        echo "$COMMON_FILES" | while read file; do
            echo "      ⚠️  $file"
        done
        echo "   💬 建议立即和同事沟通协调"
    fi
fi

echo ""
echo "🔄 要实时监控同事更改，可以运行："
echo "   watch -n 30 './check-teammate.sh'"