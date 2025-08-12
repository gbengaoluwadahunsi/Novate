// Script to update female left side coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/femaleleftside.json'), 'utf8'))

// Image dimensions (you may need to adjust these based on your actual image size)
const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 1200  // Full body side view

// Convert pixel coordinates to normalized coordinates (0-1 range)
function convertToNormalized(pixelX, pixelY) {
  return {
    x: pixelX / IMAGE_WIDTH,
    y: pixelY / IMAGE_HEIGHT
  }
}

// Map anatomical names to regions and aliases for female left side view
const ANATOMICAL_MAPPING = {
  // Head and facial features (left side profile)
  'head': { region: 'head', aliases: ['skull', 'cranium'] },
  'face': { region: 'head', aliases: ['facial profile', 'left profile'] },
  'nose': { region: 'head', aliases: ['nasal profile', 'left nasal'] },
  'left_eye': { region: 'head', aliases: ['left ocular', 'left orbital'] },
  'left_ear': { region: 'head', aliases: ['left auditory', 'left otic'] },
  'mouth': { region: 'head', aliases: ['oral', 'buccal'] },
  'chin': { region: 'head', aliases: ['mental', 'mandibular'] },
  
  // Neck and throat (left side)
  'neck': { region: 'neck', aliases: ['cervical', 'left cervical'] },
  'throat': { region: 'neck', aliases: ['pharyngeal', 'laryngeal'] },
  
  // Chest and thorax (left side view)
  'chest': { region: 'chest', aliases: ['left thorax', 'left chest wall'] },
  'left_breast': { region: 'chest', aliases: ['left mammary', 'left breast tissue'] },
  
  // Upper extremities (left side)
  'left_shoulder': { region: 'upper_extremity', aliases: ['left deltoid', 'left shoulder joint'] },
  'left_arm': { region: 'upper_extremity', aliases: ['left upper arm', 'left brachial'] },
  'left_elbow': { region: 'upper_extremity', aliases: ['left elbow joint'] },
  'left_forearm': { region: 'upper_extremity', aliases: ['left lower arm'] },
  'left_wrist': { region: 'upper_extremity', aliases: ['left wrist joint'] },
  'left_hand': { region: 'upper_extremity', aliases: ['left palm', 'left fingers'] },
  
  // Abdomen and pelvis (left side)
  'abdomen': { region: 'abdomen', aliases: ['left abdominal wall', 'left abdomen'] },
  'left_hip': { region: 'pelvis', aliases: ['left hip joint', 'left pelvic'] },
  
  // Lower extremities (left side)
  'left_thigh': { region: 'lower_extremity', aliases: ['left upper leg', 'left femoral'] },
  'left_knee': { region: 'lower_extremity', aliases: ['left knee joint', 'left patella'] },
  'left_calf': { region: 'lower_extremity', aliases: ['left lower leg', 'left gastrocnemius'] },
  'left_ankle': { region: 'lower_extremity', aliases: ['left ankle joint'] },
  'left_foot': { region: 'lower_extremity', aliases: ['left pedal'] },
  
  // Spine (left side view)
  'spine': { region: 'back', aliases: ['vertebral column', 'spinal column'] },
  'cervical_spine': { region: 'back', aliases: ['C-spine', 'neck vertebrae'] },
  'thoracic_spine': { region: 'back', aliases: ['T-spine', 'thoracic vertebrae'] },
  'lumbar_spine': { region: 'back', aliases: ['L-spine', 'lumbar vertebrae'] },
  
  // Generic mappings for any additional regions
  'pelvis': { region: 'pelvis', aliases: ['pelvic girdle', 'left pelvis'] },
  'back': { region: 'back', aliases: ['dorsal', 'posterior'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['femaleleftside.png']
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
let code = '// Female Left Side Coordinates - Generated from mapped femaleleftside.json\n'
code += 'export const femaleLeftSideCoordinatesNew: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-femaleleftside-coordinates.ts'), code)

console.log('Generated female left side coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-femaleleftside-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 10).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})