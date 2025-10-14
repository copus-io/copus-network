# Copus 本地开发指南

## 🎯 推荐的工作流程

你说得对！本地开发 → 批量推送的方式更加高效。以下是推荐的工作流程：

### 1. 开始开发前
```bash
# 运行开始工作脚本，自动切换分支并同步代码
./start-work.sh
```

### 2. 本地开发
```bash
# 启动开发服务器
npm run dev

# 在编辑器中进行开发
# 推荐使用 VS Code, WebStorm 或其他你熟悉的编辑器
```

### 3. 本地测试
- 在浏览器中测试功能：http://localhost:5177
- 确保功能正常工作
- 检查控制台是否有错误

### 4. 完成阶段性工作后推送
```bash
# 方式一：使用备份脚本（推荐）
./git-backup.sh

# 方式二：手动提交
git add .
git commit -m "你的提交信息"
git push origin feature/functionality-updates
```

## 🛠 本地开发优势

### ✅ 更快的反馈循环
- 代码修改即时生效（HMR热更新）
- 无需等待远程同步
- 更好的调试体验

### ✅ 更灵活的实验
- 可以随意尝试不同的解决方案
- 不会产生大量无意义的commit
- 只有满意的代码才推送到远程

### ✅ 更高效的协作
- 减少远程仓库的提交噪音
- 同事看到的都是有意义的更改
- 更清晰的开发历史

## 📁 推荐的编辑器设置

### VS Code 插件
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-react",
    "formulahendry.auto-rename-tag"
  ]
}
```

### WebStorm 配置
- 启用 TypeScript 支持
- 配置 Tailwind CSS 智能提示
- 启用 ESLint 和 Prettier

## 🚀 常用开发命令

### 项目运行
```bash
npm run dev          # 开发模式
npm run build        # 生产构建
npm run preview      # 预览构建结果
```

### 代码检查
```bash
npm run lint         # ESLint 检查
npm run type-check   # TypeScript 检查
```

### 项目管理
```bash
./start-work.sh      # 开始工作
./git-backup.sh      # 保存进度
./check-teammate.sh  # 检查同事更改
```

## 📝 提交策略建议

### 🎯 什么时候推送到远程？
- ✅ 完成一个完整功能
- ✅ 修复一个重要bug
- ✅ 完成一天的工作
- ✅ 需要备份重要进度

### ❌ 不建议推送的情况
- ❌ 调试中的临时代码
- ❌ 未完成的功能
- ❌ 实验性的代码修改
- ❌ 频繁的小改动

## 🔧 本地开发最佳实践

### 1. 定期保存
即使不推送到远程，也要定期本地commit：
```bash
git add .
git commit -m "WIP: 进行中的功能描述"
```

### 2. 功能分支
确保在正确的分支上工作：
```bash
git branch  # 确认当前分支
# 应该显示 * feature/functionality-updates
```

### 3. 定期同步
每天开始工作前同步最新代码：
```bash
./start-work.sh  # 自动处理同步
```

### 4. 测试验证
推送前确保：
- 页面能正常加载
- 核心功能正常工作
- 控制台无报错
- 代码格式正确

## 🆘 常见问题解决

### 代码冲突
```bash
# 如果同步时出现冲突
git stash              # 暂存本地更改
./start-work.sh        # 重新同步
git stash pop          # 恢复本地更改
# 手动解决冲突后继续开发
```

### 服务器端口被占用
```bash
# 杀掉占用端口的进程
pkill -f "vite"
# 或者查看端口使用
lsof -ti:5177 | xargs kill
```

### 依赖问题
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 💡 总结

这种本地开发优先的方式让你可以：
- 🎨 专注于创造性工作
- 🚀 更快的开发迭代
- 🤝 更好的团队协作
- 📈 更清晰的项目历史

现在你可以安心地在本地进行开发，只在完成有意义的工作后再推送到GitHub！

---
*建议：将此文档加入书签，随时参考* 📖