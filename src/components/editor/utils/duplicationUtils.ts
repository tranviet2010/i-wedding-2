import { useEditor, Node, NodeTree } from '@craftjs/core';
import { getRandomId } from '@craftjs/utils';

/**
 * Polyfill for Object.fromEntries for older browsers
 */
const fromEntries = (pairs: [string, any][]): { [key: string]: any } => {
  if (Object.fromEntries) {
    return Object.fromEntries(pairs);
  }
  return pairs.reduce(
    (accum, [id, value]) => ({
      ...accum,
      [id]: value,
    }),
    {}
  );
};

/**
 * Remove all ID fields from node data during duplication to let Craft.js auto-generate IDs
 * This prevents ID conflicts and duplication/deletion errors
 * Also removes customId from data.custom to ensure each duplicated modal gets a fresh customId
 */
export const removeIdFields = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeIdFields);
  }

  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip ID-related fields that should be auto-generated
    if (key === 'id' || key === 'nodeId' || key === 'elementId'  || key.endsWith('Id')) {
      continue;
    }

    // Recursively clean nested objects
    cleaned[key] = removeIdFields(value);
  }

  return cleaned;
};

/**
 * Ensure all nested elements maintain their proper relationships and properties
 * This is especially important for complex components like Button with Text children
 */
export const validateNestedElements = (tree: any): void => {
  try {
    Object.values(tree.nodes).forEach((node: any) => {
      if (node?.data?.linkedNodes) {
        Object.values(node.data.linkedNodes).forEach((linkedNodeId: any) => {
          const linkedNode = tree.nodes[linkedNodeId];
          if (linkedNode && linkedNode.data.displayName === 'Text') {
            // Ensure Text nodes inside buttons have proper properties
            if (node.data.displayName === 'Button') {
              linkedNode.data.props.isChildOfButton = true;
              linkedNode.data.props.width = linkedNode.data.props.width || '100%';

              // Ensure the button's textComponent prop contains all the text styling
              if (node.data.props.textComponent) {
                node.data.props.textComponent = {
                  ...node.data.props.textComponent,
                  ...linkedNode.data.props,
                  isChildOfButton: true,
                  width: '100%',
                };
              }
            }
          }
        });
      }
    });
  } catch (error) {
    console.warn('Error validating nested elements:', error);
  }
};

/**
 * Create a cloned tree with new IDs using Craft.js proper approach
 * Following the official Craft.js guide pattern
 */
