/**
 * Cross-Platform Synchronization Utilities
 *
 * This module provides utilities for synchronizing content between desktop and mobile platforms
 * with different sync behaviors for new vs existing elements:
 *
 * - NEW ELEMENTS: Sync ALL properties but reset left/top to 0
 * - EXISTING ELEMENTS: Only sync content properties, preserve platform-specific size/positioning
 */

// Properties that should be excluded from cross-platform sync (platform-specific)
const PLATFORM_SPECIFIC_PROPERTIES = new Set([
  // Size and positioning properties
  'width',
  'height',
  'top',
  'left',
  'minHeight',
  'maxHeight',
  'minWidth',
  'maxWidth',
  
  // Typography sizing
  'fontSize',
  'lineHeight',
  
  // Spacing properties
  'padding',
  'margin',
  
  // Border sizing
  'borderWidth',
  'borderRadius',
  
  // Shadow sizing
  'shadowBlur',
  'shadowSpread',
  'shadowX',
  'shadowY',
  
  // Transform properties that affect size/position
  'scale',
  'perspective',
  
  // Crop dimensions for images
  'cropWidth',
  'cropHeight',
  'cropX',
  'cropY',
  
  // Grid and layout sizing
  'gridColumns',
  'gridRows',
  'gridGap',
  'columnGap',
  'rowGap',
  
  // Flex sizing
  'flexBasis',
  'flexGrow',
  'flexShrink',

  // Quick Actions position-specific properties (should not sync)
  'buttonSize',
  'spacing',

  // Pinning position-specific properties (should not sync)
  'topDistance',
  'bottomDistance',
  'leftDistance',
  'rightDistance',

  // Album image crop position/size properties (should not sync)
  'cropX',
  'cropY',
  'cropWidth',
  'cropHeight',
  'cropZoom',
  'cropRotation',

  // Position-related properties for modal components (should not sync)
  'modalWidth',
  'modalHeight',
  'modalTop',
  'modalLeft',
  'modalPosition',
]);

