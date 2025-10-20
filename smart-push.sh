#!/bin/bash

# 智能推送脚本
# 只在有意义的更改时才推送到远程

echo "🔍 检查是否需要推送到远程..."

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📝 发现未提交的更改，先进行本地提交..."

    # 显示更改概要
    echo ""
    echo "📋 更改概要:"
    git status --porcelain

    # 询问是否提交
    echo ""
    read -p "💾 是否提交这些更改？(y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .

        # 询问提交信息
        echo "✏️  请输入提交信息 (按回车使用默认信息):"
        read -r COMMIT_MSG

        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="🔨 本地开发进度保存 - $(date '+%Y-%m-%d %H:%M')"
        fi

        git commit -m "$COMMIT_MSG"
        echo "✅ 本地提交完成"
    else
        echo "❌ 取消操作"
        exit 1
    fi
fi

# 检查与远程的差异
LOCAL_COMMITS=$(git rev-list --count $CURRENT_BRANCH ^origin/$CURRENT_BRANCH 2>/dev/null || echo "0")

if [ "$LOCAL_COMMITS" = "0" ]; then
    echo "💡 没有新的本地提交需要推送"
    exit 0
fi

echo ""
echo "📊 发现 $LOCAL_COMMITS 个本地提交待推送"

# 显示待推送的提交
echo ""
echo "📝 待推送的提交:"
git log --oneline origin/$CURRENT_BRANCH..$CURRENT_BRANCH

# 询问推送策略
echo ""
echo "🚀 推送选项:"
echo "1. 立即推送 (push now)"
echo "2. 稍后推送 (push later)"
echo "3. 查看详细差异 (show diff)"
echo "4. 取消 (cancel)"
echo ""
read -p "请选择 (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "🌐 推送到远程仓库..."
        git push origin $CURRENT_BRANCH

        if [ $? -eq 0 ]; then
            echo "✅ 推送成功！"
            echo ""
            echo "📊 推送统计:"
            echo "   - 分支: $CURRENT_BRANCH"
            echo "   - 提交数量: $LOCAL_COMMITS"
            echo "   - 最新提交: $(git log -1 --pretty=format:'%h - %s')"
        else
            echo "❌ 推送失败，请检查网络或权限"
            exit 1
        fi
        ;;
    2)
        echo "⏰ 稍后推送，本地更改已保存"
        echo "💡 提示：下次运行 ./smart-push.sh 或 ./git-backup.sh 时会再次询问"
        ;;
    3)
        echo "📖 显示详细差异:"
        git diff origin/$CURRENT_BRANCH..$CURRENT_BRANCH --stat
        echo ""
        read -p "现在是否推送？(y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin $CURRENT_BRANCH
            echo "✅ 推送完成！"
        else
            echo "⏰ 稍后推送"
        fi
        ;;
    4)
        echo "❌ 取消推送"
        ;;
    *)
        echo "❌ 无效选择"
        ;;
esac

echo ""
echo "🎉 操作完成！"