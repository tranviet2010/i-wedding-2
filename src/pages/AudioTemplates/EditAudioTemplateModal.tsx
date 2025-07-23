import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Input,
  VStack,
  Text,
  Box,
  Progress,
  HStack,
  Portal
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { CloseButton } from '@/components/ui/close-button';
import { FiUpload, FiMusic } from 'react-icons/fi';
import {
  useUpdateAudioTemplate,
  validateAudioFile,
  formatFileSize,
  getAudioFormat,
  AudioTemplate
} from '@/features/audioTemplates/audioTemplatesAPI';
import { domainFile } from '@/api/apiClient';

interface EditAudioTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: AudioTemplate;
}

const EditAudioTemplateModal: React.FC<EditAudioTemplateModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'free' | 'pro' | 'vip'>('free');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateAudioTemplate } = useUpdateAudioTemplate();

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setName(template.name);
      setTier(template.tier);
      setSelectedFile(null);
      setError('');
    }
  }, [template]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'File không hợp lệ');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Vui lòng nhập tên template');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const updateData: any = {
        name: name.trim(),
        tier
      };

      if (selectedFile) {
        updateData.file = selectedFile;
      }

      await updateAudioTemplate({
        id: template.id,
        data: updateData
      });
      
      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error('Error updating audio template:', error);
      setError('Có lỗi xảy ra khi cập nhật audio template. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setName(template.name);
    setTier(template.tier);
    setSelectedFile(null);
    setError('');
    setIsUpdating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => e.open ? null : handleClose()}>
      <Portal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Audio Template</DialogTitle>
            <DialogCloseTrigger asChild>
              <CloseButton />
            </DialogCloseTrigger>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody>
              <VStack gap={4} align="stretch">
                {error && (
                  <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
                    <Text color="red.600" fontSize="sm">
                      {error}
                    </Text>
                  </Box>
                )}

                <Field label="Tên template" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên audio template"
                    disabled={isUpdating}
                  />
                </Field>

                <Field label="Tier" required>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as 'free' | 'pro' | 'vip')}
                    disabled={isUpdating}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="vip">VIP</option>
                  </select>
                </Field>

                <Field label="File audio hiện tại">
                  <Box
                    border="1px solid #d1d5db"
                    borderRadius="6px"
                    p={4}
                    bg="gray.50"
                  >
                    <HStack gap={3}>
                      <FiMusic size={24} color="blue" />
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="medium">{template.fileName}</Text>
                      </VStack>
                    </HStack>

                    {/* Current audio preview */}
                    <Box mt={3}>
                      <audio
                        controls
                        style={{ width: '100%' }}
                        src={`${domainFile}${template.fileUrl}`}
                      />
                    </Box>
                  </Box>
                </Field>

                <Field label="Thay đổi file audio (tùy chọn)">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg,audio/midi,audio/aac,audio/webm"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={isUpdating}
                  />

                  {!selectedFile ? (
                    <Box
                      border="2px dashed #d1d5db"
                      borderRadius="6px"
                      p={6}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{ borderColor: '#3b82f6' }}
                      onClick={handleUploadClick}
                    >
                      <VStack gap={2}>
                        <FiUpload size={32} color="gray" />
                        <Text color="gray.600">
                          Nhấn để chọn file audio mới
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Hỗ trợ: MP3, WAV, OGG, MIDI, AAC, WebM
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box
                      border="1px solid #10b981"
                      borderRadius="6px"
                      p={4}
                      bg="green.50"
                    >
                      <HStack gap={3}>
                        <FiMusic size={24} color="green" />
                        <VStack align="start" gap={1} flex={1}>
                          <Text fontWeight="medium" color="green.700">
                            {selectedFile.name} (File mới)
                          </Text>
                          <HStack gap={4} fontSize="sm" color="green.600">
                            <Text>{getAudioFormat(selectedFile.type)}</Text>
                            <Text>{formatFileSize(selectedFile.size)}</Text>
                          </HStack>
                        </VStack>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUploadClick}
                          disabled={isUpdating}
                        >
                          Thay đổi
                        </Button>
                      </HStack>

                      {/* New audio preview */}
                      <Box mt={3}>
                        <audio
                          controls
                          style={{ width: '100%' }}
                          src={URL.createObjectURL(selectedFile)}
                        />
                      </Box>
                    </Box>
                  )}
                </Field>

                {isUpdating && (
                  <Box>
                    <Text mb={2} fontSize="sm">Đang cập nhật...</Text>
                  </Box>
                )}
              </VStack>
            </DialogBody>

            <DialogFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={handleClose}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                loading={isUpdating}
                disabled={!name.trim()}
              >
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
};

export default EditAudioTemplateModal;
