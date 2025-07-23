import { ViewOnlyViewport } from '@/components/editor';
import { useGetTemplate, Template, useGetLookupTemplate } from "@/features/template/templateAPI";
import { PasswordProtection } from '@/components/PasswordProtection';
import lz from 'lzutf8';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { safeSessionStorage } from '@/utils/storage';
import { useParams } from 'react-router-dom';
import { ViewportSettingsProvider } from '@/components/editor/contexts/ViewportSettingsContext';
import '../ViewPage/ViewPage.css';

// Utility function to extract template ID from template domain
const getTemplateIdFromDomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Get the full hostname including subdomains
  const hostname = window.location.hostname;
  // Check if it matches template.mehappy.info pattern
  if (hostname === 'template.mehappy.info') {
    // Extract template ID from path: template.mehappy.info/{templateId}
    const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length > 0) {
      return pathParts[0]; // First path segment is the template ID
    }
  }
  
  return null;
};

export default function TemplateLookupPage() {
  const { templateId: routeTemplateId } = useParams(); // For development route
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  // Extract template ID on component mount
  useEffect(() => {
    // First try to get from route params (development), then from domain
    const id = routeTemplateId || getTemplateIdFromDomain();
    setTemplateId(id);
  }, [routeTemplateId]);

  // Parse template ID to number for API call
  const numericTemplateId = templateId ? parseInt(templateId, 10) : NaN;
  const isValidId = !isNaN(numericTemplateId) && numericTemplateId > 0;

  // Call the template lookup hook
  const { data, isLoading, error } = useGetLookupTemplate(isValidId ? numericTemplateId : 0);

  // Check if password was already verified in this session
  useEffect(() => {
    const verified = safeSessionStorage.getItem('template-password-verified');
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
          <p className="text-gray-600">Loading template: {templateId}</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (error || !isValidId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Template Not Found</h1>
          <p className="text-gray-600 mb-4">
            {!isValidId 
              ? `Invalid template ID: ${templateId}` 
              : `No template found with ID: ${templateId}`
            }
          </p>
          <p className="text-sm text-gray-500">
            Please check the URL or contact the template provider.
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
            The template with ID <strong>{templateId}</strong> exists but has no content.
          </p>
        </div>
      </div>
    );
  }

  // Handle password protection - check if template has password protection
  const hasPassword = data?.seoSettings?.password && data.seoSettings.password.trim() !== '';

  // Show password protection if needed and not verified
  if (hasPassword && !isPasswordVerified && data?.seoSettings?.password) {
    return (
      <PasswordProtection
        expectedPassword={data.seoSettings.password}
        onPasswordCorrect={() => {
          setIsPasswordVerified(true);
          safeSessionStorage.setItem('template-password-verified', 'true');
        }}
        title="Template được bảo vệ"
        description="Vui lòng nhập mật khẩu để xem template."
      />
    );
  }

  const templateIdString = data?.id?.toString();

  return (
    <>
      {/* SEO Meta Tags using react-helmet-async */}
      <Helmet>
        {/* Basic page title */}
        <title>{data?.seoSettings?.title || data?.name || 'Template Preview'}</title>

        {/* Basic meta tags */}
        {data?.seoSettings?.description && (
          <meta name="description" content={data.seoSettings.description} />
        )}
        {data?.seoSettings?.keywords && data.seoSettings.keywords.length > 0 && (
          <meta name="keywords" content={data.seoSettings.keywords.join(', ')} />
        )}

        {/* Open Graph tags */}
        <meta property="og:title" content={data?.seoSettings?.title || data?.name || 'Template Preview'} />
        {data?.seoSettings?.description && (
          <meta property="og:description" content={data.seoSettings.description} />
        )}
        {data?.seoSettings?.imageUrl && (
          <meta property="og:image" content={data.seoSettings.imageUrl} />
        )}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : `https://template.mehappy.info/${templateId}`} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data?.seoSettings?.title || data?.name || 'Template Preview'} />
        {data?.seoSettings?.description && (
          <meta name="twitter:description" content={data.seoSettings.description} />
        )}
        {data?.seoSettings?.imageUrl && (
          <meta name="twitter:image" content={data.seoSettings.imageUrl} />
        )}

        {/* Template-specific meta tags */}
        {data?.category && <meta name="template:category" content={data.category} />}
        {data?.tier && <meta name="template:tier" content={data.tier} />}
        {data?.name && <meta name="template:name" content={data.name} />}
        {data?.description && <meta name="template:description" content={data.description} />}

        {/* Favicon */}
        {data?.seoSettings?.favoriteIconUrl && (
          <link rel="icon" href={data.seoSettings.favoriteIconUrl} />
        )}
      </Helmet>

      <ViewportSettingsProvider templateData={data}>
        <ViewOnlyViewport
          id={templateIdString}
          content={data?.content ? lz.decompress(lz.decodeBase64(data.content)) : undefined}
          mobileContent={data?.contentMobile ? lz.decompress(lz.decodeBase64(data.contentMobile)) : undefined}
          className="view-page"
          // Pass template-specific props
          effects={data?.effects}
          audioSettings={data?.audioSettings}
          notificationSettings={data?.notificationSettings}
          customEffects={data?.customEffects}
        />
      </ViewportSettingsProvider>
    </>
  );
}