export const getCloneTree = (tree: NodeTree, query: any, positionOffset?: { top?: string; left?: string }) => {
  const newNodes: { [nodeId: string]: Node } = {};

  // Validate input
  if (!tree || !tree.nodes || !tree.rootNodeId || !tree.nodes[tree.rootNodeId]) {
    throw new Error('Invalid tree structure provided to getCloneTree');
  }

  // Debug: Log basic tree info
  console.log(`Cloning tree with ${Object.keys(tree.nodes).length} nodes, root: ${tree.rootNodeId}`);

  const changeNodeId = (node: Node, newParentId?: string): string => {
    // Validate node
    if (!node || !node.data) {
      console.error('Invalid node provided to changeNodeId:', node);
      throw new Error('Invalid node structure');
    }
    
    // Create a new node object with cleared custom data instead of mutating the original
    const nodeWithClearedCustom = {
      ...node,
      data: {
        ...node.data,
        custom: {}
      }
    };
    
    const newNodeId = getRandomId();

    // Special handling for Text components to ensure all properties are preserved
    const enhancedProps = { ...nodeWithClearedCustom.data.props };
    if (nodeWithClearedCustom.data.displayName === 'Text' || nodeWithClearedCustom.data.name === 'Text') {
      // Ensure text content is preserved, especially for ContentEditable elements
      if (nodeWithClearedCustom.data.props.text) {
        enhancedProps.text = nodeWithClearedCustom.data.props.text;
      }
      // Preserve all styling properties that might be lost during cloning
      const textStyleProps = [
        'fontSize', 'fontWeight', 'fontStyle', 'fontFamily', 'color',
        'textAlign', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration',
        'textShadow', 'textStroke', 'backgroundColor', 'backgroundType',
        'gradientType', 'gradientAngle', 'gradientColor1', 'gradientColor2',
        'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
        'opacity', 'width', 'isChildOfButton'
      ];

      textStyleProps.forEach(prop => {
        if (nodeWithClearedCustom.data.props[prop] !== undefined) {
          enhancedProps[prop] = nodeWithClearedCustom.data.props[prop];
        }
      });
    }

    // Handle child nodes recursively - check if child exists
    const childNodes = nodeWithClearedCustom.data.nodes
      .filter((childId) => tree.nodes[childId]) // Only process existing children
      .map((childId) => changeNodeId(tree.nodes[childId], newNodeId));

    // Handle linked nodes recursively - check if linked node exists
    const linkedNodes = Object.keys(nodeWithClearedCustom.data.linkedNodes || {}).reduce(
      (acc, id) => {
        const linkedNodeId = nodeWithClearedCustom.data.linkedNodes[id];
        if (tree.nodes[linkedNodeId]) { // Only process existing linked nodes
          const newLinkedNodeId = changeNodeId(
            tree.nodes[linkedNodeId],
            newNodeId
          );
          console.log(`Mapped linked node: ${id} -> ${newLinkedNodeId}`);
          return {
            ...acc,
            [id]: newLinkedNodeId,
          };
        } else {
          console.warn(`Linked node ${linkedNodeId} not found in tree`);
        }
        return acc;
      },
      {}
    );

    // Create the new node with updated references and preserve all data
    // Remove ID fields from enhanced props to prevent conflicts
    const cleanedProps = removeIdFields(enhancedProps);
    
    const tmpNode = {
      ...nodeWithClearedCustom,
      id: newNodeId,
      data: {
        ...nodeWithClearedCustom.data,
        parent: newParentId || nodeWithClearedCustom.data.parent,
        nodes: childNodes,
        linkedNodes,
        // Ensure we preserve all props including text content, with ID fields removed
        props: {
          ...cleanedProps,
          top: cleanedProps?.top ? `${parseInt(cleanedProps.top) + 10}px` : '20px',
          left: cleanedProps?.left ? `${parseInt(cleanedProps.left) + 10}px` : '20px'
        }
      },
    };

    // Apply position offset for root node (only if it's not a child of another node)
    if (!newParentId && positionOffset && tmpNode.data.props) {
      tmpNode.data.props = {
        ...tmpNode.data.props,
        ...(positionOffset.top && { top: tmpNode.data.props.top ? `${parseInt(tmpNode.data.props.top) + 10}px` : positionOffset.top }),
        ...(positionOffset.left && { left: tmpNode.data.props.left ? `${parseInt(tmpNode.data.props.left) + 10}px` : positionOffset.left })
      };
    }

    // Parse the node to ensure it's properly formatted
    const freshNode = query.parseFreshNode(tmpNode).toNode();
    newNodes[newNodeId] = freshNode;
    return newNodeId;
  };

  const rootNodeId = changeNodeId(tree.nodes[tree.rootNodeId]);

  // Create the new tree structure
  const newTree = {
    rootNodeId,
    nodes: newNodes,
  };

  // Validate and fix nested element relationships
  validateNestedElements(newTree);

  return newTree;
};

/**
 * Duplicate a node with all its children using the proper Craft.js approach
 * This uses the getCloneTree function and addNodeTree method
 */
