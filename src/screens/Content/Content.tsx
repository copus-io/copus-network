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

  // ========================================
  // Helper Functions (extracted for code reuse)
  // ========================================

  // Helper: Extract signature data from various response formats
  const extractSignatureData = (signatureDataResponse: any): string => {
    if (typeof signatureDataResponse === 'string') {
      return signatureDataResponse;
    }

    if (signatureDataResponse && typeof signatureDataResponse === 'object') {
      if (signatureDataResponse.data) {
        return signatureDataResponse.data;
      } else if (signatureDataResponse.message) {
        return signatureDataResponse.message;
      } else if (signatureDataResponse.msg) {
        return signatureDataResponse.msg;
      } else {
        return JSON.stringify(signatureDataResponse);
      }
    }

    throw new Error('Invalid signature data received from server');
  };

  // Helper: Detect wallet provider from providers array or single provider
  const detectWalletProvider = (walletType: 'metamask' | 'coinbase' | 'okx'): any => {
    // OKX Wallet uses its own injection point
    if (walletType === 'okx') {
      return (window as any).okxwallet || null;
    }

    if (!window.ethereum) {
      return null;
    }

    if ((window.ethereum as any)?.providers && Array.isArray((window.ethereum as any).providers)) {
      const providers = (window.ethereum as any).providers;

      if (walletType === 'metamask') {
        return providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet);
      } else if (walletType === 'coinbase') {
        return providers.find((p: any) => p.isCoinbaseWallet);
      }
    } else {
      if (walletType === 'metamask') {
        return window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet ? window.ethereum : null;
      } else if (walletType === 'coinbase') {
        return window.ethereum.isCoinbaseWallet ? window.ethereum : (window as any).coinbaseWalletExtension;
      }
    }

    return null;
  };

  // Helper: Connect to wallet and get address
  const connectToWallet = async (provider: any): Promise<string> => {
    await provider.request({ method: 'eth_requestAccounts' });

    let address = provider.selectedAddress;
    if (!address) {
      const accounts = await provider.request({ method: 'eth_accounts' });
      address = accounts[0];
    }

    if (!address) {
      throw new Error('No account selected in wallet. Please select an account and try again.');
    }

    return address;
  };

  // Helper: Handle wallet login process
  const handleWalletLogin = async (address: string, provider: any, walletType: string) => {
    showToast('Connecting wallet...', 'info');

    const signatureDataResponse = await AuthService.getMetamaskSignatureData(address);
    const signatureData = extractSignatureData(signatureDataResponse);

    if (typeof signatureData !== 'string' || !signatureData) {
      throw new Error('Invalid signature data received from server');
    }

    const signature = await provider.request({
      method: 'personal_sign',
      params: [signatureData, address],
    });

    const response = await AuthService.metamaskLogin(address, signature, false);
    const token = response?.data?.token || response?.token;
    const namespace = response?.data?.namespace || response?.namespace;

    if (!token) {
      throw new Error('Failed to create account - no token received from backend');
    }

    const basicUser = { email: '', namespace: namespace || '', walletAddress: address };
    login(basicUser, token);
    localStorage.setItem('copus_auth_method', walletType);

    try {
      await fetchUserInfo(token);
    } catch (userInfoError) {
      console.warn('Failed to fetch user info after wallet login:', userInfoError);
    }

    setIsWalletSignInOpen(false);
    setIsPayConfirmOpen(true);
    setWalletBalance('...');
    const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX' : 'Coinbase';
    showToast(`${walletName} wallet connected successfully! 🎉`, 'success');
  };

  // Helper: Switch to Base Sepolia network
  const switchToBaseSepolia = async (provider: any): Promise<void> => {
    const baseSepoliaChainId = '0x14a34'; // 84532 in hex

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: baseSepoliaChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
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
      } else {
        throw switchError;
      }
    }
  };

  // Helper: Fetch USDC balance on Base Sepolia
  const fetchUSDCBalance = async (provider: any, address: string): Promise<string> => {
    const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    const data = '0x70a08231' + address.slice(2).padStart(64, '0');

    const balance = await provider.request({
      method: 'eth_call',
      params: [{
        to: usdcContractAddress,
        data: data
      }, 'latest']
    });

    const balanceInSmallestUnit = parseInt(balance, 16);
    return (balanceInSmallestUnit / 1000000).toFixed(2);
  };

  // Helper: Handle wallet connection logic (shared between MetaMask, Coinbase, and OKX)
  const handleWalletConnection = async (walletType: 'metamask' | 'coinbase' | 'okx') => {
    const provider = detectWalletProvider(walletType);

    if (!provider) {
      const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX Wallet' : 'Coinbase Wallet';
      showToast(`${walletName} not found. Please install ${walletName} extension.`, 'error');
      return;
    }

    const address = await connectToWallet(provider);

    setWalletAddress(address);
    setWalletProvider(provider);
    setWalletType(walletType);

    if (!user) {
      await handleWalletLogin(address, provider, walletType);
    } else {
      setIsWalletSignInOpen(false);
      setIsPayConfirmOpen(true);
      setWalletBalance('...');
      showToast('Loading wallet balance...', 'info');
    }

    try {
      await switchToBaseSepolia(provider);
      const balance = await fetchUSDCBalance(provider, address);
      setWalletBalance(balance);
    } catch (balanceError) {
      console.error('Failed to fetch USDC balance:', balanceError);
      setWalletBalance('0.00');
    }
  };

  // ========================================
  // Effect Hooks
  // ========================================

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

  // Set like state when article data is fetched
  useEffect(() => {
    if (content && article) {
      // Get global state or use API data
      const globalState = getArticleLikeState(article.uuid, content.isLiked, content.likes);
      setIsLiked(globalState.isLiked);
      setLikesCount(globalState.likeCount);
    }
  }, [content, article, getArticleLikeState]);

  // ========================================
  // Event Handlers
  // ========================================

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
          <HeaderSection articleAuthorId={content?.userId} />

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
  const handleUnlock = async () => {
    if (!article?.uuid) {
      showToast('Article information not available', 'error');
      return;
    }

    try {
      const x402Url = `https://api-test.copus.network/client/payment/getTargetUrl?uuid=${article.uuid}`;
      const response = await fetch(x402Url);
      const data = await response.json();

      if (data.accepts && data.accepts.length > 0) {
        const paymentOption = data.accepts[0];
        console.log('📥 Received 402 payment option:', paymentOption);

        const resourceUrl = `https://api-test.copus.network/client/payment/getTargetUrl?uuid=${article.uuid}`;
        const paymentInfo = {
          payTo: paymentOption.payTo,
          asset: paymentOption.asset,
          amount: paymentOption.maxAmountRequired,
          network: paymentOption.network,
          resource: resourceUrl
        };

        setX402PaymentInfo(paymentInfo);

        const authMethod = localStorage.getItem('copus_auth_method');
        const isWalletUser = authMethod === 'metamask' || authMethod === 'coinbase' || authMethod === 'okx';

        if (user && isWalletUser && user.walletAddress) {
          setWalletAddress(user.walletAddress);
          setWalletType(authMethod);
          setIsPayConfirmOpen(true);
          setWalletBalance('...');

          setupLoggedInWallet(user.walletAddress, authMethod).catch(error => {
            console.error('Failed to setup wallet:', error);
            setWalletBalance('0.00');
          });
        } else {
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

      const provider = detectWalletProvider(authMethod as 'metamask' | 'coinbase' | 'okx');

      if (!provider) {
        setIsWalletSignInOpen(true);
        return;
      }

      setWalletAddress(walletAddress);
      setWalletProvider(provider);
      setWalletType(authMethod);

      await switchToBaseSepolia(provider);
      const balance = await fetchUSDCBalance(provider, walletAddress);
      setWalletBalance(balance);
    } catch (error: any) {
      console.error('Failed to set up logged-in wallet:', error);
      showToast('Failed to connect to your wallet. Please try again.', 'error');
      setIsWalletSignInOpen(true);
    }
  };

  // ========================================
  // Step 2: Connect Wallet and Fetch Balance
  // ========================================
  const handleWalletSelect = async (walletId: string) => {
    if (walletId === 'metamask') {
      try {
        await handleWalletConnection('metamask');
      } catch (error) {
        console.error('MetaMask connection error:', error);
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
      try {
        await handleWalletConnection('coinbase');
      } catch (error) {
        console.error('Coinbase Wallet connection error:', error);
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
    } else if (walletId === 'okx') {
      // For OKX wallet, skip connection and go directly to payment modal
      setWalletType('okx');
      setIsWalletSignInOpen(false);
      setIsPayConfirmOpen(true);
    } else {
      showToast(`${walletId} wallet integration coming soon`, 'info');
      setIsWalletSignInOpen(false);
    }
  };

  // ========================================
  // Step 3: Execute Payment using x402 + ERC-3009
  // ========================================
  const handlePayNow = async () => {
    if (!x402PaymentInfo) {
      showToast('Payment information not available', 'error');
      return;
    }

    if (!walletAddress || !walletProvider) {
      showToast('Wallet not connected', 'error');
      return;
    }

    try {
      // Ensure user is on Base Sepolia network
      const chainId = await walletProvider.request({ method: 'eth_chainId' });
      const baseSepoliaChainId = '0x14a34';

      if (chainId !== baseSepoliaChainId) {
        await switchToBaseSepolia(walletProvider);
      }

      // Create ERC-3009 TransferWithAuthorization signature
      const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX Wallet' : 'Coinbase Wallet';
      showToast(`Please sign the payment authorization in ${walletName}...`, 'info');

      const nonce = generateNonce();
      const now = Math.floor(Date.now() / 1000);
      const validAfter = now;
      const validBefore = now + 3600;

      const signedAuth = await signTransferWithAuthorization({
        from: walletAddress,
        to: x402PaymentInfo.payTo,
        value: x402PaymentInfo.amount,
        validAfter,
        validBefore,
        nonce
      }, walletProvider);

      // Create X-PAYMENT header with signed authorization
      const paymentHeader = createX402PaymentHeader(
        signedAuth,
        x402PaymentInfo.network,
        x402PaymentInfo.asset
      );

      showToast('Payment authorization signed! Unlocking content...', 'success');

      const unlockResponse = await fetch(x402PaymentInfo.resource, {
        headers: {
          'X-PAYMENT': paymentHeader
        }
      });

      if (!unlockResponse.ok) {
        const errorText = await unlockResponse.text();
        console.error('x402 unlock error:', {
          status: unlockResponse.status,
          errorText: errorText
        });
        throw new Error(`Payment failed: ${unlockResponse.status}`);
      }

      const unlockData = await unlockResponse.json();
      const targetUrl = unlockData.data || unlockData.targetUrl;

      if (targetUrl) {
        setUnlockedUrl(targetUrl);
        showToast('Payment successful! Content unlocked 🎉', 'success');
        setIsPayConfirmOpen(false);
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast('Payment completed but no URL returned. Please contact support.', 'error');
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

  // ========================================
  // JSX Return (unchanged from original)
  // ========================================
  return (
    <div
      className="min-h-screen w-full flex justify-center overflow-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
      data-model-id="9091:54529"
    >
      <div className="flex mt-0 w-full min-h-screen ml-0 relative flex-col items-start">
        <HeaderSection articleAuthorId={content?.userId} />

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
                  <div className="flex items-start justify-center w-fit whitespace-nowrap relative mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-red text-[50px] tracking-[0] leading-[80.0px]">
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

{/* Conditional button - "Visit" for unlocked/targetUrl content, "Unlock now" for locked content without targetUrl */}
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
            ) : article?.targetUrl && article.targetUrl.trim() !== '' ? (
              // Content has targetUrl - show "Visit" button regardless of lock status
              <button
                onClick={() => window.open(article.targetUrl, '_blank', 'noopener,noreferrer')}
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
                className="h-[46px] gap-2.5 px-5 py-2 bg-[linear-gradient(0deg,rgba(0,82,255,0.8)_0%,rgba(0,82,255,0.8)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,254,254,1)_100%)] inline-flex items-center relative flex-[0_0_auto] rounded-[50px] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] hover:bg-[linear-gradient(0deg,rgba(0,82,255,0.9)_0%,rgba(0,82,255,0.9)_100%),linear-gradient(0deg,rgba(255,254,254,1)_0%,rgba(255,255,255,1)_100%)] transition-all active:scale-95"
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
              // No targetUrl available and not locked - show disabled state
              <div className="inline-flex items-center justify-center gap-[15px] px-5 lg:px-[30px] py-2 relative flex-[0_0_auto] bg-gray-400 rounded-[100px] border border-solid border-gray-400 opacity-50 cursor-not-allowed">
                <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-white text-xl tracking-[0] leading-[30px] whitespace-nowrap">
                  No Link Available
                </span>
              </div>
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
          availableBalance={walletBalance}
          amount={article?.priceInfo ? `${article.priceInfo.price} ${article.priceInfo.currency}` : '0.01 USDC'}
          network="Base Sepolia"
          faucetLink="https://faucet.circle.com/"
          isInsufficientBalance={x402PaymentInfo ? parseFloat(walletBalance) < (parseInt(x402PaymentInfo.amount) / 1000000) : false}
          walletType={walletType}
        />
      </div>
    </div>
  );
};