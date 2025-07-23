import { CloseButton } from '@/components/ui/close-button';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import {
  formatFileSize,
  getAudioFormat,
  useCreateAudioTemplate,
  validateAudioFile
} from '@/features/audioTemplates/audioTemplatesAPI';
import {
  Box,
  Button,
  HStack,
  Input,
  Portal,
  Text,
  VStack
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { FiMusic, FiUpload } from 'react-icons/fi';

interface CreateAudioTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAudioTemplateModal: React.FC<CreateAudioTemplateModalProps> = ({
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'free' | 'pro' | 'vip'>('free');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createAudioTemplate } = useCreateAudioTemplate();

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
    
    // Auto-fill name if empty
    if (!name) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setName(fileName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Vui lòng chọn file audio');
      return;
    }

    if (!name.trim()) {
      setError('Vui lòng nhập tên template');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await createAudioTemplate({
        file: selectedFile,
        name: name.trim(),
        tier
      });
      
      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error('Error creating audio template:', error);
      setError('Có lỗi xảy ra khi tạo audio template. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setTier('free');
    setSelectedFile(null);
    setError('');
    setIsUploading(false);
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
            <DialogTitle>Thêm Audio Template</DialogTitle>
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
                    disabled={isUploading}
                  />
                </Field>

                <Field label="Tier" required>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as 'free' | 'pro' | 'vip')}
                    disabled={isUploading}
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

                <Field label="File audio" required>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg,audio/midi,audio/aac,audio/webm"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={isUploading}
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
                          Nhấn để chọn file audio
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Hỗ trợ: MP3, WAV, OGG, MIDI, AAC, WebM
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box
                      border="1px solid #d1d5db"
                      borderRadius="6px"
                      p={4}
                    >
                      <HStack gap={3}>
                        <FiMusic size={24} color="green" />
                        <VStack align="start" gap={1} flex={1}>
                          <Text fontWeight="medium">{selectedFile.name}</Text>
                          <HStack gap={4} fontSize="sm" color="gray.600">
                            <Text>{getAudioFormat(selectedFile.type)}</Text>
                            <Text>{formatFileSize(selectedFile.size)}</Text>
                          </HStack>
                        </VStack>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUploadClick}
                          disabled={isUploading}
                        >
                          Thay đổi
                        </Button>
                      </HStack>

                      {/* Audio preview */}
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

                {isUploading && (
                  <Box>
                    <Text mb={2} fontSize="sm">Đang tải lên...</Text>
                  </Box>
                )}
              </VStack>
            </DialogBody>

            <DialogFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={handleClose}
                disabled={isUploading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                loading={isUploading}
                disabled={!selectedFile || !name.trim()}
              >
                {isUploading ? 'Đang tạo...' : 'Tạo Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Portal>
    </DialogRoot>
  );
};

export default CreateAudioTemplateModal;
