import {
	Box,
	Button,
	HStack,
	Input,
	Stack,
	Text,
	Select,
	createListCollection
} from '@chakra-ui/react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiTrash2, FiChevronDown, FiChevronRight, FiPlay } from 'react-icons/fi';
import { useEditor } from '@craftjs/core';
import { DraggableNumberInput } from './DraggableNumberInput';

// Types for animations
export interface DisplayAnimationItem {
	id: string;
	effect: string;
	duration: number; // seconds
	repeat: boolean;
}

export interface HoverAnimationSettings {
	enabled: boolean;
	borderColor?: string;
	opacity?: number;
	scale?: number;
	rotate?: number;
	blur?: number;
	grayscale?: number;
	textColor?: string;
	iconColor?: string;
	backgroundColor?: string;
}

interface AnimationManagerProps {
	displayAnimation: DisplayAnimationItem | null;
	onDisplayAnimationChange: (animation: DisplayAnimationItem | null) => void;
	hoverAnimation: HoverAnimationSettings;
	onHoverAnimationChange: (settings: HoverAnimationSettings) => void;
	hideHoverSection?: boolean;
}

// Animation effect options based on animate.css
const animationEffectOptions = [
	{ value: 'none', label: 'Không chọn' },
	// Attention Seekers
	{ value: 'bounce', label: 'Bounce' },
	{ value: 'flash', label: 'Flash' },
	{ value: 'pulse', label: 'Pulse' },
	{ value: 'rubberBand', label: 'Rubber Band' },
	{ value: 'shake', label: 'Shake' },
	{ value: 'swing', label: 'Swing' },
	{ value: 'tada', label: 'Tada' },
	{ value: 'wobble', label: 'Wobble' },
	// Bouncing Entrances
	{ value: 'bounceIn', label: 'Bounce In' },
	{ value: 'bounceInDown', label: 'Bounce In Down' },
	{ value: 'bounceInLeft', label: 'Bounce In Left' },
	{ value: 'bounceInRight', label: 'Bounce In Right' },
	{ value: 'bounceInUp', label: 'Bounce In Up' },
	// Fading Entrances
	{ value: 'fadeIn', label: 'Fade In' },
	{ value: 'fadeInDown', label: 'Fade In Down' },
	{ value: 'fadeInDownBig', label: 'Fade In Down Big' },
	{ value: 'fadeInLeft', label: 'Fade In Left' },
	{ value: 'fadeInLeftBig', label: 'Fade In Left Big' },
	{ value: 'fadeInRight', label: 'Fade In Right' },
	{ value: 'fadeInRightBig', label: 'Fade In Right Big' },
	{ value: 'fadeInUp', label: 'Fade In Up' },
	{ value: 'fadeInUpBig', label: 'Fade In Up Big' },
	// Flippers
	{ value: 'flip', label: 'Flip' },
	{ value: 'flipInX', label: 'Flip In X' },
	{ value: 'flipInY', label: 'Flip In Y' },
	// Lightspeed
	{ value: 'lightSpeedIn', label: 'Light Speed In' },
	// Rotating Entrances
	{ value: 'rotateIn', label: 'Rotate In' },
	{ value: 'rotateInDownLeft', label: 'Rotate In Down Left' },
	{ value: 'rotateInDownRight', label: 'Rotate In Down Right' },
	{ value: 'rotateInUpLeft', label: 'Rotate In Up Left' },
	{ value: 'rotateInUpRight', label: 'Rotate In Up Right' },
	// Sliding Entrances
	{ value: 'slideInUp', label: 'Slide In Up' },
	{ value: 'slideInDown', label: 'Slide In Down' },
	{ value: 'slideInLeft', label: 'Slide In Left' },
	{ value: 'slideInRight', label: 'Slide In Right' },
	// Specials
	{ value: 'hinge', label: 'Hinge' },
	{ value: 'rollIn', label: 'Roll In' }
];

// Hook for handling display animations
export const useDisplayAnimations = (animation: DisplayAnimationItem | null) => {
	// Get editor state to check if we're in edit mode
	const { enabled } = useEditor((state) => ({
		enabled: state.options.enabled,
	}));

	// Track applied animations to prevent re-triggering
	const appliedAnimationsRef = useRef<Map<HTMLElement, string>>(new Map());
	const animationTimeoutsRef = useRef<Map<HTMLElement, number>>(new Map());

	const applyAnimation = useCallback((element: HTMLElement) => {
		if (enabled) {
			return;
		}

		if (!animation || animation.effect === 'none') {

			clearAnimation(element);
			return;
		}

		// CRITICAL: Additional safety check - if element is currently animating, don't re-apply
		if (element.classList.contains('animate__animated') && !animation.repeat) {
			return;
		}

		// Create a unique key for this animation state
		const animationKey = `${animation.effect}-${animation.duration}-${animation.repeat}`;
		const lastAppliedKey = appliedAnimationsRef.current.get(element);

		// If the same animation is already applied and not repeating, don't re-apply
		if (lastAppliedKey === animationKey && !animation.repeat) {
			return;
		}


		// Clear any existing animations and timeouts first
		clearAnimation(element);
		const existingTimeout = animationTimeoutsRef.current.get(element);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
			animationTimeoutsRef.current.delete(element);
		}

		// Store the animation key to prevent re-application
		appliedAnimationsRef.current.set(element, animationKey);

		// Execute animation immediately (no delay)
		executeAnimation(element, animation);
	}, [enabled, animation]);

	const executeAnimation = (element: HTMLElement, animation: DisplayAnimationItem) => {
		// Remove initial hiding styles before starting animation
		removeInitialHidingStyles(element);

		// Add animate.css base class
		element.classList.add('animate__animated');

		// Set animation duration
		element.style.setProperty('--animate-duration', `${animation.duration}s`);

		// For repeat animations handled by JavaScript interval, always use single iteration
		// For non-repeat animations, also use single iteration
		element.style.setProperty('--animate-repeat', '1');

		// Force reflow to ensure classes are applied
		element.offsetHeight;

		// Add the specific animation class
		const animationClass = `animate__${animation.effect}`;
		element.classList.add(animationClass);

		// Always clean up after animation completion
		const cleanup = () => {
			// Clear animation classes
			const originalClasses = element.className.split(' ');
			const filteredClasses = originalClasses.filter(cls => !cls.startsWith('animate__'));
			element.className = filteredClasses.join(' ');

			// Remove CSS properties
			element.style.removeProperty('--animate-duration');
			element.style.removeProperty('--animate-repeat');
		};

		// Listen for animation end
		const handleAnimationEnd = (e: AnimationEvent) => {
			if (e.target === element) {
				cleanup();
				element.removeEventListener('animationend', handleAnimationEnd);
			}
		};

		element.addEventListener('animationend', handleAnimationEnd);

		// Fallback timeout in case animationend doesn't fire
		setTimeout(() => {
			cleanup();
		}, (animation.duration * 1000) + 500);
	};

	const clearAnimation = useCallback((element: HTMLElement) => {
		// Remove all animate.css classes
		const originalClasses = element.className.split(' ');
		const filteredClasses = originalClasses.filter(cls => !cls.startsWith('animate__'));
		element.className = filteredClasses.join(' ');

		// Remove CSS properties
		element.style.removeProperty('--animate-duration');
		element.style.removeProperty('--animate-repeat');

		// Remove initial hiding styles
		removeInitialHidingStyles(element);

		// Clear tracking data for this element
		appliedAnimationsRef.current.delete(element);
		const existingTimeout = animationTimeoutsRef.current.get(element);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
			animationTimeoutsRef.current.delete(element);
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Clear all timeouts when component unmounts
			animationTimeoutsRef.current.forEach((timeoutId) => {
				clearTimeout(timeoutId);
			});
			animationTimeoutsRef.current.clear();
			appliedAnimationsRef.current.clear();
		};
	}, []);

	return { applyAnimation, clearAnimation };
};

