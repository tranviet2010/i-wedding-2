import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  IconButton,
  Spinner,
  Table,
  NativeSelect,
  HStack,
  Text
} from "@chakra-ui/react";
import { FiPlus, FiEdit, FiTrash, FiPlay, FiDownload } from "react-icons/fi";
import { 
  useGetAudioTemplates, 
  useDeleteAudioTemplate,
  formatFileSize,
  getAudioFormat,
  AudioTemplate
} from "@/features/audioTemplates/audioTemplatesAPI";
import { domainFile } from '@/api/apiClient';
import CreateAudioTemplateModal from './CreateAudioTemplateModal';
import EditAudioTemplateModal from './EditAudioTemplateModal';

const AudioTemplates = () => {
  const [tierFilter, setTierFilter] = useState<'free' | 'pro' | 'vip' | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AudioTemplate | null>(null);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const { data: audioTemplates, isLoading } = useGetAudioTemplates(
    tierFilter ? { tier: tierFilter } : undefined
  );
  const { mutate: deleteAudioTemplate } = useDeleteAudioTemplate();

  const handleDeleteTemplate = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa audio template "${name}"?`)) {
      deleteAudioTemplate(id);
    }
  };

  const handleEditTemplate = (template: AudioTemplate) => {
    setEditingTemplate(template);
  };

  const handlePlayAudio = (id: number, filePath: string) => {
    if (playingAudio === id) {
      // Stop current audio
      setPlayingAudio(null);
      const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
      
      // Play new audio
      setPlayingAudio(id);
      const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
      if (audio) {
        audio.play();
      }
    }
  };

  const handleAudioEnded = (id: number) => {
    if (playingAudio === id) {
      setPlayingAudio(null);
    }
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `${domainFile}${filePath}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'green';
      case 'pro': return 'purple';
      case 'vip': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="text-black flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-2xl font-bold">Quản lý Audio Templates</p>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <div className="flex items-center gap-2">
            <FiPlus />
            <p>Thêm Audio Template</p>
          </div>
        </Button>
      </div>

      {/* Filter Controls */}
      <HStack gap={4} mb={4}>
        <Text fontSize="sm" fontWeight="medium">Lọc theo tier:</Text>
        <NativeSelect.Root size="sm" width="200px">
          <NativeSelect.Field
            value={tierFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTierFilter(e.target.value as 'free' | 'pro' | 'vip' | '')}
          >
            <option value="">Tất cả</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="vip">VIP</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Spinner />
        </Box>
      ) : audioTemplates && audioTemplates.length > 0 ? (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Tên</Table.ColumnHeader>
              <Table.ColumnHeader>Tier</Table.ColumnHeader>
              <Table.ColumnHeader>Ngày tạo</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Thao tác</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {audioTemplates.map((template) => (
              <Table.Row key={template.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <span>{template.name}</span>
                    {/* Hidden audio element for playback */}
                    <audio
                      id={`audio-${template.id}`}
                      src={`${domainFile}${template.fileUrl}`}
                      onEnded={() => handleAudioEnded(template.id)}
                      preload="none"
                    />
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorScheme={getTierBadgeColor(template.tier)}>
                    {template.tier.toUpperCase()}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {new Date(template.createdAt).toLocaleDateString('vi-VN')}
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <HStack gap={1} justify="flex-end">
                    <IconButton
                      aria-label={playingAudio === template.id ? "Stop audio" : "Play audio"}
                      size="sm"
                      colorScheme={playingAudio === template.id ? "red" : "blue"}
                      onClick={() => handlePlayAudio(template.id, template.fileUrl)}
                    >
                      <FiPlay />
                    </IconButton>
                    <IconButton
                      aria-label="Download audio"
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleDownload(template.fileUrl, template.fileName)}
                    >
                      <FiDownload />
                    </IconButton>
                    <IconButton
                      aria-label="Edit template"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <FiEdit />
                    </IconButton>
                    <IconButton
                      aria-label="Delete template"
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                    >
                      <FiTrash />
                    </IconButton>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <Box textAlign="center" py={8}>
          Chưa có audio template nào. Nhấn "Thêm Audio Template" để bắt đầu.
        </Box>
      )}

      {/* Create Modal */}
      <CreateAudioTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Modal */}
      {editingTemplate && (
        <EditAudioTemplateModal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate}
        />
      )}
    </div>
  );
};

export default AudioTemplates;
