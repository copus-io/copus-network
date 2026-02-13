import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/toast';
import { SpacePaymentService } from '../../services/spacePaymentService';
import { PaymentType, CurrencyType } from '../../types/space';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (spaceId: number) => void;
}

export const CreateSpaceModal = ({ isOpen, onClose, onSuccess }: CreateSpaceModalProps): JSX.Element => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    paymentType: 'free' as PaymentType,
    unlockPrice: 0,
    currency: 'USDT' as CurrencyType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        paymentType: 'free',
        unlockPrice: 0,
        currency: 'USDT',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Space name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Space name must be 50 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Space description is required';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    if (formData.paymentType === 'paid' || formData.paymentType === 'hybrid') {
      if (formData.unlockPrice <= 0) {
        newErrors.unlockPrice = 'Price must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, we'll simulate creating a space
      // In real implementation, this would call a space creation API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock space ID
      const mockSpaceId = Math.floor(Math.random() * 1000) + 100;

      // If payment is enabled, configure the payment settings
      if (formData.paymentType !== 'free') {
        await SpacePaymentService.setSpacePaymentConfig(mockSpaceId, {
          paymentType: formData.paymentType,
          unlockPrice: formData.unlockPrice,
          currency: formData.currency,
        });
      }

      showToast('Space created successfully!', 'success');
      onSuccess(mockSpaceId);
      onClose();

    } catch (error) {
      console.error('Failed to create space:', error);
      showToast('Failed to create space, please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string | number | PaymentType | CurrencyType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-off-black">Create New Space</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Space Basic Info */}
          <div className="space-y-6">
            {/* Space Name */}
            <div>
              <label htmlFor="space-name" className="block text-sm font-medium text-gray-700 mb-2">
                Space Name *
              </label>
              <Input
                id="space-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter space name..."
                className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.name.length}/50 characters</p>
            </div>

            {/* Space Description */}
            <div>
              <label htmlFor="space-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                id="space-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your space and what visitors can expect to find..."
                className={`w-full h-24 resize-none ${errors.description ? 'border-red-500' : ''}`}
                maxLength={200}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.description.length}/200 characters</p>
            </div>

            {/* Payment Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-off-black mb-4">Payment Settings</h3>

              {/* Payment Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Space Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="free"
                      checked={formData.paymentType === 'free'}
                      onChange={(e) => handleInputChange('paymentType', e.target.value as PaymentType)}
                      className="w-4 h-4 text-red focus:ring-red border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Free Space</strong> - All content is accessible to everyone
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="paid"
                      checked={formData.paymentType === 'paid'}
                      onChange={(e) => handleInputChange('paymentType', e.target.value as PaymentType)}
                      className="w-4 h-4 text-red focus:ring-red border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Paid Space</strong> - Users pay once to unlock all content
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="hybrid"
                      checked={formData.paymentType === 'hybrid'}
                      onChange={(e) => handleInputChange('paymentType', e.target.value as PaymentType)}
                      className="w-4 h-4 text-red focus:ring-red border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Hybrid Space</strong> - Mix of free preview and paid content
                    </span>
                  </label>
                </div>
              </div>

              {/* Price Configuration - Only show for paid/hybrid */}
              {(formData.paymentType === 'paid' || formData.paymentType === 'hybrid') && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Price Configuration</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.unlockPrice}
                        onChange={(e) => handleInputChange('unlockPrice', Number(e.target.value))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full ${errors.unlockPrice ? 'border-red-500' : ''}`}
                      />
                      {errors.unlockPrice && (
                        <p className="mt-1 text-sm text-red-500">{errors.unlockPrice}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value as CurrencyType)}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-red focus:border-red"
                      >
                        <option value="USDT">USDT</option>
                        <option value="USDC">USDC</option>
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Users will pay {SpacePaymentService.formatPrice(formData.unlockPrice || 0, formData.currency)} to unlock this space
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">✨ Space Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Organize your curated content collections</li>
                <li>• Share your expertise with followers</li>
                <li>• Monetize your content curation work</li>
                <li>• Build your personal brand and audience</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red hover:bg-red/90 text-white"
            >
              {loading ? 'Creating...' : 'Create Space'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpaceModal;