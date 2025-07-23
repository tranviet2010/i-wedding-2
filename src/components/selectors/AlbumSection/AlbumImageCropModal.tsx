import React, { useState, useCallback, useRef } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Portal,
  createToaster,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogBackdrop,
} from '../../ui/dialog';
import { CloseButton } from '../../ui/close-button';
import ReactCrop, {
  centerCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import { canvasPreview } from '../../../utils/canvasPreview';
import { useDebounceEffect } from '../../../utils/useDebounceEffect';

export interface AlbumCropData {
  crop: PixelCrop;
  scale: number;
  rotate: number;
  imageDimensions?: {
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
  };
}

interface AlbumImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (cropData: AlbumCropData) => void;
  imageId: string;
  imageAlt?: string;
  // For album items, we'll allow free cropping (no aspect ratio constraint)
  aspectRatio?: number;
  initialCrop?: Crop;
  initialScale?: number;
  initialRotate?: number;
}

export const AlbumImageCropModal: React.FC<AlbumImageCropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  imageId,
  imageAlt = '',
  aspectRatio, // Will be undefined for free-form cropping
  initialCrop,
  initialScale = 1,
  initialRotate = 0,
}) => {
  // Remove aspect ratio constraint to allow free-form cropping for albums
  const aspect = undefined;
  
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [crop, setCrop] = useState<Crop | undefined>(initialCrop);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(initialScale);
  const [rotate, setRotate] = useState(initialRotate);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toaster = createToaster({
    placement: 'top',
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // Initialize with a default crop area (centered, 80% of image size) without aspect constraints
    const { width, height } = e.currentTarget;
    if (!crop) {
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        );
      }
    },
    100,
    [completedCrop, scale, rotate],
  );

  const handleCropConfirm = useCallback(() => {
    if (!completedCrop) {
      toaster.create({
        title: 'Lỗi',
        description: 'Vui lòng chọn vùng cắt',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Save crop data for react-image-crop with image dimensions for proper scaling
      const cropData: AlbumCropData = {
        crop: completedCrop,
        scale,
        rotate,
        // Add image dimensions to ensure proper scaling later
        imageDimensions: imgRef.current ? {
          width: imgRef.current.width,
          height: imgRef.current.height,
          naturalWidth: imgRef.current.naturalWidth,
          naturalHeight: imgRef.current.naturalHeight
        } : undefined
      };

      onCropComplete(cropData);
      onClose();
    } catch (error) {
      console.error('Error saving crop data:', error);
      toaster.create({
        title: 'Lỗi cắt ảnh',
        description: 'Không thể lưu thông tin cắt ảnh. Vui lòng thử lại.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, scale, rotate, onCropComplete, onClose, toaster]);

  const handleCancel = useCallback(() => {
    // Reset to initial values
    setCrop(initialCrop);
    setScale(initialScale);
    setRotate(initialRotate);
    setCompletedCrop(undefined);
    onClose();
  }, [initialCrop, initialScale, initialRotate, onClose]);

  return (
    <DialogRoot size="sm" open={isOpen} onOpenChange={(e) => e.open ? null : handleCancel()}>
      <Portal>
        <DialogBackdrop style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cắt ảnh Album - {imageAlt || `Image ${imageId}`}</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger asChild>
            <CloseButton size="sm" />
          </DialogCloseTrigger>
          <DialogBody p={0}>
            <VStack gap={4}>
              {/* Cropper Container */}
              <Box
                position="relative"
                width="100%"
                height="400px"
                bg="gray.100"
                borderRadius="md"
                overflow="hidden"
              >
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  minHeight={50}
                  minWidth={50}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageUrl}
                    style={{ 
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </Box>

              {/* Preview Canvas */}
              {completedCrop && (
                <Box
                  position="relative"
                  width="100%"
                  height="200px"
                  bg="gray.50"
                  borderRadius="md"
                  overflow="hidden"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      border: '1px solid #e2e8f0',
                      objectFit: 'contain',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                </Box>
              )}

              {/* Controls */}
              <Box width="100%" px={6} pb={4}>
                <VStack gap={4}>
                  {/* Scale Control */}
                  <Box width="100%">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Tỷ lệ
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {Math.round(scale * 100)}%
                      </Text>
                    </HStack>
                    <input
                      type="range"
                      value={scale}
                      min={0.5}
                      max={3}
                      step={0.1}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        height: '4px',
                        background: '#e2e8f0',
                        borderRadius: '2px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>

                  {/* Rotate Control */}
                  <Box width="100%">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Xoay
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {rotate}°
                      </Text>
                    </HStack>
                    <input
                      type="range"
                      value={rotate}
                      min={-180}
                      max={180}
                      step={1}
                      onChange={(e) => setRotate(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '4px',
                        background: '#e2e8f0',
                        borderRadius: '2px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </DialogBody>

          <DialogFooter>
            <HStack gap={3}>
              <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
                Hủy
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCropConfirm}
                loading={isProcessing}
                loadingText="Đang xử lý..."
              >
                Xác nhận
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
};