// Global counter to stagger initial animations
let initialAnimationCounter = 0;
// Track when the page started loading to determine initial vs scroll animations
let pageLoadTime = Date.now();
// Global map to track which elements have been triggered (persistent across effect re-runs)
const globalTriggeredElements = new Map<string, boolean>();
// Track elements that are in initial view and have animations - these should NEVER retrigger
const initialViewElementsWithAnimation = new Map<string, { hasAnimation: boolean; isInInitialView: boolean; hasTriggered: boolean }>();
// Track if we've already set up event listeners to prevent duplicates
let eventListenersSetup = false;
// Track the current URL to detect actual page changes
let currentUrl = typeof window !== 'undefined' ? window.location.href : '';

// Function to clear triggered elements only on actual page changes
const clearTriggeredElementsOnPageChange = () => {
	const newUrl = window.location.href;
	if (newUrl !== currentUrl) {
		currentUrl = newUrl;
		globalTriggeredElements.clear();
		initialViewElementsWithAnimation.clear();
		initialAnimationCounter = 0;
		pageLoadTime = Date.now();
	}
};

// Reset counter and timestamp when page loads
if (typeof window !== 'undefined' && !eventListenersSetup) {
	eventListenersSetup = true;

	// Reset counter on page load - but don't clear triggered elements unless URL changed
	window.addEventListener('load', () => {
		clearTriggeredElementsOnPageChange();
	});

	window.addEventListener('beforeunload', () => {
	});

	// Listen for popstate events (back/forward navigation)
	window.addEventListener('popstate', () => {
		setTimeout(() => clearTriggeredElementsOnPageChange(), 100);
	});
}

// Export function to manually clear triggered elements (useful for debugging)
export const clearGlobalTriggeredElements = () => {
	initialViewElementsWithAnimation.clear();
	initialAnimationCounter = 0;
};

// Export function to get current triggered elements (useful for debugging)
export const getGlobalTriggeredElements = () => {
	return new Map(globalTriggeredElements);
};

// Export function to get initial view elements tracking (useful for debugging)
export const getInitialViewElements = () => {
	return new Map(initialViewElementsWithAnimation);
};


// Animation effects that require initial hiding (opacity: 0 or off-screen positioning)
const ENTRANCE_ANIMATIONS = [
	// Fading Entrances
	'fadeIn', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig',
	'fadeInRight', 'fadeInRightBig', 'fadeInUp', 'fadeInUpBig',
	// Bouncing Entrances
	'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp',
	// Sliding Entrances
	'slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight',
	// Rotating Entrances
	'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight',
	// Flippers
	'flipInX', 'flipInY',
	// Lightspeed
	'lightSpeedIn',
	// Specials
	'rollIn'
];

// Function to determine if an animation effect requires initial hiding
const requiresInitialHiding = (effect: string): boolean => {
	return ENTRANCE_ANIMATIONS.includes(effect);
};

// Function to apply initial hiding styles based on animation type
const applyInitialHidingStyles = (element: HTMLElement, effect: string, isEditorMode: boolean = false) => {
	if (!requiresInitialHiding(effect)) return;

	// Don't apply initial hiding in editor mode - elements should be visible for editing
	if (isEditorMode) return;

	// Store original styles to restore later if needed
	if (!element.dataset.originalOpacity) {
		element.dataset.originalOpacity = element.style.opacity || '1';
	}
	if (!element.dataset.originalTransform) {
		element.dataset.originalTransform = element.style.transform || '';
	}
	if (!element.dataset.originalVisibility) {
		element.dataset.originalVisibility = element.style.visibility || 'visible';
	}

	// Apply initial hiding based on animation type
	if (effect.includes('fade') || effect.includes('bounce') || effect.includes('flip') || effect.includes('rotate') || effect === 'rollIn' || effect === 'lightSpeedIn') {
		// For fade, bounce, flip, rotate animations - start with opacity 0
		element.style.opacity = '0';
	} else if (effect.includes('slide')) {
		// For slide animations - start with opacity 0 and off-screen position
		element.style.opacity = '0';
		if (effect.includes('Up')) {
			element.style.transform = 'translateY(100px)';
		} else if (effect.includes('Down')) {
			element.style.transform = 'translateY(-100px)';
		} else if (effect.includes('Left')) {
			element.style.transform = 'translateX(100px)';
		} else if (effect.includes('Right')) {
			element.style.transform = 'translateX(-100px)';
		}
	}

	// Add a class to track that initial hiding has been applied
	element.classList.add('animate-initial-hidden');
};

// Function to remove initial hiding styles
const removeInitialHidingStyles = (element: HTMLElement) => {
	if (!element.classList.contains('animate-initial-hidden')) return;

	// Restore original styles
	const originalOpacity = element.dataset.originalOpacity;
	const originalTransform = element.dataset.originalTransform;
	const originalVisibility = element.dataset.originalVisibility;

	if (originalOpacity !== undefined) {
		element.style.opacity = originalOpacity;
		delete element.dataset.originalOpacity;
	}
	if (originalTransform !== undefined) {
		element.style.transform = originalTransform;
		delete element.dataset.originalTransform;
	}
	if (originalVisibility !== undefined) {
		element.style.visibility = originalVisibility;
		delete element.dataset.originalVisibility;
	}

	element.classList.remove('animate-initial-hidden');
};

