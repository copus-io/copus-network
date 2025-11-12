import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "../../lib/utils";

interface UnifiedSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  checkedLabel?: string;
  uncheckedLabel?: string;
  label?: string;
  "aria-label"?: string;
}

const variants = {
  default: {
    checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 data-[state=checked]:shadow-blue-200 data-[state=checked]:shadow-lg",
    unchecked: "data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300",
    thumb: "data-[state=checked]:shadow-blue-100",
    ring: "focus-visible:ring-blue-300"
  },
  success: {
    checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 data-[state=checked]:shadow-green-200 data-[state=checked]:shadow-lg",
    unchecked: "data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300",
    thumb: "data-[state=checked]:shadow-green-100",
    ring: "focus-visible:ring-green-300"
  },
  warning: {
    checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600 data-[state=checked]:shadow-yellow-200 data-[state=checked]:shadow-lg",
    unchecked: "data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300",
    thumb: "data-[state=checked]:shadow-yellow-100",
    ring: "focus-visible:ring-yellow-300"
  },
  error: {
    checked: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-red-600 data-[state=checked]:shadow-red-200 data-[state=checked]:shadow-lg",
    unchecked: "data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300",
    thumb: "data-[state=checked]:shadow-red-100",
    ring: "focus-visible:ring-red-300"
  }
};

const sizes = {
  sm: {
    root: "h-4 w-8",
    thumb: "h-3 w-3 data-[state=checked]:translate-x-4"
  },
  md: {
    root: "h-6 w-11",
    thumb: "h-5 w-5 data-[state=checked]:translate-x-5"
  },
  lg: {
    root: "h-8 w-14",
    thumb: "h-7 w-7 data-[state=checked]:translate-x-6"
  }
};

const UnifiedSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  UnifiedSwitchProps
>(({
  className,
  variant = "default",
  size = "md",
  showLabel = false,
  checkedLabel = "ON",
  uncheckedLabel = "OFF",
  label,
  ...props
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(props.checked || props.defaultChecked || false);

  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  React.useEffect(() => {
    if (props.checked !== undefined) {
      setIsChecked(props.checked);
    }
  }, [props.checked]);

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span 
          className={cn(
            "text-sm font-medium transition-colors duration-200 cursor-pointer",
            isChecked ? "text-gray-900" : "text-gray-500"
          )}
          onClick={() => props.onCheckedChange?.(!isChecked)}
        >
          {label}
        </span>
      )}
      
      {showLabel && (
        <span className={cn(
          "text-sm font-medium transition-colors duration-200",
          isChecked ? "text-gray-700" : "text-gray-500"
        )}>
          {isChecked ? checkedLabel : uncheckedLabel}
        </span>
      )}

      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm",
          // 基础动画
          "transition-all duration-300 ease-in-out",
          // 聚焦状态
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          // 禁用状态
          "disabled:cursor-not-allowed disabled:opacity-50",
          // 交互效果
          "hover:scale-105 active:scale-95",
          // 悬停时的阴影增强
          "data-[state=checked]:hover:shadow-xl data-[state=unchecked]:hover:bg-gray-300",
          // 变体样式
          variantStyles.checked,
          variantStyles.unchecked,
          variantStyles.ring,
          // 尺寸样式
          sizeStyles.root,
          className,
        )}
        onCheckedChange={(checked) => {
          setIsChecked(checked);
          props.onCheckedChange?.(checked);
        }}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-lg ring-0",
            // 平滑动画，使用弹性缓动
            "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
            // 位置变换
            "data-[state=unchecked]:translate-x-0",
            // 缩放效果
            "data-[state=checked]:scale-110 data-[state=unchecked]:scale-100",
            // 阴影效果
            "data-[state=checked]:shadow-md",
            // 边框效果
            "data-[state=checked]:ring-2 data-[state=checked]:ring-white data-[state=checked]:ring-opacity-60",
            // 变体相关的阴影
            variantStyles.thumb,
            // 尺寸相关的位置
            sizeStyles.thumb,
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  );
});

UnifiedSwitch.displayName = "UnifiedSwitch";

export { UnifiedSwitch };