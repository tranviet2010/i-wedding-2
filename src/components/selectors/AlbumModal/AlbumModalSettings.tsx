import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { FileType } from '@/features/files/fileAPI';
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNode } from '@craftjs/core';
import { FaPlus, FaTrash, FaImage, FaEdit, FaCrop, FaCheck, FaTimes } from 'react-icons/fa';
import { AlbumModalProps, AlbumImage } from '.';
import { AlbumImageCropModal, AlbumCropData } from '../AlbumSection/AlbumImageCropModal';
import { useState } from 'react';

export const AlbumModalSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as AlbumModalProps
  }));

  const { showFileSelectModal, showMultiImageSelectModal } = useViewport();

  // State for crop modal
  const [cropModalState, setCropModalState] = useState<{
    isOpen: boolean;
    imageId: string | null;
    imageUrl: string;
    imageAlt: string;
  }>({
    isOpen: false,
    imageId: null,
    imageUrl: '',
    imageAlt: '',
  });

  // State for multi-select management
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const updateProp = (key: keyof AlbumModalProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  // Image management functions
  const addImage = () => {
    showFileSelectModal(FileType.IMAGE, (fileUrl: string) => {
      if (fileUrl) {
        const newImage: AlbumImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          url: fileUrl,
          alt: `Image ${props.albumImages.length + 1}`,
        };
        updateProp('albumImages', [...props.albumImages, newImage]);
      }
    });
  };

  // Batch image addition
  const addMultipleImages = () => {
    showMultiImageSelectModal((fileUrls: string[]) => {
      if (fileUrls && fileUrls.length > 0) {
        const newImages = fileUrls.map((url, index) => ({
          id: `img-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
          url: url,
          alt: `Image ${props.albumImages.length + index + 1}`,
        }));
        updateProp('albumImages', [...props.albumImages, ...newImages]);
      }
    });
  };

  const removeImage = (imageId: string) => {
    updateProp('albumImages', props.albumImages.filter(img => img.id !== imageId));
    // Remove from selection if it was selected
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  // Multi-select management functions
  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllImages = () => {
    setSelectedImageIds(new Set(props.albumImages.map(img => img.id)));
  };

  const clearSelection = () => {
    setSelectedImageIds(new Set());
  };

  const removeSelectedImages = () => {
    updateProp('albumImages', props.albumImages.filter(img => !selectedImageIds.has(img.id)));
    setSelectedImageIds(new Set());
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedImageIds(new Set());
  };

  const updateImage = (imageId: string, updates: Partial<AlbumImage>) => {
    updateProp('albumImages', props.albumImages.map(img =>
      img.id === imageId ? { ...img, ...updates } : img
    ));
  };

  // Handle crop completion
  const handleCropComplete = async (cropData: AlbumCropData) => {
    if (cropModalState.imageId) {
      updateImage(cropModalState.imageId, {
        reactImageCropData: cropData,
        // Clear any existing croppedImageUrl to force regeneration
        croppedImageUrl: '',
      });
    }
    setCropModalState({ isOpen: false, imageId: null, imageUrl: '', imageAlt: '' });
  };

  // Open crop modal
  const openCropModal = (image: AlbumImage) => {
    setCropModalState({
      isOpen: true,
      imageId: image.id,
      imageUrl: image.url,
      imageAlt: image.alt || `Image ${image.id}`,
    });
  };





  return (
    <Box p={4}>
      <VStack gap={4} align="stretch">
        {/* Album Images Management */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <HStack gap={2}>
              <div className='flex flex-col gap-2'>
                <Button
                  size="sm"
                  onClick={addImage}
                  colorScheme="blue"
                  variant="outline"
                >
                  <FaPlus style={{ marginRight: '8px' }} />
                  Thêm ảnh
                </Button>
                <Button
                  size="sm"
                  onClick={addMultipleImages}
                  colorScheme="green"
                  variant="outline"
                >
                  <FaPlus style={{ marginRight: '8px' }} />
                  Thêm nhiều ảnh
                </Button>
                {props.albumImages.length > 0 && (
                  <Button
                    size="sm"
                    onClick={toggleMultiSelectMode}
                    colorScheme={isMultiSelectMode ? "red" : "gray"}
                    variant="outline"
                  >
                    {isMultiSelectMode ? <FaTimes style={{ marginRight: '8px' }} /> : <FaCheck style={{ marginRight: '8px' }} />}
                    {isMultiSelectMode ? 'Thoát chọn nhiều' : 'Chọn nhiều'}
                  </Button>
                )}
              </div>
            </HStack>
          </HStack>

          {/* Multi-select controls */}
          {isMultiSelectMode && props.albumImages.length > 0 && (
            <Box mb={3} p={3} bg="blue.50" borderRadius="md">
              <Box className='flex flex-col ' mb={2}>
                <Text fontSize="sm" color="blue.700">
                  Đã chọn: {selectedImageIds.size}/{props.albumImages.length} ảnh
                </Text>
                <HStack gap={2}>
                  <Button size="xs" onClick={selectAllImages} variant="ghost" colorScheme="blue">
                    Chọn tất cả
                  </Button>
                  <Button size="xs" onClick={clearSelection} variant="ghost" colorScheme="blue">
                    Bỏ chọn tất cả
                  </Button>
                </HStack>
              </Box>
              {selectedImageIds.size > 0 && (
                <HStack gap={2}>
                  <Button
                    size="sm"
                    onClick={removeSelectedImages}
                    colorScheme="red"
                    variant="solid"
                  >
                    <FaTrash style={{ marginRight: '8px' }} />
                    Xóa đã chọn ({selectedImageIds.size})
                  </Button>
                </HStack>
              )}
            </Box>
          )}

          {props.albumImages.length === 0 ? (
            <Box
              p={4}
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              textAlign="center"
              color="gray.500"
            >
              <FaImage size={24} style={{ margin: '0 auto 8px' }} />
              <Text fontSize="sm">Chưa có hình ảnh nào</Text>
              <Text fontSize="xs">Nhấn "Thêm ảnh" để bắt đầu</Text>
            </Box>
          ) : (
            <VStack gap={2} align="stretch">
              {props.albumImages.map((image, index) => {
                const isSelected = selectedImageIds.has(image.id);
                return (
                  <Box
                    key={image.id}
                    p={3}
                    border="1px solid"
                    borderColor={isSelected && isMultiSelectMode ? "blue.300" : "gray.200"}
                    borderRadius="md"
                    bg={isSelected && isMultiSelectMode ? "blue.50" : "gray.50"}
                    position="relative"
                  >
                    <HStack gap={3}>
                      {/* Multi-select checkbox */}
                      {isMultiSelectMode && (
                        <Box>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleImageSelection(image.id)}
                          />
                        </Box>
                      )}

                      <Box
                        width="60px"
                        height="60px"
                        borderRadius="md"
                        overflow="hidden"
                        bg="gray.200"
                        flexShrink={0}
                        onClick={() => isMultiSelectMode && toggleImageSelection(image.id)}
                        cursor={isMultiSelectMode ? "pointer" : "default"}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </Box>
                      <VStack flex={1} align="stretch" gap={2}>
                        <Input
                          size="sm"
                          value={image.url || ''}
                          onChange={(e) => updateImage(image.id, { url: e.target.value })}
                          placeholder="URL ảnh..."
                          disabled={isMultiSelectMode}
                        />
                        <Input
                          size="sm"
                          value={image.alt || ''}
                          onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                          placeholder="Mô tả ảnh..."
                          disabled={isMultiSelectMode}
                        />
                        <Input
                          size="sm"
                          value={image.title || ''}
                          onChange={(e) => updateImage(image.id, { title: e.target.value })}
                          placeholder="Tiêu đề ảnh..."
                          disabled={isMultiSelectMode}
                        />
                      </VStack>
                      <VStack gap={1}>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            showFileSelectModal(FileType.IMAGE, (fileUrl: string) => {
                              if (fileUrl) {
                                updateImage(image.id, { url: fileUrl });
                              }
                            });
                          }}
                          title="Chọn ảnh từ thư viện"
                          disabled={isMultiSelectMode}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => openCropModal(image)}
                          title="Cắt ảnh"
                          disabled={!image.url || isMultiSelectMode}
                        >
                          <FaCrop />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeImage(image.id)}
                          title="Xóa ảnh"
                          disabled={isMultiSelectMode}
                        >
                          <FaTrash />
                        </Button>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </VStack >

      {/* Crop Modal */}
      < AlbumImageCropModal
        isOpen={cropModalState.isOpen}
        onClose={() => setCropModalState({ isOpen: false, imageId: null, imageUrl: '', imageAlt: '' })}
        imageUrl={cropModalState.imageUrl}
        imageId={cropModalState.imageId || ''}
        imageAlt={cropModalState.imageAlt}
        onCropComplete={handleCropComplete}
        aspectRatio={undefined} // Allow free cropping for album items
      />
    </Box >
  );
};