// Enhanced hook that uses Intersection Observer to trigger animations when elements come into view
// This includes elements that are visible on page load, but staggers them to prevent all running at once
export const useAutoDisplayAnimations = (
	elementRef: React.RefObject<HTMLElement | null>,
	animation: DisplayAnimationItem | null
) => {
	const { applyAnimation, clearAnimation } = useDisplayAnimations(animation);
	const lastAnimationRef = useRef<string | null>(null);
	const hasTriggeredRef = useRef<boolean>(false);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const repeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const lastTriggerTimeRef = useRef<number>(0);

	// Get editor state to check if we're in edit mode
	const { enabled } = useEditor((state) => ({
		enabled: state.options.enabled,
	}));

	// Store element ID in a ref to avoid recreating observers
	const elementIdRef = useRef<string | null>(null);

	// Generate a unique identifier for this element that persists across re-renders
	const getElementId = useCallback(() => {
		if (!elementRef.current) {
			return null;
		}

		// Return cached ID if available
		if (elementIdRef.current) {
			return elementIdRef.current;
		}

		// Try to get a stable identifier from the element
		const element = elementRef.current;
		const nodeId = element.getAttribute('data-node-id');

		// Create a unique ID based on node ID (if available)
		let elementId;
		if (nodeId) {
			elementId = `element-${nodeId}`;
		} else {
			// Fallback: create a more robust unique identifier
			const tagName = element.tagName || 'UNKNOWN';
			const className = element.className || '';
			const content = (element.textContent || element.innerHTML || '').slice(0, 20);
			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(2, 7);

			// Create a unique ID using multiple factors
			elementId = `element-${tagName}-${className.replace(/\s+/g, '_')}-${content.replace(/\s+/g, '_')}-${timestamp}-${random}`;
		}

		// Cache the ID
		elementIdRef.current = elementId;
		return elementId;
	}, []);

	// Get element ID dynamically (don't memoize since elementRef.current changes)
	const getElementIdSafe = useCallback(() => {
		const id = getElementId();
		if (!id) {
		}
		return id;
	}, [getElementId]);

	// Function to check if element is in viewport
	const isElementInViewport = useCallback((element: HTMLElement): boolean => {
		const rect = element.getBoundingClientRect();
		return (
			rect.top < window.innerHeight &&
			rect.bottom > 0 &&
			rect.left < window.innerWidth &&
			rect.right > 0
		);
	}, []);

	// Function to register element in initial view tracking
	const registerInitialViewElement = useCallback((element: HTMLElement, hasAnimation: boolean) => {
		const elementId = getElementIdSafe();
		if (!elementId) return;

		const isInViewport = isElementInViewport(element);
		const existing = initialViewElementsWithAnimation.get(elementId);

		// Only register if not already registered or if status changed
		if (!existing || existing.hasAnimation !== hasAnimation || existing.isInInitialView !== isInViewport) {
			initialViewElementsWithAnimation.set(elementId, {
				hasAnimation,
				isInInitialView: isInViewport,
				hasTriggered: existing?.hasTriggered || false
			});

		}
	}, [getElementIdSafe, isElementInViewport]);

	// Function to check if element should be prevented from retriggering
	const shouldPreventRetrigger = useCallback((): boolean => {
		const elementId = getElementIdSafe();
		if (!elementId) return false;

		const tracked = initialViewElementsWithAnimation.get(elementId);
		if (!tracked) return false;

		// Prevent retrigger if element has animation, was in initial view, and has already triggered
		const shouldPrevent = tracked.hasAnimation && tracked.isInInitialView && tracked.hasTriggered;

		return shouldPrevent;
	}, [getElementIdSafe]);

	// Function to mark initial view element as triggered
	const markInitialViewElementTriggered = useCallback(() => {
		const elementId = getElementIdSafe();
		if (!elementId) return;

		const existing = initialViewElementsWithAnimation.get(elementId);
		if (existing) {
			initialViewElementsWithAnimation.set(elementId, {
				...existing,
				hasTriggered: true
			});
		}
	}, [getElementIdSafe]);

	// Check if this element has already been triggered globally
	const hasBeenTriggeredGlobally = useCallback(() => {
		const elementId = getElementIdSafe();
		const hasBeenTriggered = elementId ? globalTriggeredElements.get(elementId) === true : false;
		return hasBeenTriggered;
	}, [getElementIdSafe]);

	// Mark this element as triggered globally with debounce protection
	const markAsTriggeredGlobally = useCallback(() => {
		const elementId = getElementIdSafe();
		if (elementId) {
			const now = Date.now();
			globalTriggeredElements.set(elementId, true);
			lastTriggerTimeRef.current = now;
		}
	}, [getElementIdSafe]);

	// Function to execute a single animation cycle for repeat animations
	const executeRepeatAnimation = useCallback((element: HTMLElement, animation: DisplayAnimationItem) => {
		// Remove initial hiding styles before starting animation
		removeInitialHidingStyles(element);

		// Add animate.css base class
		element.classList.add('animate__animated');

		// Set animation duration
		element.style.setProperty('--animate-duration', `${animation.duration}s`);
		element.style.setProperty('--animate-repeat', '1');

		// Force reflow to ensure classes are applied
		element.offsetHeight;

		// Add the specific animation class
		const animationClass = `animate__${animation.effect}`;
		element.classList.add(animationClass);

		// Clean up after animation completion
		const cleanup = () => {
			// Clear animation classes
			const originalClasses = element.className.split(' ');
			const filteredClasses = originalClasses.filter(cls => !cls.startsWith('animate__'));
			element.className = filteredClasses.join(' ');

			// Remove CSS properties
			element.style.removeProperty('--animate-duration');
			element.style.removeProperty('--animate-repeat');
		};

		// Listen for animation end
		const handleAnimationEnd = (e: AnimationEvent) => {
			if (e.target === element) {
				cleanup();
				element.removeEventListener('animationend', handleAnimationEnd);
			}
		};

		element.addEventListener('animationend', handleAnimationEnd);

		// Fallback timeout in case animationend doesn't fire
		setTimeout(() => {
			cleanup();
		}, (animation.duration * 1000) + 500);
	}, []);

	// Function to start repeat animation loop
	const startRepeatLoop = useCallback((element: HTMLElement, animation: DisplayAnimationItem) => {
		// Clear any existing repeat timeout
		if (repeatIntervalRef.current) {
			clearTimeout(repeatIntervalRef.current);
			repeatIntervalRef.current = null;
		}

		// Function to run a single animation cycle and schedule the next one
		const runAnimationCycle = () => {
			if (!elementRef.current || enabled) {
				return; // Stop if element is gone or editor is enabled
			}

			// Start animation immediately (no delay)
			const startAnimation = () => {
				executeRepeatAnimation(element, animation);

				// Schedule the next cycle after current animation completes
				// Total cycle time = duration * 2 + buffer (1 second between cycles)
				const nextCycleDelay = animation.duration * 2000 + 1000; // 1 second buffer between cycles

				repeatIntervalRef.current = setTimeout(() => {
					runAnimationCycle(); // Recursively schedule next cycle
				}, nextCycleDelay);
			};

			// Start animation immediately
			startAnimation();
		};

		// Start the first cycle
		runAnimationCycle();
	}, [executeRepeatAnimation, elementRef, enabled]);

	// Function to stop repeat loop
	const stopRepeatLoop = useCallback(() => {
		if (repeatIntervalRef.current) {
			clearTimeout(repeatIntervalRef.current);
			repeatIntervalRef.current = null;
		}
	}, []);

	// Use a ref to track if we've already set up the observer for this element
	const setupCompleteRef = useRef<string | null>(null);
	// Track if we've processed this element to prevent multiple effect runs
	const processedRef = useRef<boolean>(false);

	// Create stable animation key to prevent unnecessary re-renders
	const animationKey = React.useMemo(() => {
		if (!animation || animation.effect === 'none') return 'none';
		return `${animation.effect}-${animation.duration}-${animation.repeat}`;
	}, [animation?.effect, animation?.duration, animation?.repeat]);

	useEffect(() => {
		if (!elementRef.current || !animation || animation.effect === 'none') {
			// Register element with no animation
			if (elementRef.current) {
				registerInitialViewElement(elementRef.current, false);
			}

			// Clear any existing setup
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}
			stopRepeatLoop();
			setupCompleteRef.current = null;
			return;
		}

		const element = elementRef.current;
		const elementId = getElementIdSafe();

		// CRITICAL: If elementId is null, the element is not ready yet - skip this run
		if (!elementId) {
			return;
		}

		// Register element with animation in initial view tracking
		registerInitialViewElement(element, true);

		const currentTime = Date.now();
		const timeSincePageLoad = currentTime - pageLoadTime;

		// Check if this element should be prevented from retriggering
		if (shouldPreventRetrigger()) {
			setupCompleteRef.current = animationKey;
			processedRef.current = true;
			return;
		}

		// If we've already set up this exact configuration, don't do it again
		if (setupCompleteRef.current === animationKey && processedRef.current) {
			return;
		}

		// Clear any existing observer and repeat loop
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}
		stopRepeatLoop();

		// Check if this element has already been triggered globally
		const hasBeenTriggeredBefore = hasBeenTriggeredGlobally();

		// Track if element was immediately triggered to prevent observer creation
		let wasImmediatelyTriggered = false;

		// Check if element is in viewport NOW (regardless of setup phase) and should be immediately triggered
		const rect = element.getBoundingClientRect();
		const isInViewport = rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
		const isInitialLoad = timeSincePageLoad < 10000; // Extended to 10 seconds to catch more elements

		// If element is in viewport and not already triggered, trigger immediately
		if (isInViewport && !hasBeenTriggeredBefore) {
			// Trigger animation immediately (no delay)
			hasTriggeredRef.current = true;
			lastTriggerTimeRef.current = Date.now();
			markAsTriggeredGlobally();
			markInitialViewElementTriggered();
			wasImmediatelyTriggered = true;

			if (isInitialLoad) {
				// For initial load, add stagger delay
				initialAnimationCounter++;
				const staggerDelay = Math.min(initialAnimationCounter * 200, 2000);

				setTimeout(() => {
					if (elementRef.current) {
						applyAnimation(element);
					}
				}, staggerDelay);
			} else {
				applyAnimation(element);
			}
		}

		// If animation configuration changed, reset trigger state
		if (animationKey !== lastAnimationRef.current) {
			const isInitialSetup = lastAnimationRef.current === null;

			if (isInitialSetup) {
				// Apply initial hiding styles for entrance animations
				applyInitialHidingStyles(element, animation.effect, enabled);
				// Check if this element was already triggered globally
				if (hasBeenTriggeredBefore) {
					hasTriggeredRef.current = true;
				}
			} else {
				// Only reset local trigger state if element hasn't been triggered globally and wasn't just immediately triggered
				if (!hasBeenTriggeredBefore && !wasImmediatelyTriggered) {
					hasTriggeredRef.current = false;
				} else {
					hasTriggeredRef.current = true;
				}
				// Clear previous animation and apply new initial hiding if needed
				if (!wasImmediatelyTriggered) {
					clearAnimation(element);
					removeInitialHidingStyles(element);
					applyInitialHidingStyles(element, animation.effect, enabled);
				}
			}

			lastAnimationRef.current = animationKey;
		}

		// CRITICAL: If element was immediately triggered, skip all observer creation
		if (wasImmediatelyTriggered) {
			setupCompleteRef.current = animationKey;
			processedRef.current = true;
			return;
		}

		// Handle repeat animations differently - start immediately without waiting for scroll
		// Note: Repeat animations should work regardless of enabled state in view mode
		if (animation.repeat && !enabled) {
			startRepeatLoop(element, animation);
			setupCompleteRef.current = animationKey;
			processedRef.current = true;
			return;
		}

		// Check current trigger state after potential immediate triggering above
		const currentlyTriggered = hasBeenTriggeredGlobally() || hasTriggeredRef.current;
		const preventRetrigger = shouldPreventRetrigger();

		// For non-repeat animations that have already been triggered, don't create observer
		if ((currentlyTriggered || preventRetrigger) && !animation.repeat) {
			setupCompleteRef.current = animationKey;
			processedRef.current = true;
			return;
		}

		// For non-repeat animations, use intersection observer
		const newObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// CRITICAL: Only process intersecting entries and check trigger state first
					if (!entry.isIntersecting) {
						return;
					}

					// CRITICAL: Check if this element should be prevented from retriggering (initial view protection)
					if (shouldPreventRetrigger()) {
						return;
					}

					// CRITICAL: Double-check if already triggered (race condition protection)
					const hasBeenTriggeredNow = hasBeenTriggeredGlobally();
					const now = Date.now();
					const timeSinceLastTrigger = now - lastTriggerTimeRef.current;


					// Check for recent triggering (debounce protection)
					if (timeSinceLastTrigger < 500 && lastTriggerTimeRef.current > 0 && !animation.repeat) {
						return;
					}

					if ((hasTriggeredRef.current || hasBeenTriggeredNow) && !animation.repeat) {
						return;
					}

					// CRITICAL: Mark as triggered IMMEDIATELY to prevent race conditions
					if (!animation.repeat) {
						hasTriggeredRef.current = true;
						markAsTriggeredGlobally();
						markInitialViewElementTriggered();
					}

					// Check if we're still in the initial page load phase (within 10 seconds)
					const timeSincePageLoad = Date.now() - pageLoadTime;
					const isInitialLoad = timeSincePageLoad < 10000; // 10 second window for initial load

					if (isInitialLoad) {
						// Element is in view during initial page load
						// Add a staggered delay to prevent all animations from running simultaneously
						initialAnimationCounter++;
						const staggerDelay = Math.min(initialAnimationCounter * 200, 2000); // Max 2 second delay

						// Apply animation with stagger delay
						setTimeout(() => {
							// Double-check element still exists (in case component unmounted)
							if (elementRef.current) {
								applyAnimation(element);
							}
						}, staggerDelay);
					} else {
						// For non-initial load, apply animation immediately
						applyAnimation(element);
					}
				});
			},
			{
				// Trigger when 15% of the element is visible
				threshold: 0.15,
				// Add negative bottom margin to trigger animation before element is fully visible
				rootMargin: '0px 0px -50px 0px'
			}
		);

		// Register the observer locally
		observerRef.current = newObserver;

		// Start observing the element
		newObserver.observe(element);

		// Mark setup as complete for this configuration
		setupCompleteRef.current = animationKey;
		processedRef.current = true;

		// Cleanup function - only runs when component unmounts or dependencies change
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}
			stopRepeatLoop();
			setupCompleteRef.current = null;
			processedRef.current = false;
		};
	}, [animationKey, enabled, getElementIdSafe]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}
			stopRepeatLoop();
		};
	}, [stopRepeatLoop]);

	return { applyAnimation, clearAnimation };
};

