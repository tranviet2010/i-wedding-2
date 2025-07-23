import { useGetFonts } from '@/features/files/fileAPI';
import { Box, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useViewport } from '../Viewport/ViewportContext';
import { zIndex } from '@/utils/zIndex';

interface FontOption {
  value: string;
  label: string;
  isCustom?: boolean;
  fontPath?: string;
}

interface StyledFontSelectorProps {
  value: string;
  options: FontOption[];
  onChange: (value: string) => void;
  className?: string;
}

export const StyledFontSelector: React.FC<StyledFontSelectorProps> = ({
  value,
  options,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customFonts, setCustomFonts] = useState<FontOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showFontSelectModal } = useViewport();
  const { data: fonts } = useGetFonts();

  // Find the selected option label
  const selectedOption = options.find(opt => opt.value === value) ||
    customFonts.find(opt => opt.value === value) ||
    options[0];

  // Load custom fonts from the API
  useEffect(() => {
    if (fonts && fonts.length > 0) {
      const fontOptions: FontOption[] = fonts.map(font => ({
        value: font.fileName,
        label: font.originalName || font.fileName,
        isCustom: true,
        fontPath: font.filePath
      }));

      setCustomFonts(fontOptions);
    }
  }, [fonts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <Box
      position="relative"
      ref={dropdownRef}
      className={className}
    >
      {/* Selected value display */}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        padding="0.5rem"
        borderRadius="md"
        border="1px solid #e2e8f0"
        cursor="pointer"
        backgroundColor="white"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text style={{
          fontFamily: selectedOption.value === 'inherit' ? 'inherit' :
            (selectedOption.value.includes("'") || selectedOption.value.includes('"') || selectedOption.value.includes(',')) ?
              selectedOption.value : `'${selectedOption.value}'`
        }}>
          {selectedOption.label}
        </Text>
        <Box as="span" ml={2}>▼</Box>
      </Box>

      {/* Dropdown options */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          width="250px"
          zIndex={zIndex.styledFontSelector}
          backgroundColor="white"
          borderRadius="md"
          border="1px solid #e2e8f0"
          boxShadow="md"
          display="grid"
          gridTemplateColumns="2fr 1fr"
          gridTemplateRows="auto"
          maxHeight="350px"
          overflowY="auto"
        >
          {customFonts.length > 0 && (
            <>

              {/* Only show the currently selected custom font if it exists */}
              {customFonts.find(font => font.value === value) && (
                <Box
                  key={value}
                  padding="0.5rem"
                  cursor="pointer"
                  backgroundColor="#e6f7ff"
                  style={{
                    fontFamily: value === 'inherit' ? 'inherit' :
                      (value.includes("'") || value.includes('"') || value.includes(',')) ?
                        value : `'${value}'`
                  }}
                  gridColumn="1 / -1"
                >
                  {customFonts.find(font => font.value === value)?.label || value}
                </Box>
              )}

            </>
          )}
          <Box
            padding="0.5rem"
            cursor="pointer"
            backgroundColor="#f0f7ff"
            _hover={{ backgroundColor: "#e0f0ff" }}
            color="blue.600"
            fontWeight="medium"
            gridColumn="1 / -1"
            textAlign="center" onClick={() => {
              console.log('Choose from library clicked');
              console.log('showFontSelectModal function exists:', !!showFontSelectModal);

              // Show the font selection modal
              showFontSelectModal((fontName: string) => {
                console.log('Font selected callback:', fontName);
                // Create a new custom font option
                const newFont: FontOption = {
                  value: fontName,
                  label: fontName,
                  isCustom: true
                };

                // Add to custom fonts if not already present
                setCustomFonts(prev => {
                  if (!prev.some(f => f.value === fontName)) {
                    return [...prev, newFont];
                  }
                  return prev;
                });

                // Select the new font
                onChange(fontName);
              });

              // Add a slight delay before closing the dropdown
              setTimeout(() => {
                setIsOpen(false);
              }, 100);
            }}
          >
            Chọn từ Thư viện
          </Box>
          {/* Standard font options */}
          {options.map((option) => (
            <Box
              key={option.value}
              padding="0.5rem"
              cursor="pointer"
              _hover={{ backgroundColor: "#f7fafc" }}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                fontFamily: option.value === 'inherit' ? 'inherit' :
                  (option.value.includes("'") || option.value.includes('"') || option.value.includes(',')) ?
                    option.value : `'${option.value}'`
              }}
            >
              {option.label}
            </Box>
          ))}


          {/* Choose from library option */}

        </Box>
      )}

    </Box>
  );
};
