import React, { useState, useCallback } from 'react';
import {
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Portal,
  createToaster,
  Stack,
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
import { DraggableNumberInput } from '@/components/editor/components/DraggableNumberInput';

export interface AlbumResizeData {
  width: string;
  height: string;
}

interface AlbumImageResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onResizeComplete: (resizeData: AlbumResizeData) => void;
  imageId: string;
  imageAlt?: string;
  initialWidth?: string;
  initialHeight?: string;
  lockAspectRatio?: boolean;
}

// Helper function to parse numeric value from string (e.g., "200px" -> 200)
const parseNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

export const AlbumImageResizeModal: React.FC<AlbumImageResizeModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onResizeComplete,
  imageId,
  imageAlt,
  initialWidth = '200px',
  initialHeight = '150px',
  lockAspectRatio = true,
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(lockAspectRatio);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toaster = createToaster({
    placement: 'top',
  });

  const handleWidthChange = useCallback((newWidthValue: number) => {
    const newWidth = `${newWidthValue}px`;
    setWidth(newWidth);
    
    if (aspectRatioLocked) {
      const currentW = parseNumericValue(width);
      const currentH = parseNumericValue(height);
      
      if (currentW > 0 && currentH > 0) {
        const aspectRatio = currentH / currentW;
        const newHeightValue = Math.round(newWidthValue * aspectRatio);
        setHeight(`${Math.max(1, newHeightValue)}px`);
      }
    }
  }, [width, height, aspectRatioLocked]);

  const handleHeightChange = useCallback((newHeightValue: number) => {
    const newHeight = `${newHeightValue}px`;
    setHeight(newHeight);
    
    if (aspectRatioLocked) {
      const currentW = parseNumericValue(width);
      const currentH = parseNumericValue(height);
      
      if (currentW > 0 && currentH > 0) {
        const aspectRatio = currentW / currentH;
        const newWidthValue = Math.round(newHeightValue * aspectRatio);
        setWidth(`${Math.max(1, newWidthValue)}px`);
      }
    }
  }, [width, height, aspectRatioLocked]);

  const handleResizeConfirm = useCallback(() => {
    if (parseNumericValue(width) <= 0 || parseNumericValue(height) <= 0) {
      toaster.create({
        title: 'Lỗi',
        description: 'Kích thước phải lớn hơn 0',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const resizeData: AlbumResizeData = {
        width,
        height,
      };

      onResizeComplete(resizeData);
      onClose();
    } catch (error) {
      console.error('Error saving resize data:', error);
      toaster.create({
        title: 'Lỗi thay đổi kích thước',
        description: 'Không thể lưu thông tin kích thước. Vui lòng thử lại.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [width, height, onResizeComplete, onClose, toaster]);

  const handleCancel = useCallback(() => {
    // Reset to initial values
    setWidth(initialWidth);
    setHeight(initialHeight);
    setAspectRatioLocked(lockAspectRatio);
    onClose();
  }, [initialWidth, initialHeight, lockAspectRatio, onClose]);

  return (
    <DialogRoot size="sm" open={isOpen} onOpenChange={(e) => e.open ? null : handleCancel()}>
      <Portal>
        <DialogBackdrop style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi kích thước - {imageAlt || `Image ${imageId}`}</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger asChild>
            <CloseButton size="sm" />
          </DialogCloseTrigger>
          <DialogBody p={6}>
            <VStack gap={4} align="stretch">
              {/* Image Preview */}
              <Box
                position="relative"
                width="100%"
                height="200px"
                bg="gray.100"
                borderRadius="md"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src={imageUrl}
                  alt={imageAlt || `Image ${imageId}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {/* Size Controls */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={3}>Kích thước</Text>
                <Stack gap={3} direction="row" alignItems="center" justifyContent="space-between">
                  <Box flex={1} display="flex" alignItems="center" gap={2}>
                    <Text fontSize="xs" className='translate-y-[2px]'>W</Text>
                    <DraggableNumberInput
                      value={parseNumericValue(width)}
                      onChange={handleWidthChange}
                      min={1}
                    />
                  </Box>
                  <Box flex={1} display="flex" alignItems="center" gap={2}>
                    <Text fontSize="xs" className='translate-y-[2px]'>H</Text>
                    <DraggableNumberInput
                      value={parseNumericValue(height)}
                      onChange={handleHeightChange}
                      min={1}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Aspect Ratio Lock */}
              <Box>
                <HStack>
                  <input
                    type="checkbox"
                    checked={aspectRatioLocked}
                    onChange={(e) => setAspectRatioLocked(e.target.checked)}
                    id="aspect-ratio-lock"
                  />
                  <label htmlFor="aspect-ratio-lock" style={{ fontSize: '14px' }}>
                    Khóa tỷ lệ khung hình
                  </label>
                </HStack>
              </Box>

              {/* Current Dimensions Display */}
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="xs" color="gray.600">
                  Kích thước hiện tại: {parseNumericValue(width)} x {parseNumericValue(height)} px
                </Text>
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
                onClick={handleResizeConfirm}
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