// Hook for handling hover animations
export const useHoverAnimations = (settings: HoverAnimationSettings) => {
	// Get editor state to check if we're in edit mode
	const { enabled } = useEditor((state) => ({
		enabled: state.options.enabled,
	}));

	// Store original styles to restore them later
	const originalStyles = useRef<Record<string, string>>({});
	const applyHoverStyles = (element: HTMLElement, isHover: boolean) => {
		// Don't apply hover animations if editor is enabled (edit mode)
		if (enabled) {
			return;
		}

		if (!settings.enabled) {
			return;
		}

		if (isHover) {
			// Store original styles before modifying
			if (Object.keys(originalStyles.current).length === 0) {
				originalStyles.current = {
					borderColor: element.style.borderColor || '',
					opacity: element.style.opacity || '',
					transform: element.style.transform || '',
					filter: element.style.filter || '',
					transition: element.style.transition || '',
					color: element.style.color || '',
					backgroundColor: element.style.backgroundColor || '',
				};
			}

			// Apply hover styles
			const style = element.style;
			style.transition = 'all 0.3s ease';

			// Apply border color
			if (settings.borderColor) {
				style.borderColor = settings.borderColor;
			}

			// Apply text color
			if (settings.textColor) {
				style.color = settings.textColor;
			}

			// Apply background color
			if (settings.backgroundColor) {
				style.backgroundColor = settings.backgroundColor;
			}

			// Apply icon color for Button components
			if (settings.iconColor) {
				// Find icon elements within the component and apply color
				const iconElements = element.querySelectorAll('svg, [data-icon]');
				iconElements.forEach((iconEl: Element) => {
					if (iconEl instanceof HTMLElement || iconEl instanceof SVGElement) {
						// Store original icon color if not already stored
						if (!iconEl.dataset.originalColor) {
							iconEl.dataset.originalColor = iconEl.style.color || iconEl.style.fill || '';
						}
						// Apply new icon color
						if (iconEl instanceof SVGElement) {
							iconEl.style.fill = settings.iconColor!;
						} else {
							iconEl.style.color = settings.iconColor!;
						}
					}
				});
			}
			
			// Apply opacity
			if (settings.opacity !== undefined) {
				const opacityValue = (settings.opacity / 100).toString();
				style.opacity = opacityValue;
			}
			
			// Build transform string by combining all transform values
			const transforms: string[] = [];
			
			// Keep existing transforms if any
			const existingTransform = originalStyles.current.transform;
			if (existingTransform && !existingTransform.includes('scale') && !existingTransform.includes('rotate')) {
				transforms.push(existingTransform);
			}
			
			// Add scale transform
			if (settings.scale !== undefined && settings.scale !== 100) {
				transforms.push(`scale(${settings.scale / 100})`);
			}
			
			// Add rotate transform
			if (settings.rotate !== undefined && settings.rotate !== 0) {
				transforms.push(`rotate(${settings.rotate}deg)`);
			}
			
			// Apply combined transform
			if (transforms.length > 0) {
				style.transform = transforms.join(' ');
			}
			
			// Build filter string by combining all filter values
			const filters: string[] = [];
			
			// Keep existing filters that aren't blur or grayscale
			const existingFilter = originalStyles.current.filter;
			if (existingFilter && existingFilter !== 'none' && !existingFilter.includes('blur') && !existingFilter.includes('grayscale')) {
				filters.push(existingFilter);
			}
			
			// Add blur filter
			if (settings.blur !== undefined && settings.blur > 0) {
				filters.push(`blur(${settings.blur}px)`);
			}
			
			// Add grayscale filter
			if (settings.grayscale !== undefined && settings.grayscale > 0) {
				filters.push(`grayscale(${settings.grayscale}%)`);
			}
			
			// Apply combined filter
			if (filters.length > 0) {
				style.filter = filters.join(' ');
			} else if (settings.blur === 0 && settings.grayscale === 0) {
				style.filter = originalStyles.current.filter || 'none';
			}
			
		} else {
			// Restore original styles
			const style = element.style;
			style.transition = originalStyles.current.transition;
			style.borderColor = originalStyles.current.borderColor;
			style.opacity = originalStyles.current.opacity;
			style.transform = originalStyles.current.transform;
			style.filter = originalStyles.current.filter;
			style.color = originalStyles.current.color;
			style.backgroundColor = originalStyles.current.backgroundColor;

			// Restore icon colors
			const iconElements = element.querySelectorAll('svg, [data-icon]');
			iconElements.forEach((iconEl: Element) => {
				if (iconEl instanceof HTMLElement || iconEl instanceof SVGElement) {
					const originalColor = iconEl.dataset.originalColor;
					if (originalColor !== undefined) {
						if (iconEl instanceof SVGElement) {
							iconEl.style.fill = originalColor;
						} else {
							iconEl.style.color = originalColor;
						}
						// Clean up the stored original color
						delete iconEl.dataset.originalColor;
					}
				}
			});

			// Clear stored styles for next hover
			originalStyles.current = {};
		}
	};

	return { applyHoverStyles };
};

