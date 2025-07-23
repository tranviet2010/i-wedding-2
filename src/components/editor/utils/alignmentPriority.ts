// Enhanced alignment types for the 6-point alignment system
export enum AlignmentType {
  TOP_EDGE = 'top-edge',
  LEFT_EDGE = 'left-edge',
  RIGHT_EDGE = 'right-edge',
  BOTTOM_EDGE = 'bottom-edge',
  CENTER_HORIZONTAL = 'center-horizontal',
  CENTER_VERTICAL = 'center-vertical'
}

// Priority levels for alignment types
export enum AlignmentPriority {
  HIGHEST = 0,    // Section centers, exact edge alignments
  HIGH = 1,       // Center alignments between elements
  MEDIUM = 2,     // Adjacent edge alignments (left-right, top-bottom)
  LOW = 3         // Basic edge alignments
}

// Helper function to determine alignment type and priority
export const getAlignmentTypeAndPriority = (
  checkType: string, 
  isSection: boolean
): { alignmentType: AlignmentType; priority: AlignmentPriority } => {
  if (isSection) {
    // Section center alignments get highest priority
    if (checkType.includes('center') || checkType.includes('middle')) {
      return {
        alignmentType: checkType.includes('center') ? AlignmentType.CENTER_HORIZONTAL : AlignmentType.CENTER_VERTICAL,
        priority: AlignmentPriority.HIGHEST
      };
    }
  }

  // Map check types to alignment types and priorities
  switch (checkType) {
    case 'left':
      return { alignmentType: AlignmentType.LEFT_EDGE, priority: AlignmentPriority.LOW };
    case 'right':
      return { alignmentType: AlignmentType.RIGHT_EDGE, priority: AlignmentPriority.LOW };
    case 'top':
      return { alignmentType: AlignmentType.TOP_EDGE, priority: AlignmentPriority.LOW };
    case 'bottom':
      return { alignmentType: AlignmentType.BOTTOM_EDGE, priority: AlignmentPriority.LOW };
    case 'center-center':
      return { alignmentType: AlignmentType.CENTER_HORIZONTAL, priority: AlignmentPriority.HIGH };
    case 'middle-middle':
      return { alignmentType: AlignmentType.CENTER_VERTICAL, priority: AlignmentPriority.HIGH };
    case 'left-right':
    case 'right-left':
      return { alignmentType: AlignmentType.LEFT_EDGE, priority: AlignmentPriority.MEDIUM };
    case 'top-bottom':
    case 'bottom-top':
      return { alignmentType: AlignmentType.TOP_EDGE, priority: AlignmentPriority.MEDIUM };
    default:
      return { alignmentType: AlignmentType.LEFT_EDGE, priority: AlignmentPriority.LOW };
  }
};

// Helper function to calculate snap strength based on distance
export const calculateSnapStrength = (distance: number, threshold: number): number => {
  if (distance > threshold) return 0;
  return Math.max(0, Math.min(1, 1 - (distance / threshold)));
};

// Enhanced priority calculation for magnetic snapping
export const calculateMagneticPriority = (
  snapDistance: number,
  elementDistance: number,
  alignmentPriority: AlignmentPriority,
  elementCount: number = 1
): number => {
  // Lower score = higher priority
  let priorityScore = snapDistance;
  
  // Apply alignment type priority multiplier
  priorityScore += alignmentPriority * 5;
  
  // Reduce priority score for guides that align multiple elements
  priorityScore -= (elementCount - 1) * 2;
  
  // Add element distance factor (closer elements get priority)
  priorityScore += elementDistance * 0.01;
  
  return priorityScore;
};
