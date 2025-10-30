import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../components/ui/toast";
import { ContentPageSkeleton } from "../../components/ui/skeleton";
import { useArticleDetail } from "../../hooks/queries";
import { getCategoryStyle, getCategoryInlineStyle } from "../../utils/categoryStyles";
import { AuthService } from "../../services/authService";
import { TreasureButton } from "../../components/ui/TreasureButton";
import { ShareDropdown } from "../../components/ui/ShareDropdown";
import { ArticleDetailResponse } from "../../types/article";
import profileDefaultAvatar from "../../assets/images/profile-default.svg";
import { WalletSignInModal } from "../../components/WalletSignInModal/WalletSignInModal";
import { PayConfirmModal } from "../../components/PayConfirmModal/PayConfirmModal";
import {
  generateNonce,
  signTransferWithAuthorization,
  createX402PaymentHeader
} from "../../utils/x402Utils";


// Image URL validation and fallback function
const getValidDetailImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Check if it's a blob URL (from file upload) - these URLs don't work in new sessions
  if (imageUrl.startsWith('blob:')) {
    // Return placeholder as blob URLs are invalid after page refresh
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VcGxvYWRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Check if it's a valid HTTP/HTTPS URL
  try {
    const url = new URL(imageUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return imageUrl;
    } else {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
    }
  } catch (error) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
  }
};

