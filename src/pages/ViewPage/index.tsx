import { ViewOnlyViewport } from '@/components/editor';
import { useGetPage } from "@/features/page/pageAPI";
import { PasswordProtection } from '@/components/PasswordProtection';
import lz from 'lzutf8';
import { Navigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { safeSessionStorage } from '@/utils/storage';
import './ViewPage.css';

export default function ViewPage() {
	const { id } = useParams();
	const [isPasswordVerified, setIsPasswordVerified] = useState(false);

	// Validate that id is a valid number
	const pageId = id ? parseInt(id, 10) : NaN;
	const isValidId = !isNaN(pageId) && pageId > 0;

	// Call hook at top level, not inside conditions
	const { data, isLoading } = useGetPage(isValidId ? pageId : 0);

	// Check if password was already verified in this session
	useEffect(() => {
		const verified = safeSessionStorage.getItem('page-password-verified');
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

	// Check if page has password protection
	const hasPassword = data?.seoSettings?.password && data.seoSettings.password.trim() !== '';

	// Show password protection if needed and not verified
	if (hasPassword && !isPasswordVerified && data?.seoSettings?.password) {
		return (
			<PasswordProtection
				expectedPassword={data.seoSettings.password}
				onPasswordCorrect={() => setIsPasswordVerified(true)}
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
				<title>{data?.seoSettings?.title || data?.title || 'Wedding Page'}</title>

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
				<meta property="og:url" content={window.location.href} />

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
				// notificationSettings={data?.notificationSettings}
			/>
		</>
	);
}