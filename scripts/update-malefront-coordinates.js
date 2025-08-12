// Script to update male front coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/malefront.json'), 'utf8'))

// Image dimensions (you may need to adjust these based on your actual image size)
const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 1200  // Full body front view

// Convert pixel coordinates to normalized coordinates (0-1 range)
function convertToNormalized(pixelX, pixelY) {
  return {
    x: pixelX / IMAGE_WIDTH,
    y: pixelY / IMAGE_HEIGHT
  }
}

// Map anatomical names to regions and aliases for front view
const ANATOMICAL_MAPPING = {
  // Head and facial features
  'head': { region: 'head', aliases: ['skull', 'cranium'] },
  'face': { region: 'head', aliases: ['facial'] },
  'nose': { region: 'head', aliases: ['nasal', 'nostril'] },
  'eyes': { region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  'ears': { region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  'mouth': { region: 'head', aliases: ['oral', 'lips', 'buccal'] },
  'forehead': { region: 'head', aliases: ['frontal'] },
  
  // Neck
  'neck': { region: 'neck', aliases: ['cervical', 'throat'] },
  
  // Chest and torso
  'chest': { region: 'chest', aliases: ['thorax', 'pectoral'] },
  'upper_chest': { region: 'chest', aliases: ['upper thorax'] },
  'lower_chest': { region: 'chest', aliases: ['lower thorax'] },
  'nipples': { region: 'chest', aliases: ['areola', 'breast'] },
  
  // Abdomen
  'abdomen': { region: 'abdomen', aliases: ['abdominal', 'belly'] },
  'upper_abdomen': { region: 'abdomen', aliases: ['epigastrium'] },
  'lower_abdomen': { region: 'abdomen', aliases: ['hypogastrium', 'suprapubic'] },
  'navel': { region: 'abdomen', aliases: ['umbilicus', 'belly button'] },
  
  // Upper extremities
  'shoulders': { region: 'upper_extremity', aliases: ['shoulder', 'deltoid'] },
  'left_shoulder': { region: 'upper_extremity', aliases: ['left deltoid'] },
  'right_shoulder': { region: 'upper_extremity', aliases: ['right deltoid'] },
  'left_arm': { region: 'upper_extremity', aliases: ['left brachial'] },
  'right_arm': { region: 'upper_extremity', aliases: ['right brachial'] },
  'left_elbow': { region: 'upper_extremity', aliases: ['left cubital'] },
  'right_elbow': { region: 'upper_extremity', aliases: ['right cubital'] },
  'left_forearm': { region: 'upper_extremity', aliases: ['left antebrachial'] },
  'right_forearm': { region: 'upper_extremity', aliases: ['right antebrachial'] },
  'left_wrist': { region: 'upper_extremity', aliases: ['left carpal'] },
  'right_wrist': { region: 'upper_extremity', aliases: ['right carpal'] },
  'left_hand': { region: 'upper_extremity', aliases: ['left palm'] },
  'right_hand': { region: 'upper_extremity', aliases: ['right palm'] },
  
  // Lower extremities
  'hips': { region: 'lower_extremity', aliases: ['hip', 'pelvic'] },
  'left_thigh': { region: 'lower_extremity', aliases: ['left femoral'] },
  'right_thigh': { region: 'lower_extremity', aliases: ['right femoral'] },
  'left_knee': { region: 'lower_extremity', aliases: ['left patella'] },
  'right_knee': { region: 'lower_extremity', aliases: ['right patella'] },
  'left_shin': { region: 'lower_extremity', aliases: ['left tibia'] },
  'right_shin': { region: 'lower_extremity', aliases: ['right tibia'] },
  'left_calf': { region: 'lower_extremity', aliases: ['left gastrocnemius'] },
  'right_calf': { region: 'lower_extremity', aliases: ['right gastrocnemius'] },
  'left_ankle': { region: 'lower_extremity', aliases: ['left malleolus'] },
  'right_ankle': { region: 'lower_extremity', aliases: ['right malleolus'] },
  'left_foot': { region: 'lower_extremity', aliases: ['left pedal'] },
  'right_foot': { region: 'lower_extremity', aliases: ['right pedal'] },
  
  // Genitourinary
  'testicles': { region: 'genitourinary', aliases: ['testes', 'scrotum'] },
  'prostate': { region: 'genitourinary', aliases: ['prostatic'] },
  'penis': { region: 'genitourinary', aliases: ['phallus'] },
  
  // Other regions
  'groin': { region: 'genitourinary', aliases: ['inguinal'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['malefront.png']
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
let code = '// Male Front Coordinates - Generated from mapped malefront.json\n'
code += 'export const maleFrontCoordinatesNew: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-malefront-coordinates.ts'), code)

console.log('Generated male front coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-malefront-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 10).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})