import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Element, useEditor, useNode, UserComponent } from '@craftjs/core';

import { FormSettings } from './FormSettings';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '../../../components/editor/components/AnimationManager';
import { PinningSettings } from '../../../components/editor/components/PinningManager';

import { minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';
import { isPercentage } from '@/utils/numToMeasurement';
import { Input } from '../Input';
import { Button } from '../Button';
import { useViewport } from '../../../components/editor/Viewport/ViewportContext';
import { domain } from '../../../api/apiClient';
import { useQueryClient } from '@tanstack/react-query';

export interface FormProps {
  children: React.ReactNode;
  width: string;
  height: string;
  left: string;
  top: string;
  lockAspectRatio?: boolean;
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  formGap: number;
  submissionType: 'api' | 'google-form' | 'google-sheet';
  apiUrl: string;
  isWeddingWishForm: boolean;
  isGuestForm: boolean;
  formType: 'wedding-wish' | 'guest';
  isBeingManaged?: boolean;
  customQuestions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
    options?: string;
    required?: boolean;
  }>;
  syncCrossPlatform?: boolean; // Cross-platform sync control
  hidden?: boolean;
  opacity?: number;
  pointerEvents?: string;
}

const defaultProps: FormProps = {
  children: null,
  width: '400px',
  height: 'auto',
  left: '0px',
  top: '0px',
  lockAspectRatio: true,
  events: [],
  displayAnimation: null,
  hoverAnimation: { enabled: false },
  opacity: 0,
  pointerEvents: 'none',

  pinning: {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  },
  formGap: 20,
  submissionType: 'api',
  apiUrl: '',
  isWeddingWishForm: true,
  isGuestForm: false,
  formType: 'wedding-wish',
  isBeingManaged: false,
  customQuestions: [],
  syncCrossPlatform: true, // Default to enabled
};