// Properties that should always be synced (content and styling)
const SYNC_PROPERTIES = new Set([
  // Content properties
  'text',
  'url',
  'src',
  'alt',
  'title',
  'placeholder',
  'value',
  'content',
  
  // Color and visual styling
  'color',
  'backgroundColor',
  'backgroundType',
  'backgroundImage',
  'backgroundVideo',
  'gradientType',
  'gradientAngle',
  'gradientColor1',
  'gradientColor2',
  'backgroundSize',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundAttachment',
  
  // Typography (excluding size)
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textAlign',
  'textTransform',
  'textDecoration',
  'letterSpacing',
  'direction',
  
  // Border styling (excluding size)
  'borderStyle',
  'borderColor',
  
  // Shadow styling (excluding size)
  'shadow',
  'shadowType',
  'shadowColor',
  
  // Visual effects
  'opacity',
  'brightness',
  'contrast',
  'saturate',
  'grayscale',
  'invert',
  'sepia',
  'hueRotate',
  'blur',
  'blendMode',
  
  // Transform properties (excluding size-related)
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skewX',
  'skewY',
  'transformOrigin',
  
  // Layout properties (non-size related)
  'flexDirection',
  'alignItems',
  'justifyContent',
  'alignContent',
  'alignSelf',
  'justifySelf',
  'order',
  'position',
  'zIndex',
  'overflow',
  'overflowX',
  'overflowY',
  'display',
  'visibility',
  'float',
  'clear',
  
  // Component-specific properties
  'enabled',
  'disabled',
  'checked',
  'selected',
  'required',
  'readonly',
  'multiple',
  'autoplay',
  'loop',
  'muted',
  'controls',
  
  // Overlay properties
  'overlayType',
  'overlayBlendMode',
  'overlayOpacity',
  'overlayColor',
  'overlayGradientType',
  'overlayGradientAngle',
  'overlayGradientColor1',
  'overlayGradientColor2',
  'overlayImage',
  'overlayImageSize',
  'overlayImagePosition',
  'overlayImageRepeat',
  'overlayImageAttachment',
  
  // Animation and interaction properties
  'events',
  'displayAnimation',
  'hoverAnimation',
  
  // Component state
  'hidden',
  'locked',
  'isEditing',
  'isCropMode',
  
  // Form properties
  'formType',
  'questions',
  'extraInfo',
  'submitUrl',
  'method',
  
  // Button properties
  'buttonStyle',
  'textComponent',
  
  // Image properties
  'objectFit',
  'lockAspectRatio',
  
  // Text properties
  'textShadow',
  'textStroke',
  
  // Container properties
  'fillSpace',

  // Popup component properties
  'autoOpen',
  'autoOpenDelay',

  // Dropbox component properties
  'dropboxPosition',
  'dropboxDistance',
  'dropboxTriggerElementId',

  // Album Modal properties
  'albumImages',

  // Album Image properties (for individual images within albumImages)
  'cropArea',
  'croppedImageUrl',

  // Quick Actions properties
  'triggerIcon',
  'triggerIconColor',
  'triggerBackground',
  'triggerBackgroundType',
  'triggerGradientType',
  'triggerGradientAngle',
  'triggerGradientColor1',
  'triggerGradientColor2',
  'triggerBorderColor',
  'triggerBorderStyle',
  'triggerBorderRadius',
  'triggerBorderWidth',
  'actionButtons',
  'expandDirection',
  'animationDuration',

  // Action Button properties (for individual buttons within actionButtons)
  'svgCode',
  'iconColor',
  'background',
  'backgroundType',
  'gradientType',
  'gradientAngle',
  'gradientColor1',
  'gradientColor2',
  'borderColor',
  'borderStyle',
  'borderRadius',
  'borderWidth',

  // Event Manager properties (for child components)
  'eventType',
  'actionType',
  'sectionId',
  'dropboxId',
  'dropboxPosition',
  'dropboxDistance',
  'lightboxMediaType',
  'lightboxImageUrl',
  'lightboxVideoUrl',
  'lightboxVideoType',
  'albumModalId',
  'phoneNumber',
  'email',
  'url',
  'openInNewTab',
  'hideElementIds',
  'showElementIds',
  'copyElementId',
  'defaultValue',
  'popupId',

  // Pinning properties (for components with positioning)
  'pinning',

  // Advanced animation properties
  'animationRepeat',
  'animationDelay',
  'animationDirection',
  'animationFillMode',
  'animationPlayState',
  'animationTimingFunction',
]);

/**
 * Determines if a property should be synced across platforms
 */
export const shouldSyncProperty = (propertyName: string): boolean => {
  // Explicitly exclude platform-specific properties
  if (PLATFORM_SPECIFIC_PROPERTIES.has(propertyName)) {
    return false;
  }
  
  // Include explicitly defined sync properties
  if (SYNC_PROPERTIES.has(propertyName)) {
    return true;
  }
  
  // For properties not explicitly defined, use heuristics
  // Exclude properties that contain size/position keywords
  const sizeKeywords = ['width', 'height', 'size', 'top', 'left', 'right', 'bottom', 'margin', 'padding'];
  const lowerProp = propertyName.toLowerCase();
  
  if (sizeKeywords.some(keyword => lowerProp.includes(keyword))) {
    return false;
  }
  
  // Default to syncing for other properties
  return true;
};

/**
 * Filters node properties to include only those that should be synced
 */
export const filterSyncableProperties = (props: Record<string, any>): Record<string, any> => {
  const syncableProps: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (shouldSyncProperty(key)) {
      syncableProps[key] = value;
    }
  }
  
  return syncableProps;
};

/**
 * Merges syncable properties from source into target while preserving platform-specific properties
 */
export const mergeSyncableProperties = (
  targetProps: Record<string, any>,
  sourceProps: Record<string, any>
): Record<string, any> => {
  const mergedProps = { ...targetProps };

  // Only update properties that should be synced
  for (const [key, value] of Object.entries(sourceProps)) {
    if (shouldSyncProperty(key)) {
      mergedProps[key] = value;
    }
  }

  return mergedProps;
};

/**
 * Synchronizes content between two platforms with different behaviors for new vs existing elements
 * @param sourceContent - The content from the source platform (JSON string)
 * @param targetContent - The content from the target platform (JSON string)
 * @returns The synchronized target content with:
 *   - NEW ELEMENTS: All properties synced but left/top reset to 0
 *   - EXISTING ELEMENTS: Only content properties synced, size/position preserved
 */
