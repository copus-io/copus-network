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
import { ArticleDetailResponse, X402PaymentInfo } from "../../types/article";
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
  const { user, getArticleLikeState, updateArticleLikeState, login, fetchUserInfo } = useUser();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // ========================================
  // x402 Payment Protocol State Management
  // ========================================
  // The x402 protocol enables pay-per-view content using HTTP 402 Payment Required.
  // We use ERC-3009 TransferWithAuthorization for gasless USDC payments on Base Sepolia.
  // Users sign a message (no gas) and the server executes the transfer on their behalf.

  // Payment modal visibility states
  const [isWalletSignInOpen, setIsWalletSignInOpen] = useState(false);  // Wallet selection modal
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);      // Payment confirmation modal

  // Connected wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');       // User's wallet address (0x...)
  const [walletBalance, setWalletBalance] = useState<string>('0');      // USDC balance (e.g., "1.50")
  const [walletProvider, setWalletProvider] = useState<any>(null);      // EIP-1193 provider (MetaMask, Coinbase Wallet, etc.)
  const [walletType, setWalletType] = useState<string>('');             // Wallet type: 'metamask' or 'coinbase'

  // Payment details from 402 API response
  // Contains: payTo (recipient), asset (USDC contract), amount, network, resource (unlock URL)
  const [x402PaymentInfo, setX402PaymentInfo] = useState<X402PaymentInfo | null>(null);

  // Unlocked content URL after successful payment
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);

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
    visitCount: `${article.viewCount || 0}`,
    likes: article.likeCount || 0,
    isLiked: article.isLiked || false,
    website: article.targetUrl ? new URL(article.targetUrl).hostname.replace('www.', '') : 'website.com',
  } : null;

  // Debug: Log author info (only once when article loads)
  // Removed to prevent console spam from re-render loops

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

  // ========================================
  // Step 1: Fetch x402 Payment Information
  // ========================================
  // When user clicks "Unlock now", we fetch payment details from the x402 API.
  // This API returns payment options including recipient, amount, network, and unlock URL.
  // No login required - account will be auto-created when wallet connects.
  const handleUnlock = async () => {
    if (!article?.uuid) {
      showToast('Article information not available', 'error');
      return;
    }

    try {
      // Call x402 API to get payment options for this article
      // Response format: { accepts: [{ payTo, asset, maxAmountRequired, network, resource, ... }] }
      const x402Url = `https://api-test.copus.network/client/payment/getTargetUrl?uuid=${article.uuid}`;
      const response = await fetch(x402Url);
      const data = await response.json();

      if (data.accepts && data.accepts.length > 0) {
        // Extract first payment option (we use USDC on Base Sepolia)
        const paymentOption = data.accepts[0];

        console.log('📥 Received 402 payment option:', paymentOption);

        // Store payment details in state for later use in handlePayNow
        // Always construct the resource URL with UUID to ensure backend receives it
        const resourceUrl = `https://api-test.copus.network/client/payment/getTargetUrl?uuid=${article.uuid}`;

        const paymentInfo = {
          payTo: paymentOption.payTo,              // Recipient wallet address
          asset: paymentOption.asset,              // USDC contract address (0x036CbD...)
          amount: paymentOption.maxAmountRequired, // Amount in smallest unit (e.g., "10000" = 0.01 USDC)
          network: paymentOption.network,          // Network identifier ("base-sepolia")
          resource: resourceUrl                    // API endpoint to unlock content after payment (with UUID)
        };

        console.log('💾 Storing payment info with resource URL:', paymentInfo);
        setX402PaymentInfo(paymentInfo);

        // Check if user is already logged in with a wallet
        const authMethod = localStorage.getItem('copus_auth_method');
        const isWalletUser = authMethod === 'metamask' || authMethod === 'coinbase';

        if (user && isWalletUser && user.walletAddress) {
          // User is already logged in with a wallet - skip wallet selection modal
          // and go directly to payment confirmation with their logged-in wallet
          console.log('✅ User already logged in with wallet:', user.walletAddress);
          console.log('🔄 Auth method:', authMethod);

          // Store wallet address immediately
          setWalletAddress(user.walletAddress);
          setWalletType(authMethod);

          // Show payment modal immediately with loading state
          setIsPayConfirmOpen(true);
          setWalletBalance('...'); // Loading indicator

          // Set up wallet connection and fetch balance in background
          setupLoggedInWallet(user.walletAddress, authMethod).catch(error => {
            console.error('Failed to setup wallet:', error);
            setWalletBalance('0.00');
          });
        } else {
          // User is not logged in OR logged in with email - show wallet selection modal
          console.log('📱 Opening wallet selection modal');
          setIsWalletSignInOpen(true);
        }
      } else {
        showToast('Payment information not available', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch x402 payment info:', error);
      showToast('Failed to load payment information. Please try again.', 'error');
    }
  };

  // Helper function to set up wallet connection for already logged-in wallet users
  const setupLoggedInWallet = async (walletAddress: string, authMethod: string) => {
    try {
      console.log('🔧 Setting up wallet for logged-in user...');

      // Detect the correct provider based on auth method
      let provider = null;
      let walletName = '';

      if (authMethod === 'metamask') {
        // For MetaMask, we need to ensure we're NOT using Coinbase Wallet's injected provider
        // when both wallets are installed
        if (!window.ethereum) {
          showToast('MetaMask wallet not found. Please install MetaMask extension.', 'error');
          setIsWalletSignInOpen(true); // Fall back to wallet selection
          return;
        }

        // Check providers array first to find the correct wallet
        if ((window.ethereum as any)?.providers && Array.isArray((window.ethereum as any).providers)) {
          console.log('Multiple wallet providers detected, searching for MetaMask...');
          const providers = (window.ethereum as any).providers;

          // Find MetaMask provider (must have isMetaMask and NOT be Coinbase)
          const metamaskProvider = providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet);

          if (metamaskProvider) {
            provider = metamaskProvider;
            console.log('Found MetaMask provider in providers array');
          } else {
            showToast('MetaMask not found. Please ensure MetaMask is installed.', 'error');
            setIsWalletSignInOpen(true);
            return;
          }
        } else {
          // Single wallet installed - check if it's MetaMask
          if (window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
            provider = window.ethereum;
            console.log('Using window.ethereum as MetaMask provider');
          } else {
            showToast('MetaMask not found. Please install MetaMask extension.', 'error');
            setIsWalletSignInOpen(true);
            return;
          }
        }
        walletName = 'MetaMask';
      } else if (authMethod === 'coinbase') {
        // Detect Coinbase Wallet provider
        if (window.ethereum?.isCoinbaseWallet) {
          provider = window.ethereum;
        } else if ((window as any).coinbaseWalletExtension) {
          provider = (window as any).coinbaseWalletExtension;
        } else if ((window.ethereum as any)?.providers) {
          // Try to find Coinbase Wallet in providers array
          const coinbaseProvider = (window.ethereum as any).providers.find((p: any) => p.isCoinbaseWallet);
          if (coinbaseProvider) {
            provider = coinbaseProvider;
          } else {
            showToast('Coinbase Wallet not found. Please install Coinbase Wallet extension.', 'error');
            setIsWalletSignInOpen(true);
            return;
          }
        } else {
          showToast('Coinbase Wallet not found. Please install Coinbase Wallet extension.', 'error');
          setIsWalletSignInOpen(true); // Fall back to wallet selection
          return;
        }
        walletName = 'Coinbase Wallet';
      }

      if (!provider) {
        showToast('Wallet provider not found', 'error');
        setIsWalletSignInOpen(true);
        return;
      }

      // Store wallet info
      setWalletAddress(walletAddress);
      setWalletProvider(provider);
      setWalletType(authMethod);

      // Fetch USDC balance on Base Sepolia
      const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
      const baseSepoliaChainId = '0x14a34'; // 84532 in hex

      try {
        // Check if we're on Base Sepolia network
        const currentChainId = await provider.request({ method: 'eth_chainId' });
        console.log('🌐 Current network:', currentChainId, 'Expected:', baseSepoliaChainId);

        // If not on Base Sepolia, try to switch
        if (currentChainId !== baseSepoliaChainId) {
          console.log('🔄 Switching to Base Sepolia network...');
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: baseSepoliaChainId }],
            });
            console.log('✅ Network switched successfully');
          } catch (switchError: any) {
            // Error code 4902: Chain not added yet
            if (switchError.code === 4902) {
              console.log('➕ Adding Base Sepolia network...');
              await provider.request({
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
              console.log('✅ Network added successfully');
            } else {
              throw switchError;
            }
          }
        }

        // Fetch USDC balance
        const data = '0x70a08231' + walletAddress.slice(2).padStart(64, '0');
        console.log('💰 Fetching USDC balance for:', walletAddress);

        const balance = await provider.request({
          method: 'eth_call',
          params: [{
            to: usdcContractAddress,
            data: data
          }, 'latest']
        });

        console.log('📊 Raw balance response:', balance);

        const balanceInSmallestUnit = parseInt(balance, 16);
        const balanceInUSDC = (balanceInSmallestUnit / 1000000).toFixed(2);

        console.log('💵 USDC Balance:', balanceInUSDC);
        setWalletBalance(balanceInUSDC);

        // Modal is already open from handleUnlock, just update balance
        // setIsPayConfirmOpen(true); // Commented out - modal already shown
      } catch (balanceError: any) {
        console.error('❌ Failed to fetch USDC balance:', balanceError);
        console.error('Error details:', {
          message: balanceError?.message,
          code: balanceError?.code,
          data: balanceError?.data
        });
        setWalletBalance('0.00');
        // Modal is already shown from handleUnlock
        // setIsPayConfirmOpen(true); // Commented out - modal already shown
      }
    } catch (error: any) {
      console.error('Failed to set up logged-in wallet:', error);
      showToast('Failed to connect to your wallet. Please try again.', 'error');
      // Fall back to wallet selection modal
      setIsWalletSignInOpen(true);
    }
  };

  // ========================================
  // Step 2: Connect Wallet and Fetch Balance
  // ========================================
  // After user selects a wallet, we connect to it and fetch their USDC balance.
  // Currently supports MetaMask (other wallets coming soon).
  // NOTE: No login required! We auto-create an account when wallet connects.
  const handleWalletSelect = async (walletId: string) => {
    // Handle MetaMask wallet connection
    if (walletId === 'metamask') {
      try {
        // Detect the correct MetaMask provider
        // When multiple wallets are installed, they inject into window.ethereum.providers array
        let metamaskProvider = null;

        if (!window.ethereum) {
          showToast('Please install MetaMask wallet first', 'error');
          return;
        }

        // Check providers array first to find the correct wallet
        if ((window.ethereum as any)?.providers && Array.isArray((window.ethereum as any).providers)) {
          console.log('Multiple wallet providers detected, searching for MetaMask...');
          const providers = (window.ethereum as any).providers;

          // Find MetaMask provider (must have isMetaMask and NOT be Coinbase)
          metamaskProvider = providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet);

          if (!metamaskProvider) {
            showToast('MetaMask not found. Please ensure MetaMask is installed.', 'error');
            return;
          }
          console.log('Found MetaMask provider in providers array');
        } else {
          // Single wallet installed - check if it's MetaMask
          if (window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
            metamaskProvider = window.ethereum;
            console.log('Using window.ethereum as MetaMask provider');
          } else {
            showToast('MetaMask not found. Please install MetaMask extension.', 'error');
            return;
          }
        }

        // Request wallet connection - ensures user grants permission
        await metamaskProvider.request({ method: 'eth_requestAccounts' });

        // Get the currently selected account AFTER connection is established
        // selectedAddress reflects the account that's currently active in MetaMask UI
        // Note: We must read this AFTER eth_requestAccounts completes to get the latest value
        let address = metamaskProvider.selectedAddress;

        // Fallback: If selectedAddress is not available, get accounts and use first one
        if (!address) {
          const accounts = await metamaskProvider.request({ method: 'eth_accounts' });
          address = accounts[0];
        }

        if (!address) {
          showToast('No account selected in MetaMask. Please select an account and try again.', 'error');
          return;
        }

        console.log('✅ Connected to MetaMask account:', address);

        // Store wallet address and provider for later use in payment authorization
        setWalletAddress(address);
        setWalletProvider(metamaskProvider);
        setWalletType('metamask');

        // ---- Handle wallet connection based on login status ----
        if (!user) {
          // User NOT logged in: Must complete wallet connection and account creation FIRST
          // Then show payment modal after successful login
          showToast('Connecting wallet...', 'info');
          try {

            // Get signature data from backend (snowflake ID that user will sign)
            const signatureDataResponse = await AuthService.getMetamaskSignatureData(address);

            // Extract the actual string from the response object
            // The API returns an object like { data: "snowflake_id_string" }
            let signatureData = signatureDataResponse;
            if (typeof signatureDataResponse !== 'string') {
              if (signatureDataResponse && typeof signatureDataResponse === 'object') {
                if (signatureDataResponse.data) {
                  signatureData = signatureDataResponse.data;
                } else if (signatureDataResponse.message) {
                  signatureData = signatureDataResponse.message;
                } else if (signatureDataResponse.msg) {
                  signatureData = signatureDataResponse.msg;
                } else {
                  // Last resort - stringify the object (shouldn't happen)
                  signatureData = JSON.stringify(signatureDataResponse);
                }
              }
            }

            // Verify we have a valid string to sign
            if (typeof signatureData !== 'string' || !signatureData) {
              throw new Error('Invalid signature data received from server');
            }

            // Request user to sign the message via MetaMask
            // This proves they own the wallet address
            const signature = await metamaskProvider.request({
              method: 'personal_sign',
              params: [signatureData, address],
            });

            // Call backend to create/login account with this wallet
            // Backend creates account if first time, or logs in if account exists
            console.log('🔐 Calling metamaskLogin with address:', address);
            const response = await AuthService.metamaskLogin(address, signature, false);
            console.log('📩 metamaskLogin response:', response);

            // Extract token from response - it's nested in response.data.token
            const token = response?.data?.token || response?.token;
            const namespace = response?.data?.namespace || response?.namespace;

            if (token) {
              // Save token and create basic user object
              const basicUser = { email: '', namespace: namespace || '', walletAddress: address };
              login(basicUser, token);

              // Mark that user logged in via Metamask
              localStorage.setItem('copus_auth_method', 'metamask');

              // Fetch full user info from backend
              try {
                await fetchUserInfo(token);
              } catch (userInfoError) {
                // Silently handle user info fetch error - account is created but info fetch failed
                console.warn('Failed to fetch user info after wallet login:', userInfoError);
              }

              // Account created successfully - now show payment modal
              setIsWalletSignInOpen(false);
              setIsPayConfirmOpen(true);
              setWalletBalance('...'); // Will be updated after balance fetch below
              showToast('MetaMask wallet connected successfully! 🎉', 'success');
            } else {
              // Log what we actually received to help debug
              console.error('❌ No token in response. Full response:', JSON.stringify(response, null, 2));

              // Check if backend returned an error message
              const errorMsg = response?.msg || response?.message || response?.error;
              throw new Error(`Failed to create account - no token received from backend`);
            }
          } catch (accountError: any) {
            console.error('Failed to create account:', accountError);
            console.error('Error details:', {
              message: accountError?.message,
              code: accountError?.code,
              type: typeof accountError
            });

            // Handle MetaMask user rejection (code 4001)
            if (accountError?.code === 4001 || (accountError instanceof Error && accountError.message.includes('User rejected'))) {
              showToast('Signature cancelled. Wallet connection is required for payment.', 'info');
              setIsWalletSignInOpen(true); // Keep wallet modal open so user can try again
              return;
            }

            // Handle other MetaMask/wallet errors
            if (accountError?.code) {
              showToast(`Wallet error (${accountError.code}): ${accountError.message || 'Unknown error'}`, 'error');
              setIsWalletSignInOpen(true);
              return;
            }

            // Handle backend API errors
            if (accountError instanceof Error) {
              showToast(`Wallet connection failed: ${accountError.message}`, 'error');
              console.error('Backend error creating account:', accountError);
              setIsWalletSignInOpen(true);
              return;
            }

            // Unknown error type
            showToast('Wallet connection failed. Please try again or contact support.', 'error');
            setIsWalletSignInOpen(true);
            return;
          }
        } else {
          // User IS logged in: Show payment modal immediately
          setIsWalletSignInOpen(false);
          setIsPayConfirmOpen(true);
          setWalletBalance('...'); // Loading indicator
          showToast('Loading wallet balance...', 'info');
        }

        // ---- Fetch USDC balance on Base Sepolia ----
        // USDC is an ERC-20 token on Base Sepolia at this address
        const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

        try {
          // Call balanceOf(address) function on USDC contract using eth_call
          // ERC-20 balanceOf function signature: 0x70a08231 (keccak256("balanceOf(address)")[:4])
          // Encode parameter: pad address to 32 bytes (64 hex chars)
          const data = '0x70a08231' + address.slice(2).padStart(64, '0');

          // Execute read-only call to USDC contract (no gas required)
          const balance = await metamaskProvider.request({
            method: 'eth_call',
            params: [{
              to: usdcContractAddress,
              data: data
            }, 'latest']
          });

          // Convert balance from hex string to decimal
          // USDC has 6 decimals, so divide by 1,000,000 to get human-readable amount
          // Example: 1000000 (smallest unit) = 1.00 USDC
          const balanceInSmallestUnit = parseInt(balance, 16);
          const balanceInUSDC = (balanceInSmallestUnit / 1000000).toFixed(2);

          setWalletBalance(balanceInUSDC);
          // Success toast already shown after account creation or in else block for logged-in users
        } catch (balanceError) {
          console.error('Failed to fetch USDC balance:', balanceError);
          // Still proceed even if balance fetch fails (user might still have sufficient balance)
          setWalletBalance('0.00');
          showToast('MetaMask wallet connected! (Unable to fetch balance)', 'success');
        }

        // Modal is already open from earlier (line 561), balance has been updated
      } catch (error) {
        console.error('MetaMask connection error:', error);

        // Handle user rejection of wallet connection
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
    } else if (walletId === 'coinbase') {
      // ========================================
      // Coinbase Wallet Integration
      // ========================================
      try {
        if (!window.ethereum) {
          showToast('Please install Coinbase Wallet extension first', 'error');
          return;
        }

        // Detect Coinbase Wallet provider
        let coinbaseProvider = null;

        // When multiple wallets are installed, they inject into window.ethereum.providers array
        // Check providers array first to find the correct wallet
        if ((window.ethereum as any)?.providers && Array.isArray((window.ethereum as any).providers)) {
          console.log('Multiple wallet providers detected, searching for Coinbase Wallet...');
          const providers = (window.ethereum as any).providers;

          // Find Coinbase Wallet provider
          coinbaseProvider = providers.find((p: any) => p.isCoinbaseWallet);

          if (!coinbaseProvider) {
            showToast('Coinbase Wallet not found. Please ensure Coinbase Wallet is installed.', 'error');
            return;
          }
          console.log('Found Coinbase Wallet provider in providers array');
        } else {
          // Single wallet installed - check if it's Coinbase Wallet
          if (window.ethereum.isCoinbaseWallet) {
            coinbaseProvider = window.ethereum;
            console.log('Using window.ethereum as Coinbase Wallet provider');
          } else if ((window as any).coinbaseWalletExtension) {
            coinbaseProvider = (window as any).coinbaseWalletExtension;
            console.log('Using coinbaseWalletExtension as provider');
          } else {
            showToast('Coinbase Wallet not found. Please install Coinbase Wallet extension.', 'error');
            return;
          }
        }

        // Request wallet connection - shows Coinbase Wallet popup for user to select account
        await coinbaseProvider.request({ method: 'eth_requestAccounts' });

        // Get the currently selected account from Coinbase Wallet
        const address = coinbaseProvider.selectedAddress ||
                       (await coinbaseProvider.request({ method: 'eth_accounts' }))[0];

        if (!address) {
          showToast('No account selected in Coinbase Wallet. Please select an account and try again.', 'error');
          return;
        }

        // Store wallet address and provider for later use in payment authorization
        setWalletAddress(address);
        setWalletProvider(coinbaseProvider);
        setWalletType('coinbase');

        // ---- Handle wallet connection based on login status ----
        if (!user) {
          // User NOT logged in: Must complete wallet connection and account creation FIRST
          // Then show payment modal after successful login
          showToast('Connecting wallet...', 'info');
          try {

            // Get signature data from backend (snowflake ID that user will sign)
            const signatureDataResponse = await AuthService.getMetamaskSignatureData(address);

            // Extract the actual string from the response object
            let signatureData = signatureDataResponse;
            if (typeof signatureDataResponse !== 'string') {
              if (signatureDataResponse && typeof signatureDataResponse === 'object') {
                if (signatureDataResponse.data) {
                  signatureData = signatureDataResponse.data;
                } else if (signatureDataResponse.message) {
                  signatureData = signatureDataResponse.message;
                } else if (signatureDataResponse.msg) {
                  signatureData = signatureDataResponse.msg;
                } else {
                  signatureData = JSON.stringify(signatureDataResponse);
                }
              }
            }

            // Verify we have a valid string to sign
            if (typeof signatureData !== 'string' || !signatureData) {
              throw new Error('Invalid signature data received from server');
            }

            // Request user to sign the message via Coinbase Wallet
            // This proves they own the wallet address
            const signature = await coinbaseProvider.request({
              method: 'personal_sign',
              params: [signatureData, address],
            });

            // Call backend to create/login account with this wallet
            // Note: Using metamaskLogin endpoint as it works for any EVM wallet
            console.log('🔐 Calling metamaskLogin with Coinbase Wallet address:', address);
            const response = await AuthService.metamaskLogin(address, signature, false);
            console.log('📩 metamaskLogin response:', response);

            // Extract token from response
            const token = response?.data?.token || response?.token;
            const namespace = response?.data?.namespace || response?.namespace;

            if (token) {
              // Save token and create basic user object
              const basicUser = { email: '', namespace: namespace || '', walletAddress: address };
              login(basicUser, token);

              // Mark that user logged in via Coinbase Wallet
              localStorage.setItem('copus_auth_method', 'coinbase');

              // Fetch full user info from backend
              try {
                await fetchUserInfo(token);
              } catch (userInfoError) {
                console.warn('Failed to fetch user info after wallet login:', userInfoError);
              }

              // Account created successfully - now show payment modal
              setIsWalletSignInOpen(false);
              setIsPayConfirmOpen(true);
              setWalletBalance('...'); // Will be updated after balance fetch below
              showToast('Coinbase Wallet connected successfully! 🎉', 'success');
            } else {
              console.error('❌ No token in response. Full response:', JSON.stringify(response, null, 2));
              const errorMsg = response?.msg || response?.message || response?.error;
              throw new Error(`Failed to create account - no token received from backend`);
            }
          } catch (accountError: any) {
            console.error('Failed to create account:', accountError);
            console.error('Error details:', {
              message: accountError?.message,
              code: accountError?.code,
              type: typeof accountError
            });

            // Handle user rejection (code 4001)
            if (accountError?.code === 4001 || (accountError instanceof Error && accountError.message.includes('User rejected'))) {
              showToast('Signature cancelled. Wallet connection is required for payment.', 'info');
              setIsWalletSignInOpen(true);
              return;
            }

            // Handle other wallet errors
            if (accountError?.code) {
              showToast(`Wallet error (${accountError.code}): ${accountError.message || 'Unknown error'}`, 'error');
              setIsWalletSignInOpen(true);
              return;
            }

            // Handle backend API errors
            if (accountError instanceof Error) {
              showToast(`Wallet connection failed: ${accountError.message}`, 'error');
              console.error('Backend error creating account:', accountError);
              setIsWalletSignInOpen(true);
              return;
            }

            // Unknown error type
            showToast('Wallet connection failed. Please try again or contact support.', 'error');
            setIsWalletSignInOpen(true);
            return;
          }
        } else {
          // User IS logged in: Show payment modal immediately
          setIsWalletSignInOpen(false);
          setIsPayConfirmOpen(true);
          setWalletBalance('...'); // Loading indicator
          showToast('Loading wallet balance...', 'info');
        }

        // ---- Fetch USDC balance on Base Sepolia ----
        const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
        const baseSepoliaChainId = '0x14a34'; // 84532 in hex

        try {
          // First, check if we're on Base Sepolia network
          const currentChainId = await coinbaseProvider.request({ method: 'eth_chainId' });
          console.log('🌐 Current network:', currentChainId, 'Expected:', baseSepoliaChainId);

          // If not on Base Sepolia, try to switch
          if (currentChainId !== baseSepoliaChainId) {
            console.log('🔄 Switching to Base Sepolia network...');
            try {
              await coinbaseProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: baseSepoliaChainId }],
              });
              console.log('✅ Network switched successfully');
            } catch (switchError: any) {
              // Error code 4902: Chain not added yet
              if (switchError.code === 4902) {
                console.log('➕ Adding Base Sepolia network...');
                await coinbaseProvider.request({
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
                console.log('✅ Network added successfully');
              } else {
                throw switchError;
              }
            }
          }

          // Now fetch USDC balance on Base Sepolia
          // Call balanceOf(address) function on USDC contract using eth_call
          const data = '0x70a08231' + address.slice(2).padStart(64, '0');
          console.log('💰 Fetching USDC balance for:', address);

          // Execute read-only call to USDC contract
          const balance = await coinbaseProvider.request({
            method: 'eth_call',
            params: [{
              to: usdcContractAddress,
              data: data
            }, 'latest']
          });

          console.log('📊 Raw balance response:', balance);

          // Convert balance from hex to USDC (6 decimals)
          const balanceInSmallestUnit = parseInt(balance, 16);
          const balanceInUSDC = (balanceInSmallestUnit / 1000000).toFixed(2);

          console.log('💵 USDC Balance:', balanceInUSDC);
          setWalletBalance(balanceInUSDC);
          // Success toast already shown after account creation or in else block for logged-in users
        } catch (balanceError: any) {
          console.error('❌ Failed to fetch USDC balance:', balanceError);
          console.error('Error details:', {
            message: balanceError?.message,
            code: balanceError?.code,
            data: balanceError?.data
          });
          setWalletBalance('0.00');
          // Still proceed even if balance fetch fails
        }

        // Modal is already open from earlier, balance has been updated
      } catch (error) {
        console.error('Coinbase Wallet connection error:', error);

        // Handle user rejection of wallet connection
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            showToast('Coinbase Wallet connection cancelled', 'info');
          } else {
            showToast(`Coinbase Wallet connection failed: ${error.message}`, 'error');
          }
        } else {
          showToast('Coinbase Wallet connection failed. Please try again.', 'error');
        }
      }
    } else {
      // For other wallets not yet supported
      showToast(`${walletId} wallet integration coming soon`, 'info');
      setIsWalletSignInOpen(false);
    }
  };

  // ========================================
  // Step 3: Execute Payment using x402 + ERC-3009
  // ========================================
  // This is the main payment flow using x402 protocol with ERC-3009 TransferWithAuthorization.
  //
  // KEY CONCEPT: This is a GASLESS payment!
  // - User signs a message (EIP-712 typed data), NOT a transaction
  // - No gas fees for the user
  // - Server executes the actual USDC transfer and pays gas
  // - Completes in 2-3 seconds vs 60+ seconds for regular transactions
  //
  // Flow: Network check → Sign authorization → Send to server → Unlock content
  const handlePayNow = async () => {
    // Validate we have payment info from Step 1
    if (!x402PaymentInfo) {
      showToast('Payment information not available', 'error');
      return;
    }

    // Validate wallet is connected from Step 2
    if (!walletAddress || !walletProvider) {
      showToast('Wallet not connected', 'error');
      return;
    }

    try {
      // ---- Step 3a: Ensure user is on Base Sepolia network ----
      // Check current network (chainId is returned in hex format)
      const chainId = await walletProvider.request({ method: 'eth_chainId' });
      const baseSepoliaChainId = '0x14a34'; // 84532 in decimal, 0x14a34 in hex

      if (chainId !== baseSepoliaChainId) {
        // User is on wrong network - request network switch
        try {
          await walletProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: baseSepoliaChainId }],
          });
        } catch (switchError: any) {
          // Error code 4902: Chain not added to wallet yet
          if (switchError.code === 4902) {
            // Add Base Sepolia network to wallet
            try {
              await walletProvider.request({
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

      // ---- Step 3b: Create ERC-3009 TransferWithAuthorization signature ----
      const walletName = walletType === 'metamask' ? 'MetaMask' : 'Coinbase Wallet';
      showToast(`Please sign the payment authorization in ${walletName}...`, 'info');

      // Generate cryptographically secure random nonce (prevents replay attacks)
      // Each authorization must have a unique nonce
      const nonce = generateNonce(); // Returns 32-byte hex string like "0x1234..."

      // Set validity window for this authorization
      // validAfter: Authorization becomes valid at this timestamp
      // validBefore: Authorization expires at this timestamp
      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const validAfter = now;                     // Valid immediately
      const validBefore = now + 3600;             // Expires in 1 hour

      // Sign the TransferWithAuthorization message using EIP-712 typed data signing
      //
      // IMPORTANT: This is NOT a transaction! User is signing structured data.
      // - Wallet shows clear details: from, to, amount, validity window
      // - No gas fees are charged to the user
      // - User can reject without losing anything
      // - Server will later execute the actual transfer using this signature
      //
      // Parameters: from, to, value, validAfter, validBefore, nonce
      // Returns: SignedAuthorization with signature components (v, r, s)
      const signedAuth = await signTransferWithAuthorization({
        from: walletAddress,              // User's wallet address
        to: x402PaymentInfo.payTo,        // Content seller's address
        value: x402PaymentInfo.amount,    // Amount in smallest unit (e.g., "10000" = 0.01 USDC)
        validAfter,                       // When authorization becomes valid
        validBefore,                      // When authorization expires
        nonce                             // Unique nonce for this authorization
      }, walletProvider);

      // ---- Step 3c: Create X-PAYMENT header with signed authorization ----
      // The x402 protocol requires payment info in the X-PAYMENT HTTP header
      console.log('🔍 Payment Info:', {
        network: x402PaymentInfo.network,
        asset: x402PaymentInfo.asset,
        amount: x402PaymentInfo.amount,
        payTo: x402PaymentInfo.payTo
      });

      // Create base64-encoded payload containing:
      // - x402Version: 1
      // - payload: { network, asset, chainId, scheme, from, to, value, validAfter, validBefore, nonce, signature }
      const paymentHeader = createX402PaymentHeader(
        signedAuth,
        x402PaymentInfo.network,  // "base-sepolia"
        x402PaymentInfo.asset     // USDC contract address
      );

      // Debug: decode and log the payment payload to verify structure
      try {
        const decoded = JSON.parse(atob(paymentHeader));
        console.log('📤 Sending X-PAYMENT payload:', JSON.stringify(decoded, null, 2));
      } catch (e) {
        console.error('Failed to decode payment header:', e);
      }

      // ---- Step 3d: Send signed authorization to server to unlock content ----
      showToast('Payment authorization signed! Unlocking content...', 'success');

      // Call the x402 resource endpoint with X-PAYMENT header
      // Server will:
      // 1. Validate the signature
      // 2. Execute the USDC transfer on-chain (server pays gas)
      // 3. Return the unlocked target URL
      const unlockResponse = await fetch(x402PaymentInfo.resource, {
        headers: {
          'X-PAYMENT': paymentHeader
        }
      });

      // Check if unlock was successful
      if (!unlockResponse.ok) {
        const errorText = await unlockResponse.text();
        console.error('x402 unlock error:', {
          status: unlockResponse.status,
          errorText: errorText
        });

        // Try to parse the error response to see what the backend expects
        try {
          const parsedError = JSON.parse(errorText);
          console.error('📋 Parsed x402 error:', JSON.stringify(parsedError, null, 2));
        } catch (e) {
          console.error('Could not parse error response as JSON');
        }

        throw new Error(`Payment failed: ${unlockResponse.status}`);
      }

      const unlockData = await unlockResponse.json();

      // ---- Step 3e: Open unlocked content ----
      // Backend returns URL in 'data' field for successful payments
      const targetUrl = unlockData.data || unlockData.targetUrl;

      if (targetUrl) {
        // Success! Payment completed and content is unlocked
        // Store the unlocked URL so the button changes to "Visit"
        setUnlockedUrl(targetUrl);

        showToast('Payment successful! Content unlocked 🎉', 'success');
        setIsPayConfirmOpen(false);

        // Open the unlocked URL in a new tab
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast('Payment completed but no URL returned. Please contact support.', 'error');
      }

    } catch (error: any) {
      console.error('Payment error:', error);

      // Handle user rejection of signature (error code 4001)
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

{/* Conditional button - "Visit" for unlocked/free content, "Unlock now" for locked content */}
            {unlockedUrl ? (
              // Content has been unlocked via payment - show "Visit" button
              <button
                onClick={() => window.open(unlockedUrl, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center justify-center gap-[15px] px-5 lg:px-[30px] py-2 relative flex-[0_0_auto] bg-red rounded-[100px] border border-solid border-red hover:bg-red/90 transition-colors"
              >
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                  Visit
                </span>

                <img
                  className="relative w-[31px] h-[14.73px] mr-[-1.00px]"
                  alt="Arrow"
                  src="https://c.animaapp.com/5EW1c9Rn/img/arrow-1.svg"
                />
              </button>
            ) : article?.targetUrlIsLocked ? (
              // Content is locked and requires payment - show "Unlock now" button
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
              // Content is free - show regular "Visit" link
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
          faucetLink="https://faucet.circle.com/"
          isInsufficientBalance={x402PaymentInfo ? parseFloat(walletBalance) < (parseInt(x402PaymentInfo.amount) / 1000000) : false}
        />
      </div>
    </div>
  );
};