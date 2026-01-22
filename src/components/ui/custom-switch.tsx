import * as React from "react";
import { cn } from "../../lib/utils";

interface CustomSwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  "aria-label"?: string;
}

const CustomSwitch = React.forwardRef<
  HTMLButtonElement,
  CustomSwitchProps
>(({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  label,
  "aria-label": ariaLabel,
  ...props
}, ref) => {
  return (
    <div className="inline-flex items-center gap-[15px] relative flex-[0_0_auto] rounded-[100px]">
      <button
        ref={ref}
        className={cn(
          "relative w-[26px] h-[16.42px] rounded-[50px] aspect-[1.58] cursor-pointer focus:outline-none flex items-center",
          // 基础样式保持原有设计
          "transition-all duration-300 ease-out",
          // 背景色 - 保持原有的红色主题
          checked
            ? "bg-[#f23a00] justify-end"
            : "bg-gray-300 justify-start",
          // 悬停效果
          "hover:scale-105 active:scale-95",
          // 聚焦效果
          "focus:ring-2 focus:ring-[#f23a00] focus:ring-opacity-50 focus:ring-offset-1",
          // 禁用状态
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        {...props}
      >
        <div
          className={cn(
            "w-3 h-3 bg-white rounded-full transition-all duration-300 ease-out transform",
            // 位置动画 - 使用弹性缓动
            "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
            // 位置控制
            checked ? "mr-0.5 translate-x-0" : "ml-0.5 translate-x-0",
            // 微妙的缩放效果
            checked ? "scale-110" : "scale-100",
            // 阴影效果
            "shadow-sm",
            checked && "shadow-md shadow-[#f23a00]/20"
          )}
        />
      </button>

      {label && (
        <div className="inline-flex flex-col items-start justify-center gap-[5px] relative flex-[0_0_auto]">
          <label className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[1.4] whitespace-nowrap cursor-pointer">
            {label}
          </label>
        </div>
      )}
    </div>
  );
});

CustomSwitch.displayName = "CustomSwitch";

export { CustomSwitch };