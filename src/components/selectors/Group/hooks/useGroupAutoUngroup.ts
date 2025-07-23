import { useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';

interface UseGroupAutoUngroupProps {
  id: string;
  enabled: boolean;
}

export const useGroupAutoUngroup = ({
  id,
  enabled,
}: UseGroupAutoUngroupProps) => {
  const { query, actions } = useEditor();
  const initialChildrenState = useRef<string>('');
  const hasInitialized = useRef(false);

  // Listen for changes in child element positions/sizes
  const { childrenChanged } = useEditor((state) => {
    const currentNode = state.nodes[id];
    if (!currentNode) return { childrenChanged: '' };

    const childNodeIds = currentNode?.data?.nodes || [];
    const childrenData = childNodeIds.map((childId: string) => {
      const childNode = state.nodes[childId];
      if (childNode) {
        const props = childNode.data.props;
        return {
          id: childId,
          left: props.left || '0px',
          top: props.top || '0px',
          width: props.width || '100px',
          height: props.height || '50px'
        };
      }
      return null;
    }).filter(Boolean);

    return { childrenChanged: JSON.stringify(childrenData) };
  });

  // Initialize the baseline state
  useEffect(() => {
    if (!enabled || hasInitialized.current) return;

    // Set initial state after a delay to ensure group is fully created
    const timeoutId = setTimeout(() => {
      initialChildrenState.current = childrenChanged;
      hasInitialized.current = true;
    }, 500); // Longer delay to ensure group creation is complete

    return () => clearTimeout(timeoutId);
  }, [childrenChanged, enabled, id]);

  // Monitor for changes and auto-ungroup
  useEffect(() => {
    if (!enabled || !hasInitialized.current) return;
    if (initialChildrenState.current === '') return;
    if (initialChildrenState.current === childrenChanged) return;

    // Ungroup immediately when child movement is detected
    const timeoutId = setTimeout(() => {
      try {
        const currentNode = query.node(id).get();
        const childNodeIds = currentNode?.data?.nodes || [];

        if (childNodeIds.length > 0) {
          // Get the parent node of the group
          const parentId = currentNode.data.parent;
          
          if (parentId) {
            // Move all children to the group's parent
            childNodeIds.forEach((childId: string) => {
              actions.move(childId, parentId, 0);
            });

            // Delete the group container safely
            try {
              const nodeExists = query.node(id).get();
              if (nodeExists) {
                actions.delete(id);
              }
            } catch (deleteError) {
              console.warn('Error deleting auto-ungrouped container, hiding instead:', id, deleteError);
              // Fallback: hide the group
              try {
                actions.setProp(id, (props: any) => {
                  props.opacity = 0;
                  props.pointerEvents = 'none';
                });
              } catch (hideError) {
                console.error('Fallback hide also failed:', hideError);
              }
            }
            
          }
        }
      } catch (error) {
        console.error('Error during auto-ungroup:', error);
      }
    }, 50); // Small delay to ensure state changes are complete

    return () => clearTimeout(timeoutId);
  }, [childrenChanged, enabled, id, query, actions]);

  return {
    isMonitoring: hasInitialized.current,
  };
};
