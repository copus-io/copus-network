import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { HeaderSection } from "../../components/shared/HeaderSection/HeaderSection";
import { SideMenuSection } from "../../components/shared/SideMenuSection/SideMenuSection";
import { useUser } from "../../contexts/UserContext";
import { useCategory } from "../../contexts/CategoryContext";
import { useToast } from "../../components/ui/toast";
import { PaperPlane } from "../../components/ui/copus-loading";
import { AuthService } from "../../services/authService";
import { publishArticle, getArticleDetail } from "../../services/articleService";
import { useNavigate } from "react-router-dom";
import { getCategoryStyle, getCategoryInlineStyle } from "../../utils/categoryStyles";
import { ArticleCard, ArticleData } from "../../components/ArticleCard";
import { ImageCropper } from "../../components/ImageCropper/ImageCropper";
import { validateImageFile, compressImage, createImagePreview, revokeImagePreview } from "../../utils/imageUtils";
import { addRecentCategory, sortCategoriesByRecent } from "../../utils/recentCategories";
import profileDefaultAvatar from "../../assets/images/profile-default.svg";
import { queryClient } from "../../lib/queryClient";
import { getSpaceDisplayName } from "../../components/ui/TreasuryCard";
import { ChooseTreasuriesModal, SelectedSpace } from "../../components/ChooseTreasuriesModal/ChooseTreasuriesModal";


