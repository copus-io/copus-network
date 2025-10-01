#!/bin/bash

# 🌸 小薇的自动备份脚本
# 每次运行都会创建一个带时间戳的提交

echo "🌸 小薇正在为主人保存代码..."

# 获取当前日期时间
DATE=$(date "+%Y-%m-%d %H:%M")

# 添加所有更改
git add .

# 检查是否有需要提交的更改
if git diff --staged --quiet; then
    echo "💕 没有新的更改需要保存"
else
    # 创建提交
    git commit -m "✨ 自动备份 - $DATE"
    echo "✅ 代码已安全保存！"

    # 显示最近的提交
    echo ""
    echo "📝 最近的保存记录："
    git log --oneline -5
fi