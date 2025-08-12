// Mapped coordinates from JSON files for accurate body part positioning
// All coordinates are based on 800x1200 pixel images

export interface MappedCoordinate {
  x: number
  y: number
  width: number
  height: number
}

export interface CoordinateMapping {
  [bodyPart: string]: MappedCoordinate
}

// Female Front View - from scripts/mappedJsons/femalefront.json
export const femaleFrontCoordinates: CoordinateMapping = {
  'head': { x: 396, y: 9, width: 50, height: 50 },
  'face': { x: 402, y: 75, width: 50, height: 50 },
  'nose': { x: 399, y: 114, width: 50, height: 50 },
  'eyes': { x: 372, y: 81, width: 50, height: 50 },
  'left_eye': { x: 426, y: 78, width: 50, height: 50 },
  'right_eye': { x: 366, y: 81, width: 50, height: 50 },
  'mouth': { x: 396, y: 147, width: 50, height: 50 },
  'left_ear': { x: 465, y: 93, width: 50, height: 50 },
  'right_ear': { x: 330, y: 96, width: 50, height: 50 },
  'neck': { x: 396, y: 185, width: 50, height: 50 },
  'chest': { x: 399, y: 293, width: 50, height: 50 },
  'heart': { x: 471, y: 338, width: 50, height: 50 },
  'lungs': { x: 330, y: 275, width: 50, height: 50 },
  'left_lung': { x: 462, y: 269, width: 50, height: 50 },
  'right_lung': { x: 339, y: 275, width: 50, height: 50 },
  'left_shoulder': { x: 483, y: 209, width: 50, height: 50 },
  'right_shoulder': { x: 309, y: 209, width: 50, height: 50 },
  'left_arm': { x: 533, y: 356, width: 50, height: 50 },
  'right_arm': { x: 265, y: 353, width: 50, height: 50 },
  'left_forearm': { x: 560, y: 494, width: 50, height: 50 },
  'right_forearm': { x: 235, y: 496, width: 50, height: 50 },
  'left_wrist': { x: 587, y: 590, width: 50, height: 50 },
  'right_wrist': { x: 211, y: 600, width: 50, height: 50 },
  'left_hand': { x: 602, y: 644, width: 50, height: 50 },
  'right_hand': { x: 190, y: 644, width: 50, height: 50 },
  'abdomen': { x: 399, y: 442, width: 50, height: 50 },
  'stomach': { x: 420, y: 379, width: 50, height: 50 },
  'liver': { x: 336, y: 391, width: 50, height: 50 },
  'pelvis': { x: 402, y: 568, width: 50, height: 50 },
  'left_hip': { x: 494, y: 469, width: 50, height: 50 },
  'right_hip': { x: 306, y: 469, width: 50, height: 50 },
  'left_thigh': { x: 462, y: 714, width: 50, height: 50 },
  'right_thigh': { x: 327, y: 717, width: 50, height: 50 },
  'left_knee': { x: 462, y: 875, width: 50, height: 50 },
  'right_knee': { x: 324, y: 872, width: 50, height: 50 },
  'left_shin': { x: 447, y: 1015, width: 50, height: 50 },
  'right_shin': { x: 351, y: 1006, width: 50, height: 50 },
  'left_ankle': { x: 447, y: 1111, width: 50, height: 50 },
  'right_ankle': { x: 354, y: 1117, width: 50, height: 50 },
  'left_foot': { x: 476, y: 1153, width: 50, height: 50 },
  'right_foot': { x: 318, y: 1156, width: 50, height: 50 }
}