// Hook for animation preview functionality
export const useAnimationPreview = () => {
	const { query, enabled } = useEditor((state) => ({
		enabled: state.options.enabled,
	}));

	const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const previewAnimation = (effect: string, duration: number = 1) => {
		// Only work in editor mode
		if (!enabled) return;

		// Get currently selected node
		const selectedNodeId = query.getEvent('selected').first();
		if (!selectedNodeId) return;

		// Get the DOM element of the selected node
		const selectedNode = query.node(selectedNodeId).get();
		const element = selectedNode.dom;
		if (!element) return;

		// Clear any existing preview
		clearPreview();

		if (effect === 'none') return;

		// Apply preview animation immediately
		previewTimeoutRef.current = setTimeout(() => {
			// Store original styles for restoration
			const originalAnimationDuration = element.style.getPropertyValue('--animate-duration');
			const originalAnimationRepeat = element.style.getPropertyValue('--animate-repeat');

			// Apply animation classes and styles
			element.classList.add('animate__animated');
			element.style.setProperty('--animate-duration', `${duration}s`);
			element.style.setProperty('--animate-repeat', '1');

			// Force reflow
			element.offsetHeight;

			// Add the specific animation class
			const animationClass = `animate__${effect}`;
			element.classList.add(animationClass);

			// Clean up after animation completes
			const cleanup = () => {
				// Remove animation classes
				element.classList.remove('animate__animated', animationClass);

				// Restore original styles
				if (originalAnimationDuration) {
					element.style.setProperty('--animate-duration', originalAnimationDuration);
				} else {
					element.style.removeProperty('--animate-duration');
				}

				if (originalAnimationRepeat) {
					element.style.setProperty('--animate-repeat', originalAnimationRepeat);
				} else {
					element.style.removeProperty('--animate-repeat');
				}
			};

			// Listen for animation end
			const handleAnimationEnd = (e: AnimationEvent) => {
				if (e.target === element) {
					cleanup();
					element.removeEventListener('animationend', handleAnimationEnd);
				}
			};

			element.addEventListener('animationend', handleAnimationEnd);

			// Fallback timeout
			setTimeout(cleanup, (duration * 1000) + 200);
		}, 0); // Execute immediately
	};

	const clearPreview = () => {
		if (previewTimeoutRef.current) {
			clearTimeout(previewTimeoutRef.current);
			previewTimeoutRef.current = null;
		}

		// Get currently selected node and clear any preview animations
		const selectedNodeId = query.getEvent('selected').first();
		if (!selectedNodeId) return;

		const selectedNode = query.node(selectedNodeId).get();
		const element = selectedNode.dom;
		if (!element) return;

		// Remove preview animation classes
		const classes = element.className.split(' ');
		const filteredClasses = classes.filter(cls => !cls.startsWith('animate__'));
		element.className = filteredClasses.join(' ');

		// Remove preview CSS properties
		element.style.removeProperty('--animate-duration');
		element.style.removeProperty('--animate-repeat');
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearPreview();
		};
	}, []);

	const previewHoverAnimation = (settings: HoverAnimationSettings) => {
		// Only work in editor mode
		if (!enabled) return;

		// Get currently selected node
		const selectedNodeId = query.getEvent('selected').first();
		if (!selectedNodeId) return;

		// Get the DOM element of the selected node
		const selectedNode = query.node(selectedNodeId).get();
		const element = selectedNode.dom;
		if (!element) return;

		if (!settings.enabled) return;

		// Store original styles
		const originalStyles = {
			borderColor: element.style.borderColor || '',
			opacity: element.style.opacity || '',
			transform: element.style.transform || '',
			filter: element.style.filter || '',
			transition: element.style.transition || '',
			color: element.style.color || '',
			backgroundColor: element.style.backgroundColor || '',
		};

		// Apply hover preview styles
		const style = element.style;
		style.transition = 'all 0.3s ease';

		// Apply border color
		if (settings.borderColor) {
			style.borderColor = settings.borderColor;
		}

		// Apply text color
		if (settings.textColor) {
			style.color = settings.textColor;
		}

		// Apply background color
		if (settings.backgroundColor) {
			style.backgroundColor = settings.backgroundColor;
		}

		// Apply icon color for Button components
		if (settings.iconColor) {
			// Find icon elements within the component and apply color
			const iconElements = element.querySelectorAll('svg, [data-icon]');
			iconElements.forEach((iconEl: Element) => {
				if (iconEl instanceof HTMLElement || iconEl instanceof SVGElement) {
					// Store original icon color if not already stored
					if (!iconEl.dataset.originalPreviewColor) {
						iconEl.dataset.originalPreviewColor = iconEl.style.color || iconEl.style.fill || '';
					}
					// Apply new icon color
					if (iconEl instanceof SVGElement) {
						iconEl.style.fill = settings.iconColor!;
					} else {
						iconEl.style.color = settings.iconColor!;
					}
				}
			});
		}

		// Apply opacity
		if (settings.opacity !== undefined) {
			const opacityValue = (settings.opacity / 100).toString();
			style.opacity = opacityValue;
		}

		// Build transform string
		const transforms: string[] = [];

		// Keep existing transforms if any
		const existingTransform = originalStyles.transform;
		if (existingTransform && !existingTransform.includes('scale') && !existingTransform.includes('rotate')) {
			transforms.push(existingTransform);
		}

		// Add scale transform
		if (settings.scale !== undefined && settings.scale !== 100) {
			transforms.push(`scale(${settings.scale / 100})`);
		}

		// Add rotate transform
		if (settings.rotate !== undefined && settings.rotate !== 0) {
			transforms.push(`rotate(${settings.rotate}deg)`);
		}

		// Apply combined transform
		if (transforms.length > 0) {
			style.transform = transforms.join(' ');
		}

		// Build filter string
		const filters: string[] = [];

		// Keep existing filters that aren't blur or grayscale
		const existingFilter = originalStyles.filter;
		if (existingFilter && existingFilter !== 'none' && !existingFilter.includes('blur') && !existingFilter.includes('grayscale')) {
			filters.push(existingFilter);
		}

		// Add blur filter
		if (settings.blur !== undefined && settings.blur > 0) {
			filters.push(`blur(${settings.blur}px)`);
		}

		// Add grayscale filter
		if (settings.grayscale !== undefined && settings.grayscale > 0) {
			filters.push(`grayscale(${settings.grayscale}%)`);
		}

		// Apply combined filter
		if (filters.length > 0) {
			style.filter = filters.join(' ');
		} else if (settings.blur === 0 && settings.grayscale === 0) {
			style.filter = originalStyles.filter || 'none';
		}

		// Auto-clear after 2 seconds
		setTimeout(() => {
			// Restore original styles
			style.transition = originalStyles.transition;
			style.borderColor = originalStyles.borderColor;
			style.opacity = originalStyles.opacity;
			style.transform = originalStyles.transform;
			style.filter = originalStyles.filter;
			style.color = originalStyles.color;
			style.backgroundColor = originalStyles.backgroundColor;

			// Restore icon colors
			const iconElements = element.querySelectorAll('svg, [data-icon]');
			iconElements.forEach((iconEl: Element) => {
				if (iconEl instanceof HTMLElement || iconEl instanceof SVGElement) {
					const originalColor = iconEl.dataset.originalPreviewColor;
					if (originalColor !== undefined) {
						if (iconEl instanceof SVGElement) {
							iconEl.style.fill = originalColor;
						} else {
							iconEl.style.color = originalColor;
						}
						// Clean up the stored original color
						delete iconEl.dataset.originalPreviewColor;
					}
				}
			});
		}, 2000);
	};

	return { previewAnimation, clearPreview, previewHoverAnimation };
};

