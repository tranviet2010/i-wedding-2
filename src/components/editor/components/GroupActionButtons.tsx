import React from 'react';
import { Button, Box } from '@chakra-ui/react';
import { useEditor } from '@craftjs/core';
import { useMultiSelectContext } from '../contexts/MultiSelectContext';
import { zIndex } from '@/utils/zIndex';

export const GroupActionButtons: React.FC = () => {
  const {
    selectedNodes,
    canCreateGroup,
    createGroup,
    ungroupSelection,
    clearSelection
  } = useMultiSelectContext();

  // Check if current selection is a group - make it reactive to editor state changes
  const { isGroupSelected } = useEditor((state, query) => {
    const currentSelection = query.getEvent('selected').first();
    const isGroupSelected = currentSelection &&
      state.nodes[currentSelection] &&
      state.nodes[currentSelection].data.displayName === 'Group';

    return {
      isGroupSelected
    };
  });

  // Show group button when multiple nodes are selected
  if (canCreateGroup()) {
    return (
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -5%)"
        zIndex={zIndex.groupActions}
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="xl"
        border="2px solid #ff4757"
        minWidth="200px"
      >
        <Box mb={2} textAlign="center">
          <Box
            as="span"
            fontSize="xs"
            fontWeight="bold"
            color="#ff4757"
            bg="rgba(255, 71, 87, 0.1)"
            px={2}
            py={1}
            borderRadius="full"
          >
            {selectedNodes.length} phần tử đã chọn
          </Box>
        </Box>
        <Button
          colorScheme="blue"
          size="sm"
          onClick={() => {
            createGroup();
          }}
          mr={2}
          width="full"
          mb={2}
        >
          🔗 Tạo nhóm
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearSelection}
          width="full"
        >
          ❌ Hủy chọn
        </Button>
      </Box>
    );
  }

  // Show ungroup button when a group is selected
  if (isGroupSelected) {
    return (
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -5%)"
        zIndex={zIndex.groupActions}
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="xl"
        border="2px solid #9c88ff"
        minWidth="180px"
      >

        <Button
          colorScheme="red"
          size="sm"
          onClick={() => {
            ungroupSelection();
            // Clear selection after ungrouping to ensure UI updates
            setTimeout(() => {
              clearSelection();
            }, 100);
          }}
          width="full"
        >
          💥 Hủy nhóm
        </Button>
      </Box>
    );
  }

  return null;
};