export const Form: UserComponent<Partial<FormProps>> = (props) => {
  const {
    actions: { setProp },
    id,
  } = useNode((node) => ({
    childNodes: node.data.nodes || [],
  }));

  const { enabled, actions: editorActions, query } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Get wedding page ID from ViewportContext
  const { weddingPageId } = useViewport();
  const queryClient = useQueryClient();

  const mergedProps = { ...defaultProps, ...props };
  const {
    children,
    width,
    height,
    left,
    top,
    events,
    displayAnimation,
    hoverAnimation,
    lockAspectRatio,
    formGap,
    submissionType,
    apiUrl,
    isWeddingWishForm,
    isGuestForm,
    formType,
    customQuestions,
  } = mergedProps;

  // Set initial API URL if not provided
  useEffect(() => {
    if (!apiUrl && submissionType === 'api') {
      let initialApiUrl = '';
      if (formType === 'wedding-wish') {
        initialApiUrl = `${domain}/guests/wishes`;
      } else if (formType === 'guest') {
        initialApiUrl = `${domain}/guests`;
      }

      if (initialApiUrl) {
        console.log('🔧 Setting initial API URL for form:', initialApiUrl);
        setProp((props: any) => {
          props.apiUrl = initialApiUrl;
        });
      }
    }
  }, [apiUrl, submissionType, formType, setProp]);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Track previous dimensions for scaling calculations
  const [previousDimensions, setPreviousDimensions] = useState({
    width: width,
    height: height,
  });

  // Track if we're in auto-resize mode to prevent scaling during auto-resize
  const isAutoResizing = useRef(false);

  // Use event handling hook
  const { handleContainerClick, handleHover, handleSubmit } = useEventHandling(events, id);

  // Use animation hooks
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // Helper function to parse numeric value from dimension string
  const parseNumericValue = useCallback((value: string): number => {
    if (typeof value === 'string') {
      // Handle percentage values by converting to pixels based on form width
      if (value.includes('%')) {
        const percentage = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        const formWidth = parseFloat(width.replace(/[^\d.-]/g, '')) || 400;
        return (percentage / 100) * formWidth;
      }
      return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    }
    return typeof value === 'number' ? value : 0;
  }, [width]);

  // Helper function to scale child dimensions proportionally
  const scaleChildDimensions = useCallback((childId: string, widthRatio: number, heightRatio: number) => {
    editorActions.setProp(childId, (props: any) => {
      // Determine if width or height changed
      const widthChanged = Math.abs(widthRatio - 1) > 0.001;
      const heightChanged = Math.abs(heightRatio - 1) > 0.001;

      // If both dimensions changed, use locked aspect ratio (same ratio for both)
      if (widthChanged && heightChanged) {
        // Use the smaller ratio to maintain proportions and prevent distortion
        const effectiveRatio = Math.min(widthRatio, heightRatio);

        // Scale width if it exists
        if (props.width) {
          const currentWidth = parseNumericValue(props.width);
          const newWidth = Math.round(currentWidth * effectiveRatio);
          props.width = isPercentage(props.width) ? `${newWidth}%` : `${newWidth}px`;
        }

        // Scale height if it exists
        if (props.height) {
          const currentHeight = parseNumericValue(props.height);
          const newHeight = Math.round(currentHeight * effectiveRatio);
          props.height = isPercentage(props.height) ? `${newHeight}%` : `${newHeight}px`;
        }

        // Scale positions using the effective ratio
        if (props.left) {
          const currentLeft = parseNumericValue(props.left);
          const newLeft = Math.round(currentLeft * effectiveRatio);
          props.left = isPercentage(props.left) ? `${newLeft}%` : `${newLeft}px`;
        }

        if (props.top) {
          const currentTop = parseNumericValue(props.top);
          const newTop = Math.round(currentTop * effectiveRatio);
          props.top = isPercentage(props.top) ? `${newTop}%` : `${newTop}px`;
        }
      } else {
        // Only one dimension changed - scale independently

        // Scale width if it exists and width changed
        if (props.width && widthChanged) {
          const currentWidth = parseNumericValue(props.width);
          const newWidth = Math.round(currentWidth * widthRatio);
          props.width = isPercentage(props.width) ? `${newWidth}%` : `${newWidth}px`;
        }

        // Scale height if it exists and height changed
        if (props.height && heightChanged) {
          const currentHeight = parseNumericValue(props.height);
          const newHeight = Math.round(currentHeight * heightRatio);
          props.height = isPercentage(props.height) ? `${newHeight}%` : `${newHeight}px`;
        }

        // Scale position (left) if it exists and width changed
        if (props.left && widthChanged) {
          const currentLeft = parseNumericValue(props.left);
          const newLeft = Math.round(currentLeft * widthRatio);
          props.left = isPercentage(props.left) ? `${newLeft}%` : `${newLeft}px`;
        }

        // Scale position (top) if it exists and height changed
        if (props.top && heightChanged) {
          const currentTop = parseNumericValue(props.top);
          const newTop = Math.round(currentTop * heightRatio);
          props.top = isPercentage(props.top) ? `${newTop}%` : `${newTop}px`;
        }
      }
    });
  }, [editorActions, parseNumericValue]);



  // Listen for width and height changes and scale children proportionally
  useEffect(() => {
    // Skip scaling if we're in auto-resize mode
    if (isAutoResizing.current) {
      return;
    }

    const currentWidth = parseNumericValue(width);
    const currentHeight = parseNumericValue(height);
    const prevWidth = parseNumericValue(previousDimensions.width);
    const prevHeight = parseNumericValue(previousDimensions.height);

    // Only scale if dimensions actually changed and we have valid previous dimensions
    if (
      (currentWidth !== prevWidth || currentHeight !== prevHeight) &&
      prevWidth > 0 &&
      prevHeight > 0 &&
      currentWidth > 0 &&
      currentHeight > 0
    ) {
      const widthRatio = currentWidth / prevWidth;
      const heightRatio = currentHeight / prevHeight;

      // Get child nodes from the current node
      const currentNode = query.node(id).get();
      const childNodeIds = currentNode?.data?.nodes || [];

      // Scale all child elements proportionally
      childNodeIds.forEach((childId: string) => {
        scaleChildDimensions(childId, widthRatio, heightRatio);
      });

      // Update previous dimensions
      setPreviousDimensions({
        width: width,
        height: height,
      });
    }
  }, [width, height, previousDimensions, parseNumericValue, scaleChildDimensions, query, id, setPreviousDimensions]);

  // Helper function to calculate the bounding box of all child elements
  const calculateChildrenBounds = useCallback(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    if (childNodeIds.length === 0) {
      return { width: 400, height: 200 }; // Default size when no children
    }

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    childNodeIds.forEach((childId: string) => {
      const childNode = query.node(childId).get();
      const childProps = childNode.data.props;

      const left = parseNumericValue(childProps.left || '0');
      const top = parseNumericValue(childProps.top || '0');
      const width = parseNumericValue(childProps.width || '100');
      const height = parseNumericValue(childProps.height || '50');

      const right = left + width;
      const bottom = top + height;

      minLeft = Math.min(minLeft, left);
      minTop = Math.min(minTop, top);
      maxRight = Math.max(maxRight, right);
      maxBottom = Math.max(maxBottom, bottom);
    });

    // Add small padding around the content for better visual appearance
    const padding = 0; // No padding for tight wrapping

    return {
      width: Math.max(200, maxRight - minLeft + padding * 2), // Minimum 200px width
      height: Math.max(100, maxBottom - minTop + padding * 2), // Minimum 100px height
    };
  }, [query, id, parseNumericValue]);

  // Auto-resize form to fit children when children change
  useEffect(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Only auto-resize if we have children and we're not currently auto-resizing
    if (childNodeIds.length === 0 || isAutoResizing.current) return;

    // Add a small delay to allow for grouping/ungrouping operations to complete
    const timeoutId = setTimeout(() => {
      const bounds = calculateChildrenBounds();
      const currentWidth = parseNumericValue(width);
      const currentHeight = parseNumericValue(height);

      // Only update if the calculated size is significantly different from current size
      if (Math.abs(bounds.width - currentWidth) > 5 || Math.abs(bounds.height - currentHeight) > 5) {
        isAutoResizing.current = true;

        setProp((props: any) => {
          props.width = `${bounds.width}px`;
          props.height = `${bounds.height}px`;
        });

        // Reset the flag and update previous dimensions after a short delay
        setTimeout(() => {
          isAutoResizing.current = false;
          setPreviousDimensions({
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
          });
        }, 100);
      }
    }, 200); // Delay to allow grouping operations to complete

    return () => clearTimeout(timeoutId);
  });

  // Form auto-resize is handled by the basic auto-resize logic above

  // Initialize previous dimensions on mount
  useEffect(() => {
    setPreviousDimensions({
      width: width,
      height: height,
    });
  }, [width, height]); // Initialize with current dimensions

  // Add MutationObserver to watch for DOM changes in child elements
  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const observer = new MutationObserver((mutations) => {
      let shouldResize = false;

      mutations.forEach((mutation) => {
        // Check if any child element's style changed (position, size)
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          // Check if the changed element is a child of this form
          if (target.closest('.form-container') === containerRef.current) {
            shouldResize = true;
          }
        }
      });

      if (shouldResize && !isAutoResizing.current) {
        // Debounce the resize operation
        setTimeout(() => {
          if (isAutoResizing.current) return;

          const bounds = calculateChildrenBounds();
          const currentWidth = parseNumericValue(width);
          const currentHeight = parseNumericValue(height);

          if (Math.abs(bounds.width - currentWidth) > 5 || Math.abs(bounds.height - currentHeight) > 5) {
            isAutoResizing.current = true;

            setProp((props: any) => {
              props.width = `${bounds.width}px`;
              props.height = `${bounds.height}px`;
            });

            setTimeout(() => {
              isAutoResizing.current = false;
              setPreviousDimensions({
                width: `${bounds.width}px`,
                height: `${bounds.height}px`,
              });
            }, 100);
          }
        }, 100);
      }
    });

    // Observe the entire document for style changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: true
    });

    return () => observer.disconnect();
  }, [enabled, calculateChildrenBounds, width, height, parseNumericValue, setProp]);

  // Create default children when Form is first created based on formType
  useEffect(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Only create default children if the form has no children yet AND it's the initial creation
    // Don't auto-create if form is being managed by settings
    if (childNodeIds.length === 0 && !currentNode.data.props.isBeingManaged) {
      if (formType === 'wedding-wish') {
        // Create Wedding Wish Form fields
        const inputHeight = 40;
        const textareaHeight = 80;
        let currentTop = 0;

        // 1. Guest Name input
        const guestNameElement = React.createElement(Element, {
          is: Input,
          canvas: true,
          inputType: 'text',
          placeholder: 'Tên của bạn *',
          dataName: 'guestName',
          required: true,
          width: '400px',
          height: `${inputHeight}px`,
          left: '0px',
          top: `${currentTop}px`,
          backgroundColor: '#ffffff',
          borderRadius: [4, 4, 4, 4],
          borderWidth: [1, 1, 1, 1],
          borderStyle: 'solid',
          borderColor: '#d1d5db',
          isChildOfForm: true,
        });

        const guestNameTree = query.parseReactElement(guestNameElement).toNodeTree();
        const guestNameNodeId = Object.keys(guestNameTree.nodes)[0];
        const guestNameNode = guestNameTree.nodes[guestNameNodeId];
        editorActions.add(guestNameNode, id);

        // 2. Message textarea
        currentTop += inputHeight + formGap;
        const messageElement = React.createElement(Element, {
          is: Input,
          canvas: true,
          inputType: 'textarea',
          placeholder: 'Lời chúc của bạn *',
          dataName: 'message',
          required: true,
          width: '400px',
          height: `${textareaHeight}px`,
          left: '0px',
          top: `${currentTop}px`,
          backgroundColor: '#ffffff',
          borderRadius: [4, 4, 4, 4],
          borderWidth: [1, 1, 1, 1],
          borderStyle: 'solid',
          borderColor: '#d1d5db',
          isChildOfForm: true,
        });

        const messageTree = query.parseReactElement(messageElement).toNodeTree();
        const messageNodeId = Object.keys(messageTree.nodes)[0];
        const messageNode = messageTree.nodes[messageNodeId];
        editorActions.add(messageNode, id);

        // 3. Submit button
        currentTop += textareaHeight + formGap;
        const submitButtonElement = React.createElement(Element, {
          is: Button,
          canvas: true,
          text: 'Gửi lời chúc',
          width: '400px',
          height: '44px',
          left: '0px',
          top: `${currentTop}px`,
          background: '#10b981',
          color: '#ffffff',
          isChildOfForm: true,
        });

        const submitButtonTree = query.parseReactElement(submitButtonElement).toNodeTree();
        const submitButtonNodeId = Object.keys(submitButtonTree.nodes)[0];
        const submitButtonNode = submitButtonTree.nodes[submitButtonNodeId];
        editorActions.add(submitButtonNode, id);

      } else if (formType === 'guest') {
        // Create Guest Form fields
        const inputHeight = 40;
        let currentTop = 0;

        // Basic guest form fields
        const fields = [
          { placeholder: 'Họ và tên *', dataName: 'fullName', type: 'text' },
          { placeholder: 'Số điện thoại *', dataName: 'phone', type: 'tel' },
          { placeholder: 'Email *', dataName: 'email', type: 'email' },
          { placeholder: 'Khách của', dataName: 'guestOf', type: 'select', options: 'Bride\nGroom\nBoth\nFamily\nFriend' },
          { placeholder: 'Số người tham dự', dataName: 'numberOfPeople', type: 'number' }
        ];

        fields.forEach((field) => {
          const fieldElement = React.createElement(Element, {
            is: Input,
            canvas: true,
            inputType: field.type,
            placeholder: field.placeholder,
            dataName: field.dataName,
            required: field.placeholder.includes('*'),
            width: '400px',
            height: `${inputHeight}px`,
            left: '0px',
            top: `${currentTop}px`,
            backgroundColor: '#ffffff',
            borderRadius: [4, 4, 4, 4],
            borderWidth: [1, 1, 1, 1],
            borderStyle: 'solid',
            borderColor: '#d1d5db',
            options: field.options || '',
            isChildOfForm: true,
          });

          const fieldTree = query.parseReactElement(fieldElement).toNodeTree();
          const fieldNodeId = Object.keys(fieldTree.nodes)[0];
          const fieldNode = fieldTree.nodes[fieldNodeId];
          editorActions.add(fieldNode, id);

          currentTop += inputHeight + formGap;
        });

        // Submit button
        const submitButtonElement = React.createElement(Element, {
          is: Button,
          canvas: true,
          text: 'Gửi thông tin',
          width: '400px',
          height: '44px',
          left: '0px',
          top: `${currentTop}px`,
          background: '#3b82f6',
          color: '#ffffff',
          isChildOfForm: true,
        });

        const submitButtonTree = query.parseReactElement(submitButtonElement).toNodeTree();
        const submitButtonNodeId = Object.keys(submitButtonTree.nodes)[0];
        const submitButtonNode = submitButtonTree.nodes[submitButtonNodeId];
        editorActions.add(submitButtonNode, id);
      }
    }
  }, [formType]); // Run when formType changes

  // Ensure Form always has a submit button
  useEffect(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Check if there's already a button
    const hasButton = childNodeIds.some(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.displayName === 'Button';
    });

    // If no button exists, add one
    if (childNodeIds.length > 0 && !hasButton) {
      // Calculate position for the button (below all existing elements)
      const inputNodes = childNodeIds.filter(childId => {
        const childNode = query.node(childId).get();
        return childNode.data.displayName === 'Input';
      });

      const inputCount = inputNodes.length;
      const inputHeight = 40;
      const buttonTop = inputCount * (inputHeight + formGap);

      console.log('Adding missing submit button at position:', buttonTop);

      const buttonElement = React.createElement(Element, {
        is: Button,
        canvas: true,
        text: 'Gửi',
        width: '400px',
        height: '44px',
        left: '0px',
        top: `${buttonTop}px`,
        background: '#000000',
        color: '#ffffff',
        isChildOfForm: true,
      });

      const buttonTree = query.parseReactElement(buttonElement).toNodeTree();
      const buttonNodeId = Object.keys(buttonTree.nodes)[0];
      const buttonNode = buttonTree.nodes[buttonNodeId];

      editorActions.add(buttonNode, id);
    }
  }, [children]); // Run when children change

  // Reposition form elements when formGap changes
  useEffect(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    if (childNodeIds.length === 0) return;

    const inputNodes = childNodeIds.filter(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.displayName === 'Input';
    });

    const buttonNodes = childNodeIds.filter(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.displayName === 'Button';
    });

    // Reposition inputs with proper height calculation
    let currentTop = 0;
    inputNodes.forEach((inputId) => {
      editorActions.setProp(inputId, (inputProps: any) => {
        inputProps.top = `${currentTop}px`;
      });

      // Get actual height of this input for next position calculation
      const inputNode = query.node(inputId).get();
      const inputHeight = inputNode.data.props.inputType === 'textarea' ? 80 : 40;
      currentTop += inputHeight + formGap;
    });

    // Reposition button after all inputs
    if (buttonNodes.length > 0) {
      const buttonId = buttonNodes[0];
      editorActions.setProp(buttonId, (buttonProps: any) => {
        buttonProps.top = `${currentTop}px`;
      });
    }
  }, [formGap]); // Run when formGap changes



  // Create container styles (like Group - minimal styling)
  const containerStyles: React.CSSProperties = minimizeStyle({
    position: 'absolute',
    left,
    top,
    width,
    height,
    opacity: (mergedProps.opacity || 100) / 100,
    pointerEvents: mergedProps.pointerEvents !== 'none' ? mergedProps.pointerEvents : undefined,
    ...(enabled && {
      outline: '2px dashed #9c88ff',
      outlineOffset: '2px',
    }),
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleContainerClick();
  };

  const handleMouseEnterForm = () => {
    const currentRef = enabled ? containerRef.current : formRef.current;
    if (currentRef) {
      applyHoverStyles(currentRef, true);
    }
    handleHover();
  };

  const handleMouseLeaveForm = () => {
    const currentRef = enabled ? containerRef.current : formRef.current;
    if (currentRef) {
      applyHoverStyles(currentRef, false);
    }
  };

  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        className='form-container'
        lockAspectRatio={lockAspectRatio}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {children}
        </div>
      </Resizer>
    );
  }

  // Form submission handler for preview mode
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    handleSubmit();


    if (apiUrl && submissionType === 'api') {
      const formData = new FormData(e.target as HTMLFormElement);
      const data: any = {};

      // Convert FormData to object
      formData.forEach((value, key) => {
        console.log(`📝 Form field: ${key} = ${value}`);
        data[key] = value;
      });

      // Handle guest form specific data structure
      if (isGuestForm) {
        // Add pageId from context (required for guest form)
        if (weddingPageId) {
          data.pageId = Number(weddingPageId);
          console.log('🆔 Added page ID for guest form:', weddingPageId);
        }

        // Convert numberOfPeople to number if present
        if (data.numberOfPeople) {
          data.numberOfPeople = Number(data.numberOfPeople);
        }

        // Process custom questions from form data
        const questions: Array<{
          question: string;
          answer: string;
          type?: string;
        }> = [];

        if (customQuestions && customQuestions.length > 0) {
          customQuestions.forEach((customQuestion) => {
            const fieldName = customQuestion.id; // Use ID as field name
            const answer = data[fieldName];

            if (answer) {
              questions.push({
                question: customQuestion.question,
                answer: String(answer),
                type: customQuestion.type
              });
            }

            // Remove the custom question field from the main data object
            delete data[fieldName];
          });
        }

        // Set extraInfo.questions with processed custom questions
        data.extraInfo = {
          questions: questions
        };

        console.log('👥 Guest form data structure prepared');
      }

      // Add wedding page ID if available (for wedding wish forms)
      if (weddingPageId && !isGuestForm) {
        data.weddingPageId = Number(weddingPageId);
        console.log('🆔 Added wedding page ID:', weddingPageId);
      }

      // Add isPublic: true for wedding wish forms
      if (isWeddingWishForm) {
        data.isPublic = true;
        console.log('💒 Added isPublic: true for wedding wish form');
      }

      console.log('📤 Submitting form data:', data);
      console.log('🌐 API URL:', apiUrl);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Form submitted successfully:', result);
          alert('🎉 Gửi thành công!');

          // Reset form
          (e.target as HTMLFormElement).reset();
          console.log('🔄 Form reset completed');
          queryClient.invalidateQueries({ queryKey: ['guest-wishes', weddingPageId] });
        } else {
          console.error('❌ Form submission failed:', response.status, response.statusText);
          alert('❌ Có lỗi xảy ra khi gửi form');
        }
      } catch (error) {
        console.error('💥 Form submission error:', error);
        alert('💥 Có lỗi xảy ra khi gửi form');
      }
    } else if (!apiUrl && submissionType === 'api') {
      console.log('⚠️ No API URL configured, only triggering events');
    } else {
      console.log('📋 Form submission type:', submissionType, '- API submission skipped');
    }
  };

  // Conditional rendering based on editor state
  if (enabled) {
    // Editor mode - render with Resizer for editing
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        lockAspectRatio={lockAspectRatio}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) {
            containerRef.current = dom as HTMLDivElement;
          }
        }}
      >
        <div
          className='form-container'
          data-node-id={id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnterForm}
          onMouseLeave={handleMouseLeaveForm}
        >
          {children}
        </div>
      </Resizer>
    );
  }

  // Preview mode - render as form with submission handling
  return (
    <form
      ref={formRef}
      style={containerStyles}
      className='form-container'
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnterForm}
      onMouseLeave={handleMouseLeaveForm}
      onSubmit={handleFormSubmit}
    >
      {children}
    </form>
  );
};

Form.craft = {
  displayName: 'Form',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: (incomingNodes: any[]) => {
      // Only allow Input and Button components
      return incomingNodes.every(node =>
        node.data.type === 'Input' || node.data.type === 'Button'
      );
    },
  },
  related: {
    toolbar: FormSettings,
  },
};
