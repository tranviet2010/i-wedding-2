import React, { useState } from 'react';
import {
  Button,
  IconButton,
  VStack,
  HStack,
  Text,
  Image,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { FaShare, FaCopy, FaQrcode } from 'react-icons/fa';
import { MdShare } from 'react-icons/md';
import QRCode from 'qrcode';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { useEditor } from '@craftjs/core';

interface ShareButtonProps {
  templateId?: string;
  pageData?: {
    id: number;
    domain?: string;
  };
  isPage?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ templateId, pageData, isPage }) => {
  const {enabled} = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate the appropriate URL based on context
  const generateShareUrl = (): string => {
    if (isPage && pageData?.domain) {
      // For user pages: use custom domain
      return `https://${pageData.domain}`;
    } else if (templateId) {
      // For templates: use template.mehappy.info/{templateId}
      return `https://template.mehappy.info/${templateId}`;
    }
    return window.location.href; // Fallback to current URL
  };

  const shareUrl = generateShareUrl();

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toaster.create({
        title: 'Đã sao chép!',
        description: 'Link đã được sao chép vào clipboard',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toaster.create({
        title: 'Lỗi',
        description: 'Không thể sao chép link',
        type: 'error',
        duration: 2000,
      });
    }
  };

  // Share via Web Share API
  const handleSocialShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isPage ? 'Thiệp cưới của tôi' : 'Mẫu thiệp cưới',
          text: isPage ? 'Xem thiệp cưới của chúng tôi' : 'Xem mẫu thiệp cưới đẹp',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy link if Web Share API fails
        handleCopyLink();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
      toaster.create({
        title: 'Thông báo',
        description: 'Trình duyệt không hỗ trợ chia sẻ trực tiếp. Link đã được sao chép.',
        type: 'info',
        duration: 3000,
      });
    }
  };

  // Generate and show QR code
  const handleShowQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(qrDataUrl);
      setIsQRModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toaster.create({
        title: 'Lỗi',
        description: 'Không thể tạo mã QR',
        type: 'error',
        duration: 2000,
      });
    }
  };

  if (enabled) return null;

  return (
    <>
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton
            size="sm"
            variant="outline"
            title="Chia sẻ"
            className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
          >
            <FaShare size={10} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="copy-link" onClick={handleCopyLink}>
            <HStack gap={2}>
              <FaCopy size={14} color="#3B82F6" />
              <Text>Copy Link thiệp</Text>
            </HStack>
          </MenuItem>
          <MenuItem value="social-share" onClick={handleSocialShare}>
            <HStack gap={2}>
              <MdShare size={16} color="#10B981" />
              <Text>Chia sẻ qua mạng xã hội</Text>
            </HStack>
          </MenuItem>
          <MenuItem value="qr-code" onClick={handleShowQRCode}>
            <HStack gap={2}>
              <FaQrcode size={14} color="#8B5CF6" />
              <Text>Tạo mã QR</Text>
            </HStack>
          </MenuItem>
        </MenuContent>
      </MenuRoot>

      {/* QR Code Dialog */}
      <DialogRoot open={isQRModalOpen} onOpenChange={(e) => setIsQRModalOpen(e.open)} placement="center">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mã QR</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            <VStack gap={4} align="center">
              {qrCodeDataUrl && (
                <Image
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  maxW="256px"
                  maxH="256px"
                />
              )}
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Quét mã QR để truy cập thiệp
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center" wordBreak="break-all">
                {shareUrl}
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleCopyLink}
              >
                <HStack gap={2}>
                  <FaCopy size={14} />
                  <Text>Sao chép link</Text>
                </HStack>
              </Button>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

