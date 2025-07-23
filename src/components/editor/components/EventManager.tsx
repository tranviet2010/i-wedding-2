import {
	Box,
	Button,
	HStack,
	Input,
	Stack,
	Text,
	Textarea,
	VStack,
	Select,
	createListCollection
} from '@chakra-ui/react';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useEditor } from '@craftjs/core';
import { useViewport } from '../Viewport/ViewportContext';
import { FileType } from '@/features/files/fileAPI';

// Enhanced type definitions with better type safety
export type ActionType = 'click' | 'first-click' | 'second-click' | 'hover' | 'submit';
export type EventType = 'none' | 'navigate-section' | 'call' | 'link' | 'toggle-element' | 'copy-clipboard' | 'email' | 'open-popup' | 'open-dropbox' | 'open-lightbox' | 'open-album-modal';
export type LightboxMediaType = 'image' | 'video';
export type LightboxVideoType = 'youtube' | 'meHappyVideo';
export type DropboxPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left-top' | 'left-center' | 'left-bottom' | 'right-top' | 'right-center' | 'right-bottom';

// Enhanced EventItem interface with better type safety
export interface EventItem {
	readonly id: string;
	actionType: ActionType;
	eventType: EventType;
	// Navigation event properties
	sectionId?: string;
	// Communication event properties
	phoneNumber?: string;
	email?: string;
	// Link event properties
	url?: string;
	openInNewTab?: boolean;
	// Element toggle properties
	hideElementIds?: string;
	showElementIds?: string;
	// Clipboard properties
	copyElementId?: string;
	defaultValue?: string;
	// Modal properties
	popupId?: string;
	dropboxId?: string;
	dropboxPosition?: DropboxPosition;
	dropboxDistance?: number;
	// Lightbox properties
	lightboxMediaType?: LightboxMediaType;
	lightboxImageUrl?: string;
	lightboxVideoType?: LightboxVideoType;
	lightboxVideoUrl?: string;
	// Album modal properties
	albumModalId?: string;
}

// Enhanced interfaces for better type safety
export interface AvailableComponent {
	readonly id: string;
	readonly name: string;
}

export interface EventManagerProps {
	events: EventItem[];
	onEventsChange: (events: EventItem[]) => void;
	availableSections?: AvailableComponent[];
}

// Type guards for runtime type checking
export const isValidActionType = (value: string): value is ActionType => {
	return ['click', 'first-click', 'second-click', 'hover', 'submit'].includes(value);
};

export const isValidEventType = (value: string): value is EventType => {
	return ['none', 'navigate-section', 'call', 'link', 'toggle-element', 'copy-clipboard', 'email', 'open-popup', 'open-dropbox', 'open-lightbox', 'open-album-modal'].includes(value);
};

export const isValidDropboxPosition = (value: string): value is DropboxPosition => {
	return ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'left-top', 'left-center', 'left-bottom', 'right-top', 'right-center', 'right-bottom'].includes(value);
};

// Type-safe option definitions
export interface SelectOption<T = string> {
	readonly value: T;
	readonly label: string;
}

export const actionTypeOptions: ReadonlyArray<SelectOption<ActionType>> = [
	{ value: 'click', label: 'Nhấp chuột' },
	{ value: 'first-click', label: 'Nhấp chuột đầu tiên' },
	{ value: 'second-click', label: 'Nhấp chuột thứ 2' },
	{ value: 'hover', label: 'Rê chuột (hover)' },
	{ value: 'submit', label: 'Gửi form (submit)' }
] as const;

export const eventTypeOptions: ReadonlyArray<SelectOption<EventType>> = [
	{ value: 'none', label: 'Không chọn' },
	{ value: 'navigate-section', label: 'Chuyển Section' },
	{ value: 'call', label: 'Mở cuộc gọi' },
	{ value: 'link', label: 'Mở liên kết' },
	{ value: 'toggle-element', label: 'Ẩn/Hiện phần tử' },
	{ value: 'copy-clipboard', label: 'Copy Clipboard' },
	{ value: 'email', label: 'Mở email' },
	{ value: 'open-popup', label: 'Mở Popup' },
	{ value: 'open-dropbox', label: 'Mở Dropbox' },
	{ value: 'open-lightbox', label: 'Mở LightBox' },
	{ value: 'open-album-modal', label: 'Mở Album Modal' },
] as const;

export const dropboxPositionOptions: ReadonlyArray<SelectOption<DropboxPosition>> = [
	{ value: 'top-left', label: 'Trên cùng trái' },
	{ value: 'top-center', label: 'Trên cùng giữa' },
	{ value: 'top-right', label: 'Trên cùng phải' },
	{ value: 'bottom-left', label: 'Dưới cùng trái' },
	{ value: 'bottom-center', label: 'Dưới cùng giữa' },
	{ value: 'bottom-right', label: 'Dưới cùng phải' },
	{ value: 'left-top', label: 'Trái trên' },
	{ value: 'left-center', label: 'Trái giữa' },
	{ value: 'left-bottom', label: 'Trái dưới' },
	{ value: 'right-top', label: 'Phải trên' },
	{ value: 'right-center', label: 'Phải giữa' },
	{ value: 'right-bottom', label: 'Phải dưới' },
] as const;

// Helper function to get DOM element with fallback for ViewOnlyViewport and custom ID support
const getDOMElement = (elementId: string, query: any): HTMLElement | null => {
	try {
		let actualNodeId = elementId;
		console.log(`🔍 Looking for element: ${elementId}`);

		const nodes = query.getNodes();
		const nodeWithCustomId = Object.keys(nodes).find(nodeId => {
			const node = nodes[nodeId];
			return node.data.custom?.customId === elementId;
		});

		if (nodeWithCustomId) {
			actualNodeId = nodeWithCustomId;
			console.log(`📝 Found custom ID mapping: ${elementId} -> ${actualNodeId}`);
		}

		// Method 1: Try to get DOM from craft.js node
		try {
			const node = query.node(actualNodeId).get();
			if (node && node.dom) {
				// Verify the DOM element is actually in the document
				if (document.contains(node.dom)) {
					console.log(`✅ Found DOM via craft.js node: ${elementId}`);
					return node.dom;
				} else {
					console.log(`⚠️ Craft.js DOM element not in document: ${actualNodeId}`);
				}
			}
		} catch (nodeError) {
			console.log(`⚠️ Craft.js node not found for: ${actualNodeId}`);
		}

		// Method 2: Try direct DOM query with original ID
		let domElement = document.querySelector(`[data-node-id="${elementId}"]`) as HTMLElement;
		if (domElement) {
			console.log(`✅ Found DOM via direct query (original ID): ${elementId}`);
			return domElement;
		}

		// Method 3: Try direct DOM query with actual node ID (if different)
		if (nodeWithCustomId && actualNodeId !== elementId) {
			domElement = document.querySelector(`[data-node-id="${actualNodeId}"]`) as HTMLElement;
			if (domElement) {
				console.log(`✅ Found DOM via direct query (actual ID): ${actualNodeId}`);
				return domElement;
			}
		}

		// Method 4: Try alternative selectors for ViewOnlyViewport
		const alternativeSelectors = [
			`[data-custom-id="${elementId}"]`,
			`#${elementId}`,
			`.${elementId}`,
			`[id="${elementId}"]`,
			`[class*="${elementId}"]`
		];

		for (const selector of alternativeSelectors) {
			try {
				domElement = document.querySelector(selector) as HTMLElement;
				if (domElement && document.contains(domElement)) {
					console.log(`✅ Found DOM via alternative selector: ${selector}`);
					return domElement;
				}
			} catch (selectorError) {
				// Invalid selector, continue to next
			}
		}

		// Method 5: Try to find by traversing all elements with data-node-id
		const allNodeElements = document.querySelectorAll('[data-node-id]');
		for (const element of allNodeElements) {
			const nodeId = element.getAttribute('data-node-id');
			if (nodeId === elementId) {
				console.log(`✅ Found DOM via traversal: ${elementId}`);
				return element as HTMLElement;
			}

			// Check if this element has a custom ID that matches
			try {
				const node = query.node(nodeId).get();
				if (node && node.data.custom?.customId === elementId) {
					console.log(`✅ Found DOM via traversal with custom ID: ${elementId} -> ${nodeId}`);
					return element as HTMLElement;
				}
			} catch (e) {
				// Continue searching
			}
		}

		console.warn(`❌ Could not find DOM element for: ${elementId}`);
		console.log(`🔍 Available node IDs:`, Object.keys(nodes).slice(0, 10)); // Show first 10 for debugging
		return null;
	} catch (error) {
		console.error(`Error getting DOM element ${elementId}:`, error);
		return null;
	}
};

