# 组件合并说明

本文档说明了项目中已合并的组件以及如何使用新的统一组件。

## 1. Switch 组件合并

原先项目中有三个不同的 Switch 组件实现：
- `Switch` - 基础开关组件
- `EnhancedSwitch` - 增强版开关组件
- `CustomSwitch` - 自定义开关组件

现在已合并为一个统一的 `UnifiedSwitch` 组件，位于 `src/components/ui/switch-unified.tsx`。

### 使用方法

```tsx
import { UnifiedSwitch } from "../components/ui/switch-unified";

// 基础用法
<UnifiedSwitch />

// 带标签
<UnifiedSwitch showLabel checkedLabel="开启" uncheckedLabel="关闭" />

// 不同变体
<UnifiedSwitch variant="success" />
<UnifiedSwitch variant="warning" />
<UnifiedSwitch variant="error" />

// 不同尺寸
<UnifiedSwitch size="sm" />
<UnifiedSwitch size="md" />
<UnifiedSwitch size="lg" />

// 带文字标签
<UnifiedSwitch label="启用通知" />
```

## 2. Avatar 组件统一

原先在多个路由目录中都有重复的 Avatar 组件实现，现已统一使用 `src/components/ui/avatar.tsx`。

### 使用方法

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

<Avatar>
  <AvatarImage src="https://example.com/image.jpg" alt="User" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

## 3. LazyImage 组件合并

原先有两个不同的 LazyImage 组件实现，现已合并为一个统一的 `LazyImageUnified` 组件，位于 `src/components/ui/lazy-image-unified.tsx`。

### 使用方法

```tsx
import { LazyImageUnified } from "../components/ui/lazy-image-unified";

// 普通图片
<LazyImageUnified src="https://example.com/image.jpg" alt="Image" />

// 背景图片
<LazyImageUnified 
  src="https://example.com/background.jpg" 
  isBackgroundImage={true}
>
  <div>子元素内容</div>
</LazyImageUnified>
```

## 迁移指南

### 迁移 Switch 组件

将原先的组件引用替换为 UnifiedSwitch：

```tsx
// 之前
import { EnhancedSwitch } from "../components/ui/enhanced-switch";
<EnhancedSwitch variant="success" />

// 之后
import { UnifiedSwitch } from "../components/ui/switch-unified";
<UnifiedSwitch variant="success" />
```

### 迁移 Avatar 组件

将原先的组件引用替换为统一版本：

```tsx
// 之前
import { Avatar } from "../routes/MyTreasury/components/ui/avatar";

// 之后
import { Avatar } from "../components/ui/avatar";
```

### 迁移 LazyImage 组件

将原先的组件引用替换为统一版本：

```tsx
// 之前
import { LazyImage } from "../components/ui/lazy-image";

// 之后
import { LazyImageUnified } from "../components/ui/lazy-image-unified";
```