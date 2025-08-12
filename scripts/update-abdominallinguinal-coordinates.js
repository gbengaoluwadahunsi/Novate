// Script to update abdominal and inguinal coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/abdominallinguinal.json'), 'utf8'))

// Image dimensions for AbdominalInguinal.png
const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 600  // Specialized abdominal view

// Convert pixel coordinates to normalized coordinates (0-1 range)
function convertToNormalized(pixelX, pixelY) {
  return {
    x: pixelX / IMAGE_WIDTH,
    y: pixelY / IMAGE_HEIGHT
  }
}

// Map anatomical names to regions and aliases for abdominal/inguinal examination
const ANATOMICAL_MAPPING = {
  // Abdominal regions (9-region system)
  'right_hypochondriac_region': { region: 'abdomen', aliases: ['RHC', 'right upper quadrant', 'RUQ'] },
  'epigastric_region': { region: 'abdomen', aliases: ['epigastrium', 'upper middle abdomen'] },
  'left_hypochondriac_region': { region: 'abdomen', aliases: ['LHC', 'left upper quadrant', 'LUQ'] },
  'right_lumbar_region': { region: 'abdomen', aliases: ['right flank', 'right lateral abdomen'] },
  'umbilical_region': { region: 'abdomen', aliases: ['periumbilical', 'navel area', 'umbilicus'] },
  'left_lumbar_region': { region: 'abdomen', aliases: ['left flank', 'left lateral abdomen'] },
  'right_iliac_region': { region: 'abdomen', aliases: ['RIF', 'right lower quadrant', 'RLQ', 'right inguinal'] },
  'hypogastric_region': { region: 'abdomen', aliases: ['suprapubic', 'lower middle abdomen', 'hypogastrium'] },
  'left_iliac_region': { region: 'abdomen', aliases: ['LIF', 'left lower quadrant', 'LLQ', 'left inguinal'] },
  
  // Specific organs and structures
  'liver': { region: 'abdomen', aliases: ['hepatic', 'right lobe liver', 'left lobe liver'] },
  'gallbladder': { region: 'abdomen', aliases: ['GB', 'cholecystic', 'gallbladder fossa'] },
  'stomach': { region: 'abdomen', aliases: ['gastric', 'gastric fundus', 'gastric antrum'] },
  'spleen': { region: 'abdomen', aliases: ['splenic', 'left upper quadrant organ'] },
  'pancreas': { region: 'abdomen', aliases: ['pancreatic', 'pancreatic head', 'pancreatic tail'] },
  'right_kidney': { region: 'abdomen', aliases: ['right renal', 'right nephric'] },
  'left_kidney': { region: 'abdomen', aliases: ['left renal', 'left nephric'] },
  'bladder': { region: 'abdomen', aliases: ['urinary bladder', 'vesical', 'suprapubic bladder'] },
  'appendix': { region: 'abdomen', aliases: ['vermiform appendix', 'appendiceal', 'McBurney point'] },
  
  // Intestinal regions
  'ascending_colon': { region: 'abdomen', aliases: ['right colon', 'cecum', 'hepatic flexure'] },
  'transverse_colon': { region: 'abdomen', aliases: ['middle colon'] },
  'descending_colon': { region: 'abdomen', aliases: ['left colon', 'splenic flexure'] },
  'sigmoid_colon': { region: 'abdomen', aliases: ['sigmoid', 'left lower colon'] },
  'small_intestine': { region: 'abdomen', aliases: ['small bowel', 'jejunum', 'ileum', 'duodenum'] },
  
  // Vascular structures
  'aorta': { region: 'abdomen', aliases: ['abdominal aorta', 'aortic pulsation'] },
  'inferior_vena_cava': { region: 'abdomen', aliases: ['IVC', 'vena cava'] },
  
  // Inguinal and groin structures
  'right_inguinal_canal': { region: 'inguinal', aliases: ['right inguinal', 'right groin'] },
  'left_inguinal_canal': { region: 'inguinal', aliases: ['left inguinal', 'left groin'] },
  'right_femoral_triangle': { region: 'inguinal', aliases: ['right femoral', 'right upper thigh'] },
  'left_femoral_triangle': { region: 'inguinal', aliases: ['left femoral', 'left upper thigh'] },
  
  // Anatomical landmarks
  'xiphoid_process': { region: 'abdomen', aliases: ['xiphisternum', 'lower sternum'] },
  'right_costal_margin': { region: 'abdomen', aliases: ['right rib margin', 'right subcostal'] },
  'left_costal_margin': { region: 'abdomen', aliases: ['left rib margin', 'left subcostal'] },
  'pubic_symphysis': { region: 'inguinal', aliases: ['pubis', 'pubic bone'] },
  'anterior_superior_iliac_spine': { region: 'inguinal', aliases: ['ASIS', 'iliac spine'] },
  
  // Clinical examination points
  'mcburney_point': { region: 'abdomen', aliases: ['appendix point', 'appendicitis point'] },
  'murphy_sign': { region: 'abdomen', aliases: ['gallbladder tenderness', 'cholecystitis point'] },
  'rovsing_sign_appendicitis': { region: 'abdomen', aliases: ['Rovsing sign', 'referred appendix pain'] },
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['abdominalinguinal.png']
const coordinates = []

Object.entries(imageData.coordinates).forEach(([anatomicalName, coord]) => {
  // Convert pixel coordinates to normalized coordinates
  const normalized = convertToNormalized(coord.x, coord.y)
  
  // Get region and aliases from mapping
  const mapping = ANATOMICAL_MAPPING[anatomicalName]
  const region = mapping?.region || 'abdomen' // default to abdomen
  const aliases = mapping?.aliases || []
  
  coordinates.push({
    name: anatomicalName,
    coordinates: normalized,
    region,
    aliases
  })
})

// Generate TypeScript code
let code = '// Abdominal and Inguinal Coordinates - Generated from mapped abdominallinguinal.json\n'
code += 'export const abdominalCoordinatesNew: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-abdominallinguinal-coordinates.ts'), code)

console.log('Generated abdominal and inguinal coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-abdominallinguinal-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 10).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})