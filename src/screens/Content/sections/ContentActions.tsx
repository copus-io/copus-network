import React from 'react';
import { Button } from '@/components/ui/button';
import { ShareDropdown } from '@/components/ui/ShareDropdown';
import { TreasureSection } from '@/components/TreasureSection/TreasureSection';
import { CommentModal } from '@/components/CommentModal/CommentModal';
import { PayConfirmModal } from '@/components/PayConfirmModal/PayConfirmModal';
import { usePayment } from '@/hooks/usePayment';
import { ArticleDetailResponse } from '@/types/article';

// 🔍 SEARCH: content-actions-props
interface ContentActionsProps {
  article: ArticleDetailResponse;
  isLiked: boolean;
  likesCount: number;
  onLikeChange: (isLiked: boolean, count: number) => void;
  onRefetch?: () => void;
}

// 🔍 SEARCH: content-actions-component
export const ContentActions: React.FC<ContentActionsProps> = ({
  article,
  isLiked,
  likesCount,
  onLikeChange,
  onRefetch
}) => {
  const payment = usePayment();

  // 🔍 SEARCH: content-actions-handlers
  const handleUnlockContent = async () => {
    if (!article?.uuid) {
      console.error('Article UUID not available');
      return;
    }

    try {
      await payment.workflow.initializePayment(article.uuid);
    } catch (error) {
      console.error('Failed to initialize payment:', error);
    }
  };

  const handleWalletSelect = async (walletId: string) => {
    if (walletId === 'metamask' || walletId === 'coinbase' || walletId === 'okx') {
      await payment.workflow.setupWallet(walletId);
    }
  };

  const handlePayNow = async () => {
    try {
      await payment.workflow.completePayment();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  // Check if content requires payment
  const requiresPayment = article.isPaidContent;
  const isContentUnlocked = payment.state.unlockedUrl !== null;

  return (
    <>
      {/* Action Buttons Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
          {/* Payment/Unlock Button */}
          {requiresPayment && !isContentUnlocked && (
            <Button
              onClick={handleUnlockContent}
              className="bg-gradient-to-r from-[#f23a00] to-[#ff6b35] hover:from-[#e63500] hover:to-[#ff5722] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              🔓 Unlock Now
            </Button>
          )}

          {/* Action Buttons */}
          <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
            {/* Treasure Button and Collection */}
            <TreasureSection
              article={article}
              isLiked={isLiked}
              likesCount={likesCount}
              onLikeChange={onLikeChange}
              onRefetch={onRefetch}
            />

            {/* Comment Button */}
            <CommentModal
              articleId={article.id.toString()}
              targetType="article"
              onRefetch={onRefetch}
            />

            {/* Share Button */}
            <ShareDropdown
              url={window.location.href}
              title={article.title}
              description={article.description || ''}
            />
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PayConfirmModal
        isOpen={payment.state.isPayConfirmOpen}
        onClose={payment.actions.closePaymentModal}
        onWalletSelect={handleWalletSelect}
        onPayNow={handlePayNow}
        isWalletConnected={payment.state.isWalletConnected}
        walletAddress={payment.state.walletAddress}
        walletBalance={payment.state.walletBalance}
        walletType={payment.state.walletType}
        selectedNetwork={payment.state.selectedNetwork}
        selectedCurrency={payment.state.selectedCurrency}
        onNetworkChange={payment.actions.selectNetwork}
        onCurrencyChange={payment.actions.selectCurrency}
        x402PaymentInfo={payment.state.x402PaymentInfo}
        isPaymentInProgress={payment.state.isPaymentInProgress}
      />
    </>
  );
};