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
import { useArticleWithComments } from "../../hooks/queries/useArticleWithComments";
import { getCategoryStyle, getCategoryInlineStyle } from "../../utils/categoryStyles";
import { AuthService } from "../../services/authService";
import { TreasureButton } from "../../components/ui/TreasureButton";
import { ShareDropdown } from "../../components/ui/ShareDropdown";
import { CommentButton } from "../../components/ui/CommentButton";
import { CollectTreasureModal } from "../../components/CollectTreasureModal";
import { TreasuryCard, SpaceData } from "../../components/ui/TreasuryCard";
import { CommentSection } from "../../components/CommentSection";
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
import { getNetworkConfig, getTokenContract, getSupportedTokens, NetworkType, TokenType } from '../../config/contracts';
import { SUPPORTED_TOKENS, TokenInfo } from '../../types/payment';
import { getIconUrl, getIconStyle } from '../../config/icons';

// Helper function to get token information for payment requests
const getTokenInfo = (tokenType: TokenType): TokenInfo => {
  return SUPPORTED_TOKENS[tokenType];
};

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

  // Fix malformed extensions like '.svg+xml' -> '.svg'
  // This can happen when MIME type 'image/svg+xml' is incorrectly used as extension
  if (imageUrl.endsWith('+xml')) {
    imageUrl = imageUrl.replace(/\+xml$/, '');
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

  // Collect Treasure Modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);

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
  // Set default network based on auth method
  const getDefaultNetwork = (): NetworkType => {
    const authMethod = localStorage.getItem('copus_auth_method');
    const defaultNetwork = authMethod === 'okx' ? 'xlayer' : 'base-mainnet';
    console.log('🔧 Default network selection:', { authMethod, defaultNetwork });
    return defaultNetwork;
  };

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(getDefaultNetwork());
  const [selectedCurrency, setSelectedCurrency] = useState<TokenType>('usdt');

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

  // Get comment count for the comment button
  const { totalComments, isLoading: isCommentsLoading } = useArticleWithComments(
    id || '',
    {
      commentsEnabled: false // Only get comment count, not the full comments
    }
  );

  // State for "Collected in" section - stores spaces directly
  const [collectedInData, setCollectedInData] = useState<SpaceData[]>([]);

  // Comment section modal state
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);

  // Handle modal animation timing
  useEffect(() => {
    if (isCommentSectionOpen) {
      // Show modal immediately when opening
      setShouldShowModal(true);
    } else {
      // Delay hiding modal until animation completes
      const timer = setTimeout(() => {
        setShouldShowModal(false);
      }, 500); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isCommentSectionOpen]);

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
    if (article && import.meta.env.MODE === 'development') {
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

  // Fetch "Collected in" data - get spaces that contain this article
  useEffect(() => {
    const fetchCollectedInData = async () => {
      if (!article || !article.id) {
        return;
      }

      try {
        // Fetch spaces that contain this article using the article's id field
        const spacesResponse = await AuthService.getSpacesByArticleId(article.id);
        console.log('Spaces by article ID response:', spacesResponse);

        // Parse the response - handle different possible formats
        let spacesArray: SpaceData[] = [];
        if (spacesResponse?.data?.data && Array.isArray(spacesResponse.data.data)) {
          spacesArray = spacesResponse.data.data;
        } else if (spacesResponse?.data && Array.isArray(spacesResponse.data)) {
          spacesArray = spacesResponse.data;
        } else if (Array.isArray(spacesResponse)) {
          spacesArray = spacesResponse;
        }

        // Use space data directly from API response
        // The spacesByArticleId API returns spaces with a `data` array containing preview articles
        // NOTE: Backend currently returns only 2 preview articles per space - if 3 are needed,
        // the backend API needs to be updated to return 3 preview articles
        setCollectedInData(spacesArray);
      } catch (err) {
        console.error('Failed to fetch collected in data:', err);
        setCollectedInData([]);
      }
    };

    fetchCollectedInData();
  }, [article]);

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

    // Always show the collect modal (whether liked or not)
    // User can uncollect from within the modal
    setCollectModalOpen(true);
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
      console.log('🌐 Payment API selection:', { network, paymentEndpoint });

      // Build URL with uuid parameter (new OKX API only requires uuid)
      const urlParams = new URLSearchParams({ uuid: article.uuid });

      const x402Url = `${apiBaseUrl}${paymentEndpoint}?${urlParams.toString()}`;

      // Add user authentication token and prepare request
      const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // For now, use GET request with query parameters (Backend might need POST implementation)
      const supportedTokens = getSupportedTokens(network);
      console.log('🔍 Token selection debug:', {
        network,
        selectedCurrency,
        supportedTokens,
        isSupported: supportedTokens.includes(selectedCurrency)
      });

      const tokenInfo = supportedTokens.includes(selectedCurrency)
        ? getTokenInfo(selectedCurrency)
        : getTokenInfo('usdc'); // fallback to usdc

      console.log('📋 Selected token info:', tokenInfo);

      // Add token info to URL parameters
      const extendedParams = new URLSearchParams({
        uuid: article.uuid,
        name: tokenInfo.name,
        verifyingContract: tokenInfo.verifyingContract
      });

      console.log('🔍 Payment request parameters:', {
        uuid: article.uuid,
        name: tokenInfo.name,
        verifyingContract: tokenInfo.verifyingContract,
        nameEmpty: !tokenInfo.name,
        contractEmpty: !tokenInfo.verifyingContract
      });

      const fullUrl = `${apiBaseUrl}${paymentEndpoint}?${extendedParams.toString()}`;
      console.log('📤 Payment info request for', network, ':', {
        url: fullUrl,
        params: Object.fromEntries(extendedParams),
        selectedCurrency: selectedCurrency,
        tokenInfo: tokenInfo,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });

      console.log('🚀 Sending payment API request...');
      const response = await fetch(fullUrl, { headers });

      console.log('📡 Payment API response status:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok && response.status !== 402) {
        // 402 is the expected "Payment Required" status for payment APIs
        console.error(`❌ Payment API returned ${response.status} ${response.statusText}`);
        if (response.status === 500) {
          throw new Error('Server error - payment API is experiencing issues');
        } else {
          throw new Error(`Payment API error: ${response.status} ${response.statusText}`);
        }
      }

      let data = await response.json();
      console.log('📦 Payment API raw response data:', {
        network: network,
        responseType: typeof data,
        dataKeys: Object.keys(data || {}),
        data: data
      });

      // Unwrap common API response wrappers (e.g., { data: { ... } } or { code: 0, data: { ... } })
      if (data && typeof data === 'object' && !data.domain && !data.message && !data.accepts) {
        if (data.data && (typeof data.data === 'object' || typeof data.data === 'string')) {
          console.log('📦 Unwrapping nested data field:', data.data);
          data = data.data;
        }
      }

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
      } else if ((network === 'base-mainnet' || network === 'base-sepolia') && (typeof data === 'string' || (data && data.domain && data.message))) {
        // Base API may return target URL as string or EIP-712 structure
        // If it returns EIP-712 structure, handle it like XLayer
        if (data && data.domain && data.message) {
          // Base API returned EIP-712 structure
          const testConnectedAddress = walletAddress;
          const testStoredAddress = user?.walletAddress;

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

          const addressToUse = actualWalletAddress || testConnectedAddress || testStoredAddress;
          if (!addressToUse) {
            throw new Error('Please connect your wallet first');
          }

          const eip712Data = {
            ...data,
            message: {
              ...data.message,
              from: addressToUse
            }
          };

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
          return { eip712Data, paymentInfo };
        }

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
            name: selectedCurrency === 'usdc' ? 'USD Coin' : 'USD₮',
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
    console.log('💳 ========== 开始支付流程 ==========');
    console.log('🌐 环境和配置信息:');
    console.log('  当前环境:', import.meta.env.MODE);
    console.log('  API基础URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('  当前域名:', window.location.origin);

    console.log('🔍 初始支付状态检查:');
    console.log('  支付进行中:', isPaymentInProgress);
    console.log('  钱包地址:', walletAddress);
    console.log('  钱包提供者:', !!walletProvider);
    console.log('  选择的网络:', selectedNetwork);
    console.log('  选择的货币:', selectedCurrency);
    console.log('  钱包类型:', walletType);

    // 检查USDT特定配置
    if (selectedCurrency === 'usdt') {
      console.log('💰 USDT支付特定检查:');
      const networkConfig = getNetworkConfig(selectedNetwork);
      console.log('  X Layer网络配置:', networkConfig);
      console.log('  X Layer是否支持USDT:', getSupportedTokens(selectedNetwork).includes('usdt'));
      console.log('  USDT合约地址:', getTokenContract(selectedNetwork, 'usdt'));
    }

    // 防止重复提交
    if (isPaymentInProgress) {
      console.warn('⚠️ 支付已在进行中，终止操作');
      showToast('Payment is in progress, please wait...', 'warning');
      return;
    }

    if (!walletAddress || !walletProvider) {
      console.error('❌ 钱包未正确连接:', { 钱包地址: walletAddress, 钱包提供者: !!walletProvider });
      showToast('Wallet not connected', 'error');
      return;
    }

    // 开始支付，设置状态
    setIsPaymentInProgress(true);
    console.log('🚀 支付流程已启动，设置状态为进行中');

    // Local variables to store fresh data for immediate use
    let currentEip712Data = okxEip712Data;
    let currentPaymentInfo = x402PaymentInfo;

    console.log('📊 当前支付数据状态:');
    console.log('  当前EIP712数据:', !!currentEip712Data ? '可用' : '不可用');
    console.log('  当前支付信息:', !!currentPaymentInfo ? '可用' : '不可用');
    if (currentEip712Data) {
      console.log('  EIP-712域:', currentEip712Data.domain);
      console.log('  EIP-712消息预览:', {
        发送者: currentEip712Data.message?.from,
        接收者: currentEip712Data.message?.to,
        金额: currentEip712Data.message?.value
      });
    }
    if (currentPaymentInfo) {
      console.log('  支付信息:', {
        支付给: currentPaymentInfo.payTo,
        资产: currentPaymentInfo.asset,
        金额: currentPaymentInfo.amount,
        网络: currentPaymentInfo.network
      });
    }

    // 确定在整个支付过程中使用的最终地址
    let finalPaymentAddress = walletAddress;
    console.log('👤 确定最终支付地址:');
    console.log('  初始钱包地址:', walletAddress);
    try {
      const accounts = await walletProvider.request({ method: 'eth_accounts' });
      console.log('  从钱包提供者获取的账户:', accounts);
      finalPaymentAddress = accounts[0] || walletAddress;
      console.log('  选择的最终支付地址:', finalPaymentAddress);
    } catch (error) {
      console.warn('⚠️ Failed to get wallet account, using stored address:', error);
      console.log('  回退到存储的钱包地址:', walletAddress);
    }

    try {
      // 检查支付信息是否可用（应该已预加载）
      // 所有网络现在都使用带有EIP-712格式的新OKX API
      console.log('🔄 检查支付数据可用性:');
      console.log('  x402支付信息可用:', !!x402PaymentInfo);
      console.log('  当前EIP712数据可用:', !!currentEip712Data);
      console.log('  网络匹配:', x402PaymentInfo?.network === selectedNetwork);

      if (!x402PaymentInfo || !currentEip712Data || x402PaymentInfo.network !== selectedNetwork) {
        console.log('⚠️ 支付数据不可用或网络不匹配，获取新数据');
        console.log('  需要为网络获取:', selectedNetwork);
        showToast(`Preparing payment for ${selectedNetwork}...`, 'info');

        console.log('📡 Fetching payment info...');
        const fetchedData = await fetchPaymentInfo(selectedNetwork);
        console.log('📡 Payment info fetch result:', {
          hasEIP712Data: !!fetchedData.eip712Data,
          hasPaymentInfo: !!fetchedData.paymentInfo
        });

        // Check if we got payment info
        if (!fetchedData.paymentInfo) {
          console.error('❌ Payment info missing:', fetchedData);
          throw new Error(`Failed to get payment data for ${selectedNetwork}`);
        }

        currentPaymentInfo = fetchedData.paymentInfo;

        // For Base networks, if EIP-712 data is not provided, construct it manually
        if (!fetchedData.eip712Data && (selectedNetwork === 'base-mainnet' || selectedNetwork === 'base-sepolia')) {
          console.log('📝 Constructing EIP-712 data for Base network...');
          const contractAddress = getTokenContract(selectedNetwork, selectedCurrency);
          const nonce = generateNonce();
          const now = Math.floor(Date.now() / 1000);

          currentEip712Data = {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' }
              ],
              TransferWithAuthorization: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'validAfter', type: 'uint256' },
                { name: 'validBefore', type: 'uint256' },
                { name: 'nonce', type: 'bytes32' }
              ]
            },
            primaryType: 'TransferWithAuthorization',
            domain: {
              name: 'USD Coin',
              version: '2',
              chainId: parseInt(getNetworkConfig(selectedNetwork).chainId, 16),
              verifyingContract: contractAddress
            },
            message: {
              from: finalPaymentAddress,
              to: currentPaymentInfo.payTo,
              value: currentPaymentInfo.amount,
              validAfter: now.toString(),
              validBefore: (now + 3600).toString(),
              nonce: nonce
            }
          };
          console.log('✅ EIP-712 data constructed:', currentEip712Data);
        } else if (fetchedData.eip712Data) {
          currentEip712Data = fetchedData.eip712Data;
        } else {
          console.error('❌ EIP-712 data missing and not a Base network:', fetchedData);
          throw new Error(`Failed to get EIP-712 data for ${selectedNetwork}`);
        }

        console.log('✅ Payment data ready for use');
      } else {
        console.log('✅ 使用缓存的支付数据');
      }

      // 确保用户在正确的网络上进行支付
      console.log('🔗 网络验证和切换:');
      const paymentNetworkConfig = getNetworkConfig(selectedNetwork);
      console.log('  选择的网络:', selectedNetwork);
      console.log('  期望的链ID:', paymentNetworkConfig.chainId);
      console.log('  网络配置:', paymentNetworkConfig);

      const chainId = await walletProvider.request({ method: 'eth_chainId' });
      console.log('  当前钱包链ID:', chainId);

      if (chainId !== paymentNetworkConfig.chainId) {
        console.log('⚠️ 检测到网络不匹配，正在切换网络');
        console.log('  从:', chainId);
        console.log('  到:', paymentNetworkConfig.chainId);
        showToast(`Switching to ${selectedNetwork} network for payment...`, 'info');
        await switchToNetwork(walletProvider, selectedNetwork);
        console.log('✅ 网络切换完成');
      } else {
        console.log('✅ 已在正确的网络上');
      }

      // 创建ERC-3009 TransferWithAuthorization签名
      const walletName = walletType === 'metamask' ? 'MetaMask' : walletType === 'okx' ? 'OKX Wallet' : 'Coinbase Wallet';
      console.log('✍️ 启动签名流程:');
      console.log('  钱包类型:', walletType);
      console.log('  钱包名称:', walletName);
      console.log('  最终支付地址:', finalPaymentAddress);

      showToast(`Please sign the payment authorization in ${walletName}...`, 'info');

      let signedAuth;

      // All networks now use EIP-712 signing with the new OKX API
      if (currentEip712Data) {
        console.log('✍️ Starting EIP-712 signature process:');

        // Get payment contract address and chain ID for the selected network
        const paymentContractAddress = getTokenContract(selectedNetwork, selectedCurrency);
        const chainIdInt = parseInt(paymentNetworkConfig.chainId, 16);

        console.log('  Contract address:', paymentContractAddress);
        console.log('  Chain ID (int):', chainIdInt);
        console.log('  Selected currency:', selectedCurrency);

        // Try OKX-optimized signing method first (for XLayer), fallback to standard EIP-712
        try {
          if (selectedNetwork === 'xlayer' && walletType === 'okx') {
            console.log('🦊 ========== INITIATING OKX SIGNING FOR XLAYER ==========');
            console.log('🦊 [MAIN] Attempting OKX browser signature method for XLayer...');
            console.log('🦊 [MAIN] OKX wallet detected, using specialized signing');
            console.log('🦊 [MAIN] 钱包检查详情:');
            console.log('  钱包对象存在:', !!walletProvider);
            console.log('  isOKXWallet标识:', walletProvider?.isOKXWallet);
            console.log('  钱包名称:', walletProvider?.name);
            console.log('  钱包版本:', walletProvider?.version);

            // Extract parameters from EIP-712 data for OKX method
            const transferParams = {
              from: finalPaymentAddress,
              to: currentEip712Data.message.to,
              value: currentEip712Data.message.value,
              validAfter: parseInt(currentEip712Data.message.validAfter),
              validBefore: parseInt(currentEip712Data.message.validBefore),
              nonce: currentEip712Data.message.nonce
            };

            console.log('🦊 [MAIN] OKX Transfer params extracted from EIP-712 data:', transferParams);
            console.log('🦊 [MAIN] Additional OKX signing context:', {
              chainIdInt: chainIdInt,
              paymentContractAddress: paymentContractAddress,
              selectedCurrency: selectedCurrency,
              walletProvider: walletProvider?.isOKXWallet ? 'OKX Wallet' : 'Unknown',
              currentEip712DataKeys: Object.keys(currentEip712Data)
            });

            console.log('🦊 [MAIN] Calling signTransferWithAuthorizationOKXBrowser...');
            signedAuth = await signTransferWithAuthorizationOKXBrowser(
              transferParams,
              walletProvider,
              chainIdInt,
              paymentContractAddress || '',
              selectedCurrency // Pass the selected token type
            );

            console.log('🦊 [MAIN] ✅ OKX browser signature successful!');
            console.log('🦊 [MAIN] OKX signed result:', signedAuth);
            console.log('🦊 ========== OKX SIGNING COMPLETED ==========');
          } else {
            throw new Error('Using standard EIP-712 method');
          }
        } catch (okxError) {
          console.log('📝 Using standard EIP-712 signing method...');
          console.log('  OKX error (fallback expected):', okxError);

          // Standard EIP-712 signing for all wallets and networks
          const correctedEip712Data = {
            ...currentEip712Data,
            message: {
              ...currentEip712Data.message,
              from: finalPaymentAddress
            }
          };

          console.log('📝 Corrected EIP-712 data for standard signing:');
          console.log('  Domain:', correctedEip712Data.domain);
          console.log('  Message:', correctedEip712Data.message);
          console.log('  From address correction:', {
            original: currentEip712Data.message.from,
            corrected: finalPaymentAddress
          });

          // 签名前的详细检查
          console.log('🔍 ========== 签名前详细检查 ==========');
          console.log('🔍 EIP-712数据完整性验证:');
          console.log('  域名:', correctedEip712Data.domain?.name);
          console.log('  版本:', correctedEip712Data.domain?.version);
          console.log('  链ID:', correctedEip712Data.domain?.chainId);
          console.log('  验证合约:', correctedEip712Data.domain?.verifyingContract);
          console.log('  主要类型:', correctedEip712Data.primaryType);

          console.log('🔍 消息参数验证:');
          console.log('  发送方:', correctedEip712Data.message.from);
          console.log('  接收方:', correctedEip712Data.message.to);
          console.log('  金额:', correctedEip712Data.message.value);
          console.log('  有效开始时间:', correctedEip712Data.message.validAfter);
          console.log('  有效结束时间:', correctedEip712Data.message.validBefore);
          console.log('  随机数:', correctedEip712Data.message.nonce);

          console.log('🔍 环境检查:');
          console.log('  钱包提供者类型:', typeof walletProvider);
          console.log('  钱包提供者可用:', !!walletProvider);
          console.log('  是否有request方法:', typeof walletProvider?.request === 'function');
          console.log('  发送方地址格式检查:', {
            地址: finalPaymentAddress,
            长度: finalPaymentAddress?.length,
            是否以0x开头: finalPaymentAddress?.startsWith('0x'),
            是否为有效格式: /^0x[a-fA-F0-9]{40}$/.test(finalPaymentAddress || '')
          });

          console.log('🔍 JSON序列化检查:');
          const jsonString = JSON.stringify(correctedEip712Data);
          console.log('  序列化长度:', jsonString.length);
          console.log('  序列化预览:', jsonString.substring(0, 200) + '...');

          // 验证JSON可以被正确解析
          try {
            const parsed = JSON.parse(jsonString);
            console.log('  ✅ JSON序列化/解析验证通过');
          } catch (jsonError) {
            console.error('  ❌ JSON序列化/解析失败:', jsonError);
          }

          console.log('📤 Sending eth_signTypedData_v4 request...');
          console.log('📤 请求参数详情:');
          console.log('  方法:', 'eth_signTypedData_v4');
          console.log('  参数1 (账户地址):', finalPaymentAddress);
          console.log('  参数2 (数据)长度:', jsonString.length);

          // 显示时间戳便于追踪
          const signRequestTime = new Date().toISOString();
          console.log('📤 签名请求发送时间:', signRequestTime);
          // Sign using eth_signTypedData_v4 with the corrected structure
          const signature = await walletProvider.request({
            method: 'eth_signTypedData_v4',
            params: [finalPaymentAddress, JSON.stringify(correctedEip712Data)]
          });

          // 记录签名响应时间
          const signResponseTime = new Date().toISOString();
          console.log('📥 签名响应接收时间:', signResponseTime);

          console.log('✅ Standard signature received:', signature);

          // 签名后的详细分析
          console.log('🔍 ========== 签名后详细分析 ==========');
          console.log('🔍 原始签名数据分析:');
          console.log('  签名类型:', typeof signature);
          console.log('  签名长度:', signature?.length);
          console.log('  签名格式检查:', {
            是否以0x开头: signature?.startsWith('0x'),
            是否为字符串: typeof signature === 'string',
            期望长度: signature?.length === 132, // 0x + 64 + 64 + 2 = 132
          });

          // 验证签名格式
          const signatureRegex = /^0x[a-fA-F0-9]{130}$/;
          const isValidSignatureFormat = signatureRegex.test(signature || '');
          console.log('  签名格式有效性:', isValidSignatureFormat);

          if (!isValidSignatureFormat) {
            console.error('❌ 签名格式无效!');
            console.error('  期望格式: 0x + 130个十六进制字符');
            console.error('  实际接收:', signature);
          }

          // Parse signature into v, r, s components
          const r = signature.slice(0, 66);
          const s = '0x' + signature.slice(66, 130);
          const vHex = signature.slice(130, 132);
          const v = parseInt(vHex, 16);

          console.log('🔪 Standard signature parsing:');
          console.log('  r组件:', r, '(长度:', r.length, ')');
          console.log('  s组件:', s, '(长度:', s.length, ')');
          console.log('  vHex:', vHex, '(长度:', vHex.length, ')');
          console.log('  v十进制:', v);

          // 验证解析的组件
          console.log('🔍 签名组件验证:');
          const isValidR = /^0x[a-fA-F0-9]{64}$/.test(r);
          const isValidS = /^0x[a-fA-F0-9]{64}$/.test(s);
          const isValidV = v === 27 || v === 28 || v === 0 || v === 1;

          console.log('  r组件有效性:', isValidR);
          console.log('  s组件有效性:', isValidS);
          console.log('  v值有效性:', isValidV, '(期望值: 0,1,27,28)');

          if (!isValidR || !isValidS || !isValidV) {
            console.warn('⚠️ 一些签名组件验证失败，这可能导致后续问题');
          }

          console.log('🔍 签名重建验证:');
          const rebuiltSignature = r + s.slice(2) + vHex;
          const rebuiltMatches = rebuiltSignature === signature;
          console.log('  重建签名:', rebuiltSignature);
          console.log('  与原始匹配:', rebuiltMatches);

          if (!rebuiltMatches) {
            console.error('❌ 签名重建失败! 这表明解析过程有问题');
          }

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

          console.log('✅ Final signed authorization (standard):', signedAuth);
        }
      } else {
        console.error('❌ No EIP-712 data available for signing');
        throw new Error('No EIP-712 data available for signing');
      }

      // Map network name for x402 protocol
      // x402 protocol uses 'base' for Base mainnet, not 'base-mainnet'
      console.log('🗺️ Network name mapping:');
      console.log('  Selected network:', selectedNetwork);
      console.log('  Current payment info network:', currentPaymentInfo.network);

      const x402NetworkName = selectedNetwork === 'base-mainnet' ? 'base' :
                             selectedNetwork === 'xlayer' ? 'xlayer' :
                             currentPaymentInfo.network;

      console.log('  Mapped x402 network name:', x402NetworkName);

      console.log('💳 Creating X-PAYMENT header...');
      console.log('  Network:', x402NetworkName);
      console.log('  Asset:', currentPaymentInfo.asset);
      console.log('  Signed auth summary:', {
        from: signedAuth.from,
        to: signedAuth.to,
        value: signedAuth.value,
        v: signedAuth.v
      });

      // Create X-PAYMENT header with signed authorization
      const paymentHeader = createX402PaymentHeader(
        signedAuth,
        x402NetworkName,
        currentPaymentInfo.asset
      );

      console.log('✅ X-PAYMENT header created successfully');

      // Debug output for development
      if (import.meta.env.MODE === 'development') {
        try {
          const decodedHeader = JSON.parse(atob(paymentHeader));
          console.log('🔍 Payment header verification:');
          console.log('  Network in header:', decodedHeader.network);
          console.log('  X402 version:', decodedHeader.x402Version);
          console.log('  Scheme:', decodedHeader.scheme);

          const verification = {
            fromMatches: decodedHeader.payload?.authorization?.from === finalPaymentAddress,
            toMatches: decodedHeader.payload?.authorization?.to === currentPaymentInfo.payTo,
            valueMatches: decodedHeader.payload?.authorization?.value === currentPaymentInfo.amount?.toString()
          };
          console.log('  Verification results:', verification);

          if (!verification.fromMatches || !verification.toMatches || !verification.valueMatches) {
            console.warn('⚠️ Payment header verification failed!');
            console.log('    Expected from:', finalPaymentAddress);
            console.log('    Header from:', decodedHeader.payload?.authorization?.from);
            console.log('    Expected to:', currentPaymentInfo.payTo);
            console.log('    Header to:', decodedHeader.payload?.authorization?.to);
            console.log('    Expected value:', currentPaymentInfo.amount?.toString());
            console.log('    Header value:', decodedHeader.payload?.authorization?.value);
          } else {
            console.log('✅ Payment header verification successful');
          }
        } catch (e) {
          console.error('❌ Failed to decode payment header for debug:', e);
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

      // Add X-PAYMENT-ASSET header with contract address for USDT support
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

      // Ensure payment URL includes all necessary parameters and uses the same address as EIP-712 data
      let paymentUrl = currentPaymentInfo.resource;
      console.log('🔗 Payment URL preparation:');
      console.log('  Original resource URL:', currentPaymentInfo.resource);

      const url = new URL(paymentUrl);

      // Get token info for URL parameters
      const supportedTokens = getSupportedTokens(selectedNetwork as NetworkType);
      const currentTokenInfo = supportedTokens.includes(selectedCurrency)
        ? getTokenInfo(selectedCurrency)
        : getTokenInfo('usdc');

      // Add token info parameters for verification
      url.searchParams.set('name', currentTokenInfo.name);
      url.searchParams.set('verifyingContract', currentTokenInfo.verifyingContract);

      if (selectedNetwork === 'xlayer' && paymentUrl.includes('from=')) {
        // Replace the 'from' parameter with the final payment address
        const originalFrom = url.searchParams.get('from');
        url.searchParams.set('from', finalPaymentAddress);
        console.log('  XLayer URL address correction:');
        console.log('    Original from:', originalFrom);
        console.log('    Corrected from:', finalPaymentAddress);
      } else {
        console.log('  Using original URL (no address correction needed)');
      }

      paymentUrl = url.toString();
      console.log('🔗 Final payment URL with all parameters:', paymentUrl);

      console.log('📤 Final payment request details:');
      console.log('  URL:', paymentUrl);
      console.log('  Headers summary:', {
        'X-PAYMENT': `${paymentHeader.substring(0, 50)}... (${paymentHeader.length} chars)`,
        'X-PAYMENT-ASSET': paymentHeaders['X-PAYMENT-ASSET'] || 'Not provided',
        'Authorization': token ? 'Bearer [TOKEN]' : 'Not provided',
        'Content-Type': paymentHeaders['Content-Type']
      });
      console.log('  Complete headers object:', paymentHeaders);

      console.log('🚀 发送支付请求...');
      const unlockResponse = await fetch(paymentUrl, {
        headers: paymentHeaders
      });

      console.log('📥 收到支付响应:');
      console.log('  状态码:', unlockResponse.status);
      console.log('  状态文本:', unlockResponse.statusText);
      console.log('  请求成功:', unlockResponse.ok);


      if (!unlockResponse.ok) {
        console.error('❌ 支付请求失败');
        const errorText = await unlockResponse.text();
        console.error('📄 错误响应详情:', {
          状态码: unlockResponse.status,
          状态文本: unlockResponse.statusText,
          响应头: Object.fromEntries(unlockResponse.headers),
          错误内容: errorText,
          网络: currentPaymentInfo.network,
          请求URL: paymentUrl
        });

        // 尝试将错误解析为JSON以便更好地调试
        try {
          const errorJson = JSON.parse(errorText);
          console.error('📄 解析的错误JSON:', errorJson);
        } catch (parseError) {
          console.log('📄 错误响应不是JSON格式，原始文本:', errorText);
        }

        throw new Error(`Payment verification failed: ${unlockResponse.status} ${unlockResponse.statusText}`);
      }

      console.log('✅ 支付请求成功');
      const unlockData = await unlockResponse.json();
      console.log('🎉 支付成功响应:', unlockData);
      console.log('📄 响应结构分析:', {
        有data字段: 'data' in unlockData,
        有targetUrl字段: 'targetUrl' in unlockData,
        有url字段: 'url' in unlockData,
        data值: unlockData.data,
        targetUrl值: unlockData.targetUrl,
        url值: unlockData.url,
        所有字段: Object.keys(unlockData)
      });

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
      console.error('❌ ========== 支付错误 ==========');
      console.error('错误详情:', {
        错误消息: error.message,
        错误代码: error.code,
        错误堆栈: error.stack,
        错误名称: error.name,
        完整错误: error
      });

      if (error.code === 4001) {
        console.log('👤 用户取消了签名');
        showToast('Signature cancelled', 'info');
      } else if (error.code === 4902) {
        console.log('🔗 钱包中未添加该网络');
        showToast('Please add the network to your wallet', 'error');
      } else {
        console.error('💥 意外的支付错误:', error.message || '未知错误');
        showToast(`Payment failed: ${error.message || 'Unknown error'}`, 'error');
      }

      console.error('❌ ========== 支付错误结束 ==========');
    } finally {
      // 重置支付状态，允许下次支付
      console.log('🔄 重置支付状态');
      setIsPaymentInProgress(false);
      console.log('💳 ========== 支付流程结束 ==========');
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

        <main className="flex flex-col lg:flex-row items-start pt-[70px] lg:pt-[120px] pb-[120px] px-4 lg:px-[30px] relative flex-1 w-full max-w-[1250px] mx-auto grow">
          {/* Main Content Column */}
          <div className="flex-1 w-full">
            <article className="flex flex-col items-start justify-between pt-0 pb-[30px] px-0 relative flex-1 self-stretch w-full grow border-b [border-bottom-style:solid] border-[#E0E0E0]">
            <div className="flex flex-col items-start gap-[30px] self-stretch w-full relative flex-[0_0_auto]">
              <div className="flex flex-col lg:flex-row items-start gap-[40px] pt-0 pb-[30px] px-0 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col lg:h-[205px] items-start justify-start relative flex-1 grow gap-6">
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
                        className="relative flex-1 [font-family:'Lato',Helvetica] font-semibold text-[#231f20] text-[36px] lg:text-[40px] tracking-[-0.5px] leading-[44px] lg:leading-[50px] break-words"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {content.title}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="relative w-full lg:w-[280px] h-[158px] rounded-lg aspect-[1.78] bg-[url(https://c.animaapp.com/5EW1c9Rn/img/image@2x.png)] bg-cover bg-[50%_50%]"
                     style={{
                       backgroundImage: `url(${getValidDetailImageUrl(content.coverImage)})`
                     }}
                />
              </div>

              <blockquote className="flex flex-col items-start gap-5 p-5 lg:p-[30px] relative self-stretch w-full flex-[0_0_auto] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] rounded-lg">
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

                  <span className="relative w-fit [font-family:'Lato',Helvetica] text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap hover:text-blue-600 transition-colors duration-200" style={{ fontWeight: 450 }}>
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

                  <span className="mt-[-1.00px] relative w-fit [font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
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

            {/* Collected in spaces section - moved back to article content */}
            {collectedInData.length > 0 && (
              <section className="mt-[50px] border-t border-[#D3D3D3] pt-[30px]">
                <h2 className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-xl tracking-[0] leading-[28px] mb-[20px]">
                  Collected in
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectedInData.map((space) => (
                    <TreasuryCard
                      key={space.namespace || space.id?.toString()}
                      space={space}
                      onClick={() => navigate(space.namespace ? `/treasury/${space.namespace}` : '/')}
                    />
                  ))}
                </div>
              </section>
            )}
            </article>

            {/* Comment Section Modal - NetEase Music Style */}
            {shouldShowModal && article && (
              <>
                {/* Apple-style frosted glass backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCommentSectionOpen(false)}
                  style={{
                    transition: 'opacity 600ms cubic-bezier(0.4, 0.0, 0.2, 1), backdrop-filter 800ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    opacity: isCommentSectionOpen ? 1 : 0,
                    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.35) 100%)',
                    backdropFilter: isCommentSectionOpen
                      ? 'blur(25px) brightness(0.85) saturate(1.6) contrast(1.15)'
                      : 'blur(0px) brightness(1) saturate(1) contrast(1)',
                    WebkitBackdropFilter: isCommentSectionOpen
                      ? 'blur(25px) brightness(0.85) saturate(1.6) contrast(1.15)'
                      : 'blur(0px) brightness(1) saturate(1) contrast(1)',
                  }}
                />

                {/* Apple-style frosted glass modal */}
                <div
                  className="fixed bottom-0 left-0 right-0 z-50"
                  style={{
                    transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms cubic-bezier(0.4, 0.0, 0.2, 1), scale 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isCommentSectionOpen
                      ? 'translateY(0%) scale(1)'
                      : 'translateY(100%) scale(0.95)',
                    opacity: isCommentSectionOpen ? 1 : 0,
                    transformOrigin: 'center bottom'
                  }}
                >
                  <div
                    className="max-h-[85vh] overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 50%, rgba(241, 245, 249, 0.85) 100%)',
                      backdropFilter: 'blur(45px) brightness(1.12) saturate(1.6) contrast(1.08)',
                      WebkitBackdropFilter: 'blur(45px) brightness(1.12) saturate(1.6) contrast(1.08)',
                      borderRadius: '32px 32px 0 0',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderBottom: 'none',
                      boxShadow: `
                        0 -12px 40px rgba(0, 0, 0, 0.08),
                        0 -4px 16px rgba(0, 0, 0, 0.04),
                        0 -1px 4px rgba(0, 0, 0, 0.02),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9),
                        inset 0 0 30px rgba(255, 255, 255, 0.15)
                      `,
                    }}
                  >
                    {/* Apple-style drag indicator */}
                    <div className="flex justify-center py-4">
                      <div
                        className="w-12 h-1.5 rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.6) 0%, rgba(100, 116, 139, 0.7) 50%, rgba(148, 163, 184, 0.6) 100%)',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                          transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transform: isCommentSectionOpen ? 'scaleX(1)' : 'scaleX(0.7)',
                          opacity: isCommentSectionOpen ? 1 : 0,
                          animation: isCommentSectionOpen ? 'gentle-bounce 0.8s ease-out 0.3s' : 'none'
                        }}
                      />

                      {/* 添加弹跳动画 */}
                      <style jsx>{`
                        @keyframes gentle-bounce {
                          0% { transform: scaleX(0.7) scaleY(1); }
                          30% { transform: scaleX(1.1) scaleY(0.8); }
                          60% { transform: scaleX(0.95) scaleY(1.1); }
                          100% { transform: scaleX(1) scaleY(1); }
                        }
                      `}</style>
                    </div>

                    {/* Apple-style header with enhanced contrast */}
                    <div className="flex items-center justify-between px-6 pb-6">
                      <div className="flex items-center gap-4">
                        {/* Icon with enhanced visual hierarchy */}
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
                          style={{
                            background: 'linear-gradient(135deg, #ff6b35 0%, #f23a00 100%)',
                            boxShadow: '0 4px 12px rgba(242, 58, 0, 0.3), 0 2px 4px rgba(242, 58, 0, 0.2)',
                          }}
                        >
                          <svg
                            className="w-6 h-6 text-white filter drop-shadow-sm"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.109 3.194 2.676 3.741A11.04 11.04 0 0010.5 18a11.04 11.04 0 008.575-4.009c1.567-.547 2.676-2.05 2.676-3.741V6.75A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75v4.501z"
                            />
                          </svg>
                        </div>

                        <div className="flex flex-col">
                          <h3
                            className="[font-family:'Lato',Helvetica] font-bold text-2xl mb-1"
                            style={{
                              color: 'rgba(0, 0, 0, 0.9)',
                              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            评论区
                          </h3>
                          {!isCommentsLoading && (
                            <div className="flex items-center gap-2">
                              <span
                                className="[font-family:'Lato',Helvetica] text-sm font-medium"
                                style={{ color: 'rgba(0, 0, 0, 0.65)' }}
                              >
                                {totalComments === 0 ? '暂无评论' : `${totalComments} 条评论`}
                              </span>
                              {totalComments > 0 && (
                                <>
                                  <div
                                    className="w-1 h-1 rounded-full"
                                    style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                                  />
                                  <span
                                    className="[font-family:'Lato',Helvetica] text-xs font-medium"
                                    style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                                  >
                                    欢迎参与讨论
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Apple-style close button */}
                      <button
                        onClick={() => setIsCommentSectionOpen(false)}
                        className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 group"
                        style={{
                          background: 'rgba(0, 0, 0, 0.08)',
                          backdropFilter: 'blur(20px) brightness(1.2)',
                          border: '1px solid rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        <svg
                          className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          style={{ color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Apple-style content area with enhanced readability */}
                    <div
                      className="max-h-[72vh] overflow-y-auto px-2"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
                      }}
                    >
                      <div
                        className="mx-2 mb-4 rounded-2xl px-6 py-4"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(20px) brightness(1.05)',
                          border: '1px solid rgba(255, 255, 255, 0.8)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                        }}
                      >
                        {/* 懒加载评论 - 只在真正展开时才渲染 */}
                        {isCommentSectionOpen ? (
                          <CommentSection
                            targetType="article"
                            targetId={article.uuid}
                            className="px-0 py-0"
                          />
                        ) : (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500 [font-family:'Lato',Helvetica] text-sm">
                              评论加载中...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apple-style animations and scrollbar */}
                <style jsx>{`
                  /* Apple-style scrollbar */
                  .max-h-\\[72vh\\]::-webkit-scrollbar {
                    width: 4px;
                  }
                  .max-h-\\[72vh\\]::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .max-h-\\[72vh\\]::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 2px;
                    transition: background 0.3s ease, width 0.3s ease;
                  }
                  .max-h-\\[72vh\\]::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.25);
                    width: 6px;
                  }
                  .max-h-\\[72vh\\]::-webkit-scrollbar-thumb:active {
                    background: rgba(0, 0, 0, 0.35);
                  }
                  /* Hide scrollbar on non-hover */
                  .max-h-\\[72vh\\] {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
                  }
                `}</style>
              </>
            )}
          </div>

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

              {/* Comment button */}
              <CommentButton
                commentCount={totalComments || 0}
                isLoading={isCommentsLoading}
                onClick={() => setIsCommentSectionOpen(prev => !prev)}
                isExpanded={isCommentSectionOpen}
              />

              {/* Share dropdown menu */}
              <ShareDropdown
                title={content.title}
                url={window.location.href}
              />
            </div>

            <div className="flex items-center gap-5">
              {/* Edit button - only visible to author */}
              {(() => {
                // Use namespace for comparison (more reliable) with id as fallback
                const isAuthor = (user && article?.authorInfo) && (
                  (user.namespace && user.namespace === article.authorInfo.namespace) ||
                  (user.id && user.id === article.authorInfo.id)
                );

                console.log('Edit button check:', {
                  userId: user?.id,
                  userNamespace: user?.namespace,
                  authorId: article?.authorInfo?.id,
                  authorNamespace: article?.authorInfo?.namespace,
                  isAuthor
                });

                return isAuthor;
              })() && (
                <button
                  onClick={() => navigate(`/curate?edit=${article.uuid}`)}
                  className="w-[38px] h-[38px] relative cursor-pointer rounded-full transition-all duration-200 flex items-center justify-center border-0 p-0 hover:bg-gray-100"
                  aria-label="Edit"
                  title="Edit"
                >
                  <img
                    className="w-[22px] h-[22px]"
                    alt="Edit"
                    src={getIconUrl('EDIT')}
                    style={{ filter: getIconStyle('ICON_FILTER_DARK_GREY') }}
                  />
                </button>
              )}

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
            ) : null}
            </div>
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
          amount={article?.priceInfo ? `${article.priceInfo.price} USD` : '0.01 USD'}
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

        {/* Collect Treasure Modal */}
        {article && (
          <CollectTreasureModal
            isOpen={collectModalOpen}
            onClose={() => setCollectModalOpen(false)}
            articleId={article.uuid}
            articleNumericId={article.id}
            articleTitle={article.title}
            isAlreadyCollected={isLiked}
            onCollectSuccess={() => {
              // Update like state when collection is successful
              if (!isLiked) {
                const newLikesCount = likesCount + 1;
                setIsLiked(true);
                setLikesCount(newLikesCount);
                updateArticleLikeState(article.uuid, true, newLikesCount);
              }
            }}
          />
        )}

      </div>
    </div>
  );
};