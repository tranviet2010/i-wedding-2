import { RenderNode, Viewport } from '@/components/editor';
import { Selectors } from '@/components/selectors';
import { ContentWrapper } from '@/components/selectors/ContentWrapper';
import { Sections } from '@/components/selectors/Sections';
import { useGetTemplate } from "@/features/template/templateAPI";
import { Editor, Element, Frame } from '@craftjs/core';
import { Navigate, useParams } from "react-router-dom";
import { ViewportSettingsProvider } from '@/components/editor/contexts/ViewportSettingsContext';

export default function EditorPage() {
	const { id } = useParams();

	// Validate that id is a valid number
	const templateId = id ? parseInt(id, 10) : NaN;
	const isValidId = !isNaN(templateId) && templateId > 0;

	// Call hook at top level, not inside conditions
	const { data, isLoading, refetch } = useGetTemplate(isValidId ? templateId : 0);

	// Redirect to home if id is invalid
	if (!isValidId) {
		return <Navigate to="/" />;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<ViewportSettingsProvider templateData={data}>
				<Editor
					resolver={Selectors}
					enabled={false}
					onRender={RenderNode}
				>
					<Viewport
						data={data?.content}
						mobileData={data?.contentMobile}
						id={data?.id?.toString()}
						isEditor={true}
						effects={data?.effects}
						audioSettings={data?.audioSettings}
						customHtmlSettings={data?.customHtml}
						seoSettings={data?.seoSettings}
						notificationSettings={data?.notificationSettings}
						customEffects={data?.customEffects}
						refetchData={refetch}
					>
						<Frame>
							{data?.content || data?.contentMobile ? null : <Element
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
