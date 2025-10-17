import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './toast';

interface ShareDropdownProps {
  title: string;
  url?: string;
  className?: string;
}

export const ShareDropdown: React.FC<ShareDropdownProps> = ({
  title,
  url,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareUrl = url || window.location.href;
  const { showToast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleShareClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard!', 'success');
      setIsOpen(false);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShareOnX = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(title);
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      '_blank',
      'noopener,noreferrer'
    );
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleShareClick}
        className="all-[unset] box-border aspect-[1] relative cursor-pointer"
        aria-label="Share"
        aria-expanded={isOpen}
      >
        <img
          className="w-[38px] h-[38px]"
          alt="Share"
          src="https://c.animaapp.com/5EW1c9Rn/img/share.svg"
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-[50px] right-0 w-[183px] shadow-[0px_4px_10px_rgba(0,0,0,0.15)] bg-white rounded-[15px] z-10">
          <div className="flex flex-col w-full items-start relative">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-4 pl-5 pr-5 py-5 relative self-stretch w-full flex-[0_0_auto] text-left rounded-t-[15px] transition-colors hover:bg-[rgba(224,224,224,0.25)]"
            >
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 10.5C7.89782 11.0052 8.40206 11.4133 8.97664 11.6955C9.55121 11.9777 10.1815 12.1267 10.8214 12.1321C11.4613 12.1375 12.094 12.0992 12.6729 11.8202C13.2518 11.5412 13.7627 11.1286 14.1675 10.6125L16.4175 8.3625C17.1977 7.53784 17.6309 6.44599 17.6221 5.31271C17.6133 4.17943 17.163 3.09441 16.3705 2.28195C15.578 1.46948 14.503 1.01919 13.3797 1.01039C12.2564 1.00159 11.1746 1.43483 10.35 2.215L9.1125 3.4525"
                  stroke="#454545"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.5 7.5C10.1022 6.99475 9.59794 6.58669 9.02336 6.30453C8.44879 6.02237 7.81854 5.87331 7.17863 5.86789C6.53872 5.86247 5.90598 5.90083 5.32709 6.17978C4.7482 6.45873 4.23726 6.87144 3.8325 7.3875L1.5825 9.6375C0.802299 10.4622 0.369062 11.554 0.377857 12.6873C0.386652 13.8206 0.836948 14.9056 1.62948 15.718C2.422 16.5305 3.49702 16.9808 4.62031 16.9896C5.74359 16.9984 6.82543 16.5652 7.65 15.785L8.8875 14.5475"
                  stroke="#454545"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                Copy link
              </span>
            </button>

            <button
              onClick={handleShareOnX}
              className="flex items-center gap-4 pl-5 pr-5 py-5 relative self-stretch w-full flex-[0_0_auto] text-left rounded-b-[15px] transition-colors hover:bg-[rgba(224,224,224,0.25)] border-t [border-top-style:solid] border-[#e0e0e0]"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  fill="#454545"
                />
              </svg>

              <span className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-[22.4px] whitespace-nowrap">
                Share on X
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
