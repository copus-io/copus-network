#!/bin/bash

# Copus 项目自动备份脚本
# 支持多分支协作开发模式

echo "🚀 开始备份 Copus 项目代码..."

# 获取当前日期时间
DATE=$(date "+%Y-%m-%d %H:%M:%S")
BACKUP_DIR="../copus-backups"

# 获取当前分支名
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 1. 提交当前更改
git add .

if git diff --staged --quiet; then
    echo "💡 没有新的更改需要提交"
else
    git commit -m "💾 自动备份 - $DATE"
    echo "✅ 本地更改已提交"
fi

# 2. 推送到远程
echo "🌐 推送到远程仓库..."
git push origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    echo "✅ 远程备份成功"
else
    echo "⚠️ 远程推送失败，但本地已保存"
fi

# 3. 创建本地文件备份
BACKUP_NAME="copus-backup-$CURRENT_BRANCH-$(date +%Y%m%d_%H%M%S)"
cp -r . "$BACKUP_DIR/$BACKUP_NAME"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/.git"  # 移除git文件夹减小备份大小

echo "💽 本地备份已保存到: $BACKUP_DIR/$BACKUP_NAME"

# 4. 显示状态信息
echo ""
echo "📊 备份统计:"
echo "   - 当前分支: $CURRENT_BRANCH"
echo "   - 本地提交: $(git rev-parse --short HEAD)"
echo "   - 最近5次提交:"
git log --oneline -5

# 5. 清理旧备份（保留最近10个）
echo ""
echo "🧹 清理旧备份..."
cd "$BACKUP_DIR"
ls -t | grep "copus-backup-" | tail -n +11 | xargs -r rm -rf
cd - > /dev/null

echo ""
echo "🎉 备份完成！代码已安全保存到本地和远程"