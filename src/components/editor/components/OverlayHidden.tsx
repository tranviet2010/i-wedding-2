import { zIndex } from '@/utils/zIndex';

export const OverlayHidden = ({ borderRadius }: any) => {
    return (
        <div
            className="overlay-hidden"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: borderRadius,
                zIndex: zIndex.overlayHidden,
                pointerEvents: 'none',
                opacity: 0.5,
            }}
        />
    )
}
