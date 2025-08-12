// Script to update female right side coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/femalerightside.json'), 'utf8'))

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

// Map anatomical names to regions and aliases for female right side view
const ANATOMICAL_MAPPING = {
  // Head and facial features (right side profile)
  'head': { region: 'head', aliases: ['skull', 'cranium'] },
  'face': { region: 'head', aliases: ['facial profile', 'right profile'] },
  'nose': { region: 'head', aliases: ['nasal profile', 'right nasal'] },
  'right_eye': { region: 'head', aliases: ['right ocular', 'right orbital'] },
  'right_ear': { region: 'head', aliases: ['right auditory', 'right otic'] },
  'mouth': { region: 'head', aliases: ['oral', 'buccal'] },
  'chin': { region: 'head', aliases: ['mental', 'mandibular'] },
  
  // Neck and throat (right side)
  'neck': { region: 'neck', aliases: ['cervical', 'right cervical'] },
  'throat': { region: 'neck', aliases: ['pharyngeal', 'laryngeal'] },
  
  // Chest and thorax (right side view)
  'chest': { region: 'chest', aliases: ['right thorax', 'right chest wall'] },
  'right_breast': { region: 'chest', aliases: ['right mammary', 'right breast tissue'] },
  
  // Upper extremities (right side)
  'right_shoulder': { region: 'upper_extremity', aliases: ['right deltoid', 'right shoulder joint'] },
  'right_arm': { region: 'upper_extremity', aliases: ['right upper arm', 'right brachial'] },
  'right_elbow': { region: 'upper_extremity', aliases: ['right elbow joint'] },
  'right_forearm': { region: 'upper_extremity', aliases: ['right lower arm'] },
  'right_wrist': { region: 'upper_extremity', aliases: ['right wrist joint'] },
  'right_hand': { region: 'upper_extremity', aliases: ['right palm', 'right fingers'] },
  
  // Abdomen and pelvis (right side)
  'abdomen': { region: 'abdomen', aliases: ['right abdominal wall', 'right abdomen'] },
  'right_hip': { region: 'pelvis', aliases: ['right hip joint', 'right pelvic'] },
  
  // Lower extremities (right side)
  'right_thigh': { region: 'lower_extremity', aliases: ['right upper leg', 'right femoral'] },
  'right_knee': { region: 'lower_extremity', aliases: ['right knee joint', 'right patella'] },
  'right_calf': { region: 'lower_extremity', aliases: ['right lower leg', 'right gastrocnemius'] },
  'right_ankle': { region: 'lower_extremity', aliases: ['right ankle joint'] },
  'right_foot': { region: 'lower_extremity', aliases: ['right pedal'] },
  
  // Spine (right side view)
  'spine': { region: 'back', aliases: ['vertebral column', 'spinal column'] },
  'cervical_spine': { region: 'back', aliases: ['C-spine', 'neck vertebrae'] },
  'thoracic_spine': { region: 'back', aliases: ['T-spine', 'thoracic vertebrae'] },
  'lumbar_spine': { region: 'back', aliases: ['L-spine', 'lumbar vertebrae'] },
  
  // Generic mappings for any additional regions
  'pelvis': { region: 'pelvis', aliases: ['pelvic girdle', 'right pelvis'] },
  'back': { region: 'back', aliases: ['dorsal', 'posterior'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['femalerightside.png']
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
let code = '// Female Right Side Coordinates - Generated from mapped femalerightside.json\n'
code += 'export const femaleRightSideCoordinatesNew: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-femalerightside-coordinates.ts'), code)

console.log('Generated female right side coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-femalerightside-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 10).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})