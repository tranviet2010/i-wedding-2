import { NodeId } from '@craftjs/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NodeState } from '../types/RenderNodeTypes';

interface UseNodeStateProps {
  id: NodeId;
  dom: HTMLElement | null;
  locked: boolean | undefined;
  parentNode: any;
  actions: any;
  props: any;
}

export const useNodeState = ({
  id,
  dom,
  locked,
  parentNode,
  actions,
  props
}: UseNodeStateProps): NodeState & {
  toggleLock: () => void;
  setShowLayerControls: (value: boolean) => void;
  setIsNearVerticalCenter: (value: boolean) => void;
  setIsNearHorizontalCenter: (value: boolean) => void;
  setParentRect: (value: DOMRect | null) => void;
  setIsDragging: (value: boolean) => void;
} => {
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showLayerControls, setShowLayerControls] = useState(false);
  const [isNearVerticalCenter, setIsNearVerticalCenter] = useState(false);
  const [isNearHorizontalCenter, setIsNearHorizontalCenter] = useState(false);
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (parentNode?.dom) {
      setParentRect(parentNode.dom.getBoundingClientRect());
    }
  }, [parentNode]);

  const toggleLock = useCallback(() => {
    setIsLocked(prev => {
      const newValue = !prev;
      
      if (dom) {
        actions.setProp(id, (props: any) => {
          props._locked = newValue;
        });
        dom.style.cursor = newValue ? '' : 'move';
      }
      
      return newValue;
    });
  }, [dom, actions, id]);

  return {
    isLocked: typeof locked === 'boolean' ? locked : isLocked,
    isDragging,
    showLayerControls,
    isNearVerticalCenter,
    isNearHorizontalCenter,
    parentRect,
    toggleLock,
    setShowLayerControls,
    setIsNearVerticalCenter,
    setIsNearHorizontalCenter,
    setParentRect,
    setIsDragging
  };
}; 