export const Content = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getArticleLikeState, updateArticleLikeState } = useUser();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // x402 payment modal states
  const [isWalletSignInOpen, setIsWalletSignInOpen] = useState(false);
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('0');

  // x402 payment info from API
  const [x402PaymentInfo, setX402PaymentInfo] = useState<{
    payTo: string;
    asset: string;
    amount: string;
    network: string;
    resource: string;
  } | null>(null);

  // Use new article detail API hook
  const { article, loading, error } = useArticleDetail(id || '');

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Debug: Log article data to check arChainId and payment info
  useEffect(() => {
    if (article) {
      console.log('📄 Article data:', article);
      console.log('🔗 arChainId:', article.arChainId);
      console.log('💰 Payment info:', {
        targetUrlIsLocked: article.targetUrlIsLocked,
        priceInfo: article.priceInfo
      });
    }
  }, [article]);

  // Convert API data to format needed by page
  const content = article ? {
    id: article.uuid,
    title: article.title,
    description: article.content,
    coverImage: article.coverUrl,
    url: article.targetUrl,
    category: article.categoryInfo?.name || 'General',
    categoryApiColor: article.categoryInfo?.color,
    categoryStyle: getCategoryStyle(article.categoryInfo?.name || 'General', article.categoryInfo?.color),
    categoryInlineStyle: getCategoryInlineStyle(article.categoryInfo?.color),
    userName: article.authorInfo?.username || 'Anonymous',
    userId: article.authorInfo?.id,
    userNamespace: article.authorInfo?.namespace,
    userAvatar: article.authorInfo?.faceUrl && article.authorInfo.faceUrl.trim() !== '' ? article.authorInfo.faceUrl : profileDefaultAvatar,
    date: new Date(article.createAt * 1000).toLocaleDateString(),
    treasureCount: article.likeCount || 0,
    visitCount: `${article.viewCount || 0} Visits`,
    likes: article.likeCount || 0,
    isLiked: article.isLiked || false,
    website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com',
  } : null;

  // Debug: Log author info
  if (article) {
    console.log('[Content] Author info:', {
      username: article.authorInfo?.username,
      faceUrl: article.authorInfo?.faceUrl,
      faceUrlLength: article.authorInfo?.faceUrl?.length,
      faceUrlIsEmpty: article.authorInfo?.faceUrl === '',
      namespace: article.authorInfo?.namespace,
      finalAvatar: content?.userAvatar
    });
  }

  // Set like state when article data is fetched
  useEffect(() => {
    if (content && article) {
      // Get global state or use API data
      const globalState = getArticleLikeState(article.uuid, content.isLiked, content.likes);
      setIsLiked(globalState.isLiked);
      setLikesCount(globalState.likeCount);
    }
  }, [content, article, getArticleLikeState]);

  if (loading) {
    return <ContentPageSkeleton />;
  }

  // 检查是否是文章被删除的情况
  const isArticleDeleted = error && (
    error.includes('not found') || 
    error.includes('不存在') || 
    error.includes('deleted') || 
    error.includes('删除') ||
    error.includes('404')
  );

  if (error || (!loading && !content)) {
    return (
      <div className="min-h-screen w-full flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
        <div className="flex mt-0 w-full min-h-screen ml-0 relative flex-col items-start">
          <HeaderSection isLoggedIn={!!user} />

          <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] flex items-center justify-center pt-[70px] lg:pt-[120px]">
            <div className="text-center p-8 max-w-md">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {isArticleDeleted ? 'The content has been deleted' : (error ? 'Oops! Something went wrong' : 'Content not found')}
              </h1>
              <p className="text-gray-600 mb-6">
                {isArticleDeleted
                  ? 'This content has been removed by the author.'
                  : (error
                    ? 'We encountered an issue while loading this content. Please try again later.'
                    : 'The content you are looking for might have been removed or does not exist.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-red text-white rounded-full hover:bg-red/90 transition-colors font-medium"
                >
                  Explore More Content
                </Link>
                {!isArticleDeleted && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reload Page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!content || !article) return;

    if (!user) {
      showToast('Please log in to treasure this content', 'error', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    try {
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

      // Update local state immediately
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // Update global state simultaneously
      updateArticleLikeState(article.uuid, newIsLiked, newLikesCount);

      // Call API
      await AuthService.likeArticle(article.uuid);
      showToast(newIsLiked ? 'Treasured 💖' : 'Untreasured', 'success');

    } catch (error) {
      // Rollback state on API failure
      const originalIsLiked = !isLiked;
      const originalLikesCount = originalIsLiked ? likesCount - 1 : likesCount + 1;

      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      updateArticleLikeState(article.uuid, originalIsLiked, originalLikesCount);

      console.error('Like operation failed:', error);
      showToast('Operation failed, please try again', 'error');
    }
  };


  const handleUserClick = () => {
    if (!content?.userNamespace) return;

    // If logged in and it's the current user's own article, navigate to my treasury page
    if (user && user.id === content.userId) {
      navigate('/my-treasury');
    } else {
      // Navigate to the user's profile page using short link format
      navigate(`/u/${content.userNamespace}`);
    }
  };

  // Handle unlock button click - opens payment flow
  const handleUnlock = async () => {
    // Check if user is logged in
    if (!user) {
      showToast('Please log in first to unlock content', 'error');
      navigate('/login');
      return;
    }

    if (!article?.uuid) {
      showToast('Article information not available', 'error');
      return;
    }

    try {
      // Fetch x402 payment information
      const x402Url = `https://api-test.copus.network/copus-node-api/api/x402/getUrl?uuid=${article.uuid}`;
      const response = await fetch(x402Url);
      const data = await response.json();

      if (data.accepts && data.accepts.length > 0) {
        const paymentOption = data.accepts[0];

        // Store payment info
        setX402PaymentInfo({
          payTo: paymentOption.payTo,
          asset: paymentOption.asset,
          amount: paymentOption.maxAmountRequired,
          network: paymentOption.network,
          resource: paymentOption.resource
        });

        // Show wallet connection modal
        setIsWalletSignInOpen(true);
      } else {
        showToast('Payment information not available', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch x402 payment info:', error);
      showToast('Failed to load payment information. Please try again.', 'error');
    }
  };

  // Handle wallet selection
  const handleWalletSelect = async (walletId: string) => {
    // Handle MetaMask wallet connection
    if (walletId === 'metamask') {
      try {
        // Check if user is logged in
        if (!user) {
          showToast('Please log in first to make payments', 'error');
          navigate('/login');
          return;
        }

        // Check if MetaMask is installed
        if (!window.ethereum) {
          showToast('Please install MetaMask wallet first', 'error');
          return;
        }

        // Connect MetaMask to get accounts - this will show MetaMask popup
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Use the first account returned (the one user selected in the popup)
        const address = accounts[0];

        if (!address) {
          showToast('No account selected in MetaMask. Please select an account and try again.', 'error');
          return;
        }

        // Store wallet address
        setWalletAddress(address);

        // Fetch USDC balance on Base Sepolia
        // USDC contract address on Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
        const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

        try {
          // Get USDC balance using eth_call (ERC-20 balanceOf)
          // balanceOf function signature: 0x70a08231
          const data = '0x70a08231' + address.slice(2).padStart(64, '0');

          const balance = await window.ethereum.request({
            method: 'eth_call',
            params: [{
              to: usdcContractAddress,
              data: data
            }, 'latest']
          });

          // Convert from hex to decimal and adjust for 6 decimals (USDC has 6 decimals)
          const balanceInSmallestUnit = parseInt(balance, 16);
          const balanceInUSDC = (balanceInSmallestUnit / 1000000).toFixed(2);

          setWalletBalance(balanceInUSDC);
          showToast('MetaMask wallet connected successfully! 🎉', 'success');
        } catch (balanceError) {
          console.error('Failed to fetch USDC balance:', balanceError);
          // Still proceed even if balance fetch fails
          setWalletBalance('0.00');
          showToast('MetaMask wallet connected! (Unable to fetch balance)', 'success');
        }

        // Close wallet modal and open payment confirmation
        setIsWalletSignInOpen(false);
        setIsPayConfirmOpen(true);
      } catch (error) {
        console.error('MetaMask connection error:', error);

        // Handle user rejection
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            showToast('MetaMask connection cancelled', 'info');
          } else {
            showToast(`MetaMask connection failed: ${error.message}`, 'error');
          }
        } else {
          showToast('MetaMask connection failed. Please try again.', 'error');
        }
      }
    } else {
      // For other wallets, just show the payment modal for now
      showToast(`${walletId} wallet integration coming soon`, 'info');
      setIsWalletSignInOpen(false);
      setIsPayConfirmOpen(true);
    }
  };

  // Handle payment confirmation using x402 protocol with ERC-3009 TransferWithAuthorization
  const handlePayNow = async () => {
    if (!x402PaymentInfo) {
      showToast('Payment information not available', 'error');
      return;
    }

    if (!walletAddress) {
      showToast('Wallet not connected', 'error');
      return;
    }

    try {
      // Step 1: Check if user is on the correct network (Base Sepolia = 84532 in hex = 0x14a34)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const baseSepoliaChainId = '0x14a34'; // 84532 in hex

      if (chainId !== baseSepoliaChainId) {
        // Request network switch
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: baseSepoliaChainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: baseSepoliaChainId,
                  chainName: 'Base Sepolia',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.base.org'],
                  blockExplorerUrls: ['https://sepolia.basescan.org']
                }],
              });
            } catch (addError) {
              showToast('Failed to add Base Sepolia network', 'error');
              return;
            }
          } else {
            showToast('Please switch to Base Sepolia network', 'error');
            return;
          }
        }
      }

      // Step 2: Generate gasless payment authorization using ERC-3009 TransferWithAuthorization
      showToast('Please sign the payment authorization in MetaMask...', 'info');

      // Generate random nonce for this authorization
      const nonce = generateNonce();

      // Set validity window: valid now and for the next 1 hour
      const now = Math.floor(Date.now() / 1000);
      const validAfter = now;
      const validBefore = now + 3600; // 1 hour from now

      // Sign the TransferWithAuthorization message (EIP-712)
      // This is gasless - user only signs a message, doesn't execute a transaction
      const signedAuth = await signTransferWithAuthorization({
        from: walletAddress,
        to: x402PaymentInfo.payTo,
        value: x402PaymentInfo.amount,
        validAfter,
        validBefore,
        nonce
      }, window.ethereum);

      console.log('✅ Signed TransferWithAuthorization:', signedAuth);

      // Step 3: Create X-PAYMENT header with base64-encoded signed authorization
      const paymentHeader = createX402PaymentHeader(signedAuth);

      console.log('📤 X-PAYMENT header:', paymentHeader);

      // Step 4: Call x402 API with signed payment authorization to unlock content
      showToast('Payment authorization signed! Unlocking content...', 'success');

      const unlockResponse = await fetch(x402PaymentInfo.resource, {
        headers: {
          'X-PAYMENT': paymentHeader
        }
      });

      // Check response status
      if (!unlockResponse.ok) {
        const errorText = await unlockResponse.text();
        console.error('Unlock API error:', unlockResponse.status, errorText);
        throw new Error(`Server returned ${unlockResponse.status}: ${errorText}`);
      }

      const unlockData = await unlockResponse.json();

      if (unlockData.targetUrl) {
        // Successfully unlocked! Open the target URL
        showToast('Content unlocked successfully! 🎉', 'success');
        setIsPayConfirmOpen(false);

        // Open the unlocked URL in a new tab
        window.open(unlockData.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast('Failed to unlock content. Please contact support.', 'error');
      }

    } catch (error: any) {
      console.error('Payment error:', error);

      if (error.code === 4001) {
        showToast('Signature cancelled', 'info');
      } else {
        showToast(`Payment failed: ${error.message || 'Unknown error'}`, 'error');
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="9091:54529"
    >
      <div className="flex mt-0 w-full min-h-screen ml-0 relative flex-col items-start">
        <HeaderSection isLoggedIn={!!user} />

        <main className="flex flex-col items-start gap-[30px] pt-[70px] lg:pt-[120px] pb-[120px] px-4 relative flex-1 w-full max-w-[1040px] mx-auto grow">
          <article className="flex flex-col items-start justify-between pt-0 pb-[30px] px-0 relative flex-1 self-stretch w-full grow border-b-2 [border-bottom-style:solid] border-[#E0E0E0]">
            <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
              <div className="flex flex-col lg:flex-row items-start gap-[40px] pt-0 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col lg:h-[205px] items-start justify-start relative flex-1 grow gap-6">
                  <span
                    className={`relative flex items-center justify-center w-fit [font-family:'Lato',Helvetica] font-medium text-sm text-center tracking-[0.5px] leading-4 whitespace-nowrap capitalize ${
                      content.categoryApiColor ? '' : content.categoryStyle.text
                    }`}
                    style={content.categoryApiColor ? { color: content.categoryInlineStyle.color } : undefined}
                  >
                    {content.category}
                  </span>

                  {/* Title with x402 payment badge inline */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 w-full">
                      {/* Payment badge - show if content is locked */}
                      {article?.targetUrlIsLocked && article?.priceInfo && (
                        <div className="h-[34px] px-2.5 py-[5px] border border-solid border-[#0052ff] bg-white rounded-[50px] inline-flex items-center gap-[3px] flex-shrink-0">
                          <img
                            className="relative w-[22px] h-5 aspect-[1.11]"
                            alt="x402 icon"
                            src="https://c.animaapp.com/I7dLtijI/img/x402-icon-blue-2@2x.png"
                          />
                          <span className="[font-family:'Lato',Helvetica] font-semibold text-[#0052ff] text-xl tracking-[0] leading-5 whitespace-nowrap">
                            {article.priceInfo.price}
                          </span>
                        </div>
                      )}

                      <h1
                        className="relative flex-1 [font-family:'Lato',Helvetica] font-semibold text-[#231f20] text-[36px] lg:text-[40px] tracking-[-0.5px] leading-[44px] lg:leading-[50px] break-all overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          overflow: 'hidden',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {content.title}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="relative w-full lg:w-[364px] h-[205px] rounded-lg aspect-[1.78] bg-[url(https://c.animaapp.com/5EW1c9Rn/img/image@2x.png)] bg-cover bg-[50%_50%]"
                     style={{
                       backgroundImage: `url(${getValidDetailImageUrl(content.coverImage)})`
                     }}
                />
              </div>

              <blockquote className="flex flex-col items-start gap-5 p-5 lg:p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                <div className="flex items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex items-end justify-center self-stretch w-fit whitespace-nowrap relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
                    &quot;
                  </div>

                  <p
                    className="relative flex-1 mt-[-1.00px] [font-family:'Lato',Helvetica] font-light text-off-black text-xl tracking-[0] leading-[32.0px]"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {content.description}
                  </p>

                  <div className="flex items-end justify-center self-stretch w-5 relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
                    &quot;
                  </div>
                </div>

                <cite
                  className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] not-italic cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onClick={handleUserClick}
                  title={`View ${content.userName}'s profile`}
                >
                  <img
                    className="w-[25px] h-[25px] object-cover relative aspect-[1] rounded-full"
                    alt="Profile image"
                    src={content.userAvatar}
                  />

                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap hover:text-blue-600 transition-colors duration-200">
                    {content.userName}
                  </span>
                </cite>
              </blockquote>
            </div>

            <div className="flex h-[25px] items-center justify-between relative self-stretch w-full mt-[50px]">
              <time className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px] whitespace-nowrap">
                {content.date}
              </time>

              <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
                  <img
                    className="relative w-[21px] h-[15px] aspect-[1.4]"
                    alt="Ic view"
                    src="https://c.animaapp.com/5EW1c9Rn/img/ic-view.svg"
                  />

                  <span className="mt-[-1.00px] relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg text-center tracking-[0] leading-5 whitespace-nowrap">
                    {article?.viewCount || 0}
                  </span>
                </div>

                {/* Arweave onchain storage link - Always show as clickable */}
                <div
                  className="relative w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                  title={article?.arChainId ? "View on Arweave" : "Arweave storage not available"}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🔍 Arweave icon clicked');
                    console.log('📦 Article object:', article);
                    console.log('🔗 arChainId value:', article?.arChainId);

                    if (!article?.arChainId) {
                      console.warn('⚠️ No arChainId available for this article - cannot redirect to Arweave');
                      console.log('💡 Full article data:', JSON.stringify(article, null, 2));
                    } else {
                      const arweaveUrl = `https://arseed.web3infra.dev/${article.arChainId}`;
                      console.log('✅ Opening Arweave URL in new tab:', arweaveUrl);
                      window.open(arweaveUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <img
                    className="w-full h-full"
                    alt="Arweave ar logo"
                    src="https://c.animaapp.com/5EW1c9Rn/img/arweave-ar-logo-1.svg"
                  />
                </div>
              </div>
            </div>
          </article>
        </main>

        {/* Sticky bottom button bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E0E0E0] py-5 px-4 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center w-full max-w-[1040px] mx-auto">
            <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
              {/* Use unified treasure button component - large size suitable for detail page */}
              <TreasureButton
                isLiked={isLiked}
                likesCount={likesCount}
                onClick={handleLike}
                size="large"
              />

              {/* Share dropdown menu */}
              <ShareDropdown
                title={content.title}
                url={window.location.href}
              />
            </div>

{/* Conditional button - "Unlock now" for locked content, "Visit" for free content */}
            {article?.targetUrlIsLocked ? (
              <button
                onClick={handleUnlock}
                className="h-[46px] gap-2.5 px-5 py-2 bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] inline-flex items-center relative flex-[0_0_auto] rounded-[50px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] hover:bg-[linear-gradient(0deg,rgba(0,82,255,0.9)_0%,rgba(0,82,255,0.9)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] transition-all active:scale-95"
              >
                <span className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                  <img
                    className="relative w-[27px] h-[25px] aspect-[1.09]"
                    alt="x402 icon"
                    src="https://c.animaapp.com/2ALjTCkW/img/x402-icon-blue-1@2x.png"
                  />
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-[#ffffff] text-xl tracking-[0] leading-5 whitespace-nowrap">
                    Unlock now
                  </span>
                </span>
              </button>
            ) : (
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-[15px] px-5 lg:px-[30px] py-2 relative flex-[0_0_auto] bg-red rounded-[100px] border border-solid border-red no-underline hover:bg-red/90 transition-colors"
              >
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                  Visit
                </span>

                <img
                  className="relative w-[31px] h-[14.73px] mr-[-1.00px]"
                  alt="Arrow"
                  src="https://c.animaapp.com/5EW1c9Rn/img/arrow-1.svg"
                />
              </a>
            )}
          </div>
        </div>

        {/* x402 Payment Modals */}
        <WalletSignInModal
          isOpen={isWalletSignInOpen}
          onClose={() => setIsWalletSignInOpen(false)}
          onWalletSelect={handleWalletSelect}
        />

        <PayConfirmModal
          isOpen={isPayConfirmOpen}
          onClose={() => setIsPayConfirmOpen(false)}
          onPayNow={handlePayNow}
          walletAddress={walletAddress || 'Not connected'}
          availableBalance={`${walletBalance} USDC`}
          amount={article?.priceInfo ? `${article.priceInfo.price} ${article.priceInfo.currency}` : '0.01 USDC'}
          network="Base Sepolia"
          isInsufficientBalance={x402PaymentInfo ? parseFloat(walletBalance) < (parseInt(x402PaymentInfo.amount) / 1000000) : false}
        />
      </div>
    </div>
  );
};