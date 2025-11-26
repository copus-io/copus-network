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
import { PayConfirmModal } from "../../components/PayConfirmModal/PayConfirmModal";
import {
  generateNonce,
  signTransferWithAuthorization,
  signTransferWithAuthorizationOKXBrowser,
  createX402PaymentHeader
} from "../../utils/x402Utils";
import { getCurrentEnvironment, logEnvironmentInfo } from '../../utils/envUtils';
import { getNetworkConfig, getTokenContract, NetworkType, TokenType } from '../../config/contracts';


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
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);      // Payment confirmation modal
  const [isWalletConnected, setIsWalletConnected] = useState(false);    // Wallet connection status

  // Connected wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');       // User's wallet address (0x...)
  const [walletBalance, setWalletBalance] = useState<string>('0');      // USDC balance (e.g., "1.50")
  const [walletProvider, setWalletProvider] = useState<any>(null);      // EIP-1193 provider (MetaMask, Coinbase Wallet, etc.)
  const [walletType, setWalletType] = useState<string>('');             // Wallet type: 'metamask' or 'coinbase'
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('base-mainnet');
  const [selectedCurrency, setSelectedCurrency] = useState<TokenType>('usdc');

  // Payment details from 402 API response
  // Contains: payTo (recipient), asset (USDC contract), amount, network, resource (unlock URL)
  const [x402PaymentInfo, setX402PaymentInfo] = useState<X402PaymentInfo | null>(null);

  // OKX EIP-712 data for direct signing (X Layer)
  const [okxEip712Data, setOkxEip712Data] = useState<any>(null);

  // Unlocked content URL after successful payment
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);

  // Payment progress state to prevent duplicate submissions
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);

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
      return (window as any).okxwallet ||
             (window as any).okx?.ethereum ||
             (window as any).ethereum?.isOkxWallet ? (window as any).ethereum : null;
    }

    if (!window.ethereum) {
      // Try window.metamask directly if ethereum is missing
      if ((window as any).metamask?.isMetaMask) {
        return (window as any).metamask;
      }
      return null;
    }

    if ((window.ethereum as any)?.providers && Array.isArray((window.ethereum as any).providers)) {
      const providers = (window.ethereum as any).providers;

      if (walletType === 'metamask') {
        // First try to find a provider that explicitly identifies as MetaMask and not OKX
        const metamaskProvider = providers.find((p: any) => {
          // Check for OKX-specific properties (must be explicitly true, not just present)
          const hasOkxProps = (p.isOkxWallet === true) || (p.isOKExWallet === true);

          // MetaMask provider should have isMetaMask, not be Coinbase, and not have OKX properties
          return p.isMetaMask && !p.isCoinbaseWallet && !hasOkxProps;
        });

        if (metamaskProvider) {
          return metamaskProvider;
        }

        // Fallback: check if any provider has the _metamask property (unique to real MetaMask)
        return providers.find((p: any) => p._metamask && p.isMetaMask);
      } else if (walletType === 'coinbase') {
        return providers.find((p: any) => p.isCoinbaseWallet);
      }
    } else {
      if (walletType === 'metamask') {
        const eth = window.ethereum as any;

        // If OKX is installed but no providers array, OKX has hijacked window.ethereum
        // Check if MetaMask is accessible via window.metamask
        if ((window as any).okxwallet) {
          const metamaskDirect = (window as any).metamask;
          if (metamaskDirect?.isMetaMask) {
            return metamaskDirect;
          }
          // MetaMask not accessible via window.metamask
          // Return window.ethereum anyway - it may open OKX but at least user can connect
          if (eth.isMetaMask) {
            return window.ethereum;
          }
          return null;
        }

        // No OKX installed, safe to use window.ethereum if it's MetaMask
        if (eth.isMetaMask) {
          return window.ethereum;
        }

        // Check legacy web3.currentProvider for real MetaMask
        const web3Provider = (window as any).web3?.currentProvider;
        if (web3Provider?.isMetaMask) {
          return web3Provider;
        }

        return null;
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

    // Use appropriate service method based on wallet type
    const signatureDataResponse = walletType === 'okx'
      ? await AuthService.okxWalletSignature(address)
      : await AuthService.getMetamaskSignatureData(address);

    const signatureData = extractSignatureData(signatureDataResponse);

    if (typeof signatureData !== 'string' || !signatureData) {
      throw new Error('Invalid signature data received from server');
    }

    const signature = await provider.request({
      method: 'personal_sign',
      params: [signatureData, address],
    });

    // Use appropriate login method based on wallet type
    const response = walletType === 'okx'
      ? await AuthService.okxWalletLogin(address, signature, false)
      : await AuthService.metamaskLogin(address, signature, false);
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

    setIsWalletConnected(true);
    setWalletBalance('...');
    const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX' : 'Coinbase';
    showToast(`${walletName} wallet connected successfully!`, 'success');
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

  // Helper: Switch to X Layer network
  const switchToXLayer = async (provider: any): Promise<void> => {
    const xlayerChainId = '0x7a0'; // 1952 in hex (X Layer testnet)

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: xlayerChainId }],
      });
    } catch (switchError: any) {
      console.warn('Network switch failed, attempting to add network. Error:', switchError);
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: xlayerChainId,
            chainName: 'X Layer Testnet',
            nativeCurrency: {
              name: 'OKB',
              symbol: 'OKB',
              decimals: 18
            },
            rpcUrls: ['https://testrpc.xlayer.tech', 'https://xlayertestrpc.okx.com'],
            blockExplorerUrls: ['https://www.oklink.com/x-layer-testnet']
          }],
        });
      } else {
        console.error('Failed to switch to X Layer:', switchError);
        throw switchError;
      }
    }
  };


  // Helper: Fetch token balance based on network and currency
  const fetchTokenBalance = async (provider: any, address: string, network: NetworkType, currency: TokenType = 'usdc'): Promise<string> => {

    // Check current network
    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      const networkConfig = getNetworkConfig(network);
      const expectedChainId = networkConfig.chainId;

      if (currentChainId !== expectedChainId) {
        console.warn(`Network mismatch! Expected ${expectedChainId} but wallet is on ${currentChainId}`);

        try {
          // Try to switch network
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError: any) {
          console.warn('Failed to switch network:', switchError);

          // If network doesn't exist in wallet, try to add it
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: networkConfig.chainId,
                  chainName: networkConfig.name,
                  rpcUrls: networkConfig.rpcUrls,
                  blockExplorerUrls: networkConfig.blockExplorerUrls,
                  nativeCurrency: networkConfig.nativeCurrency,
                }],
              });
            } catch (addError) {
              console.error('Failed to add network:', addError);
              throw new Error(`Please manually switch to ${networkConfig.name} network`);
            }
          } else {
            throw new Error(`Please manually switch to ${networkConfig.name} network`);
          }
        }
      }
    } catch (error) {
      console.warn('Could not determine current network:', error);
    }

    const contractAddress = getTokenContract(network, currency);

    if (!contractAddress) {
      console.warn(`Token ${currency} contract not configured for network ${network}. Check official faucet for correct address.`);
      return '0.00';
    }

    const networkConfig = getNetworkConfig(network);
    const data = '0x70a08231' + address.slice(2).padStart(64, '0');

    try {
      const balance = await provider.request({
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: data
        }, 'latest']
      });


      // Handle empty or invalid response
      if (!balance || balance === '0x' || balance === '0x0') {
        console.warn('Empty balance response, returning 0.00');
        return '0.00';
      }

      const balanceInSmallestUnit = parseInt(balance, 16);

      // Handle NaN case
      if (isNaN(balanceInSmallestUnit)) {
        console.warn(`Invalid balance response: ${balance}, returning 0.00`);
        return '0.00';
      }

      const formattedBalance = (balanceInSmallestUnit / Math.pow(10, networkConfig.tokenDecimals)).toFixed(2);

      return formattedBalance;
    } catch (error: any) {
      console.error(`Balance query failed for ${network} ${currency}:`, error);
      return '0.00';
    }
  };

  // Helper: Switch to network based on selection
  const switchToNetwork = async (provider: any, network: NetworkType): Promise<void> => {
    if (network === 'xlayer') {
      await switchToXLayer(provider);
    } else {
      await switchToBaseSepolia(provider);
    }
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
      setIsWalletConnected(true);
      setWalletBalance('...');
    }

    // Fetch balance in background (non-blocking) so modal shows immediately
    fetchTokenBalance(provider, address, selectedNetwork, selectedCurrency)
      .then(balance => {
        setWalletBalance(balance);
      })
      .catch(balanceError => {
        console.error('Failed to fetch token balance:', balanceError);
        setWalletBalance('0.00');
      });
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
    if (article && process.env.NODE_ENV === 'development') {
      console.log('Article loaded:', {
        uuid: article.uuid,
        targetUrlIsLocked: article.targetUrlIsLocked,
        hasArChainId: !!article.arChainId,
        hasPriceInfo: !!article.priceInfo
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

  // Check if the article has been deleted
  const isArticleDeleted = error && (
    error.includes('not found') ||
    error.includes('deleted') ||
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
      showToast(newIsLiked ? 'Treasured' : 'Untreasured', 'success');

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
  // ========================================
  // Fetch x402 Payment Information (triggered by network selection)
  // ========================================
  const fetchPaymentInfo = async (network: NetworkType): Promise<{eip712Data?: any, paymentInfo?: any}> => {
    if (!article?.uuid) {
      showToast('Article information not available', 'error');
      return { };
    }

    try {
      const { apiBaseUrl } = getCurrentEnvironment();


      // Use appropriate payment endpoint based on network
      const getPaymentEndpoint = (networkType: NetworkType) => {
        return networkType === 'xlayer'
          ? '/client/payment/okx/getTargetUrl'   // OKX API for XLayer
          : '/client/payment/base/getTargetUrl';  // Base API for Base networks
      };

      const paymentEndpoint = getPaymentEndpoint(network);

      // Build URL with uuid parameter (new OKX API only requires uuid)
      const urlParams = new URLSearchParams({ uuid: article.uuid });

      const x402Url = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;

      // Add user authentication token
      const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(x402Url, { headers });

      if (!response.ok && response.status !== 402) {
        // 402 is the expected "Payment Required" status for payment APIs
        console.error(`❌ Payment API returned ${response.status} ${response.statusText}`);
        if (response.status === 500) {
          throw new Error('Server error - payment API is experiencing issues');
        } else {
          throw new Error(`Payment API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Handle different response formats based on endpoint
      if (network === 'xlayer' && data.domain && data.message) {
        // OKX API returns EIP-712 structure directly for XLayer
        const testConnectedAddress = walletAddress;
        const testStoredAddress = user?.walletAddress;

        // Check actual connected wallet account
        let actualWalletAddress = null;
        try {
          const provider = window.ethereum;
          if (provider) {
            const accounts = await provider.request({ method: 'eth_accounts' });
            actualWalletAddress = accounts[0] || null;
          }
        } catch (error) {
          console.warn('Could not get wallet account:', error);
        }

        // Use actual connected address if available
        const addressToUse = actualWalletAddress || testConnectedAddress || testStoredAddress;
        if (!addressToUse) {
          console.warn('No wallet address available for EIP-712 data');
          throw new Error('Please connect your wallet first');
        }

        const eip712Data = {
          ...data,
          message: {
            ...data.message,
            from: addressToUse
          }
        };

        // Store EIP-712 data for signing
        setOkxEip712Data(eip712Data);

        const resourceUrl = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;
        const paymentInfo = {
          payTo: data.message.to,
          asset: data.domain.verifyingContract,
          amount: data.message.value,
          network: network,
          resource: resourceUrl
        };

        setX402PaymentInfo(paymentInfo);

        // Return the data immediately for use in the calling function
        return { eip712Data, paymentInfo };
      } else if ((network === 'base-mainnet' || network === 'base-sepolia') && typeof data === 'string') {
        // Base API returns target URL as string, need to construct payment info manually
        const contractAddress = getTokenContract(network, selectedCurrency);
        if (!contractAddress) {
          throw new Error(`Token contract not found for ${network}`);
        }

        const resourceUrl = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;

        // For Base networks, we need to construct the EIP-712 data manually
        const nonce = generateNonce();
        const now = Math.floor(Date.now() / 1000);
        const validAfter = now;
        const validBefore = now + 3600;
        const amount = '10000'; // 0.01 USDC (6 decimals)

        // Get recipient address from the URL (this might need to be provided by the API)
        // For now, use a placeholder - the actual recipient should come from the API response
        const recipientAddress = '0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F'; // placeholder

        const eip712Data = {
          domain: {
            name: selectedCurrency === 'usdc' ? 'USD Coin' : 'Tether USD',
            version: '2',
            chainId: parseInt(getNetworkConfig(network).chainId, 16),
            verifyingContract: contractAddress
          },
          message: {
            from: walletAddress || user?.walletAddress || '',
            to: recipientAddress,
            value: amount,
            validAfter: validAfter.toString(),
            validBefore: validBefore.toString(),
            nonce: nonce
          }
        };

        const paymentInfo = {
          payTo: recipientAddress,
          asset: contractAddress,
          amount: amount,
          network: network,
          resource: data // Use the returned URL directly
        };

        setOkxEip712Data(eip712Data);
        setX402PaymentInfo(paymentInfo);

        return { eip712Data, paymentInfo };
      } else if (data.accepts && data.accepts.length > 0) {
        // Legacy x402 response format (fallback support)
        const paymentOption = data.accepts[0];

        const resourceUrl = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;
        const paymentInfo = {
          payTo: paymentOption.payTo,
          asset: paymentOption.asset,
          amount: paymentOption.maxAmountRequired,
          network: network,
          resource: resourceUrl
        };

        setX402PaymentInfo(paymentInfo);

        // Return the data immediately for legacy format
        return { paymentInfo };
      } else {
        console.error('❌ Unexpected payment response format:', data);
        showToast('Failed to get payment information', 'error');
        return { };
      }

      console.log(`✅ Payment info fetched successfully for ${network}`);
      return { }; // fallback return

    } catch (error) {
      console.error('❌ Error fetching payment info:', error);
      showToast((error as Error).message || 'Failed to load payment information', 'error');
      // Re-throw the error to prevent further execution
      throw error;
    }
  };

  const handleUnlock = async () => {
    if (!article?.uuid) {
      showToast('Article information not available', 'error');
      return;
    }

    // Just open the payment modal, don't fetch payment info yet
    setIsPayConfirmOpen(true);

    // Get suggested network based on user's auth method
    const authMethod = localStorage.getItem('copus_auth_method');
    const suggestedNetwork = authMethod === 'okx' ? 'xlayer' : 'base-mainnet';
    setSelectedNetwork(suggestedNetwork);

    const isWalletUser = authMethod === 'metamask' || authMethod === 'coinbase' || authMethod === 'okx';

    if (user && isWalletUser && user.walletAddress) {
      // Only use stored wallet address if no wallet is currently connected
      if (!walletAddress) {
        setWalletAddress(user.walletAddress);
      }
      setWalletType(authMethod);
      setIsWalletConnected(true);
      setWalletBalance('...');

      const addressToUse = walletAddress || user.walletAddress;
      setupLoggedInWallet(addressToUse, authMethod).catch(error => {
        console.error('Failed to setup wallet:', error);
        setWalletBalance('0.00');
      });
    } else {
      // Reset wallet state for new connection
      setIsWalletConnected(false);
      setWalletAddress('');
      setWalletBalance('0');
    }
  };

  // Helper function to set up wallet connection for already logged-in wallet users
  const setupLoggedInWallet = async (walletAddress: string, authMethod: string) => {
    try {
      const provider = detectWalletProvider(authMethod as 'metamask' | 'coinbase' | 'okx');

      if (!provider) {
        console.warn(`No provider found for ${authMethod}`);
        setIsWalletConnected(false);
        return;
      }

      // Don't overwrite already connected wallet address from fresh connection
      // The walletAddress parameter here is the stored user address,
      // but we want to keep any freshly connected wallet address instead
      setWalletProvider(provider);
      setWalletType(authMethod);

      // No longer force network based on wallet type, use default base-mainnet or user-selected network
      // If no network selected, default to base-mainnet
      if (!selectedNetwork) {
        setSelectedNetwork('base-mainnet');
      }


      // Fetch balance in background (non-blocking)
      const networkToUse = selectedNetwork || 'base-mainnet';
      fetchTokenBalance(provider, walletAddress, networkToUse, selectedCurrency)
        .then(balance => setWalletBalance(balance))
        .catch(error => {
          console.error('Failed to fetch balance:', error);
          setWalletBalance('0.00');
        });

      // Proactively fetch payment info to optimize user experience
      fetchPaymentInfo(networkToUse)
        .catch(error => console.warn('Failed to preload payment info:', error));
    } catch (error: any) {
      console.error('Failed to set up logged-in wallet:', error);
      showToast('Failed to connect to your wallet. Please try again.', 'error');
      setIsWalletConnected(false);
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
      try {
        await handleWalletConnection('okx');
      } catch (error) {
        console.error('OKX Wallet connection error:', error);
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            showToast('OKX Wallet connection cancelled', 'info');
          } else {
            showToast(`OKX Wallet connection failed: ${error.message}`, 'error');
          }
        } else {
          showToast('OKX Wallet connection failed. Please try again.', 'error');
        }
      }
    } else {
      showToast(`${walletId} wallet integration coming soon`, 'info');
    }
  };

  // ========================================
  // Step 3: Execute Payment using x402 + ERC-3009

  const handlePayNow = async () => {
    // Prevent duplicate submissions
    if (isPaymentInProgress) {
      showToast('Payment is in progress, please wait...', 'warning');
      return;
    }

    if (!walletAddress || !walletProvider) {
      showToast('Wallet not connected', 'error');
      return;
    }

    // Start payment, set state
    setIsPaymentInProgress(true);

    // Local variables to store fresh data for immediate use
    let currentEip712Data = okxEip712Data;
    let currentPaymentInfo = x402PaymentInfo;

    // Determine the final address to use consistently throughout the payment process
    let finalPaymentAddress = walletAddress;
    try {
      const accounts = await walletProvider.request({ method: 'eth_accounts' });
      finalPaymentAddress = accounts[0] || walletAddress;
    } catch (error) {
      console.warn('Could not get MetaMask account, using wallet address:', error);
    }

    try {
      // Check if payment info is available (should be preloaded)
      // All networks now use new OKX API with EIP-712 format
      if (!x402PaymentInfo || !currentEip712Data || x402PaymentInfo.network !== selectedNetwork) {
        showToast(`Preparing payment for ${selectedNetwork}...`, 'info');
        const fetchedData = await fetchPaymentInfo(selectedNetwork);

        // New OKX API should return both EIP-712 data and payment info for all networks
        if (!fetchedData.eip712Data || !fetchedData.paymentInfo) {
          throw new Error(`Failed to get payment data for ${selectedNetwork}`);
        }

        // Store the fresh data for immediate use
        currentEip712Data = fetchedData.eip712Data;
        currentPaymentInfo = fetchedData.paymentInfo;
      }

      // Ensure user is on the correct network for payment
      const paymentNetworkConfig = getNetworkConfig(selectedNetwork);
      const chainId = await walletProvider.request({ method: 'eth_chainId' });

      if (chainId !== paymentNetworkConfig.chainId) {
        showToast(`Switching to ${selectedNetwork} network for payment...`, 'info');
        await switchToNetwork(walletProvider, selectedNetwork);
      }

      // Create ERC-3009 TransferWithAuthorization signature
      const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX Wallet' : 'Coinbase Wallet';
      showToast(`Please sign the payment authorization in ${walletName}...`, 'info');

      let signedAuth;

      // All networks now use EIP-712 signing with the new OKX API
      if (currentEip712Data) {
        // Get payment contract address and chain ID for the selected network
        const paymentContractAddress = getTokenContract(selectedNetwork, selectedCurrency);
        const chainIdInt = parseInt(paymentNetworkConfig.chainId, 16);

        // Try OKX-optimized signing method first (for XLayer), fallback to standard EIP-712
        try {
          if (selectedNetwork === 'xlayer' && walletType === 'okx') {
            console.log('Attempting OKX browser signature method for XLayer...');

            // Extract parameters from EIP-712 data for OKX method
            const transferParams = {
              from: finalPaymentAddress,
              to: currentEip712Data.message.to,
              value: currentEip712Data.message.value,
              validAfter: parseInt(currentEip712Data.message.validAfter),
              validBefore: parseInt(currentEip712Data.message.validBefore),
              nonce: currentEip712Data.message.nonce
            };

            signedAuth = await signTransferWithAuthorizationOKXBrowser(
              transferParams,
              walletProvider,
              chainIdInt,
              paymentContractAddress || ''
            );
          } else {
            throw new Error('Using standard EIP-712 method');
          }
        } catch (okxError) {
          console.log('Using standard EIP-712 signing method...');

          // Standard EIP-712 signing for all wallets and networks
          const correctedEip712Data = {
            ...currentEip712Data,
            message: {
              ...currentEip712Data.message,
              from: finalPaymentAddress
            }
          };

          // Sign using eth_signTypedData_v4 with the corrected structure
          const signature = await walletProvider.request({
            method: 'eth_signTypedData_v4',
            params: [finalPaymentAddress, JSON.stringify(correctedEip712Data)]
          });

          // Parse signature into v, r, s components
          const r = signature.slice(0, 66);
          const s = '0x' + signature.slice(66, 130);
          const vHex = signature.slice(130, 132);
          const v = parseInt(vHex, 16);

          signedAuth = {
            from: finalPaymentAddress,
            to: correctedEip712Data.message.to,
            value: correctedEip712Data.message.value,
            validAfter: parseInt(correctedEip712Data.message.validAfter),
            validBefore: parseInt(correctedEip712Data.message.validBefore),
            nonce: correctedEip712Data.message.nonce,
            v,
            r,
            s
          };
        }
      } else {
        throw new Error('No EIP-712 data available for signing');
      }

      // Map network name for x402 protocol
      // x402 protocol uses 'base' for Base mainnet, not 'base-mainnet'
      const x402NetworkName = selectedNetwork === 'base-mainnet' ? 'base' :
                             selectedNetwork === 'xlayer' ? 'xlayer' :
                             currentPaymentInfo.network;


      // Create X-PAYMENT header with signed authorization
      const paymentHeader = createX402PaymentHeader(
        signedAuth,
        x402NetworkName,
        currentPaymentInfo.asset
      );

      // Debug output for development
      if (process.env.NODE_ENV === 'development') {
        try {
          const decodedHeader = JSON.parse(atob(paymentHeader));
          console.log('Payment header created for network:', x402NetworkName);
          console.log('Signature verification details:', {
            fromMatches: decodedHeader.payload?.authorization?.from === finalPaymentAddress,
            toMatches: decodedHeader.payload?.authorization?.to === currentPaymentInfo.payTo,
            valueMatches: decodedHeader.payload?.authorization?.value === currentPaymentInfo.amount?.toString()
          });
        } catch (e) {
          console.error('Failed to decode payment header for debug:', e);
        }
      }

      showToast('Payment authorization signed! Unlocking content...', 'success');

      // Add user authentication token to payment request
      const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');
      console.log('🔐 Authentication token status:', {
        tokenFound: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token found'
      });

      const paymentHeaders: Record<string, string> = {
        'X-PAYMENT': paymentHeader,
        'Content-Type': 'application/json'
      };

      // Add X-PAYMENT-ASSET header with contract address (required by both OKX and Base APIs)
      const contractAddress = getTokenContract(selectedNetwork, selectedCurrency);
      if (contractAddress) {
        paymentHeaders['X-PAYMENT-ASSET'] = contractAddress;
        console.log('✅ Added X-PAYMENT-ASSET header with contract address:', contractAddress);
      } else {
        console.warn('⚠️ No contract address found for', selectedNetwork, selectedCurrency);
      }

      if (token) {
        paymentHeaders.Authorization = `Bearer ${token}`;
        console.log('✅ Added Authorization header to payment request');
      } else {
        console.warn('⚠️ No authentication token found! Payment may fail');
      }

      console.log('📤 Payment request headers:', {
        'X-PAYMENT': `${paymentHeader.substring(0, 50)}...`,
        'Authorization': token ? 'Bearer [TOKEN]' : 'Not provided',
        'Content-Type': paymentHeaders['Content-Type']
      });

      // Ensure payment URL uses the same address as EIP-712 data
      let paymentUrl = currentPaymentInfo.resource;

      if (selectedNetwork === 'xlayer' && paymentUrl.includes('from=')) {
        // Replace the 'from' parameter with the final payment address
        const url = new URL(paymentUrl);
        url.searchParams.set('from', finalPaymentAddress);
        paymentUrl = url.toString();
      }


      const unlockResponse = await fetch(paymentUrl, {
        headers: paymentHeaders
      });


      if (!unlockResponse.ok) {
        const errorText = await unlockResponse.text();
        console.error('Payment verification failed:', {
          status: unlockResponse.status,
          statusText: unlockResponse.statusText,
          error: errorText,
          network: currentPaymentInfo.network
        });

        throw new Error(`failed to verify payment: ${unlockResponse.status} ${unlockResponse.statusText}`);
      }

      const unlockData = await unlockResponse.json();
      console.log('🎉 Payment success response:', unlockData);

      // Handle different response structures for different networks
      let targetUrl = unlockData.data || unlockData.targetUrl;

      // XLayer specific response handling
      if (selectedNetwork === 'xlayer') {
        console.log('🔗 XLayer payment response structure:', {
          data: unlockData.data,
          targetUrl: unlockData.targetUrl,
          url: unlockData.url,
          fullResponse: unlockData
        });

        // Try different possible field names for XLayer
        targetUrl = unlockData.data || unlockData.targetUrl || unlockData.url;
      }

      if (targetUrl) {
        setUnlockedUrl(targetUrl);
        showToast(`Payment successful! Opening ${selectedNetwork === 'xlayer' ? 'XLayer' : 'Base'} content...`, 'success');
        setIsPayConfirmOpen(false);

        console.log(`🚀 Auto-redirecting to: ${targetUrl}`);

        // Open target URL in new tab with enhanced popup handling
        try {
          const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            showToast('Content unlocked! Please check if popup was blocked and manually click the link.', 'info');
          } else {
            console.log('✅ Successfully opened target URL in new tab');
          }
        } catch (popupError) {
          console.warn('Popup blocked or failed:', popupError);
          showToast('Content unlocked! Please manually click the link to access content.', 'info');
        }
      } else {
        console.error('❌ No target URL found in response:', unlockData);
        showToast(`${selectedNetwork === 'xlayer' ? 'XLayer' : 'Base'} payment completed but no URL returned. Please contact support.`, 'error');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.code === 4001) {
        showToast('Signature cancelled', 'info');
      } else {
        showToast(`Payment failed: ${error.message || 'Unknown error'}`, 'error');
      }
    } finally {
      // Reset payment state, allow next payment
      setIsPaymentInProgress(false);
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
                    if (!article?.arChainId) {
                      console.warn('No arChainId available for this article');
                    } else {
                      const arweaveUrl = `https://arseed.web3infra.dev/${article.arChainId}`;
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

        {/* x402 Payment Modal with integrated wallet selection */}
        <PayConfirmModal
          isOpen={isPayConfirmOpen}
          onClose={() => setIsPayConfirmOpen(false)}
          onPayNow={handlePayNow}
          onWalletSelect={handleWalletSelect}
          walletAddress={walletAddress}
          availableBalance={walletBalance}
          amount={article?.priceInfo ? `${article.priceInfo.price} ${article.priceInfo.currency}` : '0.01 USDC'}
          network={getNetworkConfig(selectedNetwork).name}
          faucetLink={selectedNetwork === 'xlayer' && walletType === 'okx' ? 'https://www.okx.com/dex' : 'https://faucet.circle.com/'}
          isInsufficientBalance={(() => {
            // Don't show insufficient balance if wallet is not connected
            if (!isWalletConnected) return false;
            if (!x402PaymentInfo || !walletBalance || walletBalance === '...') return false;
            const balance = parseFloat(walletBalance);
            const required = parseInt(x402PaymentInfo.amount) / 1000000;
            return !isNaN(balance) && balance < required;
          })()}
          walletType={walletType}
          selectedNetwork={selectedNetwork}
          selectedCurrency={selectedCurrency}
          isWalletConnected={isWalletConnected}
          onDisconnectWallet={() => {
            setIsWalletConnected(false);
            setWalletAddress('');
            setWalletBalance('0');
            setWalletProvider(null);
            setWalletType('');
          }}
          onNetworkChange={(network) => {
            setSelectedNetwork(network as NetworkType);
            // Refresh balance and fetch payment info when network changes
            if (walletProvider && walletAddress) {
              // Fetch balance
              fetchTokenBalance(walletProvider, walletAddress, network as NetworkType, selectedCurrency)
                .then(balance => setWalletBalance(balance))
                .catch(() => setWalletBalance('0.00'));

              // Fetch payment info proactively for better UX
              fetchPaymentInfo(network as NetworkType)
                .catch(error => console.warn('Failed to preload payment info:', error));
            }
          }}
          onCurrencyChange={(currency) => {
            setSelectedCurrency(currency as TokenType);
            // Refresh balance when currency changes
            if (walletProvider && walletAddress && selectedNetwork === 'xlayer') {
              fetchTokenBalance(walletProvider, walletAddress, selectedNetwork, currency as TokenType)
                .then(balance => setWalletBalance(balance))
                .catch(() => setWalletBalance('0.00'));
            }
          }}
        />
      </div>
    </div>
  );
};