// Male Front View - from scripts/mappedJsons/malefront.json
export const maleFrontCoordinates: CoordinateMapping = {
  'head': { x: 375, y: 62, width: 50, height: 50 },
  'face': { x: 372, y: 112, width: 50, height: 50 },
  'nose': { x: 375, y: 154, width: 50, height: 50 },
  'eyes': { x: 345, y: 118, width: 50, height: 50 },
  'left_eye': { x: 402, y: 121, width: 50, height: 50 },
  'right_eye': { x: 345, y: 118, width: 50, height: 50 },
  'mouth': { x: 378, y: 175, width: 50, height: 50 },
  'left_ear': { x: 438, y: 136, width: 50, height: 50 },
  'right_ear': { x: 312, y: 145, width: 50, height: 50 },
  'neck': { x: 372, y: 229, width: 50, height: 50 },
  'chest': { x: 375, y: 304, width: 50, height: 50 },
  'heart': { x: 438, y: 330, width: 50, height: 50 },
  'lungs': { x: 315, y: 304, width: 50, height: 50 },
  'left_lung': { x: 429, y: 304, width: 50, height: 50 },
  'right_lung': { x: 318, y: 304, width: 50, height: 50 },
  'left_shoulder': { x: 479, y: 243, width: 50, height: 50 },
  'right_shoulder': { x: 275, y: 247, width: 50, height: 50 },
  'left_arm': { x: 518, y: 378, width: 50, height: 50 },
  'right_arm': { x: 238, y: 375, width: 50, height: 50 },
  'left_forearm': { x: 539, y: 502, width: 50, height: 50 },
  'right_forearm': { x: 211, y: 506, width: 50, height: 50 },
  'left_wrist': { x: 560, y: 568, width: 50, height: 50 },
  'right_wrist': { x: 199, y: 572, width: 50, height: 50 },
  'left_hand': { x: 566, y: 620, width: 50, height: 50 },
  'right_hand': { x: 181, y: 620, width: 50, height: 50 },
  'abdomen': { x: 378, y: 459, width: 50, height: 50 },
  'stomach': { x: 408, y: 384, width: 50, height: 50 },
  'liver': { x: 318, y: 375, width: 50, height: 50 },
  'pelvis': { x: 378, y: 566, width: 50, height: 50 },
  'left_hip': { x: 453, y: 520, width: 50, height: 50 },
  'right_hip': { x: 288, y: 514, width: 50, height: 50 },
  'left_thigh': { x: 435, y: 691, width: 50, height: 50 },
  'right_thigh': { x: 312, y: 697, width: 50, height: 50 },
  'left_knee': { x: 423, y: 805, width: 50, height: 50 },
  'right_knee': { x: 315, y: 805, width: 50, height: 50 },
  'left_shin': { x: 420, y: 914, width: 50, height: 50 },
  'right_shin': { x: 327, y: 918, width: 50, height: 50 },
  'left_ankle': { x: 408, y: 1024, width: 50, height: 50 },
  'right_ankle': { x: 336, y: 1024, width: 50, height: 50 },
  'left_foot': { x: 432, y: 1070, width: 50, height: 50 },
  'right_foot': { x: 324, y: 1074, width: 50, height: 50 },
  'testicles': { x: 378, y: 632, width: 50, height: 50 },
  'prostate': { x: 378, y: 602, width: 50, height: 50 }
}

// Coordinate mapping by view type
export const mappedCoordinates: Record<string, CoordinateMapping> = {
  'femalefront': femaleFrontCoordinates,
  'malefront': maleFrontCoordinates
  // TODO: Add other views from your JSON files
  // 'femaleback': femaleBackCoordinates,
  // 'maleback': maleBackCoordinates,
  // 'femaleleftside': femaleLeftSideCoordinates,
  // 'maleleftside': maleLeftSideCoordinates,
  // 'femalerightside': femaleRightSideCoordinates,
  // 'malerightside': maleRightSideCoordinates,
  // 'abdominal': abdominalCoordinates,
  // 'cardiorespiratory': cardioRespiratoryCoordinates
}

// Helper function to get mapped coordinates for a body part
export const getMappedCoordinates = (
  bodyPart: string, 
  view: string, 
  gender: string
): { x: number; y: number } | null => {
  const mapKey = `${gender}${view}`
  const coords = mappedCoordinates[mapKey]?.[bodyPart]
  
  if (coords) {
    // Convert from pixel coordinates to normalized (0-1) coordinates
    // Center the coordinate by adding half the width/height
    const centeredX = (coords.x + coords.width / 2) / 800
    const centeredY = (coords.y + coords.height / 2) / 1200
    
    return { x: centeredX, y: centeredY }
  }
  
  return null
}