export const synchronizeContent = (
  sourceContent: string,
  targetContent: string | null
): string => {
  try {
    // Parse source content
    const sourceNodes = JSON.parse(sourceContent) as { [nodeId: string]: any };

    // If no target content exists, return source content as-is
    if (!targetContent) {
      return sourceContent;
    }

    // Parse target content
    const targetNodes = JSON.parse(targetContent) as { [nodeId: string]: any };
    const synchronizedNodes = { ...targetNodes };

    // Track nodes for creation/deletion sync
    const sourceNodeIds = new Set(Object.keys(sourceNodes));
    const targetNodeIds = new Set(Object.keys(targetNodes));

    console.log(`🔄 Sync Analysis:`, {
      sourceNodes: sourceNodeIds.size,
      targetNodes: targetNodeIds.size,
      sourceIds: Array.from(sourceNodeIds),
      targetIds: Array.from(targetNodeIds)
    });

    // Sync existing nodes and add new nodes from source
    for (const [nodeId, sourceNode] of Object.entries(sourceNodes)) {
      if (!sourceNode || !sourceNode.type) continue;

      // Check if this node should participate in cross-platform sync
      const shouldSync = sourceNode.props?.syncCrossPlatform !== false;

      if (!shouldSync) {
        console.log(`⏭️ Skipping node ${nodeId} - cross-platform sync disabled`);
        continue;
      }

      if (targetNodeIds.has(nodeId)) {
        // Node exists in both platforms - merge ONLY content properties, preserve size/position
        const targetNode = targetNodes[nodeId];
        if (targetNode && targetNode.props && sourceNode.props) {
          // Also check target node's sync setting
          const targetShouldSync = targetNode.props?.syncCrossPlatform !== false;
          if (!targetShouldSync) {
            console.log(`⏭️ Skipping node ${nodeId} - target has cross-platform sync disabled, preserving target version`);
            // Preserve the target node as-is (it's already in synchronizedNodes from the spread)
            continue;
          }

          const mergedProps = mergeSyncableProperties(targetNode.props, sourceNode.props);
          synchronizedNodes[nodeId] = {
            ...targetNode,
            props: mergedProps,
            // Sync non-props properties that should be shared
            type: sourceNode.type,
            isCanvas: sourceNode.isCanvas,
            displayName: sourceNode.displayName,
            custom: sourceNode.custom,
            hidden: sourceNode.hidden,
            nodes: sourceNode.nodes, // Sync child relationships
            linkedNodes: sourceNode.linkedNodes, // Sync linked nodes
            parent: sourceNode.parent, // Sync parent relationships
          };

        }
      } else {
        // Node exists only in source - add to target with ALL properties but reset position
        const newNode = { ...sourceNode };

        // For new elements, sync ALL properties but reset left and top to 0
        if (newNode.props) {
          const originalProps = { ...newNode.props };

          // Keep all properties from source but reset positioning
          newNode.props = {
            ...originalProps,
            left: 0
          };


        }

        synchronizedNodes[nodeId] = newNode;
      }
    }

    // Remove nodes that exist only in target (deleted from source)
    // BUT preserve nodes that have syncCrossPlatform: false
    for (const nodeId of targetNodeIds) {
      if (!sourceNodeIds.has(nodeId)) {
        // Check if this target node has sync disabled - if so, preserve it
        const targetNode = targetNodes[nodeId];
        const targetShouldSync = targetNode?.props?.syncCrossPlatform !== false;

        if (targetShouldSync) {
          // Node should sync but doesn't exist in source - it was deleted, so remove it
          console.log(`🗑️ Removing deleted node ${nodeId} from target platform`);
          delete synchronizedNodes[nodeId];
        } else {
          // Node has sync disabled - preserve it on target platform
          console.log(`🔒 Preserving non-sync node ${nodeId} on target platform`);
          // Keep the node as-is in synchronizedNodes (it's already there from the spread)
        }
      }
    }

    // Update parent-child relationships to ensure new nodes are properly connected
    for (const [nodeId, node] of Object.entries(synchronizedNodes)) {
      if (node.parent && synchronizedNodes[node.parent]) {
        const parentNode = synchronizedNodes[node.parent];
        if (parentNode.nodes && !parentNode.nodes.includes(nodeId)) {
          // Add this node to its parent's children list if not already there
          parentNode.nodes = [...(parentNode.nodes || []), nodeId];
        }
      }
    }

    // Clean up parent nodes to remove references to deleted children
    for (const [nodeId, node] of Object.entries(synchronizedNodes)) {
      if (node.nodes && Array.isArray(node.nodes)) {
        const validChildren = node.nodes.filter((childId: string) => synchronizedNodes[childId]);
        if (validChildren.length !== node.nodes.length) {
          synchronizedNodes[nodeId] = {
            ...node,
            nodes: validChildren
          };
        }
      }
    }

    const finalNodeIds = Object.keys(synchronizedNodes);
    console.log(`✅ Sync Complete:`, {
      finalNodes: finalNodeIds.length,
      finalIds: finalNodeIds
    });

    return JSON.stringify(synchronizedNodes);

  } catch (error) {
    console.error('❌ Error synchronizing content:', error);
    // Return target content unchanged if sync fails
    return targetContent || sourceContent;
  }
};

