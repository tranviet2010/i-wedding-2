import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

// Test component to verify scrollbar visibility
const ScrollTest: React.FC = () => {
  // Custom scrollbar styles
  const scrollbarStyles = {
    overflowY: 'auto' as const,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#c1c1c1 #f1f1f1',
  } as React.CSSProperties;

  // CSS for webkit scrollbars
  const scrollbarCSS = `
.test-scroll {
  overflow-y: auto !important;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.test-scroll::-webkit-scrollbar {
  width: 8px;
}

.test-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.test-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.test-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
`;

  // Inject CSS
  React.useEffect(() => {
    const styleId = 'test-scrollbar-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = scrollbarCSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Box p={4} bg="white" border="1px solid #e0e0e0" borderRadius="md">
      <Text mb={4} fontWeight="bold">Scrollbar Test</Text>
      <Flex gap={4}>
        <Box
          w="200px"
          h="calc(100vh - 200px)"
          className="test-scroll"
          style={scrollbarStyles}
          border="1px solid #ccc"
          p={2}
        >
          <Text fontSize="sm" mb={2}>Left Panel (Should Scroll)</Text>
          {Array.from({ length: 50 }, (_, i) => (
            <Box key={i} p={2} mb={1} bg="gray.50" borderRadius="sm">
              Item {i + 1}
            </Box>
          ))}
        </Box>
        <Box
          w="300px"
          h="calc(100vh - 200px)"
          className="test-scroll"
          style={scrollbarStyles}
          border="1px solid #ccc"
          p={2}
        >
          <Text fontSize="sm" mb={2}>Right Panel (Should Scroll)</Text>
          {Array.from({ length: 30 }, (_, i) => (
            <Box key={i} p={3} mb={2} bg="blue.50" borderRadius="md">
              Content Item {i + 1} - This is a longer content item to test scrolling behavior
            </Box>
          ))}
        </Box>
      </Flex>
    </Box>
  );
};

export default ScrollTest;
