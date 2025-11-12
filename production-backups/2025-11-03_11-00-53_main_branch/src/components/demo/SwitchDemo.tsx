import React, { useState } from "react";
import { Switch } from "../ui/switch";
import { EnhancedSwitch } from "../ui/enhanced-switch";

export const SwitchDemo = () => {
  const [switches, setSwitches] = useState({
    basic: false,
    enhanced: false,
    success: false,
    warning: false,
    error: false,
    withLabel: false,
    small: false,
    large: false,
  });

  const handleSwitchChange = (key: string) => (checked: boolean) => {
    setSwitches(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Switch Component Demo</h1>
          <p className="text-gray-600">测试优化后的开关组件动效</p>
        </div>

        {/* 基础开关 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">基础开关 (优化后)</h2>
          <div className="flex items-center gap-4">
            <Switch
              checked={switches.basic}
              onCheckedChange={handleSwitchChange('basic')}
            />
            <span className="text-sm text-gray-600">
              状态: {switches.basic ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* 增强开关 - 不同变体 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">增强开关 - 不同颜色变体</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="default"
                checked={switches.enhanced}
                onCheckedChange={handleSwitchChange('enhanced')}
              />
              <span className="text-sm text-gray-600">默认 (蓝色)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="success"
                checked={switches.success}
                onCheckedChange={handleSwitchChange('success')}
              />
              <span className="text-sm text-gray-600">成功 (绿色)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="warning"
                checked={switches.warning}
                onCheckedChange={handleSwitchChange('warning')}
              />
              <span className="text-sm text-gray-600">警告 (黄色)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="error"
                checked={switches.error}
                onCheckedChange={handleSwitchChange('error')}
              />
              <span className="text-sm text-gray-600">错误 (红色)</span>
            </div>
          </div>
        </div>

        {/* 带标签的开关 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">带标签的开关</h2>
          <EnhancedSwitch
            showLabel={true}
            checkedLabel="启用"
            uncheckedLabel="禁用"
            checked={switches.withLabel}
            onCheckedChange={handleSwitchChange('withLabel')}
          />
        </div>

        {/* 不同尺寸 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">不同尺寸</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <EnhancedSwitch
                size="sm"
                checked={switches.small}
                onCheckedChange={handleSwitchChange('small')}
              />
              <span className="text-sm text-gray-600">小尺寸</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                size="md"
                checked={switches.enhanced}
                onCheckedChange={handleSwitchChange('enhanced')}
              />
              <span className="text-sm text-gray-600">中等尺寸 (默认)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                size="lg"
                checked={switches.large}
                onCheckedChange={handleSwitchChange('large')}
              />
              <span className="text-sm text-gray-600">大尺寸</span>
            </div>
          </div>
        </div>

        {/* 组合示例 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">组合示例</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">通知推送</h3>
                <p className="text-sm text-gray-500">接收新消息和更新通知</p>
              </div>
              <EnhancedSwitch
                variant="success"
                size="md"
                showLabel={true}
                checkedLabel="开启"
                uncheckedLabel="关闭"
                defaultChecked={true}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">邮件提醒</h3>
                <p className="text-sm text-gray-500">通过邮件接收重要更新</p>
              </div>
              <EnhancedSwitch
                variant="default"
                size="md"
                showLabel={true}
                checkedLabel="开启"
                uncheckedLabel="关闭"
                defaultChecked={false}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">维护模式</h3>
                <p className="text-sm text-gray-500">暂停所有服务进行维护</p>
              </div>
              <EnhancedSwitch
                variant="warning"
                size="md"
                showLabel={true}
                checkedLabel="维护中"
                uncheckedLabel="正常"
                defaultChecked={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};