/**
 * Performs bidirectional synchronization between desktop and mobile content
 * @param desktopContent - Desktop platform content
 * @param mobileContent - Mobile platform content
 * @param sourcePlatform - Which platform initiated the sync ('desktop' | 'mobile')
 * @returns Object with synchronized desktop and mobile content
 */
export const bidirectionalSync = (
  desktopContent: string | null,
  mobileContent: string | null,
  sourcePlatform: 'desktop' | 'mobile'
): { desktopContent: string | null; mobileContent: string | null } => {
  // If no content exists on either platform, return as-is
  if (!desktopContent && !mobileContent) {
    return { desktopContent, mobileContent };
  }

  // If only one platform has content, sync to the other
  if (!desktopContent && mobileContent) {
    return {
      desktopContent: mobileContent,
      mobileContent: mobileContent
    };
  }

  if (desktopContent && !mobileContent) {
    return {
      desktopContent: desktopContent,
      mobileContent: desktopContent
    };
  }

  // Both platforms have content - perform bidirectional sync
  if (sourcePlatform === 'desktop') {
    const desktopNodes = JSON.parse(desktopContent!);
    const mobileNodes = JSON.parse(mobileContent!);

    const syncedMobileContent = synchronizeContent(desktopContent!, mobileContent!);
    const syncedMobileNodes = JSON.parse(syncedMobileContent);

    return {
      desktopContent: desktopContent,
      mobileContent: syncedMobileContent
    };
  } else {
    const desktopNodes = JSON.parse(desktopContent!);
    const mobileNodes = JSON.parse(mobileContent!);

    const syncedDesktopContent = synchronizeContent(mobileContent!, desktopContent!);
    const syncedDesktopNodes = JSON.parse(syncedDesktopContent);

    return {
      desktopContent: syncedDesktopContent,
      mobileContent: mobileContent
    };
  }
};

/**
 * Checks if content has structural changes that require sync
 * @param content1 - First content to compare
 * @param content2 - Second content to compare
 * @returns True if structural changes detected
 */
export const hasStructuralChanges = (content1: string | null, content2: string | null): boolean => {
  if (!content1 || !content2) return true;

  try {
    const nodes1 = JSON.parse(content1);
    const nodes2 = JSON.parse(content2);

    const nodeIds1 = Object.keys(nodes1).sort();
    const nodeIds2 = Object.keys(nodes2).sort();

    // Check if node structure is different
    if (nodeIds1.length !== nodeIds2.length) return true;

    for (let i = 0; i < nodeIds1.length; i++) {
      if (nodeIds1[i] !== nodeIds2[i]) return true;
    }

    // Check for changes in syncable properties
    for (const nodeId of nodeIds1) {
      const node1 = nodes1[nodeId];
      const node2 = nodes2[nodeId];

      if (!node1 || !node2) continue;

      const syncableProps1 = filterSyncableProperties(node1.props || {});
      const syncableProps2 = filterSyncableProperties(node2.props || {});

      if (JSON.stringify(syncableProps1) !== JSON.stringify(syncableProps2)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking structural changes:', error);
    return true; // Assume changes if we can't parse
  }
};
