import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/toast';
import { TreasureButton } from '@/components/ui/TreasureButton';
import { CollectTreasureModal } from '@/components/CollectTreasureModal';
import { TreasuryCard, SpaceData } from '@/components/ui/TreasuryCard';
import { apiRequest } from '@/services/api';
import { ArticleDetailResponse } from '@/types/article';

// 🔍 SEARCH: treasure-section-props
interface TreasureSectionProps {
  article: ArticleDetailResponse;
  isLiked: boolean;
  likesCount: number;
  onLikeChange: (isLiked: boolean, count: number) => void;
  onRefetch?: () => void;
}

// 🔍 SEARCH: treasure-section-component
export const TreasureSection: React.FC<TreasureSectionProps> = ({
  article,
  isLiked,
  likesCount,
  onLikeChange,
  onRefetch
}) => {
  const { user, updateArticleLikeState, showToast } = useUser();
  const { showToast: showToastMessage } = useToast();

  // Treasure/collection state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [collectedInData, setCollectedInData] = useState<SpaceData[]>([]);

  // 🔍 SEARCH: treasure-effects
  // Fetch "Collected in" data when article is available
  useEffect(() => {
    const fetchCollectedInData = async () => {
      if (!article?.id) return;

      try {
        console.log('🔍 Fetching collected in data for article:', article.id);

        const response: any = await apiRequest(`/client/user/space/getCollectedInSpaces?articleId=${article.id}`, {
          method: 'GET',
          requiresAuth: true,
        });

        console.log('📦 Collected in spaces response:', response);

        if (response && response.data && Array.isArray(response.data)) {
          const spaces = response.data.map((space: any) => ({
            id: space.id,
            namespace: space.namespace,
            spaceName: space.spaceName,
            spaceDescription: space.spaceDescription,
            articleCount: space.articleCount || 0,
            spaceCreatorName: space.spaceCreatorName,
            spaceCreatorNamespace: space.spaceCreatorNamespace,
            profileFaceUrl: space.profileFaceUrl,
          }));

          console.log('✅ Processed collected in spaces:', spaces);
          setCollectedInData(spaces);
        } else {
          console.log('📦 No collected in data found or invalid format');
          setCollectedInData([]);
        }
      } catch (err) {
        console.error('Failed to fetch collected in data:', err);
        setCollectedInData([]);
      }
    };

    fetchCollectedInData();
  }, [article?.id]);

  // 🔍 SEARCH: treasure-handlers
  const handleTreasureClick = () => {
    if (!user) {
      showToastMessage('Please log in to treasure this content', 'error', {
        action: {
          label: 'Login',
          onClick: () => {
            console.log('Redirect to login');
          }
        }
      });
      return;
    }

    // Always show the collect modal (whether liked or not)
    // User can uncollect from within the modal
    setCollectModalOpen(true);
  };

  const handleSaveComplete = async (isCollected: boolean, collectionCount: number) => {
    try {
      // Update like state based on whether article is now collected or not
      if (isCollected && !isLiked) {
        // Article was collected (liked)
        onLikeChange(true, collectionCount);
        updateArticleLikeState(article.id.toString(), true);
        showToastMessage('Added to your treasury!', 'success');
      } else if (!isCollected && isLiked) {
        // Article was uncollected (unliked)
        onLikeChange(false, collectionCount);
        updateArticleLikeState(article.id.toString(), false);
        showToastMessage('Removed from your treasury', 'info');
      }

      // Refresh the page data after collection changes
      onRefetch?.();
    } catch (error) {
      console.error('Error handling save completion:', error);
      showToastMessage('Failed to update treasury', 'error');
    }
  };

  return (
    <>
      {/* Treasure Button */}
      <TreasureButton
        isLiked={isLiked}
        likesCount={likesCount}
        onClick={handleTreasureClick}
        size="large"
        showCount={true}
        variant="default"
      />

      {/* Collected in spaces section */}
      {collectedInData.length > 0 && (
        <section className="mt-[50px] border-t border-[#D3D3D3] pt-[30px] w-full self-stretch">
          <h2 className="text-xl font-semibold text-[#333] mb-6">
            Collected in {collectedInData.length} {collectedInData.length === 1 ? 'Space' : 'Spaces'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectedInData.map((space) => (
              <TreasuryCard
                key={space.namespace || space.id?.toString()}
                spaceData={space}
                showArticleCount={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Collect Treasure Modal */}
      <CollectTreasureModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        targetType="article"
        targetId={article.id.toString()}
        targetUuid={article.uuid}
        isAlreadyCollected={isLiked}
        onSaveComplete={handleSaveComplete}
      />
    </>
  );
};