export const AnimationManager: React.FC<AnimationManagerProps> = ({
	displayAnimation,
	onDisplayAnimationChange,
	hoverAnimation,
	onHoverAnimationChange,
	hideHoverSection = false
}) => {
	const [expandedSection, setExpandedSection] = useState<string | null>('display');
	const { previewAnimation, clearPreview, previewHoverAnimation } = useAnimationPreview();
	const { query } = useEditor();

	// Helper functions to check component types and their content
	const getSelectedComponentInfo = () => {
		const selectedNodeId = query.getEvent('selected').first();
		if (!selectedNodeId) return null;

		const selectedNode = query.node(selectedNodeId).get();
		return {
			displayName: selectedNode.data.displayName,
			name: selectedNode.data.name,
			node: selectedNode
		};
	};

	const hasTextContent = () => {
		const componentInfo = getSelectedComponentInfo();
		if (!componentInfo) return false;

		const { displayName, name } = componentInfo;
		// Components that contain text content
		return displayName === 'Text' || name === 'Text' ||
			   displayName === 'Button' || name === 'Button' ||
			   displayName === 'Count' || name === 'Count' ||
			   displayName === 'Input' || name === 'Input' ||
			   displayName === 'Form' || name === 'Form' ||
			   displayName === 'Calendar' || name === 'Calendar';
	};

	const hasIconContent = () => {
		const componentInfo = getSelectedComponentInfo();
		if (!componentInfo) return false;

		const { displayName, name } = componentInfo;
		// Components that contain icon content
		return displayName === 'Icon' || name === 'Icon' ||
			   displayName === 'Button' || name === 'Button';
	};

	// Update display animation
	const updateDisplayAnimation = (updates: Partial<DisplayAnimationItem>) => {
		if (displayAnimation) {
			onDisplayAnimationChange({ ...displayAnimation, ...updates });
		} else {
			// Create new animation if none exists
			const newAnimation: DisplayAnimationItem = {
				id: `animation-${Date.now()}`,
				effect: 'none',
				duration: 1,
				repeat: false,
				...updates
			};
			onDisplayAnimationChange(newAnimation);
		}
	};

	// Clear animation
	const clearDisplayAnimation = () => {
		onDisplayAnimationChange(null);
	};

	// Toggle section expansion
	const toggleSectionExpansion = (section: string) => {
		setExpandedSection(expandedSection === section ? null : section);
	};



	return (
		<Stack gap={4}>			{/* Display Animations Section */}
			<Box
				border="1px solid"
				borderColor="gray.200"
				borderRadius="md"
				overflow="hidden"
			>
				{/* Section Header */}
				<HStack
					p={3}
					bg="gray.50"
					justifyContent="space-between"
					cursor="pointer"
					onClick={() => toggleSectionExpansion('display')}
					_hover={{ bg: 'gray.100' }}
				>
					<HStack gap={2}>
						{expandedSection === 'display' ? <FiChevronDown /> : <FiChevronRight />}
						<Text fontSize="sm" fontWeight="bold">Hiệu ứng Hiển thị</Text>
					</HStack>
					{displayAnimation && displayAnimation.effect !== 'none' && (
						<Button
							size="xs"
							onClick={(e) => {
								e.stopPropagation();
								clearDisplayAnimation();
							}}
							colorScheme="red"
							variant="outline"
						>
							<FiTrash2 />
						</Button>
					)}
				</HStack>

				{/* Section Content */}
				{expandedSection === 'display' && (
					<Box p={4}>
						<Stack gap={4}>
							{/* Effect Selection with Preview */}
							<Box>
								<HStack justifyContent="space-between" alignItems="center" mb={2}>
									<Text fontSize="xs">Hiệu ứng:</Text>
									<Button
										size="xs"
										onClick={() => {
											if (displayAnimation?.effect && displayAnimation.effect !== 'none') {
												previewAnimation(
													displayAnimation.effect,
													displayAnimation.duration || 1
												);
											}
										}}
										colorScheme="blue"
										variant="outline"
										disabled={!displayAnimation?.effect || displayAnimation.effect === 'none'}
									>
										<FiPlay style={{ marginRight: '4px' }} />
										Xem trước
									</Button>
								</HStack>
								<Select.Root
									value={[displayAnimation?.effect || 'none']}
									onValueChange={(details) => {
										updateDisplayAnimation({ effect: details.value[0] });
										// Clear any existing preview when changing effect
										clearPreview();
									}}
									collection={createListCollection({
										items: animationEffectOptions
									})}
								>
									<Select.Control>
										<Select.Trigger>
											<Select.ValueText />
										</Select.Trigger>
									</Select.Control>
									<Select.Content>
										{animationEffectOptions.map(option => (
											<Select.Item
												key={option.value}
												item={option.value}
												onMouseEnter={() => {
													// Preview animation on hover (except for 'none')
													if (option.value !== 'none') {
														previewAnimation(option.value, 0.8);
													} else {
														clearPreview();
													}
												}}
												onMouseLeave={() => {
													// Clear preview when mouse leaves
													clearPreview();
												}}
											>
												<Select.ItemText>{option.label}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							</Box>

							{displayAnimation && displayAnimation.effect !== 'none' && (
								<>
									{/* Duration */}
									<Box>
										<Text fontSize="xs" mb={2}>Thời gian chạy (giây):</Text>
										<Input
											size="sm"
											type="number"
											value={displayAnimation.duration}
											onChange={(e) => updateDisplayAnimation({ duration: parseFloat(e.target.value) || 1 })}
											min={0.1}
											step={0.1}
										/>
									</Box>

									{/* Repeat */}
									<HStack justifyContent="space-between" alignItems="center">
										<Text fontSize="xs">Lặp lại:</Text>
										<input
											type="checkbox"
											checked={displayAnimation.repeat}
											onChange={(e) => updateDisplayAnimation({ repeat: e.target.checked })}
										/>
									</HStack>
								</>
							)}
						</Stack>
					</Box>
				)}
			</Box>

			{/* Hover Effects Section */}
			<Box
				border="1px solid"
				borderColor="gray.200"
				borderRadius="md"
				overflow="hidden"
				display={hideHoverSection ? 'none' : 'block'}
			>
				{/* Section Header */}
				<HStack
					p={3}
					bg="gray.50"
					justifyContent="space-between"
					cursor="pointer"
					onClick={() => toggleSectionExpansion('hover')}
					_hover={{ bg: 'gray.100' }}
				>
					<HStack gap={2}>
						{expandedSection === 'hover' ? <FiChevronDown /> : <FiChevronRight />}
						<Text fontSize="sm" fontWeight="bold">Hiệu ứng Rê chuột</Text>
					</HStack>
				</HStack>

				{/* Section Content */}
				{expandedSection === 'hover' && (
					<Box p={4}>
						<Stack gap={4}>
							{/* Enable/Disable */}
							<HStack justifyContent="space-between" alignItems="center">
								<Text fontSize="xs">Trạng thái (Bật/Tắt):</Text>
								<input
									type="checkbox"
									checked={hoverAnimation.enabled}
									onChange={(e) => onHoverAnimationChange({ ...hoverAnimation, enabled: e.target.checked })}
								/>
							</HStack>

							{hoverAnimation.enabled && (
								<>
									{/* Preview Button */}
									<Box>
										<Button
											size="xs"
											onClick={() => {
												previewHoverAnimation(hoverAnimation);
											}}
											colorScheme="blue"
											variant="outline"
											width="100%"
										>
											<FiPlay style={{ marginRight: '4px' }} />
											Xem trước hiệu ứng rê chuột
										</Button>
									</Box>
									{/* Border Color */}
									<Box>
										<Text fontSize="xs" mb={2}>Màu viền:</Text>
										<HStack gap={2}>
											<Input
												size="sm"
												type="color"
												value={hoverAnimation.borderColor || '#000000'}
												onChange={(e) => onHoverAnimationChange({ ...hoverAnimation, borderColor: e.target.value })}
												flex={1}
											/>
											<Button
												size="sm"
												variant="ghost"
												colorScheme="red"
												onClick={() => onHoverAnimationChange({ ...hoverAnimation, borderColor: undefined })}
												title="Xóa màu viền"
											>
												×
											</Button>
										</HStack>
									</Box>

									{/* Text Color - Only show for Text and Button components */}
									{hasTextContent() && (
										<Box>
											<Text fontSize="xs" mb={2}>Màu chữ:</Text>
											<HStack gap={2}>
												<Input
													size="sm"
													type="color"
													value={hoverAnimation.textColor || '#000000'}
													onChange={(e) => onHoverAnimationChange({ ...hoverAnimation, textColor: e.target.value })}
													flex={1}
												/>
												<Button
													size="sm"
													variant="ghost"
													colorScheme="red"
													onClick={() => onHoverAnimationChange({ ...hoverAnimation, textColor: undefined })}
													title="Xóa màu chữ"
												>
													×
												</Button>
											</HStack>
										</Box>
									)}

									{/* Icon Color - Only show for Icon and Button components */}
									{hasIconContent() && (
										<Box>
											<Text fontSize="xs" mb={2}>Màu icon:</Text>
											<HStack gap={2}>
												<Input
													size="sm"
													type="color"
													value={hoverAnimation.iconColor || '#000000'}
													onChange={(e) => onHoverAnimationChange({ ...hoverAnimation, iconColor: e.target.value })}
													flex={1}
												/>
												<Button
													size="sm"
													variant="ghost"
													colorScheme="red"
													onClick={() => onHoverAnimationChange({ ...hoverAnimation, iconColor: undefined })}
													title="Xóa màu icon"
												>
													×
												</Button>
											</HStack>
										</Box>
									)}

									{/* Background Color - Show for all component types */}
									<Box>
										<Text fontSize="xs" mb={2}>Màu nền:</Text>
										<HStack gap={2}>
											<Input
												size="sm"
												type="color"
												value={hoverAnimation.backgroundColor || '#ffffff'}
												onChange={(e) => onHoverAnimationChange({ ...hoverAnimation, backgroundColor: e.target.value })}
												flex={1}
											/>
											<Button
												size="sm"
												variant="ghost"
												colorScheme="red"
												onClick={() => onHoverAnimationChange({ ...hoverAnimation, backgroundColor: undefined })}
												title="Xóa màu nền"
											>
												×
											</Button>
										</HStack>
									</Box>

									{/* Opacity */}
									<Box>
										<Text fontSize="xs" mb={2}>Trong suốt (%):</Text>
										<DraggableNumberInput
											value={hoverAnimation.opacity || 100}
											onChange={(value) => onHoverAnimationChange({ ...hoverAnimation, opacity: value })}
											min={0}
											max={100}
										/>
									</Box>

									{/* Scale */}
									<Box>
										<Text fontSize="xs" mb={2}>Phóng to (%):</Text>
										<DraggableNumberInput
											value={hoverAnimation.scale || 100}
											onChange={(value) => onHoverAnimationChange({ ...hoverAnimation, scale: value })}
											min={10}
											max={200}
										/>
									</Box>

									{/* Rotate */}
									<Box>
										<Text fontSize="xs" mb={2}>Xoay đều (độ):</Text>
										<DraggableNumberInput
											value={hoverAnimation.rotate || 0}
											onChange={(value) => onHoverAnimationChange({ ...hoverAnimation, rotate: value })}
											min={-360}
											max={360}
										/>
									</Box>

									{/* Blur */}
									<Box>
										<Text fontSize="xs" mb={2}>Độ mờ (px):</Text>
										<DraggableNumberInput
											value={hoverAnimation.blur || 0}
											onChange={(value) => onHoverAnimationChange({ ...hoverAnimation, blur: value })}
											min={0}
											max={20}
										/>
									</Box>

									{/* Grayscale */}
									<Box>
										<Text fontSize="xs" mb={2}>Trắng đen (%):</Text>
										<DraggableNumberInput
											value={hoverAnimation.grayscale || 0}
											onChange={(value) => onHoverAnimationChange({ ...hoverAnimation, grayscale: value })}
											min={0}
											max={100}
										/>
									</Box>
								</>
							)}
							
						</Stack>
					</Box>
				)}
			</Box>
		</Stack>
	);
};
