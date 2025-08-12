// Script to update female front coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/femalefront.json'), 'utf8'))

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

// Map anatomical names to regions and aliases for female front view
const ANATOMICAL_MAPPING = {
  // Head and facial features
  'head': { region: 'head', aliases: ['skull', 'cranium'] },
  'face': { region: 'head', aliases: ['facial', 'countenance'] },
  'nose': { region: 'head', aliases: ['nasal', 'nares'] },
  'eyes': { region: 'head', aliases: ['ocular', 'orbital'] },
  'mouth': { region: 'head', aliases: ['oral', 'buccal'] },
  'ears': { region: 'head', aliases: ['auditory', 'otic'] },
  'left_ear': { region: 'head', aliases: ['left auditory', 'left otic'] },
  'right_ear': { region: 'head', aliases: ['right auditory', 'right otic'] },
  'forehead': { region: 'head', aliases: ['frontal', 'brow'] },
  'chin': { region: 'head', aliases: ['mental', 'mandibular'] },
  
  // Neck and throat
  'neck': { region: 'neck', aliases: ['cervical', 'throat'] },
  'throat': { region: 'neck', aliases: ['pharyngeal', 'laryngeal'] },
  
  // Chest and thorax (female-specific)
  'chest': { region: 'chest', aliases: ['thorax', 'thoracic'] },
  'breasts': { region: 'chest', aliases: ['mammary', 'breast tissue'] },
  'left_breast': { region: 'chest', aliases: ['left mammary', 'left breast'] },
  'right_breast': { region: 'chest', aliases: ['right mammary', 'right breast'] },
  'sternum': { region: 'chest', aliases: ['breastbone', 'sternal'] },
  'ribs': { region: 'chest', aliases: ['costal', 'rib cage'] },
  'clavicle': { region: 'chest', aliases: ['collarbone', 'clavicular'] },
  
  // Upper extremities
  'shoulders': { region: 'upper_extremity', aliases: ['deltoid', 'shoulder girdle'] },
  'left_shoulder': { region: 'upper_extremity', aliases: ['left deltoid'] },
  'right_shoulder': { region: 'upper_extremity', aliases: ['right deltoid'] },
  'arms': { region: 'upper_extremity', aliases: ['upper arms', 'brachial'] },
  'left_arm': { region: 'upper_extremity', aliases: ['left upper arm', 'left brachial'] },
  'right_arm': { region: 'upper_extremity', aliases: ['right upper arm', 'right brachial'] },
  'elbows': { region: 'upper_extremity', aliases: ['elbow joints'] },
  'left_elbow': { region: 'upper_extremity', aliases: ['left elbow joint'] },
  'right_elbow': { region: 'upper_extremity', aliases: ['right elbow joint'] },
  'forearms': { region: 'upper_extremity', aliases: ['lower arms'] },
  'left_forearm': { region: 'upper_extremity', aliases: ['left lower arm'] },
  'right_forearm': { region: 'upper_extremity', aliases: ['right lower arm'] },
  'wrists': { region: 'upper_extremity', aliases: ['wrist joints'] },
  'left_wrist': { region: 'upper_extremity', aliases: ['left wrist joint'] },
  'right_wrist': { region: 'upper_extremity', aliases: ['right wrist joint'] },
  'hands': { region: 'upper_extremity', aliases: ['palms', 'fingers'] },
  'left_hand': { region: 'upper_extremity', aliases: ['left palm', 'left fingers'] },
  'right_hand': { region: 'upper_extremity', aliases: ['right palm', 'right fingers'] },
  
  // Abdomen and pelvis
  'abdomen': { region: 'abdomen', aliases: ['abdominal', 'belly'] },
  'upper_abdomen': { region: 'abdomen', aliases: ['epigastrium', 'upper belly'] },
  'lower_abdomen': { region: 'abdomen', aliases: ['hypogastrium', 'lower belly'] },
  'navel': { region: 'abdomen', aliases: ['umbilicus', 'belly button'] },
  'pelvis': { region: 'pelvis', aliases: ['pelvic', 'hip region'] },
  'hips': { region: 'pelvis', aliases: ['hip joints', 'pelvic girdle'] },
  'left_hip': { region: 'pelvis', aliases: ['left hip joint'] },
  'right_hip': { region: 'pelvis', aliases: ['right hip joint'] },
  
  // Genitourinary (female-specific)
  'genitalia': { region: 'genitourinary', aliases: ['vulva', 'external genitalia'] },
  'groin': { region: 'genitourinary', aliases: ['inguinal', 'pubic region'] },
  'left_groin': { region: 'genitourinary', aliases: ['left inguinal'] },
  'right_groin': { region: 'genitourinary', aliases: ['right inguinal'] },
  
  // Lower extremities
  'thighs': { region: 'lower_extremity', aliases: ['upper legs', 'femoral'] },
  'left_thigh': { region: 'lower_extremity', aliases: ['left upper leg', 'left femoral'] },
  'right_thigh': { region: 'lower_extremity', aliases: ['right upper leg', 'right femoral'] },
  'knees': { region: 'lower_extremity', aliases: ['knee joints', 'patella'] },
  'left_knee': { region: 'lower_extremity', aliases: ['left knee joint', 'left patella'] },
  'right_knee': { region: 'lower_extremity', aliases: ['right knee joint', 'right patella'] },
  'calves': { region: 'lower_extremity', aliases: ['lower legs', 'shins'] },
  'left_calf': { region: 'lower_extremity', aliases: ['left lower leg', 'left shin'] },
  'right_calf': { region: 'lower_extremity', aliases: ['right lower leg', 'right shin'] },
  'ankles': { region: 'lower_extremity', aliases: ['ankle joints'] },
  'left_ankle': { region: 'lower_extremity', aliases: ['left ankle joint'] },
  'right_ankle': { region: 'lower_extremity', aliases: ['right ankle joint'] },
  'feet': { region: 'lower_extremity', aliases: ['foot', 'pedal'] },
  'left_foot': { region: 'lower_extremity', aliases: ['left pedal'] },
  'right_foot': { region: 'lower_extremity', aliases: ['right pedal'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['femalefront.png']
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
let code = '// Female Front Coordinates - Generated from mapped femalefront.json\n'
code += 'export const femaleFrontCoordinatesNew: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-femalefront-coordinates.ts'), code)

console.log('Generated female front coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-femalefront-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 10).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})