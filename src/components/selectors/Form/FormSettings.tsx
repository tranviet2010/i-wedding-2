import {
  Box,
  Button,
  Input as ChakraInput,
  Stack,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { Element, useEditor, useNode } from '@craftjs/core';
import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { EventManager, EventItem } from '../../editor/components/EventManager';
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings } from '../../editor/components/AnimationManager';
import { PinningManager, PinningSettings } from '../../editor/components/PinningManager';
import { Input } from '../Input';
import { domain } from '../../../api/apiClient';
import CrossPlatformSyncToggle from '@/components/editor/components/CrossPlatformSyncToggle';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';

interface FormProps {
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
}

export const FormSettings = () => {
  const {
    actions: { setProp },
    props,
    id
  } = useNode((node) => ({
    props: node.data.props as FormProps
  }));


  const { actions: editorActions, query } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [settingType, setSettingType] = useState<string>('default');
  const [customQuestions, setCustomQuestions] = useState<Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
    options?: string;
    required?: boolean;
  }>>(props.customQuestions || []);

  // Sync customQuestions state with props when props change
  React.useEffect(() => {
    if (props.customQuestions) {
      // Add IDs to questions that don't have them (backward compatibility)
      const questionsWithIds = props.customQuestions.map(q => ({
        ...q,
        id: q.id || generateQuestionId()
      }));
      setCustomQuestions(questionsWithIds);

      // Update props if we added IDs
      if (questionsWithIds.some((q, i) => q.id !== props.customQuestions?.[i]?.id)) {
        updateProp('customQuestions', questionsWithIds);
      }
    }
  }, [props.customQuestions]);

  // Sync existing custom questions with form elements on component mount
  React.useEffect(() => {
    if (customQuestions.length === 0) {
      // If no custom questions in state, clean up any remaining elements
      cleanupAllCustomQuestions();
    } else {
      // Check if custom question elements already exist in the form
      const currentNode = query.node(id).get();
      const childNodeIds = currentNode?.data?.nodes || [];

      const existingCustomQuestions = childNodeIds.filter(childId => {
        const childNode = query.node(childId).get();
        return childNode.data.props.dataName?.startsWith('customQuestion_');
      });

      // If mismatch between state and form elements, rebuild
      if (existingCustomQuestions.length !== customQuestions.length) {
        console.log('Syncing custom questions - state vs form mismatch:', {
          stateCount: customQuestions.length,
          formCount: existingCustomQuestions.length
        });
        rebuildAllCustomQuestions();
      }
    }
  }, [customQuestions.length]); // Only run when the number of questions changes

  const updateProp = (key: keyof FormProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  // Generate unique ID for custom questions
  const generateQuestionId = () => {
    return `customQuestion_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  // Custom questions management
  const addCustomQuestion = () => {
    // Set form as being managed
    updateProp('isBeingManaged', true);

    const newQuestion = {
      id: generateQuestionId(),
      question: 'Câu hỏi mới',
      type: 'text' as const,
      required: false
    };
    const updatedQuestions = [...customQuestions, newQuestion];
    setCustomQuestions(updatedQuestions);
    updateProp('customQuestions', updatedQuestions);

    // Add the question as an actual Input element to the form
    addCustomQuestionToForm(newQuestion);
  };

  const updateCustomQuestion = (questionId: string, field: string, value: any) => {
    // Set form as being managed
    updateProp('isBeingManaged', true);

    const updatedQuestions = customQuestions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    );
    setCustomQuestions(updatedQuestions);
    updateProp('customQuestions', updatedQuestions);

    // Update the corresponding Input element in the form
    const updatedQuestion = updatedQuestions.find(q => q.id === questionId);
    if (updatedQuestion) {
      updateCustomQuestionInForm(questionId, updatedQuestion);
    }
  };

  // Update custom question Input element in the form
  const updateCustomQuestionInForm = (questionId: string, question: any) => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Find the custom question input to update
    const customQuestionNodeId = childNodeIds.find(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.props.dataName === questionId;
    });

    if (customQuestionNodeId) {
      const inputHeight = question.type === 'textarea' ? 80 : 40;

      editorActions.setProp(customQuestionNodeId, (inputProps: any) => {
        inputProps.inputType = question.type;
        inputProps.placeholder = question.question + (question.required ? ' *' : '');
        inputProps.required = question.required || false;
        inputProps.height = `${inputHeight}px`;
        inputProps.options = question.options || '';
      });

      console.log('Updated custom question in form:', {
        id: questionId,
        question: question.question,
        type: question.type,
        required: question.required
      });

      // Reposition elements if height changed
      setTimeout(() => {
        repositionFormElements();
      }, 100);
    }
  };

  const removeCustomQuestion = (questionId: string) => {
    // Set form as being managed
    updateProp('isBeingManaged', true);

    const updatedQuestions = customQuestions.filter(q => q.id !== questionId);
    setCustomQuestions(updatedQuestions);
    updateProp('customQuestions', updatedQuestions);

    // If removing all questions, do a complete cleanup
    if (updatedQuestions.length === 0) {
      cleanupAllCustomQuestions();
    } else {
      // Remove the corresponding Input element from the form
      removeCustomQuestionFromForm(questionId);
    }
  };

  // Complete cleanup of all custom questions
  const cleanupAllCustomQuestions = () => {
    // Set form as being managed
    updateProp('isBeingManaged', true);

    // Clear state first
    setCustomQuestions([]);
    updateProp('customQuestions', []);

    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    console.log('Complete cleanup of all custom questions');

    // Find and remove ALL custom question elements using multiple criteria
    const customQuestionNodes = childNodeIds.filter(childId => {
      const childNode = query.node(childId).get();
      const props = childNode.data.props;

      // Multiple ways to identify custom questions
      const isCustomQuestion =
        props.dataName?.startsWith('customQuestion_') ||
        props.placeholder?.includes('Câu hỏi mới') ||
        props.placeholder?.includes('câu hỏi') ||
        props.placeholder?.toLowerCase().includes('question') ||
        // Check if it's an input that's not part of the base form
        (childNode.data.displayName === 'Input' &&
          !['fullName', 'phone', 'email', 'guestOf', 'numberOfPeople', 'guestName', 'message'].includes(props.dataName));

      return isCustomQuestion;
    });

    console.log('Cleaning up custom question nodes:', customQuestionNodes.length);
    customQuestionNodes.forEach(nodeId => {
      console.log('Deleting node:', nodeId);
      editorActions.delete(nodeId);
    });

    // Reposition remaining elements
    setTimeout(() => {
      repositionFormElements();
    }, 200);
  };

  // Handle form type change
  const handleFormTypeChange = (newFormType: 'wedding-wish' | 'guest') => {
    console.log('Changing form type to:', newFormType);

    // Set form as being managed to prevent auto-creation conflicts
    updateProp('isBeingManaged', true);

    // Update form type and related flags
    updateProp('formType', newFormType);
    updateProp('isWeddingWishForm', newFormType === 'wedding-wish');
    updateProp('isGuestForm', newFormType === 'guest');

    // Clear existing form and rebuild based on type
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Remove all existing children
    childNodeIds.forEach(childId => {
      editorActions.delete(childId);
    });

    // Create appropriate form based on type
    setTimeout(() => {
      if (newFormType === 'wedding-wish') {
        createWeddingWishFormFields();
      } else if (newFormType === 'guest') {
        createGuestFormFields();
      }
    }, 100);
  };

  // Add custom question as actual Input element to the form
  const addCustomQuestionToForm = (question: any) => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Find existing inputs and button to calculate position
    const inputNodes = childNodeIds.filter(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.displayName === 'Input';
    });

    const buttonNodes = childNodeIds.filter(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.displayName === 'Button';
    });

    const inputHeight = question.type === 'textarea' ? 80 : 40;
    const totalInputs = inputNodes.length;
    const newInputTop = totalInputs * (40 + props.formGap);

    console.log('Adding custom question to form:', {
      id: question.id,
      question: question.question,
      type: question.type,
      position: newInputTop,
      totalInputs
    });

    // Create new Input element for the custom question
    const questionElement = React.createElement(Element, {
      is: Input,
      canvas: true,
      inputType: question.type,
      placeholder: question.question + (question.required ? ' *' : ''),
      dataName: question.id, // Use unique ID instead of index
      required: question.required || false,
      width: '400px',
      height: `${inputHeight}px`,
      left: '0px',
      top: `${newInputTop}px`,
      backgroundColor: '#ffffff',
      borderRadius: [4, 4, 4, 4],
      borderWidth: [1, 1, 1, 1],
      borderStyle: 'solid',
      borderColor: '#d1d5db',
      options: question.options || ''
    });

    const questionTree = query.parseReactElement(questionElement).toNodeTree();
    const questionNodeId = Object.keys(questionTree.nodes)[0];
    const questionNode = questionTree.nodes[questionNodeId];

    editorActions.add(questionNode, id);

    // Update button position to be below the new input
    setTimeout(() => {
      if (buttonNodes.length > 0) {
        const buttonId = buttonNodes[0];
        const newButtonTop = (totalInputs + 1) * (40 + props.formGap) + (inputHeight - 40);

        editorActions.setProp(buttonId, (buttonProps: any) => {
          buttonProps.top = `${newButtonTop}px`;
        });
      }
    }, 100);
  };

  // Remove custom question Input element from the form
  const removeCustomQuestionFromForm = (questionId: string) => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    // Find the custom question input to remove
    const customQuestionNode = childNodeIds.find(childId => {
      const childNode = query.node(childId).get();
      return childNode.data.props.dataName === questionId;
    });

    if (customQuestionNode) {
      editorActions.delete(customQuestionNode);
      console.log('Removed custom question from form:', questionId);
    }

    // Reposition remaining elements
    setTimeout(() => {
      repositionFormElements();
    }, 100);
  };

  // Rebuild all custom questions with correct indices (debounced)
  const rebuildAllCustomQuestions = React.useCallback(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    console.log('Rebuilding all custom questions, current questions:', customQuestions.length);

    // Remove all existing custom question elements - check both dataName and placeholder
    const customQuestionNodes = childNodeIds.filter(childId => {
      const childNode = query.node(childId).get();
      const props = childNode.data.props;

      // Check if it's a custom question by dataName or placeholder
      const isCustomQuestion = props.dataName?.startsWith('customQuestion_') ||
        props.placeholder?.includes('Câu hỏi mới') ||
        props.placeholder?.includes('câu hỏi');

      console.log('Checking node:', {
        id: childId,
        dataName: props.dataName,
        placeholder: props.placeholder,
        isCustomQuestion
      });

      return isCustomQuestion;
    });

    console.log('Removing existing custom question nodes:', customQuestionNodes.length);
    customQuestionNodes.forEach(nodeId => {
      console.log('Deleting custom question node:', nodeId);
      editorActions.delete(nodeId);
    });

    // Only re-add questions if there are any in the state
    if (customQuestions.length > 0) {
      setTimeout(() => {
        console.log('Re-adding custom questions:', customQuestions.length);
        customQuestions.forEach((question) => {
          addCustomQuestionToForm(question);
        });

        // Reposition all elements after rebuilding
        setTimeout(() => {
          repositionFormElements();
        }, 200);
      }, 150);
    } else {
      // If no custom questions, just reposition existing elements
      setTimeout(() => {
        repositionFormElements();
      }, 150);
    }
  }, [customQuestions]);

  // Reposition all form elements after changes
  const repositionFormElements = () => {
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
      currentTop += inputHeight + props.formGap;
    });

    // Reposition button after all inputs
    if (buttonNodes.length > 0) {
      const buttonId = buttonNodes[0];
      editorActions.setProp(buttonId, (buttonProps: any) => {
        buttonProps.top = `${currentTop}px`;
      });
    }
  };



  // Create Wedding Wish Form fields
  const createWeddingWishFormFields = () => {
    console.log('Creating Wedding Wish Form fields');

    // Set API URL for wedding wishes
    const baseApiUrl = props.apiUrl || '';
    let weddingWishApiUrl = '';

    if (baseApiUrl) {
      // Clean the base URL and check if it already contains the endpoint
      const cleanBaseUrl = baseApiUrl.replace(/\/$/, '');
      if (cleanBaseUrl.endsWith('/guests/wishes')) {
        weddingWishApiUrl = cleanBaseUrl;
      } else if (cleanBaseUrl.endsWith('/guests')) {
        weddingWishApiUrl = `${cleanBaseUrl}/wishes`;
      } else {
        weddingWishApiUrl = `${cleanBaseUrl}/guests/wishes`;
      }
    } else {
      weddingWishApiUrl = `${domain}/guests/wishes`;
    }

    updateProp('apiUrl', weddingWishApiUrl);

    const inputHeight = 40;
    const textareaHeight = 80;
    let currentTop = 0;

    // 1. Guest Name input (required)
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
    });

    const guestNameTree = query.parseReactElement(guestNameElement).toNodeTree();
    const guestNameNodeId = Object.keys(guestNameTree.nodes)[0];
    const guestNameNode = guestNameTree.nodes[guestNameNodeId];
    editorActions.add(guestNameNode, id);

    // 2. Message textarea (required)
    currentTop += inputHeight + props.formGap;
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
    });

    const messageTree = query.parseReactElement(messageElement).toNodeTree();
    const messageNodeId = Object.keys(messageTree.nodes)[0];
    const messageNode = messageTree.nodes[messageNodeId];
    editorActions.add(messageNode, id);

    // 3. Submit button
    currentTop += textareaHeight + props.formGap;
    const submitButtonElement = React.createElement(Element, {
      is: Button,
      canvas: true,
      text: 'Gửi lời chúc',
      width: '400px',
      height: '44px',
      left: '0px',
      top: `${currentTop}px`,
      background: '#10b981', // Green color for wedding theme
      color: '#ffffff',
      isChildOfForm: true,
    });

    const submitButtonTree = query.parseReactElement(submitButtonElement).toNodeTree();
    const submitButtonNodeId = Object.keys(submitButtonTree.nodes)[0];
    const submitButtonNode = submitButtonTree.nodes[submitButtonNodeId];
    editorActions.add(submitButtonNode, id);
  };

  // Create Guest Form fields
  const createGuestFormFields = () => {
    console.log('Creating Guest Form fields');

    // Set API URL for guests
    const baseApiUrl = props.apiUrl || '';
    let guestApiUrl = '';

    if (baseApiUrl) {
      // Clean the base URL and check if it already contains the endpoint
      const cleanBaseUrl = baseApiUrl.replace(/\/$/, '');
      if (cleanBaseUrl.endsWith('/guests/wishes')) {
        // Remove /wishes to get just /guests
        guestApiUrl = cleanBaseUrl.replace('/wishes', '');
      } else if (cleanBaseUrl.endsWith('/guests')) {
        guestApiUrl = cleanBaseUrl;
      } else {
        guestApiUrl = `${cleanBaseUrl}/guests`;
      }
    } else {
      guestApiUrl = `${domain}/guests`;
    }

    updateProp('apiUrl', guestApiUrl);

    const inputHeight = 40;
    let currentTop = 0;

    // 1. Full Name input (required)
    const fullNameElement = React.createElement(Element, {
      is: Input,
      canvas: true,
      inputType: 'text',
      placeholder: 'Họ và tên *',
      dataName: 'fullName',
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
    });

    const fullNameTree = query.parseReactElement(fullNameElement).toNodeTree();
    const fullNameNodeId = Object.keys(fullNameTree.nodes)[0];
    const fullNameNode = fullNameTree.nodes[fullNameNodeId];
    editorActions.add(fullNameNode, id);

    // 2. Phone input (required)
    currentTop += inputHeight + props.formGap;
    const phoneElement = React.createElement(Element, {
      is: Input,
      canvas: true,
      inputType: 'tel',
      placeholder: 'Số điện thoại *',
      dataName: 'phone',
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
    });

    const phoneTree = query.parseReactElement(phoneElement).toNodeTree();
    const phoneNodeId = Object.keys(phoneTree.nodes)[0];
    const phoneNode = phoneTree.nodes[phoneNodeId];
    editorActions.add(phoneNode, id);

    // 3. Email input (required)
    currentTop += inputHeight + props.formGap;
    const emailElement = React.createElement(Element, {
      is: Input,
      canvas: true,
      inputType: 'email',
      placeholder: 'Email *',
      dataName: 'email',
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
    });

    const emailTree = query.parseReactElement(emailElement).toNodeTree();
    const emailNodeId = Object.keys(emailTree.nodes)[0];
    const emailNode = emailTree.nodes[emailNodeId];
    editorActions.add(emailNode, id);

    // 4. Guest Of dropdown
    currentTop += inputHeight + props.formGap;
    const guestOfElement = React.createElement(Element, {
      is: Input,
      canvas: true,
      inputType: 'select',
      placeholder: 'Khách của',
      dataName: 'guestOf',
      required: false,
      width: '400px',
      height: `${inputHeight}px`,
      left: '0px',
      top: `${currentTop}px`,
      backgroundColor: '#ffffff',
      borderRadius: [4, 4, 4, 4],
      borderWidth: [1, 1, 1, 1],
      borderStyle: 'solid',
      borderColor: '#d1d5db',
      options: 'Bride\nGroom\nBoth\nFamily\nFriend'
    });

    const guestOfTree = query.parseReactElement(guestOfElement).toNodeTree();
    const guestOfNodeId = Object.keys(guestOfTree.nodes)[0];
    const guestOfNode = guestOfTree.nodes[guestOfNodeId];
    editorActions.add(guestOfNode, id);

    // 5. Number of People input
    currentTop += inputHeight + props.formGap;
    const numberOfPeopleElement = React.createElement(Element, {
      is: Input,
      canvas: true,
      inputType: 'number',
      placeholder: 'Số người tham dự',
      dataName: 'numberOfPeople',
      required: false,
      width: '400px',
      height: `${inputHeight}px`,
      left: '0px',
      top: `${currentTop}px`,
      backgroundColor: '#ffffff',
      borderRadius: [4, 4, 4, 4],
      borderWidth: [1, 1, 1, 1],
      borderStyle: 'solid',
      borderColor: '#d1d5db',
    });

    const numberOfPeopleTree = query.parseReactElement(numberOfPeopleElement).toNodeTree();
    const numberOfPeopleNodeId = Object.keys(numberOfPeopleTree.nodes)[0];
    const numberOfPeopleNode = numberOfPeopleTree.nodes[numberOfPeopleNodeId];
    editorActions.add(numberOfPeopleNode, id);

    // 6. Submit button
    currentTop += inputHeight + props.formGap;

    console.log('Creating guest form submit button at position:', currentTop);

    const submitButtonElement = React.createElement(Element, {
      is: Button,
      canvas: true,
      text: 'Gửi thông tin',
      width: '400px',
      height: '44px',
      left: '0px',
      top: `${currentTop}px`,
      background: '#3b82f6', // Blue color for guest form
      color: '#ffffff',
      isChildOfForm: true,
    });

    const submitButtonTree = query.parseReactElement(submitButtonElement).toNodeTree();
    const submitButtonNodeId = Object.keys(submitButtonTree.nodes)[0];
    const submitButtonNode = submitButtonTree.nodes[submitButtonNodeId];
    editorActions.add(submitButtonNode, id);

  };



  const handleEventsChange = (newEvents: EventItem[]) => {
    updateProp('events', newEvents);
  };

  const handleDisplayAnimationChange = (newAnimation: DisplayAnimationItem | null) => {
    updateProp('displayAnimation', newAnimation);
  };

  const handleHoverAnimationChange = (newHoverAnimation: HoverAnimationSettings) => {
    updateProp('hoverAnimation', newHoverAnimation);
  };

  const handlePinningChange = (newPinning: PinningSettings) => {
    updateProp('pinning', newPinning);
  };

  const currentEvents = props.events || [];
  const currentDisplayAnimation = props.displayAnimation || null;
  const currentHoverAnimation = props.hoverAnimation || { enabled: false };
  const currentPinning = props.pinning || {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  };



  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'form-setting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="event" className='!text-xs'>
            Sự kiện
          </Tabs.Trigger>
          <Tabs.Trigger value="animation" className='!text-xs'>
            Hiệu ứng
          </Tabs.Trigger>
          <Tabs.Trigger value="advanced" className='!text-xs'>
            Nâng cao
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="default">
          <Stack gap={4}>
            {/* Form Type Selection */}
            <NodeControlsPanel
              showDragHandle={false}
              showLayerControls={true}
              showContainerSpecificControls={true}
            />
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Loại Form</Text>
              <Stack gap={3}>
                {/* Form Type Selector */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Chọn loại form</Text>
                  <select
                    style={{
                      width: '60%',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    value={props.formType}
                    onChange={(e: any) => handleFormTypeChange(e.target.value)}
                  >
                    <option value="wedding-wish">Form Chúc mừng</option>
                    <option value="guest">Form Khách mời</option>
                  </select>
                </Box>

                {/* Custom Questions - Only for Guest Forms */}
                {props.formType === 'guest' && (
                  <Box className='w-full' borderTop="1px solid #e0e0e0" pt={3}>
                    <Box className='w-full flex items-center justify-between gap-2 mb-2'>
                      <Text fontSize="xs" fontWeight="bold">Câu hỏi tùy chỉnh</Text>
                      <Box className='flex gap-1'>
                        <Button size="xs" onClick={addCustomQuestion} colorScheme="green">
                          <FaPlus className="mr-1" />
                          Thêm câu hỏi
                        </Button>
                        {customQuestions.length > 0 && (
                          <Button size="xs" onClick={cleanupAllCustomQuestions} colorScheme="red" variant="outline">
                            <FaTrash className="mr-1" />
                            Xóa tất cả
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {customQuestions.map((question) => (
                      <Box key={question.id} className='border border-gray-200 rounded p-2 mb-2'>
                        <Box className='w-full flex items-center justify-between gap-2 mb-2'>
                          <ChakraInput
                            size="xs"
                            placeholder="Câu hỏi"
                            value={question.question}
                            onChange={(e) => updateCustomQuestion(question.id, 'question', e.target.value)}
                            flex={1}
                          />
                          <Button
                            size="xs"
                            colorScheme="red"
                            aria-label="Xóa câu hỏi"
                            onClick={() => removeCustomQuestion(question.id)}
                          >
                            <FaTrash />
                          </Button>
                        </Box>

                        <Box className='w-full flex items-center gap-2'>
                          <select
                            style={{
                              fontSize: '12px',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                              flex: 1
                            }}
                            value={question.type}
                            onChange={(e) => updateCustomQuestion(question.id, 'type', e.target.value)}
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                            <option value="radio">Radio</option>
                            <option value="checkbox">Checkbox</option>
                          </select>

                          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="checkbox"
                              checked={question.required || false}
                              onChange={(e) => updateCustomQuestion(question.id, 'required', e.target.checked)}
                            />
                            Bắt buộc
                          </label>
                        </Box>

                        {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                          <Box className='w-full mt-2'>
                            <textarea
                              style={{
                                width: '100%',
                                fontSize: '12px',
                                padding: '4px',
                                borderRadius: '4px',
                                border: '1px solid #d1d5db',
                                minHeight: '60px',
                                resize: 'vertical'
                              }}
                              placeholder="Nhập các tùy chọn (mỗi dòng một tùy chọn)"
                              value={question.options || ''}
                              onChange={(e) => updateCustomQuestion(question.id, 'options', e.target.value)}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Form Spacing Settings Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Khoảng cách</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Khoảng cách giữa các phần tử</Text>
                  <Box className='flex items-center gap-2' style={{ width: '60%' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={props.formGap}
                      onChange={(e) => {
                        const newGap = parseInt(e.target.value) || 0;
                        updateProp('formGap', newGap);
                      }}
                      style={{
                        width: '70px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}
                    />
                    <Text fontSize="xs" color="gray.600">px</Text>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Form Submission Settings Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Cài đặt gửi form</Text>
              <Stack gap={3}>
                {/* Submission Type */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Kiểu gửi</Text>
                  <select
                    style={{
                      width: '60%',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    value={props.submissionType}
                    onChange={(e: any) => updateProp('submissionType', e.target.value)}
                  >
                    <option value="api">API</option>
                    <option value="google-form" disabled>Google Form (Sắp có)</option>
                    <option value="google-sheet" disabled>Google Sheet (Sắp có)</option>
                  </select>
                </Box>

                {/* API URL - only show when API is selected */}
                {props.submissionType === 'api' && (
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs">API URL</Text>
                    <ChakraInput
                      size="sm"
                      width="60%"
                      placeholder="https://api.example.com"
                      value={props.apiUrl}
                      onChange={(e) => updateProp('apiUrl', e.target.value)}
                      disabled={props.isWeddingWishForm || props.isGuestForm}
                      style={{
                        backgroundColor: (props.isWeddingWishForm || props.isGuestForm) ? '#f5f5f5' : 'white',
                        cursor: (props.isWeddingWishForm || props.isGuestForm) ? 'not-allowed' : 'text'
                      }}
                    />
                  </Box>
                )}

                {/* Guest Form Info */}
                {props.isGuestForm && (
                  <Box className='w-full'>
                    <Text fontSize="xs" color="gray.600" fontStyle="italic">
                      👥 Form khách mời đã được cấu hình tự động với endpoint: {domain}/guests
                    </Text>
                  </Box>
                )}

                {/* Wedding Wish Form Info */}
                {props.isWeddingWishForm && (
                  <Box className='w-full'>
                    <Text fontSize="xs" color="gray.600" fontStyle="italic">
                      💒 Form chúc mừng đã được cấu hình tự động với endpoint: {domain}/guests/wishes
                    </Text>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="event" className="p-4">
          <Stack>
            <EventManager
              events={currentEvents}
              onEventsChange={handleEventsChange}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="animation" className="p-4">
          <Stack>
            <AnimationManager
              displayAnimation={currentDisplayAnimation}
              onDisplayAnimationChange={handleDisplayAnimationChange}
              hoverAnimation={currentHoverAnimation}
              onHoverAnimationChange={handleHoverAnimationChange}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="advanced" className="p-4">
          <Stack>
            <CrossPlatformSyncToggle />
            <PinningManager
              pinning={currentPinning}
              onPinningChange={handlePinningChange}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
