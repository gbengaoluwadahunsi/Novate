// Script to update cardiorespiratory coordinates from mapped JSON data
const fs = require('fs')
const path = require('path')

// Read the mapped JSON data
const mappedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mappedJsons/respicardio.json'), 'utf8'))

// Image dimensions (you may need to adjust these based on your actual image size)
const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 600

// Convert pixel coordinates to normalized coordinates (0-1 range)
function convertToNormalized(pixelX, pixelY) {
  return {
    x: pixelX / IMAGE_WIDTH,
    y: pixelY / IMAGE_HEIGHT
  }
}

// Map anatomical names to regions and aliases
const ANATOMICAL_MAPPING = {
  // Heart valves and areas
  'mitral_area': { region: 'cardiovascular', aliases: ['mitral valve', 'bicuspid valve', 'apex beat'] },
  'pulmonary_area': { region: 'cardiovascular', aliases: ['pulmonary valve', 'pulmonic area'] },
  'tricuspid_area': { region: 'cardiovascular', aliases: ['tricuspid valve'] },
  'aortic_area': { region: 'cardiovascular', aliases: ['aortic valve'] },
  
  // Cardiac examination points
  'parasternal_heave_area': { region: 'cardiovascular', aliases: ['parasternal lift', 'RV heave'] },
  'lower_sternal_border': { region: 'cardiovascular', aliases: ['LSB', 'tricuspid area'] },
  'mitral_area_to_axilla': { region: 'cardiovascular', aliases: ['mitral radiation', 'axillary area'] },
  
  // Vascular examination
  'carotid_artery_left': { region: 'cardiovascular', aliases: ['left carotid', 'carotid pulse left'] },
  'carotid_artery_right': { region: 'cardiovascular', aliases: ['right carotid', 'carotid pulse right'] },
  'jugular_venous_pressure_point': { region: 'cardiovascular', aliases: ['JVP', 'jugular vein', 'neck veins'] },
  
  // Respiratory examination points
  'trachea_suprasternal_notch': { region: 'respiratory', aliases: ['trachea', 'suprasternal notch', 'windpipe'] },
  'upper_chest_expansion_right': { region: 'respiratory', aliases: ['right chest expansion', 'right upper chest'] },
  'upper_chest_expansion_left': { region: 'respiratory', aliases: ['left chest expansion', 'left upper chest'] },
  'lower_chest_expansion_right': { region: 'respiratory', aliases: ['right lower chest', 'right base'] },
  'lower_chest_expansion_left': { region: 'respiratory', aliases: ['left lower chest', 'left base'] },
  
  // Lung auscultation points
  'right_upper_lobe_anterior': { region: 'respiratory', aliases: ['RUL anterior', 'right apex anterior'] },
  'left_upper_lobe_anterior': { region: 'respiratory', aliases: ['LUL anterior', 'left apex anterior'] },
  'right_middle_lobe': { region: 'respiratory', aliases: ['RML', 'right middle lobe'] },
  'left_lower_lobe_anterior': { region: 'respiratory', aliases: ['LLL anterior', 'left base anterior'] },
  'right_lower_lobe_anterior': { region: 'respiratory', aliases: ['RLL anterior', 'right base anterior'] },
  
  // Percussion points
  'percussion_clavicle_right': { region: 'respiratory', aliases: ['right clavicular percussion', 'right apex percussion'] },
  'percussion_clavicle_left': { region: 'respiratory', aliases: ['left clavicular percussion', 'left apex percussion'] },
  
  // Tactile fremitus points
  'tactile_fremitus_upper_right': { region: 'respiratory', aliases: ['fremitus upper right', 'vocal fremitus upper right'] },
  'tactile_fremitus_upper_left': { region: 'respiratory', aliases: ['fremitus upper left', 'vocal fremitus upper left'] },
  'tactile_fremitus_lower_right': { region: 'respiratory', aliases: ['fremitus lower right', 'vocal fremitus lower right'] },
  'tactile_fremitus_lower_left': { region: 'respiratory', aliases: ['fremitus lower left', 'vocal fremitus lower left'] }
}

// Convert the mapped data
const imageData = mappedData.coordinates_by_image['respicardio.png']
const coordinates = []

Object.entries(imageData.coordinates).forEach(([anatomicalName, coord]) => {
  // Convert pixel coordinates to normalized coordinates
  const normalized = convertToNormalized(coord.x, coord.y)
  
  // Get region and aliases from mapping
  const mapping = ANATOMICAL_MAPPING[anatomicalName]
  const region = mapping?.region || 'cardiovascular' // default to cardiovascular
  const aliases = mapping?.aliases || []
  
  coordinates.push({
    name: anatomicalName,
    coordinates: normalized,
    region,
    aliases
  })
})

// Generate TypeScript code
let code = '// Cardiorespiratory System Coordinates (Gender Neutral) - Generated from mapped respicardio.json\n'
code += 'export const cardioRespiratoryCoordinates: BodyPartCoordinate[] = [\n'

coordinates.forEach(coord => {
  code += `  { name: '${coord.name}', coordinates: { x: ${coord.coordinates.x.toFixed(3)}, y: ${coord.coordinates.y.toFixed(3)} }, region: '${coord.region}'`
  if (coord.aliases && coord.aliases.length > 0) {
    code += `, aliases: [${coord.aliases.map(alias => `'${alias}'`).join(', ')}]`
  }
  code += ' },\n'
})

code += ']\n'

// Write the generated coordinates to a file
fs.writeFileSync(path.join(__dirname, 'generated-respicardio-coordinates.ts'), code)

console.log('Generated cardiorespiratory coordinates from mapped data!')
console.log(`Total coordinates: ${coordinates.length}`)
console.log('Output file: scripts/generated-respicardio-coordinates.ts')
console.log('\nPreview of first few coordinates:')
coordinates.slice(0, 5).forEach(coord => {
  console.log(`  ${coord.name}: (${coord.coordinates.x.toFixed(3)}, ${coord.coordinates.y.toFixed(3)}) - ${coord.region}`)
})