export const duplicateNodeWithChildren = (
  nodeId: string,
  targetParent: string,
  insertIndex: number,
  query: any,
  actions: any,
  positionOffset?: { top?: string; left?: string }
) => {
  try {
    // Get the node tree for the element to duplicate
    const tree = query.node(nodeId).toNodeTree();

    // Recursively collect all linked nodes (including nested ones)
    const collectAllLinkedNodes = (nodeId: string, visited = new Set<string>()) => {
      if (visited.has(nodeId)) return; // Prevent infinite loops
      visited.add(nodeId);

      const node = tree.nodes[nodeId] || query.node(nodeId).get();
      if (!node) return;

      // Add the node to tree if it's missing
      if (!tree.nodes[nodeId]) {
        tree.nodes[nodeId] = node;
        console.log(`Added missing linked node: ${nodeId}`);
      }

      // Process linked nodes
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

    // Create a cloned tree with new IDs
    const newTree = getCloneTree(tree, query, positionOffset);

    // Add the cloned tree to the target parent
    actions.addNodeTree(newTree, targetParent, insertIndex);

    // Enhanced handling for Button components to ensure proper text styling preservation
    const originalRootNode = tree.nodes[tree.rootNodeId];
    if (originalRootNode?.data?.displayName === 'Button' || originalRootNode?.data?.name === 'Button') {
      try {
        const newButtonId = newTree.rootNodeId;

        // Get all text and icon properties from the original linked nodes
        const linkedNodes = originalRootNode.data.linkedNodes || {};
        const textNodeKey = Object.keys(linkedNodes).find(key => key.startsWith('text'));
        const iconNodeKey = Object.keys(linkedNodes).find(key => key.startsWith('icon'));

        if (textNodeKey) {
          const textNodeId = linkedNodes[textNodeKey];
          const originalTextNode = tree.nodes[textNodeId];

          if (originalTextNode?.data?.props) {
            console.log('=== Button Duplication Debug ===');
            console.log('Original text node properties:', originalTextNode.data.props);
            console.log('Original button props:', originalRootNode.data.props);

            // Create a complete textComponent object with all styling properties
            const completeTextComponent = {
              // Start with default Text component properties
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
              // Override with ALL original text node properties (this will override defaults above)
              ...originalTextNode.data.props,
              // Ensure button-specific properties (these override everything)
              isChildOfButton: true,
              width: '100%',
            };

            // Update the button's textComponent with complete styling immediately
            actions.setProp(newButtonId, (props: any) => {
              props.textComponent = completeTextComponent;
              props.text = originalTextNode.data.props.text || props.text;

              // Also update the button's color prop to match the text color
              // This is important because Button passes color={color} which overrides textComponent.color
              if (originalTextNode.data.props.color) {
                props.color = originalTextNode.data.props.color;
              }

              // Preserve iconComponent data during duplication
              if (originalRootNode.data.props.iconComponent) {
                props.iconComponent = { ...originalRootNode.data.props.iconComponent };
              }

              console.log('Updated button textComponent and color:', completeTextComponent);
            });

            // Ensure the duplicated text node also has the correct properties
            const newLinkedNodes = newTree.nodes[newButtonId]?.data?.linkedNodes || {};
            const newTextNodeId = newLinkedNodes[textNodeKey];

            if (newTextNodeId && newTree.nodes[newTextNodeId]) {
              actions.setProp(newTextNodeId, (props: any) => {
                // Apply all original text properties to the new text node
                Object.keys(originalTextNode.data.props).forEach(key => {
                  props[key] = originalTextNode.data.props[key];
                });
                props.isChildOfButton = true;

                console.log('Updated duplicated text node properties');
              });
            }

            // Force a second update after a brief delay to ensure styling is applied
            setTimeout(() => {
              try {
                actions.setProp(newButtonId, (props: any) => {
                  props.textComponent = { ...completeTextComponent };
                  // Ensure color is also updated in the delayed update
                  if (originalTextNode.data.props.color) {
                    props.color = originalTextNode.data.props.color;
                  }
                  // Ensure iconComponent is also preserved in delayed update
                  if (originalRootNode.data.props.iconComponent) {
                    props.iconComponent = { ...originalRootNode.data.props.iconComponent };
                  }
                });
                console.log('Applied delayed text styling and color update');
              } catch (delayError) {
                console.warn('Delayed styling update failed:', delayError);
              }
            }, 100);
          }
        }

        // Handle icon node duplication if it exists
        if (iconNodeKey) {
          const iconNodeId = linkedNodes[iconNodeKey];
          const originalIconNode = tree.nodes[iconNodeId];

          if (originalIconNode?.data?.props) {
            console.log('Original icon node properties:', originalIconNode.data.props);

            // Create a complete iconComponent object with all icon properties
            const completeIconComponent = {
              // Start with default Icon component properties
              svgCode: '',
              iconColor: '',
              width: '20px',
              height: '20px',
              // Override with ALL original icon node properties
              ...originalIconNode.data.props,
              // Ensure button-specific properties
              isChildOfButton: true,
            };

            // Update the button's iconComponent with complete icon styling immediately
            actions.setProp(newButtonId, (props: any) => {
              props.iconComponent = completeIconComponent;

              console.log('Updated button iconComponent:', completeIconComponent);
            });

            // Update the duplicated icon node with original properties
            const newLinkedNodes = newTree.nodes[newButtonId]?.data?.linkedNodes || {};
            const newIconNodeId = newLinkedNodes[iconNodeKey];

            if (newIconNodeId && newTree.nodes[newIconNodeId]) {
              actions.setProp(newIconNodeId, (props: any) => {
                // Apply all original icon properties to the new icon node
                Object.keys(originalIconNode.data.props).forEach(key => {
                  props[key] = originalIconNode.data.props[key];
                });
                props.isChildOfButton = true;

                console.log('Updated duplicated icon node properties');
              });
            }

            // Force a second update after a brief delay to ensure icon styling is applied
            setTimeout(() => {
              try {
                actions.setProp(newButtonId, (props: any) => {
                  props.iconComponent = { ...completeIconComponent };
                });
                console.log('Applied delayed icon styling update');
              } catch (delayError) {
                console.warn('Delayed icon styling update failed:', delayError);
              }
            }, 100);
          }
        }

        console.log('Button duplication completed with full text and icon styling preservation');
      } catch (error) {
        console.error("Error in Button duplication handling:", error);
      }
    }

    // Select the new root node
    actions.selectNode(newTree.rootNodeId);

    return { id: newTree.rootNodeId };

  } catch (error) {
    console.error("Error duplicating node with children:", error);
    throw error;
  }
};

/**
 * Get the target section for placing duplicated elements
 * This follows the existing pattern in the codebase
 */
export const getTargetSection = (query: any, currentNodeId?: string): string => {
  const node = query.node('ROOT').toNodeTree().nodes;
  const sections = Object.values(node).filter((n: any) => n && n.data && n.data.name === 'Sections') as any[];
  
  if (currentNodeId) {
    const sectionIdContainingSelected = sections.find((section: any) => {
      return section.data.nodes.includes(currentNodeId)
    }) as any;
    if (sectionIdContainingSelected) {
      return sectionIdContainingSelected.id;
    }
  }
  
  return sections[0]?.id || 'ROOT';
};

/**
 * Check if a node is a modal/popup component that requires special duplication handling
 */
export const isModalComponent = (node: Node): boolean => {
  const displayName = node.data.displayName;
  return displayName === 'Popup' ||
         displayName === 'Dropbox' ||
         displayName === 'Album Modal' ||
         displayName === 'QuickActions';
};

/**
 * Duplicate a modal/popup component with special behavior:
 * 1. Close the currently open modal
 * 2. Duplicate the component
 * 3. Open the newly duplicated modal
 */
export const duplicateModalComponent = (
  nodeId: string,
  query: any,
  actions: any,
  viewportContext: any
) => {
  try {
    const node = query.node(nodeId).get();

    if (!isModalComponent(node)) {
      throw new Error('Node is not a modal component');
    }

    // Close all existing modal components before duplication
    viewportContext.closeAllModalComponents();

    // Get the node tree for the modal to duplicate
    const tree = query.node(nodeId).toNodeTree();

    // Create a cloned tree with new IDs (customId will be excluded by removeIdFields)
    const newTree = getCloneTree(tree, query);

    // Add the cloned tree directly to ROOT (modals are always children of ROOT)
    actions.addNodeTree(newTree, 'ROOT');

    // Get the new modal's ID
    const newModalId = newTree.rootNodeId;

    // Select the new modal
    actions.selectNode([]);

    // Open the appropriate modal type after a short delay
    setTimeout(() => {
      const newNode = query.node(newModalId).get();
      const displayName = newNode.data.displayName;

      switch (displayName) {
        case 'Popup':
          viewportContext.openPopup(newModalId);
          break;
        case 'Dropbox':
          viewportContext.openDropboxEditor(newModalId);
          break;
        case 'Album Modal':
          viewportContext.openAlbumModal(newModalId);
          break;
        case 'QuickActions':
          // QuickActions doesn't have a specific open function, just select it
          break;
      }

      // Select the new modal node
      actions.selectNode(newModalId);
    }, 100);

    return newModalId;
  } catch (error) {
    console.error('Error duplicating modal component:', error);
    throw error;
  }
};

/**
 * Hook to provide duplication utilities
 * This can be used in any component that needs duplication functionality
 */
export const useDuplication = () => {
  const { query, actions } = useEditor();

  const duplicateNode = (
    nodeId: string,
    positionOffset?: { top?: string; left?: string }
  ) => {
    const targetParent = getTargetSection(query, nodeId);
    const parentData = query.node(targetParent).get();
    const currentIndex = parentData.data.nodes.indexOf(nodeId);

    // Use the proper Craft.js approach with node trees
    return duplicateNodeWithChildren(
      nodeId,
      targetParent,
      currentIndex + 1,
      query,
      actions,
      positionOffset
    );
  };

  const duplicateSection = (sectionId: string) => {
    const rootData = query.node('ROOT').get();
    const currentIndex = rootData.data.nodes.indexOf(sectionId);

    // Use the proper Craft.js approach for sections too
    return duplicateNodeWithChildren(
      sectionId,
      'ROOT',
      currentIndex + 1,
      query,
      actions,
      undefined // No position offset for sections
    );
  };

  return {
    duplicateNode,
    duplicateSection,
    duplicateNodeWithChildren,
    duplicateModalComponent,
    isModalComponent,
    getCloneTree,
    getTargetSection,
    removeIdFields,
    validateNestedElements
  };
};
