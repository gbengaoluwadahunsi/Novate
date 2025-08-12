// Script to update female back coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/femaleback.json'), 'utf8'))

// Image dimensions (you may need to adjust these based on your actual image size)
const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 1200  // Full body back view

// Convert pixel coordinates to normalized coordinates (0-1 range)
function convertToNormalized(pixelX, pixelY) {
  return {
    x: pixelX / IMAGE_WIDTH,
    y: pixelY / IMAGE_HEIGHT
  }
}

// Map anatomical names to regions and aliases for female back view
const ANATOMICAL_MAPPING = {
  // Head and neck
  'head': { region: 'head', aliases: ['skull', 'cranium', 'occiput'] },
  'left_ear': { region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  'right_ear': { region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  'neck': { region: 'neck', aliases: ['cervical', 'nape'] },
  
  // Back and spine
  'upper_back': { region: 'back', aliases: ['upper dorsal', 'thoracic back'] },
  'middle_back': { region: 'back', aliases: ['mid dorsal', 'thoracolumbar'] },
  'lower_back': { region: 'back', aliases: ['lumbar', 'lower dorsal'] },
  'spine': { region: 'back', aliases: ['spinal', 'vertebral', 'backbone'] },
  'cervical_spine': { region: 'back', aliases: ['C-spine', 'neck vertebrae'] },
  'thoracic_spine': { region: 'back', aliases: ['T-spine', 'thoracic vertebrae'] },
  'lumbar_spine': { region: 'back', aliases: ['L-spine', 'lumbar vertebrae'] },
  'sacrum': { region: 'back', aliases: ['sacral', 'sacrococcygeal'] },
  'coccyx': { region: 'back', aliases: ['tailbone', 'coccygeal'] },
  
  // Shoulders and arms (posterior view)
  'left_shoulder_blade': { region: 'back', aliases: ['left scapula', 'left shoulder'] },
  'right_shoulder_blade': { region: 'back', aliases: ['right scapula', 'right shoulder'] },
  'left_arm_back': { region: 'upper_extremity', aliases: ['left posterior arm'] },
  'right_arm_back': { region: 'upper_extremity', aliases: ['right posterior arm'] },
  'left_elbow_back': { region: 'upper_extremity', aliases: ['left posterior elbow'] },
  'right_elbow_back': { region: 'upper_extremity', aliases: ['right posterior elbow'] },
  'left_forearm_back': { region: 'upper_extremity', aliases: ['left posterior forearm'] },
  'right_forearm_back': { region: 'upper_extremity', aliases: ['right posterior forearm'] },
  
  // Buttocks and pelvis
  'buttocks': { region: 'buttocks', aliases: ['gluteal', 'glutes'] },
  'left_buttock': { region: 'buttocks', aliases: ['left gluteal', 'left glute'] },
  'right_buttock': { region: 'buttocks', aliases: ['right gluteal', 'right glute'] },
  
  // Legs (posterior view)
  'left_thigh_back': { region: 'lower_extremity', aliases: ['left posterior thigh', 'left hamstring'] },
  'right_thigh_back': { region: 'lower_extremity', aliases: ['right posterior thigh', 'right hamstring'] },
  'left_knee_back': { region: 'lower_extremity', aliases: ['left posterior knee', 'left popliteal'] },
  'right_knee_back': { region: 'lower_extremity', aliases: ['right posterior knee', 'right popliteal'] },
  'left_calf': { region: 'lower_extremity', aliases: ['left gastrocnemius', 'left posterior leg'] },
  'right_calf': { region: 'lower_extremity', aliases: ['right gastrocnemius', 'right posterior leg'] },
  'left_ankle': { region: 'lower_extremity', aliases: ['left posterior ankle'] },
  'right_ankle': { region: 'lower_extremity', aliases: ['right posterior ankle'] },
  
  // Generic mappings for any unmapped regions
  'left_shoulder': { region: 'upper_extremity', aliases: ['left posterior deltoid'] },
  'right_shoulder': { region: 'upper_extremity', aliases: ['right posterior deltoid'] },
  'left_arm': { region: 'upper_extremity', aliases: ['left posterior arm', 'left triceps'] },
  'right_arm': { region: 'upper_extremity', aliases: ['right posterior arm', 'right triceps'] },
  'left_elbow': { region: 'upper_extremity', aliases: ['left posterior elbow'] },
  'right_elbow': { region: 'upper_extremity', aliases: ['right posterior elbow'] },
  'left_forearm': { region: 'upper_extremity', aliases: ['left posterior forearm'] },
  'right_forearm': { region: 'upper_extremity', aliases: ['right posterior forearm'] },
  'left_wrist': { region: 'upper_extremity', aliases: ['left posterior wrist'] },
  'right_wrist': { region: 'upper_extremity', aliases: ['right posterior wrist'] },
  'left_hand': { region: 'upper_extremity', aliases: ['left posterior hand'] },
  'right_hand': { region: 'upper_extremity', aliases: ['right posterior hand'] },
  'left_hip': { region: 'pelvis', aliases: ['left posterior hip'] },
  'right_hip': { region: 'pelvis', aliases: ['right posterior hip'] },
  'left_thigh': { region: 'lower_extremity', aliases: ['left posterior thigh', 'left hamstring'] },
  'right_thigh': { region: 'lower_extremity', aliases: ['right posterior thigh', 'right hamstring'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['femaleback.png']
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
let code = '// Female Back Coordinates - Generated from mapped femaleback.json\n'
code += 'export const femaleBackCoordinatesNew: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-femaleback-coordinates.ts'), code)

console.log('Generated female back coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-femaleback-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 10).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})