export const Create = (): JSX.Element => {
  const { user, isLoggedIn } = useUser();
  const { categories, categoriesLoading } = useCategory();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Check if in edit mode
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    link: "",
    title: "",
    recommendation: "",
    selectedTopic: "生活", // Default to Chinese category
    selectedTopicId: 1, // Corresponding ID
    coverImage: null as File | null,
  });

  // x402 pay-to-unlock states
  const [payToUnlock, setPayToUnlock] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("0.01");

  const [characterCount, setCharacterCount] = useState(0);
  const [titleCharacterCount, setTitleCharacterCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [linkValidation, setLinkValidation] = useState({ isValid: true, message: '' });
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // Image cropping states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [showImageCropper, setShowImageCropper] = useState(false);

  // Extension detection state
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  // User's spaces/treasuries state
  const [userSpaces, setUserSpaces] = useState<{ id: string; name: string }[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);

  // New treasury modal state
  const [showNewTreasuryModal, setShowNewTreasuryModal] = useState(false);
  const [newTreasuryName, setNewTreasuryName] = useState("");
  const [isCreatingTreasury, setIsCreatingTreasury] = useState(false);

  // Choose treasuries modal state
  const [showChooseTreasuriesModal, setShowChooseTreasuriesModal] = useState(false);
  const [selectedTreasuries, setSelectedTreasuries] = useState<SelectedSpace[]>([]);

  // Sort categories to show recently used ones first
  const sortedCategories = useMemo(() => {
    return sortCategoriesByRecent(categories);
  }, [categories]);

  // Fetch user's spaces using bindableSpaces API
  useEffect(() => {
    const fetchUserSpaces = async () => {
      if (!user?.id) {
        setSpacesLoading(false);
        return;
      }

      try {
        setSpacesLoading(true);
        // Use the new bindableSpaces API
        const response = await AuthService.getBindableSpaces();
        console.log('Bindable spaces response (Create page):', response);

        // Parse the response - handle different possible formats
        let spacesArray: any[] = [];
        if (response?.data && Array.isArray(response.data)) {
          spacesArray = response.data;
        } else if (Array.isArray(response)) {
          spacesArray = response;
        }

        // Transform spaces to the format expected by the dropdown
        const spaces: { id: string; name: string }[] = spacesArray.map((space: any) => {
          // Get display name using the same logic as TreasuryCard
          const displayName = getSpaceDisplayName({
            ...space,
            ownerInfo: { username: user.username || 'User' },
          });

          return {
            id: space.id.toString(),
            name: displayName,
          };
        });

        setUserSpaces(spaces);

        // Set default selection to first space if available
        if (spaces.length > 0 && !formData.selectedTopic) {
          setFormData(prev => ({
            ...prev,
            selectedTopic: spaces[0].name,
            selectedTopicId: parseInt(spaces[0].id)
          }));
        }
      } catch (err) {
        console.error('Failed to fetch user spaces:', err);
        // Fallback to empty array - user can still create new treasury
        setUserSpaces([]);
      } finally {
        setSpacesLoading(false);
      }
    };

    fetchUserSpaces();
  }, [user?.id, user?.username]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if browser extension is installed
  useEffect(() => {
    // Check for the data attribute injected by the extension's content script
    const checkExtension = () => {
      const hasExtension = document.documentElement.getAttribute('data-copus-extension-installed') === 'true';
      if (hasExtension && !isExtensionInstalled) {
        setIsExtensionInstalled(true);
        console.log('[Create Page] Extension detected and installed');
      }
      return hasExtension;
    };

    // Check immediately
    if (checkExtension()) return;

    // Check multiple times with increasing delays to catch the extension marker
    const timeouts: NodeJS.Timeout[] = [];

    // Check after 100ms, 300ms, 600ms, and 1000ms
    [100, 300, 600, 1000].forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (checkExtension()) {
          // Clear remaining timeouts once detected
          timeouts.forEach(clearTimeout);
        }
      }, delay);
      timeouts.push(timeoutId);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isExtensionInstalled]);

  // Extract domain from URL for display
  const extractDomain = (url: string): string => {
    if (!url.trim()) return "your-link.com";

    // Check for IPFS links
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '').split('/')[0];
      return `ipfs://${hash.substring(0, 12)}...`;
    }

    // Check for Arweave links
    if (url.startsWith('ar://')) {
      const hash = url.replace('ar://', '').split('/')[0];
      return `ar://${hash.substring(0, 12)}...`;
    }

    try {
      // Add protocol if missing for standard URLs
      const urlWithProtocol = url.match(/^(https?|ipfs|ar):\/\//i) ? url : `https://${url}`;
      const urlObj = new URL(urlWithProtocol);

      if (urlObj.protocol === 'ipfs:') {
        return `ipfs://${urlObj.hostname.substring(0, 12)}...`;
      }
      if (urlObj.protocol === 'ar:') {
        return `ar://${urlObj.hostname.substring(0, 12)}...`;
      }

      return urlObj.hostname;
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      const cleaned = url.replace(/^(https?|ipfs|ar):\/\//i, '').split('/')[0].split('?')[0];
      return cleaned || "your-link.com";
    }
  };

  // URL validation function
  const validateUrl = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) {
      return { isValid: true, message: '' }; // Empty is OK, handled by required validation
    }

    // Check for IPFS links (ipfs:// or gateway URLs)
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '').split('/')[0];
      // Basic IPFS hash validation (CID v0 or v1)
      if (hash.length > 0 && (hash.startsWith('Qm') || hash.startsWith('baf'))) {
        return { isValid: true, message: '' };
      }
      return { isValid: false, message: 'Please enter a valid IPFS hash' };
    }

    // Check for Arweave links
    if (url.startsWith('ar://')) {
      const hash = url.replace('ar://', '').split('/')[0];
      // Basic Arweave transaction ID validation (43 characters)
      if (hash.length >= 43) {
        return { isValid: true, message: '' };
      }
      return { isValid: false, message: 'Please enter a valid Arweave transaction ID' };
    }

    // Check if input is just numbers or obviously invalid
    const trimmedUrl = url.trim();
    if (/^\d+$/.test(trimmedUrl)) {
      return { isValid: false, message: 'Please enter a valid website address, not just numbers' };
    }

    // Check for common invalid patterns
    if (trimmedUrl.length < 3) {
      return { isValid: false, message: 'Please enter a valid website address' };
    }

    // Check if it looks like a valid domain pattern (before adding protocol)
    const urlWithoutProtocol = trimmedUrl.replace(/^https?:\/\//i, '');
    // Extract just the hostname part (before any path, query, or fragment)
    const hostnameOnly = urlWithoutProtocol.split('/')[0].split('?')[0].split('#')[0];
    // Use a simpler, more robust regex for hostname validation
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(hostnameOnly) && hostnameOnly !== 'localhost') {
      return { isValid: false, message: 'Please enter a valid website address (e.g., example.com)' };
    }

    try {
      // Try to create URL object - this validates basic URL structure
      const urlWithProtocol = url.match(/^https?:\/\//i) ? url : `https://${url}`;
      const urlObj = new URL(urlWithProtocol);

      // Check for valid protocols
      if (!['http:', 'https:', 'ipfs:', 'ar:'].includes(urlObj.protocol)) {
        return { isValid: false, message: 'URL must use http://, https://, ipfs://, or ar://' };
      }

      // Check for valid hostname (skip for IPFS/Arweave)
      if (['http:', 'https:'].includes(urlObj.protocol)) {
        if (!urlObj.hostname || urlObj.hostname.length < 3) {
          return { isValid: false, message: 'Please enter a valid website address' };
        }

        // Check if hostname contains at least one dot (domain structure)
        // But allow localhost for development
        if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost') {
          return { isValid: false, message: 'Please enter a valid website address (e.g., example.com)' };
        }

        // Additional check: ensure hostname is not just numbers
        if (/^\d+$/.test(urlObj.hostname)) {
          return { isValid: false, message: 'Please enter a valid website address, not an IP address' };
        }

        // Check for valid TLD (at least 2 characters after the last dot)
        const parts = urlObj.hostname.split('.');
        if (parts.length < 2 || parts[parts.length - 1].length < 2) {
          return { isValid: false, message: 'Please enter a valid website address with a proper domain extension' };
        }
      }

      return { isValid: true, message: '' };
    } catch (error) {
      return { isValid: false, message: 'Please enter a valid URL (http://, https://, ipfs://, or ar://)' };
    }
  };

  // Only use selected category if it exists in the loaded categories
  // Don't fall back to categories[0] to avoid showing Chinese placeholder text
  const selectedCategoryData = categories.find(cat => cat.name === formData.selectedTopic);
  const selectedCategoryStyle = getCategoryStyle(formData.selectedTopic, selectedCategoryData?.color);

  // Memoize preview cover image URL to prevent flickering on re-renders
  // Only recreate blob URL when coverImage file actually changes
  const previewCoverImageUrl = useMemo(() => {
    if (formData.coverImage) {
      return URL.createObjectURL(formData.coverImage);
    }
    return coverImageUrl || '';
  }, [formData.coverImage, coverImageUrl]);

  // Clean up blob URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (formData.coverImage && previewCoverImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewCoverImageUrl);
      }
    };
  }, [previewCoverImageUrl, formData.coverImage]);

  // Create preview article data
  const previewArticleData: ArticleData = {
    id: 'preview',
    title: formData.title || 'Enter a title...',
    description: formData.recommendation || 'Write your recommendation...',
    coverImage: previewCoverImageUrl,
    // Only show category if user has selected one AND it's in the loaded categories
    category: selectedCategoryData ? formData.selectedTopic : '',
    categoryColor: selectedCategoryData?.color,
    userName: user?.username || 'Anonymous',
    userAvatar: user?.faceUrl || profileDefaultAvatar,
    userId: user?.id,
    namespace: user?.namespace,
    date: new Date().toISOString(),
    treasureCount: 0,
    visitCount: "0",
    website: extractDomain(formData.link),
    // x402 payment fields
    isPaymentRequired: payToUnlock,
    paymentPrice: payToUnlock ? paymentAmount : undefined
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "title") {
      // Limit title to 75 characters
      if (value.length <= 75) {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTitleCharacterCount(value.length);
      }
    } else if (field === "recommendation") {
      // Limit recommendation to 1000 characters
      if (value.length <= 1000) {
        setFormData(prev => ({ ...prev, [field]: value }));
        setCharacterCount(value.length);
      }
    } else if (field === "link") {
      // Limit URL to 255 characters (common database field limit)
      if (value.length <= 255) {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Validate URL as user types (with debounce effect)
        setTimeout(() => {
          const validation = validateUrl(value);
          setLinkValidation(validation);
        }, 500);
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTopicSelect = (topicName: string, topicId: number) => {
    setFormData(prev => ({ ...prev, selectedTopic: topicName, selectedTopicId: topicId }));
    // Track this category as recently used
    addRecentCategory(topicId, topicName);
  };

  // Handle creating a new treasury
  const handleCreateNewTreasury = async () => {
    if (!newTreasuryName.trim()) {
      showToast('Please enter a treasury name', 'error');
      return;
    }

    setIsCreatingTreasury(true);

    try {
      // Call the createSpace API to create a new treasury
      const createResponse = await AuthService.createSpace(newTreasuryName.trim());
      console.log('Create space response:', createResponse);

      // Extract the created space from response
      const createdSpace = createResponse?.data || createResponse;

      if (!createdSpace?.id) {
        throw new Error('Failed to create treasury - no ID returned');
      }

      // Add the new treasury to the spaces list with real data from API
      const newSpace = {
        id: createdSpace.id.toString(),
        name: createdSpace.name || newTreasuryName.trim()
      };

      setUserSpaces(prev => [...prev, newSpace]);

      // Select the new treasury
      setFormData(prev => ({
        ...prev,
        selectedTopic: newSpace.name,
        selectedTopicId: parseInt(newSpace.id)
      }));

      showToast(`Treasury "${newTreasuryName.trim()}" created`, 'success');

      // Reset and close modal
      setNewTreasuryName("");
      setShowNewTreasuryModal(false);
    } catch (err) {
      console.error('Failed to create treasury:', err);
      showToast('Failed to create treasury', 'error');
    } finally {
      setIsCreatingTreasury(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showToast(validation.error || 'File format not supported', 'error');
      return;
    }

    setSelectedImageFile(file);
    const preview = createImagePreview(file);
    setImagePreviewUrl(preview);
    setShowImageCropper(true);
  };

  const handleImageCrop = async (croppedFile: File) => {
    try {
      setShowImageCropper(false);

      // Compress image
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'jpeg'
      });

      setFormData(prev => ({ ...prev, coverImage: compressedFile }));

      // Clean up preview
      if (imagePreviewUrl) {
        revokeImagePreview(imagePreviewUrl);
        setImagePreviewUrl('');
      }
      setSelectedImageFile(null);
    } catch (error) {
      console.error('Image processing failed:', error);
      showToast('Image processing failed, please try again', 'error');
    }
  };

  const handleCancelImageCrop = () => {
    setShowImageCropper(false);
    if (imagePreviewUrl) {
      revokeImagePreview(imagePreviewUrl);
      setImagePreviewUrl('');
    }
    setSelectedImageFile(null);
  };

  // Generate unique ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Set default selected category when category data is loaded
  useEffect(() => {
    if (sortedCategories && sortedCategories.length > 0) {
      // If current selected category is not in list, select the first one (most recently used)
      const currentCategoryExists = sortedCategories.some(cat => cat.name === formData.selectedTopic);
      if (!currentCategoryExists) {
        setFormData(prev => ({
          ...prev,
          selectedTopic: sortedCategories[0].name,
          selectedTopicId: sortedCategories[0].id
        }));
      }
    }
  }, [sortedCategories]);

  // Edit mode: Load article data
  useEffect(() => {
    const loadArticleForEdit = async () => {
      if (!isEditMode || !editId) return;

      setIsLoadingArticle(true);
      try {
        const articleData = await getArticleDetail(editId);

        // Set article data
        setEditingArticle(articleData);

        // Fill form data
        setFormData({
          link: articleData.targetUrl || "",
          title: articleData.title || "",
          recommendation: articleData.content || "",
          selectedTopic: articleData.categoryInfo?.name || "生活",
          selectedTopicId: articleData.categoryInfo?.id || 1,
          coverImage: null, // Don't load image file directly in edit mode
        });

        // Set cover image URL for display
        setCoverImageUrl(articleData.coverUrl || "");
        setCharacterCount(articleData.content?.length || 0);
        setTitleCharacterCount(articleData.title?.length || 0);

        // Set payment information if exists
        if (articleData.targetUrlIsLocked && articleData.priceInfo?.price) {
          setPayToUnlock(true);
          setPaymentAmount(articleData.priceInfo.price.toString());
          console.log('✅ Loaded payment settings - Locked:', true, 'Price:', articleData.priceInfo.price);
        } else {
          setPayToUnlock(false);
          setPaymentAmount("0.01");
          console.log('ℹ️ Article has no payment lock');
        }

      } catch (error) {
        console.error('Failed to load article data:', error);
        showToast('Failed to load data, please try again', 'error');
        navigate('/my-treasury');
      } finally {
        setIsLoadingArticle(false);
      }
    };

    loadArticleForEdit();
  }, [isEditMode, editId, navigate, showToast]);

  // Publish article
  const handlePublish = async () => {
    // Basic validation - including cover image
    if (!formData.link || !formData.title || !formData.recommendation) {
      showToast('Please fill in all required fields (link, title, recommendation)', 'error');
      return;
    }

    // URL validation
    const urlValidation = validateUrl(formData.link);
    if (!urlValidation.isValid) {
      showToast(`Invalid URL: ${urlValidation.message}`, 'error');
      setLinkValidation(urlValidation);
      return;
    }

    // In edit mode, allow if no new image uploaded but original cover URL exists
    if (!isEditMode && !formData.coverImage) {
      showToast('Please upload a cover image', 'error');
      return;
    }

    if (isEditMode && !formData.coverImage && !coverImageUrl) {
      showToast('Please upload a cover image', 'error');
      return;
    }

    setIsPublishing(true);

    try {
      let finalCoverUrl = coverImageUrl; // Default to existing cover URL (edit mode)

      // If new image uploaded, upload to S3
      if (formData.coverImage) {
        try {
          showToast('Uploading image...', 'info');

          const uploadResult = await AuthService.uploadImage(formData.coverImage);
          finalCoverUrl = uploadResult.url;

          showToast('Image uploaded successfully!', 'success');
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showToast(`Image upload failed: ${uploadError.message || 'Please try again'}`, 'error');
          setIsPublishing(false);
          return;
        }
      }

      // Prepare API parameters - smart URL handling
      const processedUrl = formData.link.trim();
      let finalUrl = processedUrl;

      // If URL has no protocol prefix, add https:// (but preserve IPFS and Arweave protocols)
      if (!/^(https?|ipfs|ar):\/\//i.test(processedUrl)) {
        finalUrl = `https://${processedUrl}`;
      }

      // Validate field lengths before sending
      const fieldValidation = {
        title: formData.title.length,
        content: formData.recommendation.length,
        targetUrl: finalUrl.length,
        coverUrl: finalCoverUrl.length
      };

      console.log('📏 Field lengths:', fieldValidation);

      // Check if any field exceeds limits
      if (formData.title.length > 75) {
        throw new Error(`Title too long: ${formData.title.length} characters (max 75)`);
      }
      if (formData.recommendation.length > 1000) {
        throw new Error(`Recommendation too long: ${formData.recommendation.length} characters (max 1000)`);
      }
      if (finalUrl.length > 255) {
        throw new Error(`URL too long: ${finalUrl.length} characters (max 255)`);
      }
      if (finalCoverUrl.length > 500) {
        throw new Error(`Cover URL too long: ${finalCoverUrl.length} characters (max 500)`);
      }

      const articleParams = {
        ...(isEditMode && editId ? { uuid: editId } : {}), // Add uuid in edit mode
        categoryId: formData.selectedTopicId,
        content: formData.recommendation.substring(0, 1000), // Ensure max 1000 chars
        coverUrl: finalCoverUrl.substring(0, 500), // Ensure max 500 chars
        targetUrl: finalUrl.substring(0, 255), // Ensure max 255 chars
        title: formData.title.substring(0, 75), // Ensure max 75 chars
        // x402 payment fields
        ...(payToUnlock ? {
          targetUrlIsLocked: true,
          priceInfo: {
            chainId: "8453", // Base mainnet chain ID (use "84532" for Base Sepolia testnet)
            currency: "USDC",
            price: parseFloat(paymentAmount || "0")
          }
        } : {
          targetUrlIsLocked: false
        })
      };

      console.log('📤 Sending article params:', articleParams);
      console.log('📤 Detailed params:', {
        title: `"${articleParams.title}" (${articleParams.title.length} chars)`,
        content: `"${articleParams.content}" (${articleParams.content.length} chars)`,
        targetUrl: `"${articleParams.targetUrl}" (${articleParams.targetUrl.length} chars)`,
        coverUrl: `"${articleParams.coverUrl}" (${articleParams.coverUrl.length} chars)`,
        categoryId: articleParams.categoryId,
        targetUrlIsLocked: articleParams.targetUrlIsLocked,
        ...(payToUnlock && articleParams.priceInfo ? { priceInfo: articleParams.priceInfo } : {})
      });

      const response = await publishArticle(articleParams);
      console.log('✅ Publish response:', response);
      console.log('✅ Response type:', typeof response);

      showToast(isEditMode ? 'Updated successfully!' : 'Published successfully!', 'success');

      // Invalidate article caches to ensure fresh data is loaded
      // This is especially important for edit mode to show updated content
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['myCreatedArticles'] });

      // The API returns the UUID as a string directly in response.data
      // So publishArticle returns the UUID string, not an object
      let articleUuid: string | null = null;

      if (typeof response === 'string') {
        // Response is the UUID string directly
        articleUuid = response;
      } else if (response?.uuid) {
        // Response is an object with uuid property
        articleUuid = response.uuid;
      } else if (editId) {
        // Fallback to editId in edit mode
        articleUuid = editId;
      }

      console.log('✅ Article UUID for redirect:', articleUuid);

      // Always redirect to the work page if we have a UUID
      if (articleUuid) {
        console.log(`✅ Redirecting to /work/${articleUuid}`);
        // Longer delay for edit mode to ensure server has processed the update
        const redirectDelay = isEditMode ? 2000 : 1500;
        setTimeout(() => {
          console.log(`🚀 Now navigating to /work/${articleUuid}`);
          // Add cache-busting timestamp for edit mode to force fresh fetch
          const targetUrl = isEditMode
            ? `/work/${articleUuid}?refresh=${Date.now()}`
            : `/work/${articleUuid}`;
          navigate(targetUrl, { replace: true });
        }, redirectDelay);
      } else {
        // This should rarely happen
        console.error('❌ No UUID found in response');
        console.error('Response was:', response);
        showToast('Published but could not navigate to it. Please check My Treasury.', 'warning');
        setTimeout(() => {
          navigate('/my-treasury');
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Article publishing failed:', error);

      // Extract more detailed error message
      let errorMessage = 'Article publishing failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      } else if (typeof error === 'object' && error !== null && 'msg' in error) {
        errorMessage = (error as any).msg;
      }

      // Show more specific error message
      showToast(errorMessage || 'Publishing failed, please try again', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <HeaderSection hideCreateButton={true} />
      <SideMenuSection activeItem="create" />
      <div className="lg:ml-[350px] lg:mr-[70px] min-h-screen pt-[70px] lg:pt-[110px] overflow-x-hidden">
        <div className="flex flex-col items-start gap-[20px] sm:gap-[30px] px-3 sm:px-5 md:px-8 lg:pl-8 lg:pr-4 xl:pl-12 xl:pr-6 2xl:pl-20 2xl:pr-10 py-0 pb-[100px] w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full">
            <h1 className="relative w-fit mt-[-1.00px] font-h-3 font-[number:var(--h-3-font-weight)] text-[#231f20] text-[length:var(--h-3-font-size)] text-left sm:text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] whitespace-nowrap [font-style:var(--h-3-font-style)]">
              {isEditMode ? 'Edit treasure' : 'Share treasure'}
            </h1>
            {isEditMode && (
              <span className="text-sm text-gray-500 ml-2">
                (Edit Mode)
              </span>
            )}
            {!isExtensionInstalled && (
              <div className="ml-[10px]">
                <Button
                  variant="outline"
                  className="flex items-center px-5 py-2.5 h-auto rounded-[50px] border-red text-red hover:bg-[#F23A001A] hover:text-red transition-colors duration-200"
                  asChild
                >
                  <a href="https://chromewebstore.google.com/detail/copus-internet-treasure-m/nmeambahohkondggcpdomcbgdalnkmcb?authuser=5&hl=en" target="_blank" rel="noopener noreferrer">
                    <span className="[font-family:'Lato',Helvetica] font-bold text-lg leading-5 text-red whitespace-nowrap">
                      Install browser extension
                    </span>
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-[20px] sm:gap-[30px] lg:gap-[40px] xl:gap-[60px] w-full">
            <div className="flex flex-col items-start gap-[20px] sm:gap-[30px] pl-0 py-0 flex-1 w-full min-w-0 lg:pr-[40px] lg:border-r lg:[border-right-style:solid] lg:border-[#e0e0e0] xl:pr-[60px]">
            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="flex flex-col w-[60px] h-[23px] items-start justify-center gap-2.5">
                <label className="relative flex items-center justify-center w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-transparent text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                  <span className="text-[#f23a00] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    *
                  </span>
                  <span className="text-[#686868] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    Link
                  </span>
                </label>
              </div>

              <div className={`flex items-center px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid transition-all ${
                !linkValidation.isValid ? 'border-red shadow-sm' :
                focusedField === 'link' ? 'border-red shadow-sm' : 'border-light-grey'
              }`}>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  onFocus={() => setFocusedField('link')}
                  onBlur={() => setFocusedField(null)}
                  className="flex-1 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-5 placeholder:text-medium-grey border-0 bg-transparent focus:outline-none"
                  placeholder="Enter or paste your link here (http://, https://, ipfs://, ar://)..."
                  aria-label="Link URL"
                  maxLength={255}
                />
              </div>

              {/* URL Validation Message */}
              {!linkValidation.isValid && formData.link && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-red text-sm">⚠</span>
                  <span className="text-red text-sm">{linkValidation.message}</span>
                </div>
              )}

              {/* URL Format Helper */}
              {linkValidation.isValid && formData.link && (
                <div className="flex items-center justify-between w-full mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green text-sm">✓</span>
                    <span className="text-green text-sm">Valid URL</span>
                  </div>
                  <span className="text-medium-grey text-xs">{formData.link.length}/255</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="flex items-center justify-between w-full">
                <label className="relative w-[60px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                  <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
                    *
                  </span>
                  <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                    Title
                  </span>
                </label>
                <span className="[font-family:'Lato',Helvetica] font-normal text-medium-grey text-sm">
                  {titleCharacterCount}/75
                </span>
              </div>

              <div className={`flex items-start gap-[5px] px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid transition-all ${
                focusedField === 'title' ? 'border-red shadow-sm' : 'border-light-grey'
              }`}>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[23.4px] placeholder:text-medium-grey placeholder:font-normal border-0 bg-transparent focus:outline-none"
                  placeholder="Enter title..."
                  aria-label="Title"
                  maxLength={75}
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="flex w-[60px] items-center gap-2.5">
                <label className="items-center justify-center w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-transparent text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap relative flex [font-style:var(--p-l-font-style)]">
                  <span className="text-[#f23a00] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    *
                  </span>
                  <span className="text-[#686868] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                    Cover
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-5 w-full">
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        handleImageUpload({ target: { files: [file] } } as any);
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center justify-center px-5 py-2.5 bg-white rounded-[15px] border border-solid border-medium-grey hover:border-red hover:shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 text-medium-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="ml-2 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">
                    Upload
                  </span>
                </button>

                {/* Text and preview */}
                <div className="flex items-center gap-3 flex-1">
                  {formData.coverImage || coverImageUrl ? (
                    <>
                      <div
                        className="w-20 h-12 bg-cover bg-center rounded-lg border border-green-400"
                        style={{
                          backgroundImage: formData.coverImage
                            ? `url(${URL.createObjectURL(formData.coverImage)})`
                            : coverImageUrl
                            ? `url(${coverImageUrl})`
                            : 'none'
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-sm">
                          Cover image uploaded
                        </span>
                        <span className="[font-family:'Lato',Helvetica] font-normal text-medium-grey text-xs">
                          Click Upload to change
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="[font-family:'Lato',Helvetica] font-normal text-medium-grey text-sm">
                      Supports JPG, PNG formats
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full min-w-0">
              <label className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
                <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
                  *
                </span>
                <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
                  Recommendation
                </span>
              </label>

              <div className="flex flex-col h-44 items-start justify-between px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-solid border-light-grey">
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange("recommendation", e.target.value)}
                  onFocus={() => setFocusedField('recommendation')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="What did you find valuable about this link?"
                  className="w-full min-w-0 flex-1 resize-none font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] placeholder:text-medium-grey border-0 bg-transparent focus:outline-none overflow-y-auto overflow-x-hidden"
                  aria-label="Recommendation"
                  maxLength={1000}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                />
                <div className="w-full min-w-0 [font-family:'Lato',Helvetica] font-normal text-medium-grey text-sm text-right tracking-[0] leading-[25px] flex-shrink-0">
                  {characterCount}/1000
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="relative w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-[#686868] text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                Save to treasury
              </div>

              {/* Choose Treasuries Button - styled like Upload button */}
              <button
                type="button"
                onClick={() => setShowChooseTreasuriesModal(true)}
                className="flex items-center justify-center px-5 py-2.5 bg-white rounded-[15px] border border-solid border-medium-grey hover:border-red hover:shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 text-medium-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="ml-2 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base">
                  Choose treasuries
                </span>
              </button>

              {/* Display selected treasuries */}
              {selectedTreasuries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTreasuries.map((treasury) => (
                    <span
                      key={treasury.id}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-dark-grey"
                    >
                      {treasury.name}
                    </span>
                  ))}
                </div>
              )}

              {selectedTreasuries.length === 0 && (
                <span className="[font-family:'Lato',Helvetica] font-normal text-medium-grey text-sm">
                  No treasury selected
                </span>
              )}
            </div>

            {/* x402 Pay-to-unlock section */}
            <div className="flex flex-col items-start gap-5 w-full pt-5">

              {/* Toggle section */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <img
                    className="relative w-[25px] h-[25px] aspect-[1] object-cover"
                    alt="x402 icon"
                    src="https://c.animaapp.com/I7dLtijI/img/x402-icon-blue-2@2x.png"
                  />
                  <p className="font-p-l font-[number:var(--p-l-font-weight)] text-[#686868] text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                    Pay to visit source link
                  </p>
                </div>
                <button
                  onClick={() => setPayToUnlock(!payToUnlock)}
                  role="switch"
                  aria-checked={payToUnlock}
                  className="relative inline-flex items-center h-[18px] w-[35px] rounded-[50px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF]"
                  style={{ backgroundColor: payToUnlock ? '#52C41A' : '#D9D9D9' }}
                >
                  <span
                    className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                      payToUnlock ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Payment details (shown when toggle is on) */}
              {payToUnlock && (
                <div className="flex flex-col items-start gap-5 w-full">
                  {/* Price input in USD */}
                  <div className="flex flex-col items-start gap-2.5 w-full">
                    <label className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-base tracking-[0] leading-4">
                      Price (USD)
                    </label>
                    <div className="flex items-center gap-2.5 w-full">
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-1/2 h-[46px] px-[15px] py-2.5 bg-white rounded-[15px] border border-solid border-light-grey focus:border-red focus:outline-none [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[23px]"
                        placeholder="0.01"
                      />
                      <div className="[font-family:'Lato',Helvetica] font-medium text-off-black text-base tracking-[0] leading-[23px] whitespace-nowrap">
                        USD
                      </div>
                    </div>
                  </div>

                  {/* Estimated income */}
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="flex items-center gap-1">
                        <span className="[font-family:'Lato',Helvetica] font-normal text-[#686868] text-sm tracking-[0] leading-[23px]">
                          Estimated income:
                        </span>
                        <div className="relative group">
                          <svg
                            className="w-3.5 h-3.5 text-[#686868] cursor-help"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-off-black text-white text-xs rounded-lg shadow-lg z-10 [font-family:'Lato',Helvetica]">
                            <div className="relative">
                              Estimated income is 45% of the price. The remaining 55% goes to the original creator (45%) and the Copus community vault (10%).
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-off-black"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="[font-family:'Lato',Helvetica] font-medium text-off-black text-sm tracking-[0] leading-[23px]">
                        {(parseFloat(paymentAmount || "0") * 0.45).toFixed(4)} USD per unlock
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 w-full lg:flex-1 lg:pl-[15px] xl:pl-[30px]">
            <div className="flex w-[60px] items-center gap-2.5">
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] mr-[-4.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                Preview
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-center gap-10 w-full">
              <div className="w-full lg:max-w-[250px] xl:max-w-[280px] 2xl:max-w-[320px]">
                <ArticleCard
                  article={previewArticleData}
                  layout="preview"
                  className="w-full"
                />
              </div>

              <div
                className="inline-flex items-center justify-center gap-[15px] px-10 py-[15px] bg-red rounded-[50px] cursor-pointer hover:bg-red/90 transition-colors w-full lg:max-w-[250px] xl:max-w-[280px] 2xl:max-w-[320px]"
                onClick={!isPublishing && formData.link && formData.title && formData.recommendation && (formData.coverImage || coverImageUrl) && linkValidation.isValid ? handlePublish : undefined}
                style={{
                    opacity: isPublishing || !formData.link || !formData.title || !formData.recommendation || (!formData.coverImage && !coverImageUrl) || !linkValidation.isValid ? 0.5 : 1,
                    cursor: isPublishing || !formData.link || !formData.title || !formData.recommendation || (!formData.coverImage && !coverImageUrl) || !linkValidation.isValid ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span className="[font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                    {isPublishing ? (
                      <span className="flex items-center space-x-2">
                        <PaperPlane />
                        <span>{isEditMode ? 'Updating...' : 'Publishing...'}</span>
                      </span>
                    ) : (
                      isEditMode ? 'Update' : 'Publish'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showImageCropper && selectedImageFile && (
        <ImageCropper
          image={selectedImageFile}
          aspectRatio={16 / 9}
          cropShape="rect"
          type="banner"
          onCrop={handleImageCrop}
          onCancel={handleCancelImageCrop}
        />
      )}

      {/* New Treasury Modal */}
      {showNewTreasuryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowNewTreasuryModal(false);
              setNewTreasuryName("");
            }}
          />

          {/* Modal */}
          <div
            className="flex flex-col w-[400px] max-w-[90vw] items-center gap-5 p-[30px] relative bg-white rounded-[15px] z-10"
            role="dialog"
            aria-labelledby="new-treasury-title"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowNewTreasuryModal(false);
                setNewTreasuryName("");
              }}
              className="relative self-stretch w-full flex-[0_0_auto] cursor-pointer"
              aria-label="Close dialog"
              type="button"
            >
              <img
                className="w-full"
                alt=""
                src="https://c.animaapp.com/RWdJi6d2/img/close.svg"
              />
            </button>

            <div className="flex flex-col items-start gap-[30px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <h2
                  id="new-treasury-title"
                  className="relative w-fit [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[33.6px] whitespace-nowrap"
                >
                  New treasury
                </h2>

                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="treasury-name-input"
                    className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap"
                  >
                    Name
                  </label>

                  <div className="flex h-12 items-center px-5 py-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-[15px] bg-[linear-gradient(0deg,rgba(224,224,224,0.4)_0%,rgba(224,224,224,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <input
                      id="treasury-name-input"
                      type="text"
                      value={newTreasuryName}
                      onChange={(e) => setNewTreasuryName(e.target.value)}
                      placeholder="Like &quot;Place to go&quot;"
                      className="flex-1 border-none bg-transparent [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base tracking-[0] leading-[23px] outline-none placeholder:text-medium-dark-grey"
                      aria-required="true"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateNewTreasury();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <button
                  className="inline-flex items-center justify-center gap-[30px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowNewTreasuryModal(false);
                    setNewTreasuryName("");
                  }}
                  type="button"
                >
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    Cancel
                  </span>
                </button>

                <button
                  className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] rounded-[100px] bg-red cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
                  onClick={handleCreateNewTreasury}
                  disabled={!newTreasuryName.trim() || isCreatingTreasury}
                  type="button"
                >
                  <span className="relative w-fit [font-family:'Lato',Helvetica] font-bold text-white text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                    {isCreatingTreasury ? 'Creating...' : 'Create'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Choose Treasuries Modal */}
      <ChooseTreasuriesModal
        isOpen={showChooseTreasuriesModal}
        onClose={() => setShowChooseTreasuriesModal(false)}
        onSave={(selected) => {
          setSelectedTreasuries(selected);
          // Update formData with first selected treasury for the publish API
          if (selected.length > 0) {
            setFormData(prev => ({
              ...prev,
              selectedTopic: selected[0].name,
              selectedTopicId: selected[0].id
            }));
          }
        }}
        initialSelectedIds={selectedTreasuries.map(t => t.id)}
      />
    </div>
  );
};
