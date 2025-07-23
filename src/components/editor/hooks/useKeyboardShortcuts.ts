import { useEditor } from '@craftjs/core';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useViewport } from '../Viewport/ViewportContext';

export const useKeyboardShortcuts = () => {
  const { actions, query, editorState } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
    editorState: state, // Include editor state to make isAtInitialState reactive
  }));

  const { currentEditingPlatform, desktopContent, mobileContent } = useViewport();

  // Track the initial loaded state for each platform
  const [initialDesktopState, setInitialDesktopState] = useState<string | null>(null);
  const [initialMobileState, setInitialMobileState] = useState<string | null>(null);

  // Track when content is being loaded to capture initial state
  const isCapturingInitialState = useRef(false);
  const lastCapturedContent = useRef<{desktop?: string, mobile?: string}>({});

  // Track if we've already captured initial state to prevent multiple captures
  const hasInitialStateCaptured = useRef<{desktop: boolean, mobile: boolean}>({desktop: false, mobile: false});

  // Capture initial state when content is loaded from backend
  useEffect(() => {
    if (currentEditingPlatform === 'desktop' && desktopContent && !hasInitialStateCaptured.current.desktop) {
      // Only capture if we haven't captured this content before
      if (lastCapturedContent.current.desktop !== desktopContent && !initialDesktopState) {
        lastCapturedContent.current.desktop = desktopContent;
        hasInitialStateCaptured.current.desktop = true;

        // Set a flag to capture state after next render
        isCapturingInitialState.current = true;

        // Use a short delay to ensure editor has processed the content
        setTimeout(() => {
          try {
            const currentState = query.serialize();
            if (currentState && currentState !== '{}') {
              setInitialDesktopState(currentState);
              console.log('📍 Captured initial desktop state for undo baseline');
            }
          } catch (error) {
            console.warn('Failed to capture initial desktop state:', error);
          } finally {
            isCapturingInitialState.current = false;
          }
        }, 200);
      }
    }
  }, [currentEditingPlatform, desktopContent, initialDesktopState, query]);

  useEffect(() => {
    if (currentEditingPlatform === 'mobile' && mobileContent && !hasInitialStateCaptured.current.mobile) {
      // Only capture if we haven't captured this content before
      if (lastCapturedContent.current.mobile !== mobileContent && !initialMobileState) {
        lastCapturedContent.current.mobile = mobileContent;
        hasInitialStateCaptured.current.mobile = true;

        // Set a flag to capture state after next render
        isCapturingInitialState.current = true;

        // Use a short delay to ensure editor has processed the content
        setTimeout(() => {
          try {
            const currentState = query.serialize();
            if (currentState && currentState !== '{}') {
              setInitialMobileState(currentState);
              console.log('📍 Captured initial mobile state for undo baseline');
            }
          } catch (error) {
            console.warn('Failed to capture initial mobile state:', error);
          } finally {
            isCapturingInitialState.current = false;
          }
        }, 200);
      }
    }
  }, [currentEditingPlatform, mobileContent, initialMobileState, query]);

  // Override deserialize to capture initial state immediately after content is loaded
  useEffect(() => {
    const originalDeserialize = actions.deserialize;

    // Create a wrapper function that captures state after deserialize
    const wrappedDeserialize = (data: string) => {
      // Call the original deserialize
      originalDeserialize(data);

      // Capture initial state if we don't have it yet and this is a backend content load
      setTimeout(() => {
        try {
          const currentState = query.serialize();
          const currentInitialState = currentEditingPlatform === 'desktop' ? initialDesktopState : initialMobileState;
          const hasAlreadyCaptured = currentEditingPlatform === 'desktop' ?
            hasInitialStateCaptured.current.desktop :
            hasInitialStateCaptured.current.mobile;

          if (!currentInitialState && !hasAlreadyCaptured && currentState && currentState !== '{}') {
            if (currentEditingPlatform === 'desktop') {
              setInitialDesktopState(currentState);
              hasInitialStateCaptured.current.desktop = true;
              console.log('📍 Captured initial desktop state via deserialize wrapper');
            } else {
              setInitialMobileState(currentState);
              hasInitialStateCaptured.current.mobile = true;
              console.log('📍 Captured initial mobile state via deserialize wrapper');
            }
          }
        } catch (error) {
          console.warn('Failed to capture state after deserialize:', error);
        }
      }, 100);
    };

    // Replace the deserialize function
    actions.deserialize = wrappedDeserialize as any;

    // Cleanup: restore original function
    return () => {
      actions.deserialize = originalDeserialize;
    };
  }, [actions, query, currentEditingPlatform, initialDesktopState, initialMobileState]);

  // Check if current state matches the initial loaded state
  const isAtInitialState = useCallback(() => {
    try {
      const currentState = query.serialize();
      const initialState = currentEditingPlatform === 'desktop' ? initialDesktopState : initialMobileState;

      // If no initial state is captured yet, don't block undo unless we're in the process of capturing
      if (!initialState) {
        // If we're currently capturing initial state, block undo
        if (isCapturingInitialState.current) {
          return true;
        }

        // If we have content but haven't captured yet, allow undo (this handles edge cases)
        return false;
      }

      // Compare current state with initial state
      const isAtInitial = currentState === initialState;

      // Additional safety check: if we're very close to initial state (minor differences), consider it initial
      if (!isAtInitial && initialState && currentState) {
        try {
          const initialObj = JSON.parse(initialState);
          const currentObj = JSON.parse(currentState);

          // If the structure is essentially the same (same keys), consider it initial
          const initialKeys = Object.keys(initialObj);
          const currentKeys = Object.keys(currentObj);

          if (initialKeys.length === currentKeys.length &&
              initialKeys.every(key => currentKeys.includes(key))) {
            return true;
          }
        } catch (parseError) {
          // If parsing fails, fall back to string comparison
        }
      }

      return isAtInitial;
    } catch (error) {
      console.warn('Error checking initial state:', error);
      return false;
    }
  }, [query, currentEditingPlatform, initialDesktopState, initialMobileState]);

  const handleUndo = useCallback((e: KeyboardEvent) => {
    // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();

      const canUndo = query.history.canUndo();
      const atInitialState = isAtInitialState();
      console.log('🔍 Keyboard Undo triggered - canUndo:', canUndo, 'isAtInitialState:', atInitialState);

      // Check if we're at the initial state first - if so, prevent undo
      if (atInitialState) {
        console.log('🚫 Keyboard Undo blocked: Cannot undo past initial loaded state from backend');
        return;
      }

      if (canUndo) {
        actions.history.undo();
      }
    }
  }, [actions, query, isAtInitialState]);

  const handleRedo = useCallback((e: KeyboardEvent) => {
    // Check for Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();

      if (query.history.canRedo()) {
        actions.history.redo();
      }
    }
    // Also support Ctrl+Y (Windows alternative for redo)
    else if (e.ctrlKey && e.key === 'y' && !e.shiftKey) {
      e.preventDefault();

      if (query.history.canRedo()) {
        actions.history.redo();
      }
    }
  }, [actions, query]);

  useEffect(() => {
    // Add event listeners for keyboard shortcuts
    document.addEventListener('keydown', handleUndo);
    document.addEventListener('keydown', handleRedo);

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('keydown', handleUndo);
      document.removeEventListener('keydown', handleRedo);
    };
  }, [handleUndo, handleRedo]);



  // Function to reset initial state (useful when loading new content)
  const resetInitialState = useCallback((platform?: 'desktop' | 'mobile') => {
    if (platform === 'desktop' || (!platform && currentEditingPlatform === 'desktop')) {
      setInitialDesktopState(null);
      hasInitialStateCaptured.current.desktop = false;
      lastCapturedContent.current.desktop = undefined;
      console.log('🔄 Reset desktop initial state');
    }
    if (platform === 'mobile' || (!platform && currentEditingPlatform === 'mobile')) {
      setInitialMobileState(null);
      hasInitialStateCaptured.current.mobile = false;
      lastCapturedContent.current.mobile = undefined;
      console.log('🔄 Reset mobile initial state');
    }
  }, [currentEditingPlatform]);

  // Make isAtInitialState reactive to editor state changes
  const reactiveIsAtInitialState = useMemo(() => {
    return isAtInitialState();
  }, [isAtInitialState, editorState, initialDesktopState, initialMobileState, currentEditingPlatform]);

  // Return the handlers and state info in case they need to be used elsewhere
  return {
    handleUndo,
    handleRedo,
    isAtInitialState: reactiveIsAtInitialState,
    initialDesktopState,
    initialMobileState,
    resetInitialState,
  };
};