// Helper function to scroll to element using Y position calculation
const scrollToElement = (
	element: HTMLElement,
	options: {
		behavior?: 'smooth' | 'auto',
		offset?: number,
		container?: HTMLElement | null,
		duration?: number
	} = {}
) => {
	try {
		const {
			behavior = 'smooth',
			offset = 0,
			container = null,
			duration = 500
		} = options;

		// Determine scroll container - use craftjs-renderer as default instead of window
		let scrollContainer: HTMLElement | Window = container || window;
		if (!container) {
			// Look for the craftjs-renderer container first
			const craftjsRenderer = document.querySelector('.craftjs-renderer') as HTMLElement;
			if (craftjsRenderer) {
				scrollContainer = craftjsRenderer;
			}
		}

		const isWindow = scrollContainer === window;

		// Get the element's position relative to the document or container
		const elementRect = element.getBoundingClientRect();

		let targetY: number;

		if (isWindow) {
			// Scrolling the window
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			targetY = elementRect.top + scrollTop + offset;

			console.log(`🔄 Scrolling window to Y: ${targetY}`);
			window.scrollTo({
				top: targetY,
				behavior: behavior
			});
		} else {
			// Scrolling within a container
			const containerElement = scrollContainer as HTMLElement;
			const containerRect = containerElement.getBoundingClientRect();

			// Calculate relative position within the container
			targetY = elementRect.top - containerRect.top + containerElement.scrollTop + offset;

			console.log(`🔄 Scrolling container to Y: ${targetY}, container:`, containerElement.className);
			containerElement.scrollTo({
				top: targetY,
				behavior: behavior
			});
		}

	} catch (error) {
		console.error('Error scrolling to element:', error);
		// Fallback to scrollIntoView if our method fails
		element.scrollIntoView({ behavior: 'smooth' });
	}
};

// Helper function to get element's Y position relative to document
const getElementYPosition = (element: HTMLElement, offset: number = 0): number => {
	const elementRect = element.getBoundingClientRect();
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return elementRect.top + scrollTop + offset;
};

// Helper function to scroll to specific Y position
const scrollToY = (targetY: number, behavior: 'smooth' | 'auto' = 'smooth') => {
	window.scrollTo({
		top: targetY,
		behavior: behavior
	});
};

// Helper function to wait for element to be available in DOM
const waitForElement = async (elementId: string, query: any, maxAttempts: number = 10): Promise<HTMLElement | null> => {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const element = getDOMElement(elementId, query);
		if (element && document.contains(element)) {
			return element;
		}
		// Wait 100ms before next attempt
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	return null;
};

// Debug helper function to test toggle-element functionality
export const debugToggleElement = (elementId: string, query: any) => {
	console.group(`🔧 Debug Toggle Element: ${elementId}`);

	try {
		const nodes = query.getNodes();
		console.log(`📊 Total nodes: ${Object.keys(nodes).length}`);

		// Check custom ID mapping
		const nodeWithCustomId = Object.keys(nodes).find(nodeId => {
			const node = nodes[nodeId];
			return node.data.custom?.customId === elementId;
		});

		if (nodeWithCustomId) {
			console.log(`✅ Custom ID mapping: ${elementId} -> ${nodeWithCustomId}`);
		} else {
			console.log(`❌ No custom ID mapping for: ${elementId}`);
		}

		// Test DOM element retrieval
		const domElement = getDOMElement(elementId, query);
		if (domElement) {
			console.log(`✅ DOM element found:`, domElement);
			console.log(`📏 Element in document:`, document.contains(domElement));
			console.log(`📏 Current display style:`, domElement.style.display);
			console.log(`📏 Computed display style:`, window.getComputedStyle(domElement).display);
			console.log(`📏 Element visibility:`, window.getComputedStyle(domElement).visibility);
			console.log(`📏 Element opacity:`, window.getComputedStyle(domElement).opacity);
		} else {
			console.log(`❌ DOM element not found`);
		}

		// List similar IDs for suggestions
		const similarIds = Object.keys(nodes).filter(nodeId =>
			nodeId.toLowerCase().includes(elementId.toLowerCase()) ||
			nodes[nodeId].data.custom?.customId?.toLowerCase().includes(elementId.toLowerCase())
		);

		if (similarIds.length > 0) {
			console.log(`💡 Similar IDs found:`, similarIds);
		}

	} catch (error) {
		console.error(`❌ Debug error:`, error);
	}

	console.groupEnd();
};

