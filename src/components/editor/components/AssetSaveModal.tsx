import apiClient, { domainFile } from '@/api/apiClient';
import { NodeId, useEditor } from '@craftjs/core';
import lz from 'lzutf8';
import React, { useState, useEffect, useRef } from 'react';
import { useCreateAsset, useGetAllTags } from '../../../features/assets/assetsAPI';
import { uploadFile } from '../../../features/files/fileAPI'; // Import the new function
import { removeIdFields, validateNestedElements } from '../utils/duplicationUtils';
import html2canvas from 'html2canvas';
import { zIndex } from '@/utils/zIndex';

interface AssetSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementName: string;
  nodeId: NodeId;
}

export const AssetSaveModal: React.FC<AssetSaveModalProps> = ({
  isOpen,
  onClose,
  elementName,
  nodeId
}) => {
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  const { mutate: createAsset, isPending } = useCreateAsset();
  const { data: existingTags = [], isLoading: isLoadingTags } = useGetAllTags();
  const { query } = useEditor();
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Function to map element names to category values
  const getDefaultCategory = (elementName: string): string => {
    const elementNameLower = elementName.toLowerCase();

    // Map element names to category values
    const categoryMap: { [key: string]: string } = {
      'button': 'button',
      'text': 'text',
      'image': 'image',
      'container': 'container',
      'icon': 'icon',
      'line': 'line',
      'form': 'form',
      'input': 'input',
      'video': 'video',
      'calendar': 'calendar',
      'count': 'count',
      'albumsection': 'albumsection',
      'popup': 'popup',
      'dropbox': 'dropbox',
      'wishlist': 'wishlist',
      'quickactions': 'quickactions',
      'sections': 'section',
      'section': 'section',
      'group': 'other',
      'content wrapper': 'other',
      'lightbox': 'other'
    };

    return categoryMap[elementNameLower] || 'other';
  };

  // Auto-select category when modal opens
  useEffect(() => {
    if (isOpen && elementName) {
      const defaultCategory = getDefaultCategory(elementName);
      setCategory(defaultCategory);
    }
  }, [isOpen, elementName]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategory('');
      setTag('');
      setTagInputValue('');
      setPreviewUrl('');
      setIsGeneratingPreview(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle modal close with state reset
  const handleClose = () => {
    setCategory('');
    setTag('');
    setTagInputValue('');
    setPreviewUrl('');
    setIsGeneratingPreview(false);
    onClose();
  };



  // Function to convert modern CSS colors to supported formats
  const convertModernColors = (cssValue: string): string => {
    if (!cssValue) return cssValue;

    // Handle oklch colors - convert to fallback
    if (cssValue.includes('oklch')) {
      // Extract oklch values and convert to approximate RGB
      const oklchMatch = cssValue.match(/oklch\(([^)]+)\)/);
      if (oklchMatch) {
        const values = oklchMatch[1].split(/\s+/);
        if (values.length >= 3) {
          // Simple approximation: use lightness as grayscale
          const lightness = parseFloat(values[0]) || 0.5;
          const gray = Math.round(lightness * 255);
          return `rgb(${gray}, ${gray}, ${gray})`;
        }
      }
      return 'transparent'; // Fallback
    }

    // Handle other modern color functions
    if (cssValue.includes('lab(') || cssValue.includes('lch(') || cssValue.includes('color(')) {
      return 'transparent'; // Fallback for unsupported color functions
    }

    return cssValue;
  };

  // Auto-generate preview using html2canvas
  const generatePreview = async (): Promise<string> => {
    setIsGeneratingPreview(true);

    try {
      let element: HTMLElement | null = null;

      // Special handling for QuickActions components
      if (elementName.toLowerCase() === 'quickactions') {
        // For QuickActions, capture the preview section from the modal instead of the hidden element
        const previewSection = document.querySelector('[data-quickactions-preview]') as HTMLElement;
        if (previewSection) {
          element = previewSection;

          // Temporarily force expanded state for better preview
          const actionButtons = previewSection.querySelectorAll('[style*="opacity"]');
          const originalStyles: string[] = [];
          actionButtons.forEach((button, index) => {
            if (button instanceof HTMLElement) {
              originalStyles[index] = button.style.opacity;
              button.style.opacity = '1';
            }
          });

          // Wait a moment for the style changes to take effect
          await new Promise(resolve => setTimeout(resolve, 100));

          // Restore original styles after a delay (will be restored after screenshot)
          setTimeout(() => {
            actionButtons.forEach((button, index) => {
              if (button instanceof HTMLElement) {
                button.style.opacity = originalStyles[index] || '';
              }
            });
          }, 1000);
        } else {
          // Fallback: look for any QuickActions preview area
          const modalContent = document.querySelector('[data-quickactions-id]')?.closest('.modal-content, [style*="backgroundColor: white"]') as HTMLElement;
          if (modalContent) {
            // Find the preview section within the modal
            const previewDiv = modalContent.querySelector('[style*="backgroundColor: #f8f9fa"]') as HTMLElement;
            if (previewDiv) {
              element = previewDiv;
            }
          }
        }
      }

      // Default behavior for other components
      if (!element) {
        const node = query.node(nodeId).get();
        element = node.dom;
      }

      if (!element) {
        throw new Error('Element not found in DOM');
      }

      // Create canvas from the element with enhanced options to handle modern CSS
      const canvas = await html2canvas(element, {
        backgroundColor: elementName.toLowerCase() === 'quickactions' ? '#ffffff' : null, // White background for QuickActions, transparent for others
        scale: 1, // Adjust scale for quality vs file size
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        ignoreElements: (element) => {
          // Skip elements that might cause parsing issues
          const style = window.getComputedStyle(element);
          // Skip elements with problematic color functions
          return style.backgroundColor?.includes('oklch') ||
                 style.backgroundColor?.includes('lab(') ||
                 style.backgroundColor?.includes('lch(') ||
                 style.backgroundColor?.includes('color(') ||
                 style.color?.includes('oklch') ||
                 style.color?.includes('lab(') ||
                 style.color?.includes('lch(') ||
                 style.color?.includes('color(') ||
                 style.borderColor?.includes('oklch') ||
                 style.borderColor?.includes('lab(') ||
                 style.borderColor?.includes('lch(') ||
                 style.borderColor?.includes('color(');
        },
        onclone: (clonedDoc) => {
          // Clean up problematic CSS in the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              const style = el.style;

              // Convert modern color functions to supported formats
              if (style.backgroundColor) {
                style.backgroundColor = convertModernColors(style.backgroundColor);
              }
              if (style.color) {
                style.color = convertModernColors(style.color);
              }
              if (style.borderColor) {
                style.borderColor = convertModernColors(style.borderColor);
              }
              if (style.borderTopColor) {
                style.borderTopColor = convertModernColors(style.borderTopColor);
              }
              if (style.borderRightColor) {
                style.borderRightColor = convertModernColors(style.borderRightColor);
              }
              if (style.borderBottomColor) {
                style.borderBottomColor = convertModernColors(style.borderBottomColor);
              }
              if (style.borderLeftColor) {
                style.borderLeftColor = convertModernColors(style.borderLeftColor);
              }
              if (style.outlineColor) {
                style.outlineColor = convertModernColors(style.outlineColor);
              }
              if (style.textDecorationColor) {
                style.textDecorationColor = convertModernColors(style.textDecorationColor);
              }

              // Also check computed styles and override if needed
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.backgroundColor?.includes('oklch') ||
                  computedStyle.backgroundColor?.includes('lab(') ||
                  computedStyle.backgroundColor?.includes('lch(') ||
                  computedStyle.backgroundColor?.includes('color(')) {
                style.backgroundColor = 'transparent';
              }
              if (computedStyle.color?.includes('oklch') ||
                  computedStyle.color?.includes('lab(') ||
                  computedStyle.color?.includes('lch(') ||
                  computedStyle.color?.includes('color(')) {
                style.color = '#000000';
              }
            }
          });
        }
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png', 0.8);
      });

      // Create a File object from the blob
      const file = new File([blob], `preview-${Date.now()}.png`, { type: 'image/png' });

      // Upload the generated preview image
      const data = await uploadFile(file);
      const generatedUrl = `${domainFile}${data.path}`;
      setPreviewUrl(generatedUrl);

      setIsGeneratingPreview(false);
      return generatedUrl;

    } catch (error) {
      console.error('Error generating preview:', error);

      // Fallback: Try with more restrictive options
      try {
        console.log('Attempting fallback preview generation...');

        let element: HTMLElement | null = null;

        // Try QuickActions preview section first in fallback too
        if (elementName.toLowerCase() === 'quickactions') {
          const previewSection = document.querySelector('[data-quickactions-preview]') as HTMLElement;
          if (previewSection) {
            element = previewSection;
          }
        }

        // Default fallback
        if (!element) {
          const node = query.node(nodeId).get();
          element = node.dom;
        }

        if (element) {
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 0.5, // Lower scale to reduce complexity
            useCORS: false,
            allowTaint: false,
            logging: false,
            width: Math.min(element.offsetWidth, 400),
            height: Math.min(element.offsetHeight, 300),
            ignoreElements: () => false, // Don't ignore any elements in fallback
            onclone: (clonedDoc) => {
              // More aggressive CSS cleanup - inject CSS to override all colors
              const style = clonedDoc.createElement('style');
              style.textContent = `
                * {
                  background-color: transparent !important;
                  color: #000000 !important;
                  border-color: #cccccc !important;
                  outline-color: #cccccc !important;
                  text-decoration-color: #000000 !important;
                }
                /* Remove any CSS custom properties that might contain modern colors */
                :root {
                  --color-primary: #4ade80 !important;
                }
              `;
              clonedDoc.head.appendChild(style);
            }
          });

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Fallback blob creation failed'));
              }
            }, 'image/png', 0.5);
          });

          const file = new File([blob], `preview-fallback-${Date.now()}.png`, { type: 'image/png' });
          const data = await uploadFile(file);
          const fallbackUrl = `${domainFile}${data.path}`;
          setPreviewUrl(fallbackUrl);

          console.log('Fallback preview generation successful');
          setIsGeneratingPreview(false);
          return fallbackUrl;
        }
      } catch (fallbackError) {
        console.error('Fallback preview generation also failed:', fallbackError);

        // Generate a simple placeholder preview URL instead of leaving empty
        const placeholderPreview = await generatePlaceholderPreview(elementName);
        setPreviewUrl(placeholderPreview);
        setIsGeneratingPreview(false);
        return placeholderPreview;
      }

      // If we reach here, the fallback element was not found
      console.error('Element not found for fallback preview generation');
      const placeholderPreview = await generatePlaceholderPreview(elementName);
      setPreviewUrl(placeholderPreview);
      setIsGeneratingPreview(false);
      return placeholderPreview;
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Generate a simple placeholder preview when canvas generation fails
  const generatePlaceholderPreview = async (elementName: string): Promise<string> => {
    try {
      // Create a simple canvas with element name
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw a simple placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 100);

        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(elementName || 'Element', 100, 40);
        ctx.fillText('Preview', 100, 65);

        // Convert to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create placeholder blob'));
            }
          }, 'image/png', 0.8);
        });

        // Upload placeholder
        const file = new File([blob], `placeholder-${Date.now()}.png`, { type: 'image/png' });
        const data = await uploadFile(file);
        return `${domainFile}${data.path}`;
      }
    } catch (error) {
      console.error('Failed to generate placeholder preview:', error);
    }

    // Return empty string as final fallback
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions while processing
    if (isGeneratingPreview || isPending) {
      return;
    }

    try {
      // Generate preview first and wait for it to complete
      const generatedPreviewUrl = await generatePreview();

      // Now proceed with asset creation after preview is ready, using the returned preview URL
      await createAssetWithNodeData(generatedPreviewUrl);

    } catch (mainError) {
      console.error("Error in handleSubmit:", mainError);
      alert('Lỗi khi xử lý yêu cầu lưu mẫu phần tử. Vui lòng thử lại.');
    }
  };

  // Separate function to handle asset creation with node data
  const createAssetWithNodeData = async (finalPreviewUrl: string) => {
    try {
      // Get the node tree for the element to save (similar to duplication logic)
      const tree = query.node(nodeId).toNodeTree();

      // Enhanced collection of all linked nodes (including nested ones) - same as duplication
      const collectAllLinkedNodes = (nodeId: string, visited = new Set<string>()) => {
        if (visited.has(nodeId)) return; // Prevent infinite loops
        visited.add(nodeId);

        const node = tree.nodes[nodeId] || query.node(nodeId).get();
        if (!node) return;

        // Add the node to tree if it's missing
        if (!tree.nodes[nodeId]) {
          tree.nodes[nodeId] = node;
          console.log(`Added missing linked node for asset save: ${nodeId}`);
        }

        // Process linked nodes (important for Button components)
        if (node.data?.linkedNodes) {
          Object.values(node.data.linkedNodes).forEach((linkedNodeId: any) => {
            collectAllLinkedNodes(linkedNodeId, visited);
          });
        }

        // Process child nodes
        if (node.data?.nodes) {
          node.data.nodes.forEach((childNodeId: string) => {
            collectAllLinkedNodes(childNodeId, visited);
          });
        }
      };

      // Collect all linked nodes starting from root
      collectAllLinkedNodes(tree.rootNodeId);

      // Enhanced handling for Button components to preserve text and icon styling
      const rootNode = tree.nodes[tree.rootNodeId];
      if (rootNode?.data?.displayName === 'Button' || rootNode?.data?.name === 'Button') {
        console.log('=== Button Asset Save Enhancement ===');
        console.log('Original button props:', rootNode.data.props);

        // Get all text and icon properties from the linked nodes
        const linkedNodes = rootNode.data.linkedNodes || {};
        const textNodeKey = Object.keys(linkedNodes).find(key => key.startsWith('text'));
        const iconNodeKey = Object.keys(linkedNodes).find(key => key.startsWith('icon'));

        // Enhance textComponent with complete text styling
        if (textNodeKey) {
          const textNodeId = linkedNodes[textNodeKey];
          const originalTextNode = tree.nodes[textNodeId];

          if (originalTextNode?.data?.props) {
            const completeTextComponent = {
              // Default Text component properties
              fontSize: '15',
              textAlign: 'center',
              fontWeight: '400',
              fontStyle: 'normal',
              color: '#000000',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              letterSpacing: '0',
              textTransform: 'none',
              textDecoration: 'none',
              textShadow: { x: 0, y: 0, blur: 0, color: '#000000', enabled: false },
              textStroke: { width: 0, color: '#000000' },
              backgroundType: 'color',
              backgroundColor: 'transparent',
              opacity: 100,
              // Override with ALL original text node properties
              ...originalTextNode.data.props,
              // Ensure button-specific properties
              isChildOfButton: true,
              width: '100%',
            };

            // Update the button's textComponent in the tree
            tree.nodes[tree.rootNodeId].data.props.textComponent = completeTextComponent;
            tree.nodes[tree.rootNodeId].data.props.text = originalTextNode.data.props.text || tree.nodes[tree.rootNodeId].data.props.text;

            // Also update color prop to match text color
            if (originalTextNode.data.props.color) {
              tree.nodes[tree.rootNodeId].data.props.color = originalTextNode.data.props.color;
            }

            console.log('Enhanced button textComponent for asset save:', completeTextComponent);
          }
        }

        // Enhance iconComponent with complete icon styling
        if (iconNodeKey) {
          const iconNodeId = linkedNodes[iconNodeKey];
          const originalIconNode = tree.nodes[iconNodeId];

          if (originalIconNode?.data?.props) {
            const completeIconComponent = {
              // Default Icon component properties
              svgCode: '',
              iconColor: '',
              width: '20px',
              height: '20px',
              // Override with ALL original icon node properties
              ...originalIconNode.data.props,
              // Ensure button-specific properties
              isChildOfButton: true,
            };

            // Update the button's iconComponent in the tree
            tree.nodes[tree.rootNodeId].data.props.iconComponent = completeIconComponent;

            console.log('Enhanced button iconComponent for asset save:', completeIconComponent);
          }
        }
      }

      // Validate and fix nested element relationships
      validateNestedElements(tree);

      // Create a clean tree structure for saving (remove ID conflicts)
      const cleanTree = {
        rootNodeId: tree.rootNodeId,
        nodes: Object.keys(tree.nodes).reduce((acc, nodeId) => {
          const node = tree.nodes[nodeId];
          acc[nodeId] = {
            ...node,
            data: {
              ...node.data,
              // Clean props to remove ID fields that could cause conflicts
              props: removeIdFields(node.data.props)
            }
          };
          return acc;
        }, {} as any)
      };

      // Get the root node for serialization
      const rootNodeForSave = cleanTree.nodes[cleanTree.rootNodeId];

      // Remove parent reference to make it portable
      if (rootNodeForSave.data.parent) {
        delete rootNodeForSave.data.parent;
      }

      // Store the complete tree structure for complex components
      if (Object.keys(cleanTree.nodes).length > 1) {
        (rootNodeForSave as any)._assetTree = cleanTree;
      }

      // Serialize the enhanced node data to JSON
      const serializedNode = JSON.stringify(rootNodeForSave);

      // Compress and encode as base64
      const base64NodeData = lz.encodeBase64(lz.compress(serializedNode));


      // Create the asset with the node data as base64 string
      createAsset({
        key: `${category}`,
        tag: tag || '',
        content: base64NodeData,
        previewUrl: finalPreviewUrl || '' // Use the generated preview URL passed as parameter
      }, {
        onSuccess: () => {
          handleClose();
        }
      });

    } catch (error) {
      console.error("Error saving enhanced asset:", error);

      // Fallback: try the simpler approach (original method) but still preserve Button styling
      try {
        console.log("Attempting fallback asset save...");

        // Get the node data when submitting (original method)
        const node = query.node(nodeId).toSerializedNode();

        // Enhanced fallback: still try to preserve Button component styling
        if (node.displayName === 'Button' || (typeof node.type === 'object' && (node.type as any)?.resolvedName === 'Button')) {
          console.log("Applying Button enhancement to fallback save...");

          // Get the current node to access linked nodes
          const currentNode = query.node(nodeId).get();
          const linkedNodes = currentNode.data?.linkedNodes || {};

          // Enhance textComponent if text node exists
          const textNodeKey = Object.keys(linkedNodes).find(key => key.startsWith('text'));
          if (textNodeKey) {
            const textNodeId = linkedNodes[textNodeKey];
            const textNode = query.node(textNodeId).get();

            if (textNode?.data?.props) {
              const completeTextComponent = {
                fontSize: '15',
                textAlign: 'center',
                fontWeight: '400',
                fontStyle: 'normal',
                color: '#000000',
                fontFamily: 'inherit',
                lineHeight: '1.4',
                letterSpacing: '0',
                textTransform: 'none',
                textDecoration: 'none',
                textShadow: { x: 0, y: 0, blur: 0, color: '#000000', enabled: false },
                textStroke: { width: 0, color: '#000000' },
                backgroundType: 'color',
                backgroundColor: 'transparent',
                opacity: 100,
                ...textNode.data.props,
                isChildOfButton: true,
                width: '100%',
              };

              node.props.textComponent = completeTextComponent;
              node.props.text = textNode.data.props.text || node.props.text;
              if (textNode.data.props.color) {
                node.props.color = textNode.data.props.color;
              }
            }
          }

          // Enhance iconComponent if icon node exists
          const iconNodeKey = Object.keys(linkedNodes).find(key => key.startsWith('icon'));
          if (iconNodeKey) {
            const iconNodeId = linkedNodes[iconNodeKey];
            const iconNode = query.node(iconNodeId).get();

            if (iconNode?.data?.props) {
              const completeIconComponent = {
                svgCode: '',
                iconColor: '',
                width: '20px',
                height: '20px',
                ...iconNode.data.props,
                isChildOfButton: true,
              };

              node.props.iconComponent = completeIconComponent;
            }
          }
        }

        // Clean the node props to remove ID fields
        node.props = removeIdFields(node.props);

        // Serialize the enhanced node to JSON
        const serializedNode = JSON.stringify(node);

        // Compress and encode as base64
        const base64NodeData = lz.encodeBase64(lz.compress(serializedNode));

        // Create the asset with the node data as base64 string
        createAsset({
          key: `${category}`,
          tag: tag || '',
          content: base64NodeData,
          previewUrl: finalPreviewUrl || '' // Use the generated preview URL passed as parameter
        }, {
          onSuccess: () => {
            handleClose();
          }
        });

      } catch (fallbackError) {
        console.error("Fallback asset saving also failed:", fallbackError);
        alert('Lỗi khi lưu mẫu phần tử. Vui lòng thử lại.');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle tag input changes
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInputValue(value);
    setTag(value);
  };

  // Handle tag selection from list
  const handleTagSelect = (selectedTag: string) => {
    setTag(selectedTag);
    setTagInputValue(selectedTag);
  };

  // Filter existing tags based on input (show all if input is empty)
  const filteredTags = tagInputValue.length > 0
    ? existingTags.filter(existingTag =>
        existingTag.toLowerCase().includes(tagInputValue.toLowerCase())
      )
    : existingTags;



  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      onClick={handleBackdropClick}
      style={{ zIndex: zIndex.assetSave, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}

    >
      <div
        className="bg-white rounded-lg p-6 w-96 max-w-full"
        style={{ position: 'relative', zIndex: zIndex.assetSaveContent }}
      >
        <h3 className="text-lg font-medium mb-4">Lưu mẫu phần tử</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tag</label>
            <input
              ref={tagInputRef}
              type="text"
              value={tagInputValue}
              onChange={handleTagInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              placeholder="Nhập tag cho mẫu phần tử hoặc chọn từ danh sách bên dưới..."
              onClick={e => e.stopPropagation()}
              disabled={isLoadingTags}
            />

            {/* Loading indicator */}
            {isLoadingTags && (
              <div className="text-gray-400 text-sm mb-2">
                Đang tải danh sách tags...
              </div>
            )}

            {/* Tag list */}
            {!isLoadingTags && existingTags.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">Tags có sẵn:</div>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  <div className="flex flex-wrap gap-1">
                    {filteredTags.map((existingTag, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`px-2 py-1 text-xs rounded-md border cursor-pointer transition-colors ${
                          tag === existingTag
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagSelect(existingTag);
                        }}
                      >
                        {existingTag}
                      </button>
                    ))}
                  </div>
                  {filteredTags.length === 0 && tagInputValue.length > 0 && (
                    <div className="text-xs text-gray-500 italic">
                      Không tìm thấy tag phù hợp. Nhập để tạo tag mới.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No tags message */}
            {!isLoadingTags && existingTags.length === 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Chưa có tags nào. Nhập để tạo tag đầu tiên.
              </div>
            )}
          </div>



          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
              disabled={isPending || isGeneratingPreview}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 cursor-pointer"
              onClick={e => e.stopPropagation()}
              disabled={isPending || isGeneratingPreview}
            >
              {isGeneratingPreview ? 'Đang tạo preview...' : isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};