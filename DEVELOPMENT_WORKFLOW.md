# Copus 开发工作流程指南

## 分支结构

我们设置了以下分支结构来避免代码冲突：

- **main**: 生产环境代码，受保护，只能通过PR合并
- **develop**: 开发集成分支，用于集成各功能分支
- **feature/functionality-updates**: 功能开发分支（你的工作分支）
- **content/text-updates**: 文案修改分支（同事的工作分支）

## 工作流程

### 开始工作前

1. **切换到你的工作分支**
   ```bash
   git checkout feature/functionality-updates
   git pull origin feature/functionality-updates
   ```

2. **同步最新代码**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/functionality-updates
   git merge develop
   ```

### 日常开发

1. **在你的分支上工作**
   ```bash
   # 确保在正确分支
   git branch  # 应该显示 * feature/functionality-updates

   # 进行开发工作...
   # 修改文件、添加功能等
   ```

2. **提交代码**
   ```bash
   git add .
   git commit -m "描述你的更改"
   git push origin feature/functionality-updates
   ```

### 完成功能后

1. **创建Pull Request**
   ```bash
   gh pr create --base develop --head feature/functionality-updates --title "功能更新" --body "详细描述你的更改"
   ```

2. **或者通过GitHub网页创建PR**
   - 访问: https://github.com/copus-io/copus-network/compare/develop...feature/functionality-updates

## 冲突预防

### 你和同事的分工
- **你**: `feature/functionality-updates` - 负责功能性代码
- **同事**: `content/text-updates` - 负责文案修改

### 避免冲突的规则
1. **不要直接在main或develop分支工作**
2. **每天开始工作前先同步代码**
3. **经常提交和推送你的更改**
4. **如果需要修改文案，先和同事沟通**

## 紧急情况处理

### 如果遇到合并冲突
```bash
# 拉取最新的develop分支
git checkout develop
git pull origin develop

# 回到你的分支并合并
git checkout feature/functionality-updates
git merge develop

# 如果有冲突，编辑冲突文件后
git add .
git commit -m "解决合并冲突"
git push origin feature/functionality-updates
```

### 如果需要回档
```bash
# 查看提交历史
git log --oneline

# 回退到指定提交（替换 <commit-hash>）
git reset --hard <commit-hash>

# 强制推送（谨慎使用）
git push --force-with-lease origin feature/functionality-updates
```

## 备份策略

每天工作结束前执行自动备份脚本：
```bash
./git-backup.sh
```

## 监控同事更改

### 快速查看同事进度
```bash
./check-teammate.sh
```

### 实时监控（每30秒刷新）
```bash
watch -n 30 './check-teammate.sh'
```

### 查看具体文件更改
```bash
# 查看同事修改了哪些文件
git diff --name-only origin/develop..origin/content/text-updates

# 查看具体更改内容
git diff origin/develop..origin/content/text-updates

# 查看某个文件的具体更改
git show origin/content/text-updates:path/to/file
```

## 常用命令速查

| 命令 | 功能 |
|-----|------|
| `./start-work.sh` | 开始工作前准备 |
| `./smart-push.sh` | 智能推送（推荐） |
| `./git-backup.sh` | 保存和备份代码 |
| `./check-teammate.sh` | 查看同事更改 |
| `git status` | 查看当前状态 |
| `git log --oneline -5` | 查看最近提交 |

## 本地开发优先工作流

### 🎯 推荐流程
1. **开始开发**: `./start-work.sh`
2. **本地编码**: 在编辑器中开发，使用 `npm run dev` 实时预览
3. **完成阶段性工作**: `./smart-push.sh` （智能决定是否推送）
4. **监控同事**: `./check-teammate.sh`

### 💡 智能推送策略
- ✅ **完成功能时推送** - 新功能、bug修复
- ✅ **每日结束时推送** - 保存重要进度
- ❌ **避免频繁推送** - 调试代码、实验性修改

## 联系方式

如果遇到Git相关问题，及时沟通避免代码丢失。

---
*最后更新: 2025-10-14*