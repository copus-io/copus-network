import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "../../lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // 背景色过渡效果
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 data-[state=checked]:shadow-blue-200 data-[state=checked]:shadow-lg",
      "data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300",
      // 悬停效果
      "hover:scale-105 active:scale-95",
      // 聚焦时的发光效果
      "focus-visible:ring-blue-300 focus-visible:ring-opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0",
        // 平滑的移动和缩放动画
        "transition-all duration-300 ease-out",
        // 位置变换
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        // 选中状态的发光效果
        "data-[state=checked]:shadow-md data-[state=checked]:shadow-blue-100",
        // 微妙的缩放效果
        "data-[state=checked]:scale-110 data-[state=unchecked]:scale-100",
        // 边框效果
        "data-[state=checked]:ring-2 data-[state=checked]:ring-white data-[state=checked]:ring-opacity-60",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