// Enhanced hook with performance optimizations and better error handling
export const useEventHandling = (events: EventItem[] = [], nodeId?: string) => {
	const [clickCount, setClickCount] = useState(0);
	const clickTimeoutRef = useRef<number | null>(null);
	const toggleTimeoutRef = useRef<Map<string, number>>(new Map());

	const { enabled, query, actions } = useEditor((state) => ({
		enabled: state.options.enabled,
	}));

	const { openPopup, openDropbox, setDropboxHoverState, scheduleDropboxClose, cancelDropboxClose, openLightBox } = useViewport();

	// Memoize filtered events to prevent unnecessary recalculations
	const eventsByActionType = useMemo(() => {
		const eventMap = new Map<ActionType, EventItem[]>();
		events.forEach(event => {
			const existing = eventMap.get(event.actionType) || [];
			eventMap.set(event.actionType, [...existing, event]);
		});
		return eventMap;
	}, [events]);

	// Enhanced event handler with better error handling and type safety
	const handleEvent = useCallback((actionType: ActionType) => {
		if (enabled || !events || events.length === 0) return;

		const matchingEvents = eventsByActionType.get(actionType) || [];

		matchingEvents.forEach(event => {
			try {
				switch (event.eventType) {
					case 'navigate-section':
						if (event.sectionId) {
							try {
								const domElement = getDOMElement(event.sectionId, query);
								if (domElement) {
									scrollToElement(domElement, {
										behavior: 'smooth',
										offset: -20 // Optional offset for better positioning
									});

									// Alternative usage examples:
									// 1. Scroll to exact Y position:
									// const targetY = getElementYPosition(domElement, -20);
									// scrollToY(targetY, 'smooth');

									// 2. Scroll within a specific container:
									// const container = document.querySelector('.scroll-container');
									// scrollToElement(domElement, { container, offset: -20 });

								} else {
									const retryElement = getDOMElement(event.sectionId!, query);
									if (retryElement) {
										scrollToElement(retryElement, {
											behavior: 'smooth',
											offset: -20
										});
									}
								}
							} catch (error) {
								console.error('Failed to navigate to section:', error);
							}
						}
						break;

					case 'call':
						if (event.phoneNumber) {
							window.open(`tel:${event.phoneNumber}`, '_self');
						}
						break;

					case 'link':
						if (event.url) {
							if (event.openInNewTab) {
								window.open(event.url, '_blank');
							} else {
								window.open(event.url, '_self');
							}
						}
						break;

					case 'toggle-element':
						if (event.hideElementIds) {
							// Support both comma and newline separated IDs
							const hideIds = event.hideElementIds
								.split(/[,\n]/)
								.map(id => id.trim())
								.filter(id => id.length > 0);

							console.log(`🔄 Attempting to hide elements:`, hideIds);

							hideIds.forEach(id => {
								try {
									// First, try to set the component's hidden prop to true
									let nodeIdToHide = id;
									const nodes = query.getNodes();

									// Check if this is a custom ID that maps to a node ID
									const nodeWithCustomId = Object.keys(nodes).find(nodeId => {
										const node = nodes[nodeId];
										return node.data.custom?.customId === id;
									});

									if (nodeWithCustomId) {
										nodeIdToHide = nodeWithCustomId;
									}

									// Try to set the hidden prop on the component
									try {
										const node = query.node(nodeIdToHide).get();
										if (node) {
											// Set the hidden prop to true
											actions.setProp(nodeIdToHide, (props: any) => {
												props.hidden = true;
											});
											console.log(`✅ Set hidden prop to true for element: ${id}`);
											return; // If we successfully set the prop, we don't need to manipulate CSS
										}
									} catch (propError) {
										console.log(`⚠️ Could not set hidden prop for ${id}, falling back to CSS manipulation`);
									}

									// Fallback: CSS manipulation (for cases where prop setting doesn't work)
									const domElement = getDOMElement(id, query);
									if (domElement) {
										// Verify the element is actually in the DOM
										if (!document.contains(domElement)) {
											console.warn(`⚠️ Element found but not in DOM: ${id}`);
											debugToggleElement(id, query);
											return;
										}

										// Store original display value before hiding
										if (!domElement.dataset.originalDisplay) {
											const computedStyle = window.getComputedStyle(domElement);
											domElement.dataset.originalDisplay = computedStyle.display;
											console.log(`📝 Stored original display for ${id}: ${computedStyle.display}`);
										}

										// Apply hide style with multiple approaches
										console.log(`🎯 Before hiding - display: ${domElement.style.display}, computed: ${window.getComputedStyle(domElement).display}`);

										// Method 1: Direct style property
										domElement.style.display = 'none';

										// Method 2: setProperty with important
										domElement.style.setProperty('display', 'none', 'important');

										// Method 3: Add a CSS class for hiding
										domElement.classList.add('craft-toggle-hidden');

										// Method 4: Set multiple hiding properties
										domElement.style.setProperty('visibility', 'hidden', 'important');
										domElement.style.setProperty('opacity', '0', 'important');

										// Force a reflow to ensure styles are applied
										domElement.offsetHeight;

										// Verify the style was applied
										const appliedStyle = window.getComputedStyle(domElement).display;
										const appliedVisibility = window.getComputedStyle(domElement).visibility;
										const appliedOpacity = window.getComputedStyle(domElement).opacity;

										console.log(`🎯 After hiding - display: ${appliedStyle}, visibility: ${appliedVisibility}, opacity: ${appliedOpacity}`);

										if (appliedStyle === 'none' || appliedVisibility === 'hidden' || appliedOpacity === '0') {
											console.log(`✅ Successfully hidden element: ${id}`);
										} else {
											console.warn(`⚠️ Element may still be visible: ${id}`);
											console.log(`🔍 Element classes:`, domElement.className);
											console.log(`� Element inline styles:`, domElement.style.cssText);
										}
									} else {
										console.warn(`❌ Could not find element to hide: ${id}`);
										// Run debug helper for troubleshooting
										debugToggleElement(id, query);
									}
								} catch (error) {
									console.error(`Failed to hide element with id: ${id}`, error);
									debugToggleElement(id, query);
								}
							});
						}
						if (event.showElementIds) {
							// Support both comma and newline separated IDs
							const showIds = event.showElementIds
								.split(/[,\n]/)
								.map(id => id.trim())
								.filter(id => id.length > 0);

							console.log(`🔄 Attempting to show elements:`, showIds);

							showIds.forEach(id => {
								try {
									// First, try to set the component's hidden prop to false
									let nodeIdToShow = id;
									const nodes = query.getNodes();

									// Check if this is a custom ID that maps to a node ID
									const nodeWithCustomId = Object.keys(nodes).find(nodeId => {
										const node = nodes[nodeId];
										return node.data.custom?.customId === id;
									});

									if (nodeWithCustomId) {
										nodeIdToShow = nodeWithCustomId;
									}

									// Try to set the hidden prop on the component
									try {
										const node = query.node(nodeIdToShow).get();
										if (node) {
											// Set the hidden prop to false
											actions.setProp(nodeIdToShow, (props: any) => {
												props.hidden = false;
											});
											console.log(`✅ Set hidden prop to false for element: ${id}`);
											return; // If we successfully set the prop, we don't need to manipulate CSS
										}
									} catch (propError) {
										console.log(`⚠️ Could not set hidden prop for ${id}, falling back to CSS manipulation`);
									}

									// Fallback: CSS manipulation (for cases where prop setting doesn't work)
									const domElement = getDOMElement(id, query);
									if (domElement) {
										// Verify the element is actually in the DOM
										if (!document.contains(domElement)) {
											console.warn(`⚠️ Element found but not in DOM: ${id}`);
											debugToggleElement(id, query);
											return;
										}

										// Restore original display value or use 'block' as fallback
										const originalDisplay = domElement.dataset.originalDisplay || 'block';

										console.log(`🎯 Before showing - display: ${domElement.style.display}, computed: ${window.getComputedStyle(domElement).display}`);

										// Method 1: Remove the hiding CSS class
										domElement.classList.remove('craft-toggle-hidden');

										// Method 2: Remove all hiding styles
										domElement.style.removeProperty('display');
										domElement.style.removeProperty('visibility');
										domElement.style.removeProperty('opacity');
										domElement.style.removeProperty('pointer-events');

										// Method 3: Set the original display value
										domElement.style.setProperty('display', originalDisplay, 'important');
										domElement.style.setProperty('visibility', 'visible', 'important');
										domElement.style.setProperty('opacity', '1', 'important');

										// Force a reflow to ensure styles are applied
										domElement.offsetHeight;

										// Verify the style was applied
										const appliedStyle = window.getComputedStyle(domElement).display;
										const appliedVisibility = window.getComputedStyle(domElement).visibility;
										const appliedOpacity = window.getComputedStyle(domElement).opacity;

										console.log(`🎯 After showing - display: ${appliedStyle}, visibility: ${appliedVisibility}, opacity: ${appliedOpacity}`);

										if (appliedStyle !== 'none' && appliedVisibility !== 'hidden' && appliedOpacity !== '0') {
											console.log(`✅ Successfully shown element: ${id}`);
										} else {
											console.warn(`⚠️ Element may still be hidden: ${id}`);
											console.log(`🔍 Element classes:`, domElement.className);
											console.log(`� Element inline styles:`, domElement.style.cssText);
										}
									} else {
										console.warn(`❌ Could not find element to show: ${id}`);
										// Run debug helper for troubleshooting
										debugToggleElement(id, query);
									}
								} catch (error) {
									console.error(`Failed to show element with id: ${id}`, error);
									debugToggleElement(id, query);
								}
							});
						}
						break;

					case 'copy-clipboard':
						if (event.copyElementId) {
							try {
								const domElement = getDOMElement(event.copyElementId, query);
								if (domElement) {
									const textToCopy = domElement.textContent || event.defaultValue || '';
									navigator.clipboard.writeText(textToCopy).then(() => {
									}).catch(err => {
										console.error('Failed to copy text: ', err);
									});
								} else {
									console.warn(`❌ Could not find element to copy: ${event.copyElementId}`);
									// Fallback to default value if element not found
									if (event.defaultValue) {
										navigator.clipboard.writeText(event.defaultValue).then(() => {
										}).catch(err => {
											console.error('Failed to copy text: ', err);
										});
									}
								}
							} catch (error) {
								console.error(`Failed to find element with id: ${event.copyElementId}`, error);
								// Fallback to default value if element not found
								if (event.defaultValue) {
									navigator.clipboard.writeText(event.defaultValue).then(() => {
									}).catch(err => {
										console.error('Failed to copy text: ', err);
									});
								}
							}
						} else if (event.defaultValue) {
							navigator.clipboard.writeText(event.defaultValue).then(() => {
							}).catch(err => {
								console.error('Failed to copy text: ', err);
							});
						}
						break;

					case 'email':
						if (event.email) {
							window.open(`mailto:${event.email}`, '_self');
						}
						break;

					case 'open-popup':
						if (event.popupId) {
							openPopup(event.popupId);
						}
						break;

					case 'open-dropbox':
						if (event.dropboxId) {
							openDropbox(event.dropboxId, event.dropboxPosition || 'bottom-center', event.dropboxDistance || 10, nodeId);
						}
						break;

					case 'open-lightbox':
						if (event.lightboxMediaType) {
							openLightBox(event);
						}
						break;

					case 'open-album-modal':
						if (event.albumModalId) {
							openPopup(event.albumModalId);
						}
						break;

					default:
						break;
				}
			} catch (error) {
				console.error(`Error executing event ${event.id}:`, error);
			}
		});
	}, [enabled, events, eventsByActionType, query, openPopup, openDropbox, openLightBox, nodeId]);

	// Memoized event handlers for better performance
	const handleClick = useCallback(() => handleEvent('click'), [handleEvent]);
	const handleFirstClick = useCallback(() => handleEvent('first-click'), [handleEvent]);
	const handleSecondClick = useCallback(() => handleEvent('second-click'), [handleEvent]);
	const handleHover = useCallback(() => handleEvent('hover'), [handleEvent]);
	const handleSubmit = useCallback(() => handleEvent('submit'), [handleEvent]);

	const handleContainerClick = useCallback(() => {
		setClickCount(prev => prev + 1);

		if (clickTimeoutRef.current) {
			clearTimeout(clickTimeoutRef.current);
		}

		clickTimeoutRef.current = window.setTimeout(() => {
			if (clickCount === 0) {
				handleFirstClick();
			} else if (clickCount === 1) {
				handleSecondClick();
			}
			handleClick();
			setClickCount(0);
		}, 300);
	}, [clickCount, handleFirstClick, handleSecondClick, handleClick]);

	// Memoized dropbox events for hover management
	const dropboxHoverEvents = useMemo(() =>
		events.filter(event =>
			event.actionType === 'hover' &&
			event.eventType === 'open-dropbox' &&
			event.dropboxId
		), [events]);

	// Optimized hover management for trigger elements
	const handleTriggerMouseEnter = useCallback(() => {
		if (enabled || !nodeId) return;

		// Set hover state for all dropboxes this element can trigger
		dropboxHoverEvents.forEach(event => {
			if (event.dropboxId) {
				setDropboxHoverState(nodeId, true);
				cancelDropboxClose(event.dropboxId);
			}
		});

		// Trigger hover events
		handleHover();
	}, [enabled, nodeId, dropboxHoverEvents, setDropboxHoverState, cancelDropboxClose, handleHover]);

	const handleTriggerMouseLeave = useCallback(() => {
		if (enabled || !nodeId) return;

		// Set hover state for all dropboxes this element can trigger
		dropboxHoverEvents.forEach(event => {
			if (event.dropboxId) {
				setDropboxHoverState(nodeId, false);
				scheduleDropboxClose(event.dropboxId);
			}
		});
	}, [enabled, nodeId, dropboxHoverEvents, setDropboxHoverState, scheduleDropboxClose]);

	return {
		handleClick,
		handleFirstClick,
		handleSecondClick,
		handleHover,
		handleSubmit,
		handleContainerClick,
		handleTriggerMouseEnter,
		handleTriggerMouseLeave
	};
};

