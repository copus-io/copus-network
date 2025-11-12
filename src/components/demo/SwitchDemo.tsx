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
          <p className="text-gray-600">Testing optimized switch component animations</p>
        </div>

        {/* Basic switch */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Basic Switch (Optimized)</h2>
          <div className="flex items-center gap-4">
            <Switch
              checked={switches.basic}
              onCheckedChange={handleSwitchChange('basic')}
            />
            <span className="text-sm text-gray-600">
              Status: {switches.basic ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Enhanced switches - different variants */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Enhanced Switches - Color Variants</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="default"
                checked={switches.enhanced}
                onCheckedChange={handleSwitchChange('enhanced')}
              />
              <span className="text-sm text-gray-600">Default (Blue)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="success"
                checked={switches.success}
                onCheckedChange={handleSwitchChange('success')}
              />
              <span className="text-sm text-gray-600">Success (Green)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="warning"
                checked={switches.warning}
                onCheckedChange={handleSwitchChange('warning')}
              />
              <span className="text-sm text-gray-600">Warning (Yellow)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                variant="error"
                checked={switches.error}
                onCheckedChange={handleSwitchChange('error')}
              />
              <span className="text-sm text-gray-600">Error (Red)</span>
            </div>
          </div>
        </div>

        {/* Switch with labels */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Switch with Labels</h2>
          <EnhancedSwitch
            showLabel={true}
            checkedLabel="Enabled"
            uncheckedLabel="Disabled"
            checked={switches.withLabel}
            onCheckedChange={handleSwitchChange('withLabel')}
          />
        </div>

        {/* Different sizes */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <EnhancedSwitch
                size="sm"
                checked={switches.small}
                onCheckedChange={handleSwitchChange('small')}
              />
              <span className="text-sm text-gray-600">Small</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                size="md"
                checked={switches.enhanced}
                onCheckedChange={handleSwitchChange('enhanced')}
              />
              <span className="text-sm text-gray-600">Medium (Default)</span>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedSwitch
                size="lg"
                checked={switches.large}
                onCheckedChange={handleSwitchChange('large')}
              />
              <span className="text-sm text-gray-600">Large</span>
            </div>
          </div>
        </div>

        {/* Combined examples */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Combined Examples</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive new messages and update notifications</p>
              </div>
              <EnhancedSwitch
                variant="success"
                size="md"
                showLabel={true}
                checkedLabel="On"
                uncheckedLabel="Off"
                defaultChecked={true}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Email Alerts</h3>
                <p className="text-sm text-gray-500">Receive important updates via email</p>
              </div>
              <EnhancedSwitch
                variant="default"
                size="md"
                showLabel={true}
                checkedLabel="On"
                uncheckedLabel="Off"
                defaultChecked={false}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Maintenance Mode</h3>
                <p className="text-sm text-gray-500">Pause all services for maintenance</p>
              </div>
              <EnhancedSwitch
                variant="warning"
                size="md"
                showLabel={true}
                checkedLabel="Maintenance"
                uncheckedLabel="Normal"
                defaultChecked={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};