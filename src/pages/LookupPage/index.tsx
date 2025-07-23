import { ViewOnlyViewport } from '@/components/editor';
import { useGetPageByDomain, Page } from "@/features/page/pageAPI";
import { PasswordProtection } from '@/components/PasswordProtection';
import lz from 'lzutf8';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { safeSessionStorage } from '@/utils/storage';
import '../ViewPage/ViewPage.css';

// Utility function to extract domain from current window location
const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Get the full hostname including subdomains
  const hostname = window.location.hostname;
  
  // For development, you might want to handle localhost differently
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For development, you can use a query parameter or subdomain simulation
    const urlParams = new URLSearchParams(window.location.search);
    const testDomain = urlParams.get('domain');
    if (testDomain) return testDomain;
    
    // Or extract from subdomain if using something like test.localhost
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www') {
      return parts[0];
    }
  }
  
  return hostname;
};

export default function LookupPage() {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  // Extract domain on component mount
  useEffect(() => {
    const domain = getCurrentDomain();
    setCurrentDomain(domain);
  }, []);

  // Call the domain lookup hook
  const { data, isLoading, error } = useGetPageByDomain(currentDomain);

  // Check if password was already verified in this session
  useEffect(() => {
    const verified = safeSessionStorage.getItem('page-password-verified');
    if (verified === 'true') {
      setIsPasswordVerified(true);
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page for domain: {currentDomain}</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">
            No page found for domain: <strong>{currentDomain}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Please check the domain configuration or contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  // Handle case where no data is returned
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Content Available</h1>
          <p className="text-gray-600 mb-4">
            The page for domain <strong>{currentDomain}</strong> exists but has no content.
          </p>
        </div>
      </div>
    );
  }

  // Handle password protection - check if page has password protection
  const hasPassword = data?.seoSettings?.password && data.seoSettings.password.trim() !== '';

  // Show password protection if needed and not verified
  if (hasPassword && !isPasswordVerified && data?.seoSettings?.password) {
    return (
      <PasswordProtection
        expectedPassword={data.seoSettings.password}
        onPasswordCorrect={() => {
          setIsPasswordVerified(true);
          safeSessionStorage.setItem('page-password-verified', 'true');
        }}
        title="Trang được bảo vệ"
        description="Vui lòng nhập mật khẩu để xem nội dung."
      />
    );
  }

  const weddingPageId = data?.id?.toString();

  return (
    <>
      {/* SEO Meta Tags using react-helmet-async */}
      <Helmet>
        {/* Basic page title */}
        <title>{data?.seoSettings?.title || data?.title || 'Wedding Page'}</title>

        {/* Basic meta tags */}
        {data?.seoSettings?.description && (
          <meta name="description" content={data.seoSettings.description} />
        )}
        {data?.seoSettings?.keywords && data.seoSettings.keywords.length > 0 && (
          <meta name="keywords" content={data.seoSettings.keywords.join(', ')} />
        )}

        {/* Open Graph tags */}
        <meta property="og:title" content={data?.seoSettings?.title || data?.title || 'Wedding Page'} />
        {data?.seoSettings?.description && (
          <meta property="og:description" content={data.seoSettings.description} />
        )}
        {data?.seoSettings?.imageUrl && (
          <meta property="og:image" content={data.seoSettings.imageUrl} />
        )}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : `https://${currentDomain}`} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data?.seoSettings?.title || data?.title || 'Wedding Page'} />
        {data?.seoSettings?.description && (
          <meta name="twitter:description" content={data.seoSettings.description} />
        )}
        {data?.seoSettings?.imageUrl && (
          <meta name="twitter:image" content={data.seoSettings.imageUrl} />
        )}

        {/* Wedding-specific meta tags */}
        {data?.groom && <meta name="wedding:groom" content={data.groom} />}
        {data?.bride && <meta name="wedding:bride" content={data.bride} />}
        {data?.date && <meta name="wedding:date" content={data.date} />}
        {data?.location && <meta name="wedding:location" content={data.location} />}

        {/* Favicon */}
        {data?.seoSettings?.favoriteIconUrl && (
          <link rel="icon" href={data.seoSettings.favoriteIconUrl} />
        )}
      </Helmet>

      <ViewOnlyViewport
        id={weddingPageId}
        content={data?.content ? lz.decompress(lz.decodeBase64(data.content)) : undefined}
        mobileContent={data?.contentMobile ? lz.decompress(lz.decodeBase64(data.contentMobile)) : undefined}
        className="view-page"
      />
    </>
  );
}
