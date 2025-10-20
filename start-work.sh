#!/bin/bash

# Copus 项目开始工作脚本
# 自动切换到正确分支并同步最新代码

echo "🚀 准备开始 Copus 项目开发..."

# 检查当前是否在项目目录
if [ ! -d ".git" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 显示当前状态
echo "📍 当前状态:"
echo "   - 项目目录: $(pwd)"
echo "   - 当前分支: $(git branch --show-current)"

# 确保我们有最新的远程信息
echo ""
echo "🔄 获取最新的远程更新..."
git fetch origin

# 切换到功能开发分支
echo ""
echo "🌟 切换到功能开发分支..."
git checkout feature/functionality-updates

# 同步develop分支的最新更改
echo ""
echo "🔀 同步develop分支的最新更改..."
git checkout develop
git pull origin develop
git checkout feature/functionality-updates
git merge develop

if [ $? -eq 0 ]; then
    echo "✅ 代码同步成功！"
else
    echo "⚠️ 合并时遇到冲突，请手动解决后再继续"
    echo "💡 解决冲突后运行: git add . && git commit -m '解决合并冲突'"
    exit 1
fi

echo ""
echo "🎉 准备完成！你现在可以安全地开始编码了"
echo ""
echo "📝 记住:"
echo "   - 经常运行 ./git-backup.sh 保存进度"
echo "   - 完成功能后创建 PR 到 develop 分支"
echo "   - 有问题及时和同事沟通"
echo ""
echo "开始愉快的编码吧！ 🎨"