import React, { useState, useEffect } from 'react';
import { SpacePaymentService } from '../../services/spacePaymentService';
import { PaymentType, CurrencyType } from '../../types/space';
import { useToast } from '../ui/toast';
import { CustomSwitch } from '../ui/custom-switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface SpacePaymentConfigProps {
  spaceId: number;
  onClose: () => void;
}

export const SpacePaymentConfig = ({ spaceId, onClose }: SpacePaymentConfigProps): JSX.Element => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Payment configuration state
  const [paymentType, setPaymentType] = useState<PaymentType>('free');
  const [unlockPrice, setUnlockPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<CurrencyType>('USDT');
  const [paymentEnabled, setPaymentEnabled] = useState(false);

  // Space info state
  const [spaceInfo, setSpaceInfo] = useState<{
    totalRevenue: number;
    subscriberCount: number;
    freeContentCount: number;
    paidContentCount: number;
  }>({
    totalRevenue: 0,
    subscriberCount: 0,
    freeContentCount: 0,
    paidContentCount: 0
  });

  // Load current payment configuration
  useEffect(() => {
    const loadPaymentInfo = async () => {
      try {
        setLoading(true);
        const paymentInfo = await SpacePaymentService.getSpacePaymentInfo(spaceId);

        setPaymentType(paymentInfo.paymentType);
        setUnlockPrice(paymentInfo.unlockPrice || 0);
        setCurrency(paymentInfo.currency);
        setPaymentEnabled(paymentInfo.paymentType !== 'free');

        setSpaceInfo({
          totalRevenue: paymentInfo.totalRevenue || 0,
          subscriberCount: paymentInfo.subscriberCount || 0,
          freeContentCount: paymentInfo.freeContentCount,
          paidContentCount: paymentInfo.paidContentCount
        });

      } catch (error) {
        console.error('Failed to load payment info:', error);
        showToast('Failed to load payment settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentInfo();
  }, [spaceId, showToast]);

  // Handle payment type change
  const handlePaymentToggle = async (enabled: boolean) => {
    try {
      setSaving(true);

      const newPaymentType: PaymentType = enabled ? 'paid' : 'free';

      await SpacePaymentService.setSpacePaymentConfig(spaceId, {
        paymentType: newPaymentType,
        unlockPrice: enabled ? unlockPrice : undefined,
        currency: enabled ? currency : undefined
      });

      setPaymentEnabled(enabled);
      setPaymentType(newPaymentType);

      showToast(
        enabled ? 'Payment enabled for this space' : 'Payment disabled for this space',
        'success'
      );

    } catch (error) {
      console.error('Failed to toggle payment:', error);
      showToast('Failed to update payment settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle price and currency update
  const handlePriceUpdate = async () => {
    if (!paymentEnabled) return;

    try {
      setSaving(true);

      await SpacePaymentService.setSpacePaymentConfig(spaceId, {
        paymentType: 'paid',
        unlockPrice,
        currency
      });

      showToast('Price updated successfully', 'success');

    } catch (error) {
      console.error('Failed to update price:', error);
      showToast('Failed to update price', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-off-black">Space Payment Settings</h2>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close payment settings"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Payment Enable/Disable Toggle */}
      <div className="flex flex-col gap-4">
        <CustomSwitch
          checked={paymentEnabled}
          onCheckedChange={handlePaymentToggle}
          label="Enable paid space"
          disabled={saving}
          aria-label="Toggle payment for this space"
        />

        <p className="text-sm text-medium-dark-grey">
          {paymentEnabled
            ? 'Users will need to pay to access this space\'s content'
            : 'This space is free for all users to access'
          }
        </p>
      </div>

      {/* Price Configuration - Only show when payment is enabled */}
      {paymentEnabled && (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-off-black">Price Configuration</h3>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="unlock-price" className="block text-sm font-medium text-gray-700 mb-1">
                Unlock Price
              </label>
              <Input
                id="unlock-price"
                type="number"
                value={unlockPrice}
                onChange={(e) => setUnlockPrice(Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full"
              />
            </div>

            <div className="flex-shrink-0">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-red focus:border-red"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handlePriceUpdate}
            disabled={saving || unlockPrice <= 0}
            className="self-start"
          >
            {saving ? 'Updating...' : 'Update Price'}
          </Button>
        </div>
      )}

      {/* Space Statistics */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium text-off-black">Space Statistics</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-medium-dark-grey">Total Revenue</p>
            <p className="text-xl font-semibold text-off-black">
              {SpacePaymentService.formatPrice(spaceInfo.totalRevenue, currency)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-medium-dark-grey">Subscribers</p>
            <p className="text-xl font-semibold text-off-black">
              {spaceInfo.subscriberCount}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-medium-dark-grey">Free Content</p>
            <p className="text-xl font-semibold text-off-black">
              {spaceInfo.freeContentCount}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-medium-dark-grey">Paid Content</p>
            <p className="text-xl font-semibold text-off-black">
              {spaceInfo.paidContentCount}
            </p>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Users pay once to permanently access all content in this space</li>
          <li>• You can mix free and paid content for preview purposes</li>
          <li>• Payments are processed instantly via blockchain</li>
          <li>• Revenue is automatically tracked and displayed above</li>
        </ul>
      </div>
    </div>
  );
};

export default SpacePaymentConfig;