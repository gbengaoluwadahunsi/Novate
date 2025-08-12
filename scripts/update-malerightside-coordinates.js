// Script to update male right side coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/malerightside.json'), 'utf8'))

// Image dimensions (you may need to adjust these based on your actual image size)
const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 1200  // Increased height for full body side view

// Convert pixel coordinates to normalized coordinates (0-1 range)
function convertToNormalized(pixelX, pixelY) {
  return {
    x: pixelX / IMAGE_WIDTH,
    y: pixelY / IMAGE_HEIGHT
  }
}

// Map anatomical names to regions and aliases for right side view
const ANATOMICAL_MAPPING = {
  // Head and facial features
  'head': { region: 'head', aliases: ['skull', 'cranium'] },
  'face': { region: 'head', aliases: ['facial'] },
  'nose': { region: 'head', aliases: ['nasal', 'nostril'] },
  'right_eye': { region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  'right_ear': { region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  'mouth': { region: 'head', aliases: ['oral', 'lips', 'buccal'] },
  
  // Neck and upper torso
  'neck': { region: 'neck', aliases: ['cervical', 'throat'] },
  'chest': { region: 'chest', aliases: ['thorax', 'pectoral', 'breast'] },
  'back': { region: 'back', aliases: ['dorsal', 'posterior'] },
  'spine': { region: 'back', aliases: ['spinal', 'vertebral', 'backbone'] },
  
  // Abdomen
  'abdomen': { region: 'abdomen', aliases: ['abdominal', 'belly', 'stomach area'] },
  
  // Upper extremities
  'right_shoulder': { region: 'upper_extremity', aliases: ['shoulder', 'deltoid'] },
  'right_arm': { region: 'upper_extremity', aliases: ['arm', 'brachial'] },
  'right_elbow': { region: 'upper_extremity', aliases: ['elbow', 'cubital'] },
  'right_forearm': { region: 'upper_extremity', aliases: ['forearm', 'antebrachial'] },
  'right_wrist': { region: 'upper_extremity', aliases: ['wrist', 'carpal'] },
  'right_hand': { region: 'upper_extremity', aliases: ['hand', 'palm', 'fingers'] },
  
  // Lower extremities
  'right_hip': { region: 'lower_extremity', aliases: ['hip', 'pelvic'] },
  'right_thigh': { region: 'lower_extremity', aliases: ['thigh', 'femoral'] },
  'right_knee': { region: 'lower_extremity', aliases: ['knee', 'patella'] },
  'right_calf': { region: 'lower_extremity', aliases: ['calf', 'lower leg', 'shin'] },
  'right_ankle': { region: 'lower_extremity', aliases: ['ankle', 'malleolus'] },
  'right_foot': { region: 'lower_extremity', aliases: ['foot', 'pedal', 'toes'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['malerightside.png']
const coordinates = []

Object.entries(imageData.coordinates).forEach(([anatomicalName, coord]) => {
  // Convert pixel coordinates to normalized coordinates
  const normalized = convertToNormalized(coord.x, coord.y)
  
  // Get region and aliases from mapping
  const mapping = ANATOMICAL_MAPPING[anatomicalName]
  const region = mapping?.region || 'general' // default to general
  const aliases = mapping?.aliases || []
  
  coordinates.push({
    name: anatomicalName,
    coordinates: normalized,
    region,
    aliases
  })
})

// Generate TypeScript code
let code = '// Male Right Side Coordinates - Generated from mapped malerightside.json\n'
code += 'export const maleRightSideCoordinates: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-malerightside-coordinates.ts'), code)

console.log('Generated male right side coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-malerightside-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 8).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})