// Enhanced EventManager component with performance optimizations and error handling
export const EventManager: React.FC<EventManagerProps> = React.memo(({
	events,
	onEventsChange,
}) => {
	const { query } = useEditor((state) => ({
		nodes: state.nodes, // Subscribe to nodes state to detect changes
	}));
	const { showFileSelectModal } = useViewport();

	const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
	const [availableSections, setAvailableSections] = useState<AvailableComponent[]>([]);
	const [availablePopups, setAvailablePopups] = useState<AvailableComponent[]>([]);
	const [availableDropboxes, setAvailableDropboxes] = useState<AvailableComponent[]>([]);
	const [availableAlbumModals, setAvailableAlbumModals] = useState<AvailableComponent[]>([]);

	// Helper function to get display ID (custom ID if available, otherwise node ID)
	const getDisplayId = useCallback((nodeId: string, node: any): string => {
		return node.data.custom?.customId || nodeId;
	}, []);

	// Helper function to get display name for components
	const getDisplayName = useCallback((nodeId: string, node: any, componentType: string): string => {
		const displayId = getDisplayId(nodeId, node);
		// If it's a custom ID, show it clearly, otherwise show truncated node ID
		if (node.data.custom?.customId) {
			return `${componentType} - ${displayId}`;
		} else {
			return `${componentType} - ${displayId.substring(0, 8)}...`;
		}
	}, [getDisplayId]);

	// Memoized functions for getting available components with error handling
	const getAvailableSections = useCallback((): AvailableComponent[] => {
		try {
			const nodes = query.getNodes();
			return Object.keys(nodes)
				.filter(nodeId => {
					try {
						const node = nodes[nodeId];
						return node.data.displayName === 'Sections' ||
							(node.data.custom && node.data.custom.displayName === 'Sections');
					} catch (error) {
						console.warn(`Error checking node ${nodeId}:`, error);
						return false;
					}
				})
				.map(nodeId => {
					const node = nodes[nodeId];
					return {
						id: getDisplayId(nodeId, node),
						name: getDisplayName(nodeId, node, 'Section')
					};
				});
		} catch (error) {
			console.error('Error getting available sections:', error);
			return [];
		}
	}, [query, getDisplayId, getDisplayName]);

	const getAvailablePopups = useCallback((): AvailableComponent[] => {
		try {
			const nodes = query.getNodes();
			return Object.keys(nodes)
				.filter(nodeId => {
					try {
						const node = nodes[nodeId];
						return node.data.displayName === 'Popup' ||
							(node.data.custom && node.data.custom.displayName === 'Popup');
					} catch (error) {
						console.warn(`Error checking node ${nodeId}:`, error);
						return false;
					}
				})
				.map(nodeId => {
					const node = nodes[nodeId];
					return {
						id: getDisplayId(nodeId, node),
						name: getDisplayName(nodeId, node, 'Popup')
					};
				});
		} catch (error) {
			console.error('Error getting available popups:', error);
			return [];
		}
	}, [query, getDisplayId, getDisplayName]);

	const getAvailableDropboxes = useCallback((): AvailableComponent[] => {
		try {
			const nodes = query.getNodes();
			return Object.keys(nodes)
				.filter(nodeId => {
					try {
						const node = nodes[nodeId];
						return node.data.displayName === 'Dropbox' ||
							(node.data.custom && node.data.custom.displayName === 'Dropbox');
					} catch (error) {
						console.warn(`Error checking node ${nodeId}:`, error);
						return false;
					}
				})
				.map(nodeId => {
					const node = nodes[nodeId];
					return {
						id: getDisplayId(nodeId, node),
						name: getDisplayName(nodeId, node, 'Dropbox')
					};
				});
		} catch (error) {
			console.error('Error getting available dropboxes:', error);
			return [];
		}
	}, [query, getDisplayId, getDisplayName]);

	const getAvailableAlbumModals = useCallback((): AvailableComponent[] => {
		try {
			const nodes = query.getNodes();
			return Object.keys(nodes)
				.filter(nodeId => {
					try {
						const node = nodes[nodeId];
						return node && node.data && node.data.displayName === 'Album Modal';
					} catch (error) {
						console.warn(`Error checking node ${nodeId}:`, error);
						return false;
					}
				})
				.map(nodeId => {
					const node = nodes[nodeId];
					return {
						id: nodeId,
						name: getDisplayName(nodeId, node, 'Album Modal')
					};
				});
		} catch (error) {
			console.error('Error getting available album modals:', error);
			return [];
		}
	}, [query, getDisplayId, getDisplayName]);

	// Optimized effect for updating available components
	// This will now trigger whenever nodes state changes (including custom property changes)
	React.useEffect(() => {
		try {
			const sections = getAvailableSections();
			const popups = getAvailablePopups();
			const dropboxes = getAvailableDropboxes();
			const albumModals = getAvailableAlbumModals();
			setAvailableSections(sections);
			setAvailablePopups(popups);
			setAvailableDropboxes(dropboxes);
			setAvailableAlbumModals(albumModals);
		} catch (error) {
			console.error('Error updating available components:', error);
		}
	}, [getAvailableSections, getAvailablePopups, getAvailableDropboxes, getAvailableAlbumModals]);

	// Memoized event ID generator for better performance
	const generateEventId = useCallback(() =>
		`event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, []);

	// Optimized event management functions
	const addEvent = useCallback(() => {
		try {
			const newEvent: EventItem = {
				id: generateEventId(),
				actionType: 'click',
				eventType: 'none'
			};
			onEventsChange([...events, newEvent]);
			setExpandedEvent(newEvent.id);
		} catch (error) {
			console.error('Error adding event:', error);
		}
	}, [events, onEventsChange, generateEventId]);

	const removeEvent = useCallback((eventId: string) => {
		try {
			onEventsChange(events.filter(event => event.id !== eventId));
			if (expandedEvent === eventId) {
				setExpandedEvent(null);
			}
		} catch (error) {
			console.error('Error removing event:', error);
		}
	}, [events, onEventsChange, expandedEvent]);

	const updateEvent = useCallback((eventId: string, updates: Partial<EventItem>) => {
		try {
			onEventsChange(events.map(event =>
				event.id === eventId ? { ...event, ...updates } : event
			));
		} catch (error) {
			console.error('Error updating event:', error);
		}
	}, [events, onEventsChange]);

	const toggleEventExpansion = useCallback((eventId: string) => {
		setExpandedEvent(expandedEvent === eventId ? null : eventId);
	}, [expandedEvent]);

	// Memoized utility functions for better performance
	const getActionTypeLabel = useCallback((actionType: ActionType) => {
		return actionTypeOptions.find(option => option.value === actionType)?.label || actionType;
	}, []);

	const getEventTypeLabel = useCallback((eventType: EventType) => {
		return eventTypeOptions.find(option => option.value === eventType)?.label || eventType;
	}, []);

	// Type-safe update event function with proper type casting
	const updateEventWithTypeCheck = useCallback((eventId: string, updates: Partial<EventItem>) => {
		try {
			// Type-safe handling for dropbox position
			if (updates.dropboxPosition && !isValidDropboxPosition(updates.dropboxPosition)) {
				console.warn(`Invalid dropbox position: ${updates.dropboxPosition}`);
				updates.dropboxPosition = 'bottom-center';
			}

			// Type-safe handling for action type
			if (updates.actionType && !isValidActionType(updates.actionType)) {
				console.warn(`Invalid action type: ${updates.actionType}`);
				updates.actionType = 'click';
			}

			// Type-safe handling for event type
			if (updates.eventType && !isValidEventType(updates.eventType)) {
				console.warn(`Invalid event type: ${updates.eventType}`);
				updates.eventType = 'none';
			}

			updateEvent(eventId, updates);
		} catch (error) {
			console.error('Error updating event with type check:', error);
		}
	}, [updateEvent]);

	// Render event configuration based on type
	const renderEventConfiguration = (event: EventItem) => {
		switch (event.eventType) {
			case 'navigate-section':
				return (
					<Box>
						<Text fontSize="xs" mb={2}>Chọn Section:</Text>
						<Select.Root
							value={event.sectionId ? [event.sectionId] : []}
							onValueChange={(details) => updateEvent(event.id, { sectionId: details.value[0] })}
							collection={createListCollection({
								items: availableSections.map(section => ({
									label: section.name,
									value: section.id
								}))
							})}
						>
							<Select.Control>
								<Select.Trigger>
									<Select.ValueText placeholder="Chọn section" />
								</Select.Trigger>
							</Select.Control>
							<Select.Content>
								{availableSections.map(section => (
									<Select.Item key={section.id} item={section.id}>
										<Select.ItemText>{section.name}</Select.ItemText>
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
					</Box>
				);

			case 'call':
				return (
					<Box>
						<Text fontSize="xs" mb={2}>Số điện thoại:</Text>
						<Input
							size="sm"
							value={event.phoneNumber || ''}
							onChange={(e) => updateEvent(event.id, { phoneNumber: e.target.value })}
							placeholder="0123456789"
						/>
					</Box>
				);

			case 'link':
				return (
					<Stack gap={3}>
						<Box>
							<Text fontSize="xs" mb={2}>Liên kết:</Text>
							<Input
								size="sm"
								value={event.url || ''}
								onChange={(e) => updateEvent(event.id, { url: e.target.value })}
								placeholder="https://example.com"
							/>
						</Box>
						<Box>
							<Text fontSize="xs" mb={2}>Tuỳ chọn mở:</Text>
							<Select.Root
								value={event.openInNewTab ? ['new-tab'] : ['current']}
								onValueChange={(details) => updateEvent(event.id, { openInNewTab: details.value[0] === 'new-tab' })}
								collection={createListCollection({
									items: [
										{ label: 'Trang hiện tại', value: 'current' },
										{ label: 'Cửa sổ mới', value: 'new-tab' }
									]
								})}
							>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText />
									</Select.Trigger>
								</Select.Control>
								<Select.Content>
									<Select.Item item="current">
										<Select.ItemText>Trang hiện tại</Select.ItemText>
									</Select.Item>
									<Select.Item item="new-tab">
										<Select.ItemText>Cửa sổ mới</Select.ItemText>
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</Box>
					</Stack>
				);

			case 'toggle-element':
				return (
					<Stack gap={3}>
						<Box>
							<Text fontSize="xs" mb={2}>ID phần tử để ẩn (mỗi ID một dòng hoặc cách nhau bằng dấu phẩy):</Text>
							<Textarea
								size="sm"
								value={event.hideElementIds || ''}
								onChange={(e) => updateEvent(event.id, { hideElementIds: e.target.value })}
								placeholder="element-id-1&#10;element-id-2&#10;hoặc: element-id-1, element-id-2"
								rows={3}
							/>
						</Box>
						<Box>
							<Text fontSize="xs" mb={2}>ID phần tử để hiện (mỗi ID một dòng hoặc cách nhau bằng dấu phẩy):</Text>
							<Textarea
								size="sm"
								value={event.showElementIds || ''}
								onChange={(e) => updateEvent(event.id, { showElementIds: e.target.value })}
								placeholder="element-id-3&#10;element-id-4&#10;hoặc: element-id-3, element-id-4"
								rows={3}
							/>
						</Box>
					</Stack>
				);

			case 'copy-clipboard':
				return (
					<Stack gap={3}>
						<Box>
							<Text fontSize="xs" mb={2}>ID phần tử để copy:</Text>
							<Input
								size="sm"
								value={event.copyElementId || ''}
								onChange={(e) => updateEvent(event.id, { copyElementId: e.target.value })}
								placeholder="element-id"
							/>
						</Box>
						<Box>
							<Text fontSize="xs" mb={2}>Giá trị mặc định:</Text>
							<Input
								size="sm"
								value={event.defaultValue || ''}
								onChange={(e) => updateEvent(event.id, { defaultValue: e.target.value })}
								placeholder="Văn bản mặc định để copy"
							/>
						</Box>
					</Stack>
				);

			case 'email':
				return (
					<Box>
						<Text fontSize="xs" mb={2}>Địa chỉ email:</Text>
						<Input
							size="sm"
							value={event.email || ''}
							onChange={(e) => updateEvent(event.id, { email: e.target.value })}
							placeholder="example@email.com"
						/>
					</Box>
				);

			case 'open-popup':
				return (
					<Box>
						<Text fontSize="xs" mb={2}>Chọn Popup:</Text>
						{availablePopups.length > 0 ? (
							<Select.Root
								value={event.popupId ? [event.popupId] : []}
								onValueChange={(details) => updateEvent(event.id, { popupId: details.value[0] })}
								collection={createListCollection({
									items: availablePopups.map(popup => ({
										label: popup.name,
										value: popup.id
									}))
								})}
							>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Chọn popup" />
									</Select.Trigger>
								</Select.Control>
								<Select.Content>
									{availablePopups.map(popup => (
										<Select.Item key={popup.id} item={popup.id}>
											<Select.ItemText>{popup.name}</Select.ItemText>
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						) : (
							<Box p={2} bg="gray.50" borderRadius="md">
								<Text fontSize="xs" color="gray.500">
									Chưa có popup nào. Tạo popup trước để sử dụng.
								</Text>
							</Box>
						)}
					</Box>
				);

			case 'open-dropbox':
				const dropboxPositionOptions = [
					{ value: 'top-left', label: 'Trên cùng trái' },
					{ value: 'top-center', label: 'Trên cùng giữa' },
					{ value: 'top-right', label: 'Trên cùng phải' },
					{ value: 'bottom-left', label: 'Dưới cùng trái' },
					{ value: 'bottom-center', label: 'Dưới cùng giữa' },
					{ value: 'bottom-right', label: 'Dưới cùng phải' },
					{ value: 'left-top', label: 'Trái trên' },
					{ value: 'left-center', label: 'Trái giữa' },
					{ value: 'left-bottom', label: 'Trái dưới' },
					{ value: 'right-top', label: 'Phải trên' },
					{ value: 'right-center', label: 'Phải giữa' },
					{ value: 'right-bottom', label: 'Phải dưới' },
				];

				return (
					<Stack gap={3}>
						<Box>
							<Text fontSize="xs" mb={2}>Chọn Dropbox:</Text>
							{availableDropboxes.length > 0 ? (
								<Select.Root
									value={event.dropboxId ? [event.dropboxId] : []}
									onValueChange={(details) => updateEvent(event.id, { dropboxId: details.value[0] })}
									collection={createListCollection({
										items: availableDropboxes.map(dropbox => ({
											label: dropbox.name,
											value: dropbox.id
										}))
									})}
								>
									<Select.Control>
										<Select.Trigger>
											<Select.ValueText placeholder="Chọn dropbox" />
										</Select.Trigger>
									</Select.Control>
									<Select.Content>
										{availableDropboxes.map(dropbox => (
											<Select.Item key={dropbox.id} item={dropbox.id}>
												<Select.ItemText>{dropbox.name}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							) : (
								<Box p={2} bg="gray.50" borderRadius="md">
									<Text fontSize="xs" color="gray.500">
										Chưa có dropbox nào. Tạo dropbox trước để sử dụng.
									</Text>
								</Box>
							)}
						</Box>
						<Box>
							<Text fontSize="xs" mb={2}>Vị trí:</Text>
							<Select.Root
								value={event.dropboxPosition ? [event.dropboxPosition] : ['bottom-center']}
								onValueChange={(details) => updateEventWithTypeCheck(event.id, { dropboxPosition: details.value[0] as DropboxPosition })}
								collection={createListCollection({
									items: dropboxPositionOptions
								})}
							>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText />
									</Select.Trigger>
								</Select.Control>
								<Select.Content>
									{dropboxPositionOptions.map(option => (
										<Select.Item key={option.value} item={option.value}>
											<Select.ItemText>{option.label}</Select.ItemText>
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</Box>
						<Box>
							<Text fontSize="xs" mb={2}>Khoảng cách (px):</Text>
							<Input
								size="sm"
								type="number"
								value={event.dropboxDistance || 10}
								onChange={(e) => updateEvent(event.id, { dropboxDistance: parseInt(e.target.value) || 10 })}
								min={0}
								max={100}
							/>
						</Box>
					</Stack>
				);

			case 'open-lightbox':
				return (
					<Stack gap={3}>
						<Box>
							<Text fontSize="xs" mb={2}>Kiểu:</Text>
							<Select.Root
								value={event.lightboxMediaType ? [event.lightboxMediaType] : []}
								onValueChange={(details) => updateEvent(event.id, {
									lightboxMediaType: details.value[0] as 'image' | 'video',
									// Reset media-specific data when changing type
									lightboxImageUrl: undefined,
									lightboxVideoType: undefined,
									lightboxVideoUrl: undefined
								})}
								collection={createListCollection({
									items: [
										{ label: 'Hình ảnh', value: 'image' },
										{ label: 'Video', value: 'video' }
									]
								})}
							>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Chọn loại media" />
									</Select.Trigger>
								</Select.Control>
								<Select.Content>
									<Select.Item item="image">
										<Select.ItemText>Hình ảnh</Select.ItemText>
									</Select.Item>
									<Select.Item item="video">
										<Select.ItemText>Video</Select.ItemText>
									</Select.Item>
								</Select.Content>
							</Select.Root>
						</Box>

						{event.lightboxMediaType === 'image' && (
							<Box>
								<Text fontSize="xs" mb={2}>Hình ảnh:</Text>
								<Stack gap={2}>
									<HStack gap={2}>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												try {
													showFileSelectModal(FileType.IMAGE, (fileUrl: string) => {
														if (fileUrl) {
															updateEventWithTypeCheck(event.id, { lightboxImageUrl: fileUrl });
														}
													});
												} catch (error) {
													console.error('Error opening file select modal:', error);
												}
											}}
										>
											{event.lightboxImageUrl ? 'Thay đổi hình ảnh' : 'Chọn từ thư viện'}
										</Button>
									</HStack>
									<Box>
										<Text fontSize="xs" mb={1}>Hoặc dán URL hình ảnh:</Text>
										<Input
											size="sm"
											value={event.lightboxImageUrl || ''}
											onChange={(e) => updateEventWithTypeCheck(event.id, { lightboxImageUrl: e.target.value })}
											placeholder="https://example.com/image.jpg"
										/>
									</Box>
									{event.lightboxImageUrl && (
										<Box>
											<img
												src={event.lightboxImageUrl}
												alt="Preview"
												style={{
													maxWidth: '100px',
													maxHeight: '60px',
													objectFit: 'cover',
													borderRadius: '4px',
													border: '1px solid #e0e0e0'
												}}
												onError={(e) => {
													console.warn('Failed to load image preview:', event.lightboxImageUrl);
													e.currentTarget.style.display = 'none';
												}}
											/>
											<HStack mt={1} gap={2}>
												<Button
													size="xs"
													variant="ghost"
													colorScheme="red"
													onClick={() => {
														updateEventWithTypeCheck(event.id, { lightboxImageUrl: undefined });
													}}
												>
													Xóa
												</Button>
												<Text
													fontSize="xs"
													color="gray.500"
													flex={1}
													style={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}
												>
													{event.lightboxImageUrl.includes('/') ? event.lightboxImageUrl.split('/').pop() : event.lightboxImageUrl}
												</Text>
											</HStack>
										</Box>
									)}
								</Stack>
							</Box>
						)}

						{event.lightboxMediaType === 'video' && (
							<Stack gap={3}>
								<Box>
									<Text fontSize="xs" mb={2}>Loại video:</Text>
									<Select.Root
										value={event.lightboxVideoType ? [event.lightboxVideoType] : []}
										onValueChange={(details) => updateEvent(event.id, {
											lightboxVideoType: details.value[0] as 'youtube' | 'meHappyVideo',
											lightboxVideoUrl: undefined
										})}
										collection={createListCollection({
											items: [
												{ label: 'Youtube', value: 'youtube' },
												{ label: 'meHappyVideo', value: 'meHappyVideo' }
											]
										})}
									>
										<Select.Control>
											<Select.Trigger>
												<Select.ValueText placeholder="Chọn loại video" />
											</Select.Trigger>
										</Select.Control>
										<Select.Content>
											<Select.Item item="youtube">
												<Select.ItemText>Youtube</Select.ItemText>
											</Select.Item>
											<Select.Item item="meHappyVideo">
												<Select.ItemText>meHappyVideo</Select.ItemText>
											</Select.Item>
										</Select.Content>
									</Select.Root>
								</Box>
								{event.lightboxVideoType && (
									<Box>
										<Text fontSize="xs" mb={2}>
											{event.lightboxVideoType === 'youtube' ? 'URL Youtube:' : 'Video:'}
										</Text>
										<Stack gap={2}>
											{event.lightboxVideoType === 'meHappyVideo' && (
												<HStack gap={2}>
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															try {
																showFileSelectModal(FileType.VIDEO, (fileUrl: string) => {
																	if (fileUrl) {
																		updateEvent(event.id, { lightboxVideoUrl: fileUrl });
																	}
																});
															} catch (error) {
																console.error('Error opening file select modal:', error);
															}
														}}
													>
														{event.lightboxVideoUrl ? 'Thay đổi video' : 'Chọn từ thư viện'}
													</Button>
												</HStack>
											)}
											<Box>
												<Text fontSize="xs" mb={1}>
													{event.lightboxVideoType === 'youtube' ? 'URL Youtube:' : 'Hoặc dán URL video:'}
												</Text>
												<Input
													size="sm"
													value={event.lightboxVideoUrl || ''}
													onChange={(e) => updateEvent(event.id, { lightboxVideoUrl: e.target.value })}
													placeholder={event.lightboxVideoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/video.mp4'}
												/>
											</Box>
											{event.lightboxVideoUrl && (
												<HStack gap={2}>
													<Button
														size="xs"
														variant="ghost"
														colorScheme="red"
														onClick={() => {
															updateEvent(event.id, { lightboxVideoUrl: undefined });
														}}
													>
														Xóa
													</Button>
													<Text
														fontSize="xs"
														color="gray.500"
														flex={1}
														style={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap'
														}}
													>
														{event.lightboxVideoUrl.includes('/') ? event.lightboxVideoUrl.split('/').pop() : event.lightboxVideoUrl}
													</Text>
												</HStack>
											)}
										</Stack>
									</Box>
								)}
							</Stack>
						)}
					</Stack>
				);

			case 'open-album-modal':
				return (
					<Box>
						<Text fontSize="xs" mb={2}>Chọn Album Modal:</Text>
						{availableAlbumModals.length > 0 ? (
							<Select.Root
								value={event.albumModalId ? [event.albumModalId] : []}
								onValueChange={(details) => updateEvent(event.id, { albumModalId: details.value[0] })}
								collection={createListCollection({
									items: availableAlbumModals.map(modal => ({
										label: modal.name,
										value: modal.id
									}))
								})}
							>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Chọn Album Modal" />
									</Select.Trigger>
								</Select.Control>
								<Select.Content>
									{availableAlbumModals.map(modal => (
										<Select.Item key={modal.id} item={modal.id}>
											<Select.ItemText>{modal.name}</Select.ItemText>
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						) : (
							<Box>
								<Text fontSize="xs" color="gray.500" mb={2}>
									Không có Album Modal nào. Hãy thêm Album Modal vào trang trước.
								</Text>
							</Box>
						)}
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Stack gap={4}>
			{/* Header with Add Button */}
			<HStack justifyContent="space-between" alignItems="center">
				<Text fontSize="sm" fontWeight="bold">Sự kiện</Text>
				<Button
					size="xs"
					onClick={addEvent}
					colorScheme="blue"
					variant="outline"
				>
					Thêm sự kiện
				</Button>
			</HStack>

			{/* Events List */}
			{events.length === 0 ? (
				<Box
					p={4}
					textAlign="center"
					border="1px dashed"
					borderColor="gray.300"
					borderRadius="md"
					color="gray.500"
				>
					<Text fontSize="sm">Chưa có sự kiện nào. Nhấn "Thêm sự kiện" để bắt đầu.</Text>
				</Box>
			) : (
				<VStack gap={2} align="stretch">
					{events.map((event) => (
						<Box
							key={event.id}
							border="1px solid"
							borderColor="gray.200"
							borderRadius="md"
							overflow="hidden"
						>
							{/* Event Header */}
							<HStack
								p={3}
								bg="gray.50"
								justifyContent="space-between"
								cursor="pointer"
								onClick={() => toggleEventExpansion(event.id)}
								_hover={{ bg: 'gray.100' }}
							>
								<HStack gap={2}>
									{expandedEvent === event.id ? <FiChevronDown /> : <FiChevronRight />}
									<Text fontSize="sm" fontWeight="medium">
										{getActionTypeLabel(event.actionType)} → {getEventTypeLabel(event.eventType)}
									</Text>
								</HStack>
								<Button
									size="xs"
									variant="ghost"
									colorScheme="red"
									onClick={(e) => {
										e.stopPropagation();
										removeEvent(event.id);
									}}
								>
									<FiTrash2 />
								</Button>
							</HStack>

							{/* Event Configuration */}
							{expandedEvent === event.id && (
								<Box p={4} borderTop="1px solid" borderColor="gray.200">
									<Stack gap={4}>
										{/* Action Type Selection */}
										<Box>
											<Text fontSize="xs" mb={2}>Hành động:</Text>
											<Select.Root
												value={[event.actionType]}
												onValueChange={(details) => updateEvent(event.id, { actionType: details.value[0] as any })}
												collection={createListCollection({
													items: actionTypeOptions
												})}
											>
												<Select.Control>
													<Select.Trigger>
														<Select.ValueText />
													</Select.Trigger>
												</Select.Control>
												<Select.Content>
													{actionTypeOptions.map(option => (
														<Select.Item key={option.value} item={option.value}>
															<Select.ItemText>{option.label}</Select.ItemText>
														</Select.Item>
													))}
												</Select.Content>
											</Select.Root>
										</Box>

										{/* Event Type Selection */}
										<Box>
											<Text fontSize="xs" mb={2}>Sự kiện:</Text>
											<Select.Root
												value={[event.eventType]}
												onValueChange={(details) => updateEvent(event.id, {
													eventType: details.value[0] as any,
													// Reset event-specific data when changing type
													sectionId: undefined,
													phoneNumber: undefined,
													url: undefined,
													openInNewTab: undefined,
													hideElementIds: undefined,
													showElementIds: undefined,
													copyElementId: undefined,
													defaultValue: undefined,
													email: undefined,
													popupId: undefined,
													dropboxId: undefined,
													dropboxPosition: undefined,
													dropboxDistance: undefined,
													lightboxMediaType: undefined,
													lightboxImageUrl: undefined,
													lightboxVideoType: undefined,
													lightboxVideoUrl: undefined
												})}
												collection={createListCollection({
													items: eventTypeOptions
												})}
											>
												<Select.Control>
													<Select.Trigger>
														<Select.ValueText />
													</Select.Trigger>
												</Select.Control>
												<Select.Content>
													{eventTypeOptions.map(option => (
														<Select.Item key={option.value} item={option.value}>
															<Select.ItemText>{option.label}</Select.ItemText>
														</Select.Item>
													))}
												</Select.Content>
											</Select.Root>
										</Box>

										{/* Event-specific Configuration */}
										{event.eventType !== 'none' && renderEventConfiguration(event)}
									</Stack>
								</Box>
							)}
						</Box>
					))}
				</VStack>
			)}
		</Stack>
	);
});

// Add display name for better debugging and testing
EventManager.displayName = 'EventManager';

// Export utility functions for testing
export const EventManagerUtils = {
	isValidActionType,
	isValidEventType,
	isValidDropboxPosition,
	actionTypeOptions,
	eventTypeOptions,
	dropboxPositionOptions,
};

// Default props for better testing and documentation
export const defaultEventManagerProps: Partial<EventManagerProps> = {
	events: [],
	availableSections: [],
};

// Helper function for creating test events
export const createTestEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
	id: `test-event-${Date.now()}`,
	actionType: 'click',
	eventType: 'none',
	...overrides,
});

// Helper function for validating event configuration
export const validateEventConfiguration = (event: EventItem): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (!event.id) {
		errors.push('Event ID is required');
	}

	if (!isValidActionType(event.actionType)) {
		errors.push(`Invalid action type: ${event.actionType}`);
	}

	if (!isValidEventType(event.eventType)) {
		errors.push(`Invalid event type: ${event.eventType}`);
	}

	// Validate event-specific configurations
	switch (event.eventType) {
		case 'navigate-section':
			if (!event.sectionId) {
				errors.push('Section ID is required for navigate-section events');
			}
			break;
		case 'call':
			if (!event.phoneNumber) {
				errors.push('Phone number is required for call events');
			}
			break;
		case 'link':
			if (!event.url) {
				errors.push('URL is required for link events');
			}
			break;
		case 'email':
			if (!event.email) {
				errors.push('Email is required for email events');
			}
			break;
		case 'open-popup':
			if (!event.popupId) {
				errors.push('Popup ID is required for open-popup events');
			}
			break;
		case 'open-dropbox':
			if (!event.dropboxId) {
				errors.push('Dropbox ID is required for open-dropbox events');
			}
			if (event.dropboxPosition && !isValidDropboxPosition(event.dropboxPosition)) {
				errors.push(`Invalid dropbox position: ${event.dropboxPosition}`);
			}
			break;
		case 'open-lightbox':
			if (!event.lightboxMediaType) {
				errors.push('Lightbox media type is required for open-lightbox events');
			}
			if (event.lightboxMediaType === 'image' && !event.lightboxImageUrl) {
				errors.push('Image URL is required for image lightbox events');
			}
			if (event.lightboxMediaType === 'video' && (!event.lightboxVideoType || !event.lightboxVideoUrl)) {
				errors.push('Video type and URL are required for video lightbox events');
			}
			break;
		case 'open-album-modal':
			if (!event.albumModalId) {
				errors.push('Album Modal ID is required for open-album-modal events');
			}
			break;
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};