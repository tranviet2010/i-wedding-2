/**
 * Centralized z-index management for the entire application
 * This helps prevent z-index conflicts and provides a clear hierarchy
 */
export const zIndex = {
  // Base layers (-1 to 10)
  behind: -1,
  base: 0,
  content: 1,
  contentOverlay: 2,
  ui: 10,
  overlay: 50,
  videoOverlay: 1,
  videoControls: 2,
  popupContent: 10,

  // Component layers (99 to 999)
  renderNode: 99,
  quickActions: 999,
  quickActionsBackground: 998,
  quickActionsMain: 9999,
  quickActionsItem: 999,
  quickActionsSubItem: 998,
  popupMain: 9999,
  dropboxMain: 9999,

  // Selection and controls (1000 to 1999)
  selection: 1000,
  selectionControls: 1001,
  groupControls: 1000,
  nodeControls: 1000,
  pinning: 1000,
  pinningManager: 1000,
  sectionsControls: 1000,

  // Editor components (9999 to 9999)
  editor: 9999,
  editorOverlay: 9998,
  renderNodeHighlight: 9999,
  selectionBox: 9999,
  smartAlignment: 9999,
  audioPlayer: 9999,
  lightBox: 9999,
  lightBoxContent: 10000,
  dropbox: 9999,
  dropboxOverlay: 9998,
  viewport: 9999,
  htmlEditor: 9999,

  // Modal and popup layers (10000 to 99999)
  modalBackground: 10000,
  modal: 10000,
  audioPlayerControls: 10000,
  albumModal: 9999,
  albumModalContent: 10000,
  albumModalItem: 10002,
  albumModalSelected: 10003,
  albumSection: 10000,
  albumSectionNavigation: 10,
  albumSectionCSS: 2,
  fileManagement: 10000,
  groupActions: 10000,
  headerControls: 99999,
  resizer: 99999,

  // Advanced modals (10001 to 10003)
  modalOverlay: 10001,
  quickActionsPopup: 10001,
  quickActionsCSS: 10001,
  viewTemplateOverlay: 10001,
  tooltipContent: 10001,
  viewportOverlay: 1001,
  modalContent: 10002,
  modalTopLevel: 10003,

  // High priority UI (999999 to 1000000)
  colorPicker: 999999,
  imagePicker: 999999,
  assetSave: 999999,
  
  // Critical UI elements (1000000+)
  iconPicker: 1000000,
  elementIdEdit: 1000000,
  fileSelect: 1000000,
  assetSaveContent: 1000000,

  // Settings modals (500000+)
  seoSettings: 500000,
  audioSettings: 500001,
  notificationSettings: 500002,
  viewportSettings: 500003,
  customHtmlSettings: 500004,
  customEffects: 500005,
  particleEffects: 500006,
  overlayHidden: 500007,
  settingsModal: 500008,

  // System level (9999999+)
  fontSelect: 9999999,
  layerPopup: 9999999,
  viewportContext: 9999999,
  elementsPopup: 9999999,

  // Absolute top level (10000000+)
  fontSelectOverlay: 10000000,
  fileSelectOverlay: 10000001,

  // Special CSS cases for ViewTemplate
  viewTemplateParticles: 10000,
  viewTemplateAudioPlayer: 10001,

  // Special cases
  popover: 'popover' as const, // For Ark UI components
  styledFontSelector: '10' as const, // String value for specific component
};

// Type for z-index values
export type ZIndexValue = typeof zIndex[keyof typeof zIndex];

// Helper function to get numeric z-index value
export const getZIndex = (key: keyof typeof zIndex): number | string => {
  return zIndex[key];
};

// Helper function for dynamic z-index calculations
export const calculateDynamicZIndex = (baseKey: keyof typeof zIndex, offset: number = 0): number => {
  const baseValue = zIndex[baseKey];
  if (typeof baseValue === 'number') {
    return baseValue + offset;
  }
  return 9999; // fallback value
};
