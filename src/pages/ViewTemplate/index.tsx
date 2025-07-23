import { ViewOnlyViewport } from '@/components/editor';
import { useGetTemplate } from '@/features/template/templateAPI';
import { PasswordProtection } from '@/components/PasswordProtection';
import lz from 'lzutf8';
import { Navigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { safeSessionStorage } from '@/utils/storage';
import { ViewportSettingsProvider } from '@/components/editor/contexts/ViewportSettingsContext';
import './ViewTemplate.css';

export default function ViewPage() {
	const { id } = useParams();
	const [isPasswordVerified, setIsPasswordVerified] = useState(false);

	// Validate that id is a valid number
	const pageId = id ? parseInt(id, 10) : NaN;
	const isValidId = !isNaN(pageId) && pageId > 0;

	// Call hook at top level, not inside conditions
	const { data, isLoading } = useGetTemplate(isValidId ? pageId : 0);

	// Check if password was already verified in this session
	useEffect(() => {
		const verified = safeSessionStorage.getItem('template-password-verified');
		if (verified === 'true') {
			setIsPasswordVerified(true);
		}
	}, []);

	// Redirect to home if id is invalid
	if (!isValidId) {
		return <Navigate to="/" />;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	// Check if template has password protection
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

	return (
		<>
			{/* SEO Meta Tags using react-helmet-async */}
			<Helmet>
				<title>{data?.seoSettings?.title || data?.name || 'Template Preview'}</title>

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
				<meta property="og:url" content={window.location.href} />

				{/* Twitter Card tags */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={data?.seoSettings?.title || data?.name || 'Template Preview'} />
				{data?.seoSettings?.description && (
					<meta name="twitter:description" content={data.seoSettings.description} />
				)}
				{data?.seoSettings?.imageUrl && (
					<meta name="twitter:image" content={data.seoSettings.imageUrl} />
				)}

				{/* Favicon */}
				{data?.seoSettings?.favoriteIconUrl && (
					<link rel="icon" href={data.seoSettings.favoriteIconUrl} />
				)}
			</Helmet>

			<ViewportSettingsProvider templateData={data}>
				<ViewOnlyViewport
					content={data?.content ? lz.decompress(lz.decodeBase64(data.content)) : undefined}
					mobileContent={data?.contentMobile ? lz.decompress(lz.decodeBase64(data.contentMobile)) : undefined}
					effects={data?.effects}
					audioSettings={data?.audioSettings}
					notificationSettings={data?.notificationSettings}
					customHtmlSettings={data?.customHtml}
					customEffects={data?.customEffects}
				/>
			</ViewportSettingsProvider>
		</>
	);
}