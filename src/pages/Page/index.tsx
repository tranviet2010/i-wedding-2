import { RenderNode, Viewport } from '@/components/editor';
import { Selectors } from '@/components/selectors';
import { ContentWrapper } from '@/components/selectors/ContentWrapper';
import { Sections } from '@/components/selectors/Sections';
import { useGetPage } from "@/features/page/pageAPI";
import { useGetTemplate } from "@/features/template/templateAPI";
import { Editor, Element, Frame } from '@craftjs/core';
import { Navigate, useParams } from "react-router-dom";
import { ViewportSettingsProvider } from '@/components/editor/contexts/ViewportSettingsContext';

export default function EditorPage() {
	const { id } = useParams();

	// Validate that id is a valid number
	const pageId = id ? parseInt(id, 10) : NaN;
	const isValidId = !isNaN(pageId) && pageId > 0;

	// Call hook at top level, not inside conditions
	const { data, isLoading, refetch } = useGetPage(isValidId ? pageId : 0);

	// Fetch template data if page has a templateId
	const { data: templateData, isLoading: isTemplateLoading } = useGetTemplate(
		data?.templateId && data.templateId > 0 ? data.templateId : 0
	);

	// Redirect to home if id is invalid
	if (!isValidId) {
		return <Navigate to="/" />;
	}

	if (isLoading || isTemplateLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<ViewportSettingsProvider templateData={templateData}>
				<Editor
					resolver={Selectors}
					enabled={false}
					onRender={RenderNode}
				>
					<Viewport
						pageData={data}
						data={data?.content}
						mobileData={data?.contentMobile}
						id={data?.id?.toString()}
						isEditor={true}
						isPage
						effects={templateData?.effects}
						audioSettings={templateData?.audioSettings}
						customHtmlSettings={templateData?.customHtml}
						seoSettings={data?.seoSettings}
						notificationSettings={templateData?.notificationSettings}
						customEffects={templateData?.customEffects}
						refetchData={refetch}
					>
						<Frame>
							{data?.content ? null : <Element
								canvas
								is={ContentWrapper}
								fontSize="16px"
								fontFamily="Arial, sans-serif"
								textColor="#333333"
							>
								<Element
									canvas
									is={Sections}
									height="400px"
									backgroundColor="#f8f9fa"
								/>
							</Element>}
						</Frame>
					</Viewport>
				</Editor>
			</ViewportSettingsProvider>
		</div>
	)
}
