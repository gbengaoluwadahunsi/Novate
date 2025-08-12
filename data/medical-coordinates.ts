// Medical Body Part Coordinates for Anatomical Diagrams
// Coordinates are normalized (0-1) relative to image dimensions

export interface BodyPartCoordinate {
  name: string
  coordinates: {
    x: number // 0-1 (left to right)
    y: number // 0-1 (top to bottom)
  }
  region: string
  aliases?: string[] // Alternative names for the same body part
}

export interface AnatomicalView {
  view: 'front' | 'back' | 'leftside' | 'rightside' | 'cardiorespiratory' | 'abdominal'
  gender: 'male' | 'female' | 'neutral'
  imagePath: string
  bodyParts: BodyPartCoordinate[]
}

// Male Front Coordinates - Generated from mapped malefront.json
export const maleFrontCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.469, y: 0.052 }, region: 'head', aliases: ['skull', 'cranium'] },
  { name: 'face', coordinates: { x: 0.465, y: 0.093 }, region: 'head', aliases: ['facial'] },
  { name: 'nose', coordinates: { x: 0.469, y: 0.128 }, region: 'head', aliases: ['nasal', 'nostril'] },
  { name: 'eyes', coordinates: { x: 0.431, y: 0.098 }, region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  { name: 'left_eye', coordinates: { x: 0.502, y: 0.101 }, region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  { name: 'right_eye', coordinates: { x: 0.431, y: 0.098 }, region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  { name: 'mouth', coordinates: { x: 0.472, y: 0.146 }, region: 'head', aliases: ['oral', 'lips', 'buccal'] },
  { name: 'left_ear', coordinates: { x: 0.547, y: 0.113 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'right_ear', coordinates: { x: 0.390, y: 0.121 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'neck', coordinates: { x: 0.465, y: 0.191 }, region: 'neck', aliases: ['cervical', 'throat'] },
  { name: 'chest', coordinates: { x: 0.469, y: 0.253 }, region: 'chest', aliases: ['thorax', 'pectoral'] },
  { name: 'heart', coordinates: { x: 0.547, y: 0.275 }, region: 'cardiovascular', aliases: ['cardiac', 'myocardium'] },
  { name: 'lungs', coordinates: { x: 0.394, y: 0.253 }, region: 'respiratory', aliases: ['pulmonary', 'respiratory'] },
  { name: 'left_lung', coordinates: { x: 0.536, y: 0.253 }, region: 'respiratory', aliases: ['left pulmonary'] },
  { name: 'right_lung', coordinates: { x: 0.398, y: 0.253 }, region: 'respiratory', aliases: ['right pulmonary'] },
  { name: 'left_shoulder', coordinates: { x: 0.599, y: 0.203 }, region: 'upper_extremity', aliases: ['left deltoid'] },
  { name: 'right_shoulder', coordinates: { x: 0.343, y: 0.206 }, region: 'upper_extremity', aliases: ['right deltoid'] },
  { name: 'left_arm', coordinates: { x: 0.647, y: 0.315 }, region: 'upper_extremity', aliases: ['left brachial'] },
  { name: 'right_arm', coordinates: { x: 0.297, y: 0.313 }, region: 'upper_extremity', aliases: ['right brachial'] },
  { name: 'left_forearm', coordinates: { x: 0.674, y: 0.419 }, region: 'upper_extremity', aliases: ['left antebrachial'] },
  { name: 'right_forearm', coordinates: { x: 0.264, y: 0.422 }, region: 'upper_extremity', aliases: ['right antebrachial'] },
  { name: 'left_wrist', coordinates: { x: 0.700, y: 0.474 }, region: 'upper_extremity', aliases: ['left carpal'] },
  { name: 'right_wrist', coordinates: { x: 0.249, y: 0.477 }, region: 'upper_extremity', aliases: ['right carpal'] },
  { name: 'left_hand', coordinates: { x: 0.708, y: 0.517 }, region: 'upper_extremity', aliases: ['left palm'] },
  { name: 'right_hand', coordinates: { x: 0.226, y: 0.517 }, region: 'upper_extremity', aliases: ['right palm'] },
  { name: 'abdomen', coordinates: { x: 0.472, y: 0.383 }, region: 'abdomen', aliases: ['abdominal', 'belly'] },
  { name: 'stomach', coordinates: { x: 0.510, y: 0.320 }, region: 'abdomen', aliases: ['gastric'] },
  { name: 'liver', coordinates: { x: 0.398, y: 0.313 }, region: 'abdomen', aliases: ['hepatic'] },
  { name: 'pelvis', coordinates: { x: 0.472, y: 0.472 }, region: 'pelvis', aliases: ['pelvic', 'hip'] },
  { name: 'left_hip', coordinates: { x: 0.566, y: 0.434 }, region: 'pelvis', aliases: ['left pelvic'] },
  { name: 'right_hip', coordinates: { x: 0.360, y: 0.429 }, region: 'pelvis', aliases: ['right pelvic'] },
  { name: 'left_thigh', coordinates: { x: 0.544, y: 0.576 }, region: 'lower_extremity', aliases: ['left femoral'] },
  { name: 'right_thigh', coordinates: { x: 0.390, y: 0.581 }, region: 'lower_extremity', aliases: ['right femoral'] },
  { name: 'left_knee', coordinates: { x: 0.529, y: 0.671 }, region: 'lower_extremity', aliases: ['left patella'] },
  { name: 'right_knee', coordinates: { x: 0.394, y: 0.671 }, region: 'lower_extremity', aliases: ['right patella'] },
  { name: 'left_shin', coordinates: { x: 0.525, y: 0.762 }, region: 'lower_extremity', aliases: ['left tibia'] },
  { name: 'right_shin', coordinates: { x: 0.409, y: 0.765 }, region: 'lower_extremity', aliases: ['right tibia'] },
  { name: 'left_ankle', coordinates: { x: 0.510, y: 0.853 }, region: 'lower_extremity', aliases: ['left malleolus'] },
  { name: 'right_ankle', coordinates: { x: 0.420, y: 0.853 }, region: 'lower_extremity', aliases: ['right malleolus'] },
  { name: 'left_foot', coordinates: { x: 0.540, y: 0.892 }, region: 'lower_extremity', aliases: ['left pedal'] },
  { name: 'right_foot', coordinates: { x: 0.405, y: 0.895 }, region: 'lower_extremity', aliases: ['right pedal'] },
  { name: 'testicles', coordinates: { x: 0.472, y: 0.527 }, region: 'genitourinary', aliases: ['testes', 'scrotum'] },
  { name: 'prostate', coordinates: { x: 0.472, y: 0.502 }, region: 'genitourinary', aliases: ['prostatic'] },
]

// Female Front Coordinates - Generated from mapped femalefront.json
export const femaleFrontCoordinates: BodyPartCoordinate[] = [
  // Centered using JSON (396,9) with +25px offset: ((396+25)/800, (9+25)/1200) => (0.52625, 0.02833)
  { name: 'head', coordinates: { x: 0.52625, y: 0.02833 }, region: 'head', aliases: ['skull', 'cranium'] },
  { name: 'face', coordinates: { x: 0.502, y: 0.063 }, region: 'head', aliases: ['facial', 'countenance'] },
  { name: 'nose', coordinates: { x: 0.499, y: 0.095 }, region: 'head', aliases: ['nasal', 'nares'] },
  { name: 'eyes', coordinates: { x: 0.465, y: 0.068 }, region: 'head', aliases: ['ocular', 'orbital'] },
  { name: 'left_eye', coordinates: { x: 0.532, y: 0.065 }, region: 'head', aliases: ['left ocular', 'left orbital'] },
  { name: 'right_eye', coordinates: { x: 0.458, y: 0.068 }, region: 'head', aliases: ['right ocular', 'right orbital'] },
  { name: 'mouth', coordinates: { x: 0.495, y: 0.122 }, region: 'head', aliases: ['oral', 'buccal'] },
  { name: 'left_ear', coordinates: { x: 0.581, y: 0.077 }, region: 'head', aliases: ['left auditory', 'left otic'] },
  { name: 'right_ear', coordinates: { x: 0.412, y: 0.080 }, region: 'head', aliases: ['right auditory', 'right otic'] },
  { name: 'neck', coordinates: { x: 0.495, y: 0.154 }, region: 'neck', aliases: ['cervical', 'throat'] },
  { name: 'chest', coordinates: { x: 0.499, y: 0.244 }, region: 'chest', aliases: ['thorax', 'thoracic'] },
  { name: 'heart', coordinates: { x: 0.589, y: 0.282 }, region: 'chest', aliases: ['cardiac', 'myocardial'] },
  { name: 'lungs', coordinates: { x: 0.412, y: 0.229 }, region: 'chest', aliases: ['pulmonary', 'respiratory'] },
  { name: 'left_lung', coordinates: { x: 0.578, y: 0.224 }, region: 'chest', aliases: ['left pulmonary', 'left respiratory'] },
  { name: 'right_lung', coordinates: { x: 0.424, y: 0.229 }, region: 'chest', aliases: ['right pulmonary', 'right respiratory'] },
  { name: 'left_shoulder', coordinates: { x: 0.603, y: 0.174 }, region: 'upper_extremity', aliases: ['left deltoid'] },
  { name: 'right_shoulder', coordinates: { x: 0.386, y: 0.174 }, region: 'upper_extremity', aliases: ['right deltoid'] },
  { name: 'left_arm', coordinates: { x: 0.666, y: 0.297 }, region: 'upper_extremity', aliases: ['left upper arm', 'left brachial'] },
  { name: 'right_arm', coordinates: { x: 0.331, y: 0.294 }, region: 'upper_extremity', aliases: ['right upper arm', 'right brachial'] },
  { name: 'left_forearm', coordinates: { x: 0.700, y: 0.411 }, region: 'upper_extremity', aliases: ['left lower arm'] },
  { name: 'right_forearm', coordinates: { x: 0.294, y: 0.413 }, region: 'upper_extremity', aliases: ['right lower arm'] },
  { name: 'left_wrist', coordinates: { x: 0.734, y: 0.492 }, region: 'upper_extremity', aliases: ['left wrist joint'] },
  { name: 'right_wrist', coordinates: { x: 0.264, y: 0.500 }, region: 'upper_extremity', aliases: ['right wrist joint'] },
  { name: 'left_hand', coordinates: { x: 0.752, y: 0.537 }, region: 'upper_extremity', aliases: ['left palm', 'left fingers'] },
  { name: 'right_hand', coordinates: { x: 0.237, y: 0.537 }, region: 'upper_extremity', aliases: ['right palm', 'right fingers'] },
  { name: 'abdomen', coordinates: { x: 0.499, y: 0.368 }, region: 'abdomen', aliases: ['abdominal', 'belly'] },
  { name: 'stomach', coordinates: { x: 0.525, y: 0.316 }, region: 'abdomen', aliases: ['gastric', 'epigastric'] },
  { name: 'liver', coordinates: { x: 0.420, y: 0.326 }, region: 'abdomen', aliases: ['hepatic', 'right upper quadrant'] },
  { name: 'pelvis', coordinates: { x: 0.502, y: 0.473 }, region: 'pelvis', aliases: ['pelvic', 'hip region'] },
  { name: 'left_hip', coordinates: { x: 0.618, y: 0.391 }, region: 'pelvis', aliases: ['left hip joint'] },
  { name: 'right_hip', coordinates: { x: 0.383, y: 0.391 }, region: 'pelvis', aliases: ['right hip joint'] },
  { name: 'left_thigh', coordinates: { x: 0.578, y: 0.595 }, region: 'lower_extremity', aliases: ['left upper leg', 'left femoral'] },
  { name: 'right_thigh', coordinates: { x: 0.409, y: 0.598 }, region: 'lower_extremity', aliases: ['right upper leg', 'right femoral'] },
  { name: 'left_knee', coordinates: { x: 0.578, y: 0.729 }, region: 'lower_extremity', aliases: ['left knee joint', 'left patella'] },
  { name: 'right_knee', coordinates: { x: 0.405, y: 0.727 }, region: 'lower_extremity', aliases: ['right knee joint', 'right patella'] },
  { name: 'left_shin', coordinates: { x: 0.559, y: 0.846 }, region: 'lower_extremity', aliases: ['left tibia', 'left anterior leg'] },
  { name: 'right_shin', coordinates: { x: 0.439, y: 0.838 }, region: 'lower_extremity', aliases: ['right tibia', 'right anterior leg'] },
  { name: 'left_ankle', coordinates: { x: 0.559, y: 0.926 }, region: 'lower_extremity', aliases: ['left ankle joint'] },
  { name: 'right_ankle', coordinates: { x: 0.443, y: 0.931 }, region: 'lower_extremity', aliases: ['right ankle joint'] },
  { name: 'left_foot', coordinates: { x: 0.595, y: 0.961 }, region: 'lower_extremity', aliases: ['left pedal'] },
  { name: 'right_foot', coordinates: { x: 0.398, y: 0.963 }, region: 'lower_extremity', aliases: ['right pedal'] },
]

// Male Back Coordinates - Generated from mapped maleback.json
export const maleBackCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.472, y: 0.059 }, region: 'head', aliases: ['skull', 'cranium', 'occiput'] },
  { name: 'left_ear', coordinates: { x: 0.416, y: 0.118 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'right_ear', coordinates: { x: 0.525, y: 0.118 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'neck', coordinates: { x: 0.472, y: 0.158 }, region: 'neck', aliases: ['cervical', 'nape'] },
  { name: 'upper_back', coordinates: { x: 0.469, y: 0.223 }, region: 'back', aliases: ['upper dorsal', 'thoracic back'] },
  { name: 'lower_back', coordinates: { x: 0.472, y: 0.355 }, region: 'back', aliases: ['lumbar', 'lower dorsal'] },
  { name: 'spine', coordinates: { x: 0.472, y: 0.302 }, region: 'back', aliases: ['spinal', 'vertebral', 'backbone'] },
  { name: 'left_shoulder_blade', coordinates: { x: 0.409, y: 0.247 }, region: 'back', aliases: ['left scapula', 'left shoulder'] },
  { name: 'right_shoulder_blade', coordinates: { x: 0.525, y: 0.250 }, region: 'back', aliases: ['right scapula', 'right shoulder'] },
  { name: 'buttocks', coordinates: { x: 0.472, y: 0.449 }, region: 'buttocks', aliases: ['gluteal', 'glutes'] },
  { name: 'left_shoulder', coordinates: { x: 0.375, y: 0.188 }, region: 'upper_extremity', aliases: ['left posterior deltoid'] },
  { name: 'right_shoulder', coordinates: { x: 0.555, y: 0.186 }, region: 'upper_extremity', aliases: ['right posterior deltoid'] },
  { name: 'left_arm', coordinates: { x: 0.328, y: 0.292 }, region: 'upper_extremity', aliases: ['left posterior arm', 'left triceps'] },
  { name: 'right_arm', coordinates: { x: 0.629, y: 0.297 }, region: 'upper_extremity', aliases: ['right posterior arm', 'right triceps'] },
  { name: 'left_elbow', coordinates: { x: 0.301, y: 0.352 }, region: 'upper_extremity', aliases: ['left posterior elbow'] },
  { name: 'right_elbow', coordinates: { x: 0.632, y: 0.350 }, region: 'upper_extremity', aliases: ['right posterior elbow'] },
  { name: 'left_forearm', coordinates: { x: 0.282, y: 0.412 }, region: 'upper_extremity', aliases: ['left posterior forearm'] },
  { name: 'right_forearm', coordinates: { x: 0.662, y: 0.414 }, region: 'upper_extremity', aliases: ['right posterior forearm'] },
  { name: 'left_wrist', coordinates: { x: 0.271, y: 0.449 }, region: 'upper_extremity', aliases: ['left posterior wrist'] },
  { name: 'right_wrist', coordinates: { x: 0.670, y: 0.447 }, region: 'upper_extremity', aliases: ['right posterior wrist'] },
  { name: 'left_hand', coordinates: { x: 0.249, y: 0.487 }, region: 'upper_extremity', aliases: ['left posterior hand'] },
  { name: 'right_hand', coordinates: { x: 0.685, y: 0.484 }, region: 'upper_extremity', aliases: ['right posterior hand'] },
  { name: 'left_hip', coordinates: { x: 0.375, y: 0.393 }, region: 'pelvis', aliases: ['left posterior hip'] },
  { name: 'right_hip', coordinates: { x: 0.563, y: 0.390 }, region: 'pelvis', aliases: ['right posterior hip'] },
  { name: 'left_thigh', coordinates: { x: 0.409, y: 0.542 }, region: 'lower_extremity', aliases: ['left posterior thigh', 'left hamstring'] },
  { name: 'right_thigh', coordinates: { x: 0.525, y: 0.542 }, region: 'lower_extremity', aliases: ['right posterior thigh', 'right hamstring'] },
  { name: 'left_calf', coordinates: { x: 0.409, y: 0.696 }, region: 'lower_extremity', aliases: ['left gastrocnemius', 'left posterior leg'] },
  { name: 'right_calf', coordinates: { x: 0.517, y: 0.698 }, region: 'lower_extremity', aliases: ['right gastrocnemius', 'right posterior leg'] },
  { name: 'left_ankle', coordinates: { x: 0.424, y: 0.830 }, region: 'lower_extremity', aliases: ['left posterior ankle'] },
  { name: 'right_ankle', coordinates: { x: 0.499, y: 0.835 }, region: 'lower_extremity', aliases: ['right posterior ankle'] },
]

// Female Back Coordinates - Generated from mapped femaleback.json
export const femaleBackCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.506, y: 0.028 }, region: 'head', aliases: ['skull', 'cranium', 'occiput'] },
  { name: 'left_ear', coordinates: { x: 0.431, y: 0.098 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'right_ear', coordinates: { x: 0.593, y: 0.102 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'neck', coordinates: { x: 0.514, y: 0.172 }, region: 'neck', aliases: ['cervical', 'nape'] },
  { name: 'upper_back', coordinates: { x: 0.517, y: 0.247 }, region: 'back', aliases: ['upper dorsal', 'thoracic back'] },
  { name: 'lower_back', coordinates: { x: 0.514, y: 0.403 }, region: 'back', aliases: ['lumbar', 'lower dorsal'] },
  { name: 'spine', coordinates: { x: 0.514, y: 0.333 }, region: 'back', aliases: ['spinal', 'vertebral', 'backbone'] },
  { name: 'left_shoulder_blade', coordinates: { x: 0.458, y: 0.269 }, region: 'back', aliases: ['left scapula', 'left shoulder'] },
  { name: 'right_shoulder_blade', coordinates: { x: 0.566, y: 0.274 }, region: 'back', aliases: ['right scapula', 'right shoulder'] },
  { name: 'buttocks', coordinates: { x: 0.506, y: 0.480 }, region: 'buttocks', aliases: ['gluteal', 'glutes'] },
  { name: 'left_shoulder', coordinates: { x: 0.394, y: 0.189 }, region: 'upper_extremity', aliases: ['left posterior deltoid'] },
  { name: 'right_shoulder', coordinates: { x: 0.618, y: 0.189 }, region: 'upper_extremity', aliases: ['right posterior deltoid'] },
  { name: 'left_arm', coordinates: { x: 0.328, y: 0.304 }, region: 'upper_extremity', aliases: ['left posterior arm', 'left triceps'] },
  { name: 'right_arm', coordinates: { x: 0.689, y: 0.302 }, region: 'upper_extremity', aliases: ['right posterior arm', 'right triceps'] },
  { name: 'left_elbow', coordinates: { x: 0.301, y: 0.376 }, region: 'upper_extremity', aliases: ['left posterior elbow'] },
  { name: 'right_elbow', coordinates: { x: 0.696, y: 0.378 }, region: 'upper_extremity', aliases: ['right posterior elbow'] },
  { name: 'left_forearm', coordinates: { x: 0.282, y: 0.443 }, region: 'upper_extremity', aliases: ['left posterior forearm'] },
  { name: 'right_forearm', coordinates: { x: 0.730, y: 0.441 }, region: 'upper_extremity', aliases: ['right posterior forearm'] },
  { name: 'left_wrist', coordinates: { x: 0.256, y: 0.495 }, region: 'upper_extremity', aliases: ['left posterior wrist'] },
  { name: 'right_wrist', coordinates: { x: 0.756, y: 0.485 }, region: 'upper_extremity', aliases: ['right posterior wrist'] },
  { name: 'left_hand', coordinates: { x: 0.237, y: 0.542 }, region: 'upper_extremity', aliases: ['left posterior hand'] },
  { name: 'right_hand', coordinates: { x: 0.782, y: 0.535 }, region: 'upper_extremity', aliases: ['right posterior hand'] },
  { name: 'left_hip', coordinates: { x: 0.379, y: 0.411 }, region: 'pelvis', aliases: ['left posterior hip'] },
  { name: 'right_hip', coordinates: { x: 0.629, y: 0.406 }, region: 'pelvis', aliases: ['right posterior hip'] },
  { name: 'left_thigh', coordinates: { x: 0.412, y: 0.590 }, region: 'lower_extremity', aliases: ['left posterior thigh', 'left hamstring'] },
  { name: 'right_thigh', coordinates: { x: 0.595, y: 0.593 }, region: 'lower_extremity', aliases: ['right posterior thigh', 'right hamstring'] },
  { name: 'left_calf', coordinates: { x: 0.409, y: 0.804 }, region: 'lower_extremity', aliases: ['left gastrocnemius', 'left posterior leg'] },
  { name: 'right_calf', coordinates: { x: 0.585, y: 0.802 }, region: 'lower_extremity', aliases: ['right gastrocnemius', 'right posterior leg'] },
  { name: 'left_ankle', coordinates: { x: 0.435, y: 0.936 }, region: 'lower_extremity', aliases: ['left posterior ankle'] },
  { name: 'right_ankle', coordinates: { x: 0.589, y: 0.941 }, region: 'lower_extremity', aliases: ['right posterior ankle'] },
]

// Male Right Side Coordinates - Generated from mapped malerightside.json
export const maleRightSideCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.472, y: 0.060 }, region: 'head', aliases: ['skull', 'cranium'] },
  { name: 'face', coordinates: { x: 0.521, y: 0.125 }, region: 'head', aliases: ['facial'] },
  { name: 'nose', coordinates: { x: 0.563, y: 0.128 }, region: 'head', aliases: ['nasal', 'nostril'] },
  { name: 'right_eye', coordinates: { x: 0.532, y: 0.107 }, region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  { name: 'right_ear', coordinates: { x: 0.454, y: 0.128 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'mouth', coordinates: { x: 0.544, y: 0.152 }, region: 'head', aliases: ['oral', 'lips', 'buccal'] },
  { name: 'neck', coordinates: { x: 0.458, y: 0.189 }, region: 'neck', aliases: ['cervical', 'throat'] },
  { name: 'chest', coordinates: { x: 0.521, y: 0.269 }, region: 'chest', aliases: ['thorax', 'pectoral', 'breast'] },
  { name: 'back', coordinates: { x: 0.367, y: 0.287 }, region: 'back', aliases: ['dorsal', 'posterior'] },
  { name: 'abdomen', coordinates: { x: 0.544, y: 0.376 }, region: 'abdomen', aliases: ['abdominal', 'belly', 'stomach area'] },
  { name: 'spine', coordinates: { x: 0.364, y: 0.328 }, region: 'back', aliases: ['spinal', 'vertebral', 'backbone'] },
  { name: 'right_shoulder', coordinates: { x: 0.435, y: 0.257 }, region: 'upper_extremity', aliases: ['shoulder', 'deltoid'] },
  { name: 'right_elbow', coordinates: { x: 0.427, y: 0.378 }, region: 'upper_extremity', aliases: ['elbow', 'cubital'] },
  { name: 'right_arm', coordinates: { x: 0.435, y: 0.316 }, region: 'upper_extremity', aliases: ['arm', 'brachial'] },
  { name: 'right_forearm', coordinates: { x: 0.472, y: 0.436 }, region: 'upper_extremity', aliases: ['forearm', 'antebrachial'] },
  { name: 'right_wrist', coordinates: { x: 0.521, y: 0.485 }, region: 'upper_extremity', aliases: ['wrist', 'carpal'] },
  { name: 'right_hand', coordinates: { x: 0.540, y: 0.517 }, region: 'upper_extremity', aliases: ['hand', 'palm', 'fingers'] },
  { name: 'right_thigh', coordinates: { x: 0.484, y: 0.595 }, region: 'lower_extremity', aliases: ['thigh', 'femoral'] },
  { name: 'right_knee', coordinates: { x: 0.499, y: 0.664 }, region: 'lower_extremity', aliases: ['knee', 'patella'] },
  { name: 'right_calf', coordinates: { x: 0.401, y: 0.724 }, region: 'lower_extremity', aliases: ['calf', 'lower leg', 'shin'] },
  { name: 'right_ankle', coordinates: { x: 0.439, y: 0.856 }, region: 'lower_extremity', aliases: ['ankle', 'malleolus'] },
  { name: 'right_foot', coordinates: { x: 0.532, y: 0.878 }, region: 'lower_extremity', aliases: ['foot', 'pedal', 'toes'] },
]

// Female Right Side Coordinates - Generated from mapped femalerightside.json
export const femaleRightSideCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.495, y: 0.028 }, region: 'head', aliases: ['skull', 'cranium'] },
  { name: 'face', coordinates: { x: 0.570, y: 0.110 }, region: 'head', aliases: ['facial profile', 'right profile'] },
  { name: 'nose', coordinates: { x: 0.621, y: 0.107 }, region: 'head', aliases: ['nasal profile', 'right nasal'] },
  { name: 'right_eye', coordinates: { x: 0.581, y: 0.077 }, region: 'head', aliases: ['right ocular', 'right orbital'] },
  { name: 'right_ear', coordinates: { x: 0.487, y: 0.102 }, region: 'head', aliases: ['right auditory', 'right otic'] },
  { name: 'mouth', coordinates: { x: 0.599, y: 0.142 }, region: 'head', aliases: ['oral', 'buccal'] },
  { name: 'neck', coordinates: { x: 0.472, y: 0.169 }, region: 'neck', aliases: ['cervical', 'right cervical'] },
  { name: 'chest', coordinates: { x: 0.574, y: 0.269 }, region: 'chest', aliases: ['right thorax', 'right chest wall'] },
  { name: 'back', coordinates: { x: 0.364, y: 0.274 }, region: 'back', aliases: ['dorsal', 'posterior'] },
  { name: 'abdomen', coordinates: { x: 0.581, y: 0.396 }, region: 'abdomen', aliases: ['right abdominal wall', 'right abdomen'] },
  { name: 'spine', coordinates: { x: 0.367, y: 0.321 }, region: 'back', aliases: ['vertebral column', 'spinal column'] },
  { name: 'right_shoulder', coordinates: { x: 0.454, y: 0.219 }, region: 'upper_extremity', aliases: ['right deltoid', 'right shoulder joint'] },
  { name: 'right_elbow', coordinates: { x: 0.431, y: 0.378 }, region: 'upper_extremity', aliases: ['right elbow joint'] },
  { name: 'right_arm', coordinates: { x: 0.439, y: 0.299 }, region: 'upper_extremity', aliases: ['right upper arm', 'right brachial'] },
  { name: 'right_forearm', coordinates: { x: 0.487, y: 0.441 }, region: 'upper_extremity', aliases: ['right lower arm'] },
  { name: 'right_wrist', coordinates: { x: 0.536, y: 0.512 }, region: 'upper_extremity', aliases: ['right wrist joint'] },
  { name: 'right_hand', coordinates: { x: 0.566, y: 0.550 }, region: 'upper_extremity', aliases: ['right palm', 'right fingers'] },
  { name: 'right_thigh', coordinates: { x: 0.469, y: 0.618 }, region: 'lower_extremity', aliases: ['right upper leg', 'right femoral'] },
  { name: 'right_knee', coordinates: { x: 0.502, y: 0.739 }, region: 'lower_extremity', aliases: ['right knee joint', 'right patella'] },
  { name: 'right_calf', coordinates: { x: 0.420, y: 0.804 }, region: 'lower_extremity', aliases: ['right lower leg', 'right gastrocnemius'] },
  { name: 'right_ankle', coordinates: { x: 0.427, y: 0.931 }, region: 'lower_extremity', aliases: ['right ankle joint'] },
  { name: 'right_foot', coordinates: { x: 0.544, y: 0.933 }, region: 'lower_extremity', aliases: ['right pedal'] },
]

// Male Left Side Coordinates - Generated from mapped maleleftside.json
export const maleLeftSideCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.514, y: 0.063 }, region: 'head', aliases: ['skull', 'cranium'] },
  { name: 'face', coordinates: { x: 0.461, y: 0.135 }, region: 'head', aliases: ['facial'] },
  { name: 'nose', coordinates: { x: 0.420, y: 0.130 }, region: 'head', aliases: ['nasal', 'nostril'] },
  { name: 'left_eye', coordinates: { x: 0.458, y: 0.115 }, region: 'head', aliases: ['eye', 'ocular', 'orbital'] },
  { name: 'left_ear', coordinates: { x: 0.532, y: 0.122 }, region: 'head', aliases: ['ear', 'auditory', 'otic'] },
  { name: 'mouth', coordinates: { x: 0.439, y: 0.152 }, region: 'head', aliases: ['oral', 'lips', 'buccal'] },
  { name: 'neck', coordinates: { x: 0.529, y: 0.182 }, region: 'neck', aliases: ['cervical', 'throat'] },
  { name: 'chest', coordinates: { x: 0.461, y: 0.269 }, region: 'chest', aliases: ['thorax', 'pectoral', 'breast'] },
  { name: 'back', coordinates: { x: 0.618, y: 0.274 }, region: 'back', aliases: ['dorsal', 'posterior'] },
  { name: 'abdomen', coordinates: { x: 0.446, y: 0.358 }, region: 'abdomen', aliases: ['abdominal', 'belly', 'stomach area'] },
  { name: 'spine', coordinates: { x: 0.610, y: 0.326 }, region: 'back', aliases: ['spinal', 'vertebral', 'backbone'] },
  { name: 'left_shoulder', coordinates: { x: 0.544, y: 0.247 }, region: 'upper_extremity', aliases: ['shoulder', 'deltoid'] },
  { name: 'left_elbow', coordinates: { x: 0.551, y: 0.378 }, region: 'upper_extremity', aliases: ['elbow', 'cubital'] },
  { name: 'left_arm', coordinates: { x: 0.540, y: 0.304 }, region: 'upper_extremity', aliases: ['arm', 'brachial'] },
  { name: 'left_forearm', coordinates: { x: 0.491, y: 0.426 }, region: 'upper_extremity', aliases: ['forearm', 'antebrachial'] },
  { name: 'left_wrist', coordinates: { x: 0.461, y: 0.471 }, region: 'upper_extremity', aliases: ['wrist', 'carpal'] },
  { name: 'left_hand', coordinates: { x: 0.431, y: 0.507 }, region: 'upper_extremity', aliases: ['hand', 'palm', 'fingers'] },
  { name: 'left_thigh', coordinates: { x: 0.487, y: 0.550 }, region: 'lower_extremity', aliases: ['thigh', 'femoral'] },
  { name: 'left_knee', coordinates: { x: 0.465, y: 0.637 }, region: 'lower_extremity', aliases: ['knee', 'patella'] },
  { name: 'left_calf', coordinates: { x: 0.566, y: 0.709 }, region: 'lower_extremity', aliases: ['calf', 'lower leg', 'shin'] },
  { name: 'left_ankle', coordinates: { x: 0.551, y: 0.838 }, region: 'lower_extremity', aliases: ['ankle', 'malleolus'] },
  { name: 'left_foot', coordinates: { x: 0.480, y: 0.846 }, region: 'lower_extremity', aliases: ['foot', 'pedal', 'toes'] },
]

// Female Left Side Coordinates - Generated from mapped femaleleftside.json
export const femaleLeftSideCoordinates: BodyPartCoordinate[] = [
  { name: 'head', coordinates: { x: 0.506, y: 0.028 }, region: 'head', aliases: ['skull', 'cranium'] },
  { name: 'face', coordinates: { x: 0.465, y: 0.115 }, region: 'head', aliases: ['facial profile', 'left profile'] },
  { name: 'nose', coordinates: { x: 0.409, y: 0.113 }, region: 'head', aliases: ['nasal profile', 'left nasal'] },
  { name: 'left_eye', coordinates: { x: 0.450, y: 0.092 }, region: 'head', aliases: ['left ocular', 'left orbital'] },
  { name: 'left_ear', coordinates: { x: 0.551, y: 0.107 }, region: 'head', aliases: ['left auditory', 'left otic'] },
  { name: 'mouth', coordinates: { x: 0.435, y: 0.140 }, region: 'head', aliases: ['oral', 'buccal'] },
  { name: 'neck', coordinates: { x: 0.525, y: 0.179 }, region: 'neck', aliases: ['cervical', 'left cervical'] },
  { name: 'chest', coordinates: { x: 0.461, y: 0.267 }, region: 'chest', aliases: ['left thorax', 'left chest wall'] },
  { name: 'back', coordinates: { x: 0.647, y: 0.274 }, region: 'back', aliases: ['dorsal', 'posterior'] },
  { name: 'abdomen', coordinates: { x: 0.443, y: 0.371 }, region: 'abdomen', aliases: ['left abdominal wall', 'left abdomen'] },
  { name: 'spine', coordinates: { x: 0.636, y: 0.323 }, region: 'back', aliases: ['vertebral column', 'spinal column'] },
  { name: 'left_shoulder', coordinates: { x: 0.566, y: 0.232 }, region: 'upper_extremity', aliases: ['left deltoid', 'left shoulder joint'] },
  { name: 'left_elbow', coordinates: { x: 0.578, y: 0.396 }, region: 'upper_extremity', aliases: ['left elbow joint'] },
  { name: 'left_arm', coordinates: { x: 0.559, y: 0.294 }, region: 'upper_extremity', aliases: ['left upper arm', 'left brachial'] },
  { name: 'left_forearm', coordinates: { x: 0.506, y: 0.461 }, region: 'upper_extremity', aliases: ['left lower arm'] },
  { name: 'left_wrist', coordinates: { x: 0.461, y: 0.517 }, region: 'upper_extremity', aliases: ['left wrist joint'] },
  { name: 'left_hand', coordinates: { x: 0.435, y: 0.552 }, region: 'upper_extremity', aliases: ['left palm', 'left fingers'] },
  { name: 'left_thigh', coordinates: { x: 0.555, y: 0.608 }, region: 'lower_extremity', aliases: ['left upper leg', 'left femoral'] },
  { name: 'left_knee', coordinates: { x: 0.502, y: 0.727 }, region: 'lower_extremity', aliases: ['left knee joint', 'left patella'] },
  { name: 'left_calf', coordinates: { x: 0.595, y: 0.787 }, region: 'lower_extremity', aliases: ['left lower leg', 'left gastrocnemius'] },
  { name: 'left_ankle', coordinates: { x: 0.585, y: 0.921 }, region: 'lower_extremity', aliases: ['left ankle joint'] },
  { name: 'left_foot', coordinates: { x: 0.476, y: 0.933 }, region: 'lower_extremity', aliases: ['left pedal'] },
]

// Cardiorespiratory System Coordinates (Gender Neutral) - Generated from mapped respicardio.json
export const cardioRespiratoryCoordinates: BodyPartCoordinate[] = [
  { name: 'mitral_area', coordinates: { x: 0.578, y: 0.598 }, region: 'cardiovascular', aliases: ['mitral valve', 'bicuspid valve', 'apex beat'] },
  { name: 'pulmonary_area', coordinates: { x: 0.525, y: 0.373 }, region: 'cardiovascular', aliases: ['pulmonary valve', 'pulmonic area'] },
  { name: 'tricuspid_area', coordinates: { x: 0.491, y: 0.548 }, region: 'cardiovascular', aliases: ['tricuspid valve'] },
  { name: 'aortic_area', coordinates: { x: 0.420, y: 0.358 }, region: 'cardiovascular', aliases: ['aortic valve'] },
  { name: 'parasternal_heave_area', coordinates: { x: 0.578, y: 0.393 }, region: 'cardiovascular', aliases: ['parasternal lift', 'RV heave'] },
  { name: 'lower_sternal_border', coordinates: { x: 0.484, y: 0.568 }, region: 'cardiovascular', aliases: ['LSB', 'tricuspid area'] },
  { name: 'carotid_artery_left', coordinates: { x: 0.521, y: 0.140 }, region: 'cardiovascular', aliases: ['left carotid', 'carotid pulse left'] },
  { name: 'carotid_artery_right', coordinates: { x: 0.409, y: 0.140 }, region: 'cardiovascular', aliases: ['right carotid', 'carotid pulse right'] },
  { name: 'jugular_venous_pressure_point', coordinates: { x: 0.427, y: 0.185 }, region: 'cardiovascular', aliases: ['JVP', 'jugular vein', 'neck veins'] },
  { name: 'mitral_area_to_axilla', coordinates: { x: 0.655, y: 0.538 }, region: 'cardiovascular', aliases: ['mitral radiation', 'axillary area'] },
  { name: 'trachea_suprasternal_notch', coordinates: { x: 0.472, y: 0.085 }, region: 'respiratory', aliases: ['trachea', 'suprasternal notch', 'windpipe'] },
  { name: 'upper_chest_expansion_right', coordinates: { x: 0.360, y: 0.363 }, region: 'respiratory', aliases: ['right chest expansion', 'right upper chest'] },
  { name: 'upper_chest_expansion_left', coordinates: { x: 0.595, y: 0.363 }, region: 'respiratory', aliases: ['left chest expansion', 'left upper chest'] },
  { name: 'lower_chest_expansion_right', coordinates: { x: 0.379, y: 0.608 }, region: 'respiratory', aliases: ['right lower chest', 'right base'] },
  { name: 'lower_chest_expansion_left', coordinates: { x: 0.585, y: 0.618 }, region: 'respiratory', aliases: ['left lower chest', 'left base'] },
  { name: 'percussion_above_clavicle_right', coordinates: { x: 0.364, y: 0.220 }, region: 'cardiovascular' },
  { name: 'percussion_above_clavicle_left', coordinates: { x: 0.559, y: 0.220 }, region: 'cardiovascular' },
  { name: 'percussion_2nd_ics_right', coordinates: { x: 0.383, y: 0.353 }, region: 'cardiovascular' },
  { name: 'percussion_2nd_ics_left', coordinates: { x: 0.555, y: 0.348 }, region: 'cardiovascular' },
  { name: 'percussion_3rd_ics_right', coordinates: { x: 0.386, y: 0.438 }, region: 'cardiovascular' },
  { name: 'percussion_3rd_ics_left', coordinates: { x: 0.551, y: 0.448 }, region: 'cardiovascular' },
  { name: 'percussion_4th_ics_right', coordinates: { x: 0.386, y: 0.488 }, region: 'cardiovascular' },
  { name: 'percussion_4th_ics_left', coordinates: { x: 0.555, y: 0.503 }, region: 'cardiovascular' },
  { name: 'auscultation_upper_right', coordinates: { x: 0.364, y: 0.298 }, region: 'cardiovascular' },
  { name: 'auscultation_upper_left', coordinates: { x: 0.555, y: 0.293 }, region: 'cardiovascular' },
  { name: 'auscultation_middle_right', coordinates: { x: 0.371, y: 0.443 }, region: 'cardiovascular' },
  { name: 'auscultation_middle_left', coordinates: { x: 0.570, y: 0.443 }, region: 'cardiovascular' },
  { name: 'auscultation_lower_right', coordinates: { x: 0.371, y: 0.558 }, region: 'cardiovascular' },
  { name: 'auscultation_lower_left', coordinates: { x: 0.555, y: 0.563 }, region: 'cardiovascular' },
  { name: 'tactile_fremitus_upper_right', coordinates: { x: 0.371, y: 0.313 }, region: 'respiratory', aliases: ['fremitus upper right', 'vocal fremitus upper right'] },
  { name: 'tactile_fremitus_upper_left', coordinates: { x: 0.547, y: 0.307 }, region: 'respiratory', aliases: ['fremitus upper left', 'vocal fremitus upper left'] },
  { name: 'tactile_fremitus_lower_right', coordinates: { x: 0.371, y: 0.535 }, region: 'respiratory', aliases: ['fremitus lower right', 'vocal fremitus lower right'] },
  { name: 'tactile_fremitus_lower_left', coordinates: { x: 0.566, y: 0.545 }, region: 'respiratory', aliases: ['fremitus lower left', 'vocal fremitus lower left'] },
  { name: 'percussion_clavicle_right', coordinates: { x: 0.371, y: 0.247 }, region: 'respiratory', aliases: ['right clavicular percussion', 'right apex percussion'] },
  { name: 'percussion_clavicle_left', coordinates: { x: 0.555, y: 0.237 }, region: 'respiratory', aliases: ['left clavicular percussion', 'left apex percussion'] },
]

// Abdominal and Inguinal Coordinates - Generated from mapped abdominallinguinal.json
export const abdominalCoordinates: BodyPartCoordinate[] = [
  { name: 'right_hypochondriac_region', coordinates: { x: 0.313, y: 0.483 }, region: 'abdomen', aliases: ['RHC', 'right upper quadrant', 'RUQ'] },
  { name: 'epigastric_region', coordinates: { x: 0.480, y: 0.383 }, region: 'abdomen', aliases: ['epigastrium', 'upper middle abdomen'] },
  { name: 'left_hypochondriac_region', coordinates: { x: 0.655, y: 0.498 }, region: 'abdomen', aliases: ['LHC', 'left upper quadrant', 'LUQ'] },
  { name: 'right_lumbar_region', coordinates: { x: 0.305, y: 0.677 }, region: 'abdomen', aliases: ['right flank', 'right lateral abdomen'] },
  { name: 'umbilical_region', coordinates: { x: 0.480, y: 0.687 }, region: 'abdomen', aliases: ['periumbilical', 'navel area', 'umbilicus'] },
  { name: 'left_lumbar_region', coordinates: { x: 0.647, y: 0.692 }, region: 'abdomen', aliases: ['left flank', 'left lateral abdomen'] },
  { name: 'right_iliac_fossa', coordinates: { x: 0.335, y: 0.882 }, region: 'abdomen', aliases: ['RIF', 'right lower quadrant', 'RLQ', 'right inguinal'] },
  { name: 'hypogastric_region', coordinates: { x: 0.480, y: 0.917 }, region: 'abdomen', aliases: ['suprapubic', 'lower middle abdomen', 'hypogastrium'] },
  { name: 'left_iliac_fossa', coordinates: { x: 0.632, y: 0.882 }, region: 'abdomen', aliases: ['LIF', 'left lower quadrant', 'LLQ', 'left inguinal'] },
  { name: 'right_upper_quadrant', coordinates: { x: 0.386, y: 0.543 }, region: 'abdomen' },
  { name: 'left_upper_quadrant', coordinates: { x: 0.574, y: 0.553 }, region: 'abdomen' },
  { name: 'right_lower_quadrant', coordinates: { x: 0.386, y: 0.797 }, region: 'abdomen' },
  { name: 'left_lower_quadrant', coordinates: { x: 0.570, y: 0.807 }, region: 'abdomen' },
  { name: 'liver_palpation_right_costal_margin', coordinates: { x: 0.324, y: 0.418 }, region: 'abdomen', aliases: ['liver', 'hepatic', 'right lobe liver'] },
  { name: 'liver_percussion_midclavicular_line', coordinates: { x: 0.316, y: 0.458 }, region: 'abdomen', aliases: ['liver percussion', 'hepatic dullness'] },
  { name: 'spleen_palpation_left_costal_margin', coordinates: { x: 0.618, y: 0.403 }, region: 'abdomen', aliases: ['spleen', 'splenic', 'left upper quadrant organ'] },
  { name: 'spleen_traube_space_percussion', coordinates: { x: 0.636, y: 0.338 }, region: 'abdomen', aliases: ['Traube space', 'splenic dullness'] },
  { name: 'abdominal_aorta_pulsation_above_umbilicus', coordinates: { x: 0.480, y: 0.652 }, region: 'abdomen', aliases: ['aorta', 'abdominal aorta', 'aortic pulsation'] },
  { name: 'mcburney_point_appendicitis', coordinates: { x: 0.343, y: 0.787 }, region: 'abdomen', aliases: ['McBurney point', 'appendix point', 'appendicitis point'] },
  { name: 'murphy_sign_cholecystitis', coordinates: { x: 0.335, y: 0.418 }, region: 'abdomen', aliases: ['Murphy sign', 'gallbladder tenderness', 'cholecystitis point'] },
  { name: 'rebound_tenderness_point', coordinates: { x: 0.484, y: 0.757 }, region: 'abdomen', aliases: ['rebound tenderness', 'peritoneal irritation'] },
  { name: 'shifting_dullness_right_flank', coordinates: { x: 0.264, y: 0.757 }, region: 'abdomen', aliases: ['right flank dullness', 'ascites percussion'] },
  { name: 'shifting_dullness_left_flank', coordinates: { x: 0.696, y: 0.772 }, region: 'abdomen', aliases: ['left flank dullness', 'ascites percussion'] },
  { name: 'fluid_thrill_test_point', coordinates: { x: 0.476, y: 0.573 }, region: 'abdomen', aliases: ['fluid wave', 'ascites test'] },
  { name: 'bowel_sounds_right_umbilicus', coordinates: { x: 0.420, y: 0.727 }, region: 'abdomen', aliases: ['bowel sounds', 'intestinal sounds'] },
  { name: 'bowel_sounds_left_umbilicus', coordinates: { x: 0.540, y: 0.722 }, region: 'abdomen', aliases: ['bowel sounds', 'intestinal sounds'] },
  { name: 'arterial_bruits_above_umbilicus', coordinates: { x: 0.484, y: 0.618 }, region: 'abdomen', aliases: ['aortic bruits', 'vascular sounds'] },
  { name: 'renal_artery_bruits_lateral_umbilicus', coordinates: { x: 0.563, y: 0.712 }, region: 'abdomen', aliases: ['renal bruits', 'kidney sounds'] },
  { name: 'hepatic_bruits_over_liver', coordinates: { x: 0.286, y: 0.358 }, region: 'abdomen', aliases: ['liver bruits', 'hepatic sounds'] },
  { name: 'venous_hum_over_liver', coordinates: { x: 0.313, y: 0.353 }, region: 'abdomen', aliases: ['venous hum', 'portal hypertension'] },
  { name: 'symphysis_pubis', coordinates: { x: 0.487, y: 1.160 }, region: 'inguinal', aliases: ['pubis', 'pubic bone'] },
  { name: 'umbilicus', coordinates: { x: 0.484, y: 0.692 }, region: 'abdomen', aliases: ['navel', 'belly button'] },
  { name: 'right_costal_margin', coordinates: { x: 0.316, y: 0.383 }, region: 'abdomen', aliases: ['right rib margin', 'right subcostal'] },
  { name: 'left_costal_margin', coordinates: { x: 0.644, y: 0.403 }, region: 'abdomen', aliases: ['left rib margin', 'left subcostal'] },
  { name: 'rovsing_sign_appendicitis', coordinates: { x: 0.480, y: 0.837 }, region: 'abdomen', aliases: ['Rovsing sign', 'referred appendix pain'] },
]

// Anatomical Views Configuration
export const anatomicalViews: AnatomicalView[] = [
  {
    view: 'front',
    gender: 'male',
    imagePath: '/medical-images/malefront.png',
    bodyParts: maleFrontCoordinates
  },
  {
    view: 'front',
    gender: 'female',
    imagePath: '/medical-images/femalefront.png',
    bodyParts: femaleFrontCoordinates
  },
  {
    view: 'back',
    gender: 'male',
    imagePath: '/medical-images/maleback.png',
    bodyParts: maleBackCoordinates
  },
  {
    view: 'back',
    gender: 'female',
    imagePath: '/medical-images/femaleback.png',
    bodyParts: femaleBackCoordinates
  },
  {
    view: 'leftside',
    gender: 'male',
    imagePath: '/medical-images/maleleftside.png',
    bodyParts: maleLeftSideCoordinates
  },
  {
    view: 'leftside',
    gender: 'female',
    imagePath: '/medical-images/femaleleftside.png',
    bodyParts: femaleLeftSideCoordinates
  },
  {
    view: 'rightside',
    gender: 'male',
    imagePath: '/medical-images/malerightside.png',
    bodyParts: maleRightSideCoordinates
  },
  {
    view: 'rightside',
    gender: 'female',
    imagePath: '/medical-images/femalerightside.png',
    bodyParts: femaleRightSideCoordinates
  },
  // Specialized organ system views (gender neutral)
  {
    view: 'cardiorespiratory',
    gender: 'neutral',
    imagePath: '/medical-images/respicardio.png',
    bodyParts: cardioRespiratoryCoordinates
  },
  {
    view: 'abdominal',
    gender: 'neutral',
    imagePath: '/medical-images/AbdominalInguinal.png',
    bodyParts: abdominalCoordinates
  }
]

// Helper function to find body part coordinates
export const findBodyPartCoordinates = (
  bodyPartName: string, 
  view: 'front' | 'back' | 'leftside' | 'rightside' | 'cardiorespiratory' | 'abdominal', 
  gender: 'male' | 'female' | 'neutral'
): BodyPartCoordinate | undefined => {
  // For specialized views, try gender-neutral first, then fall back to gendered views
  let anatomicalView = anatomicalViews.find(av => av.view === view && av.gender === gender)
  if (!anatomicalView && (view === 'cardiorespiratory' || view === 'abdominal')) {
    anatomicalView = anatomicalViews.find(av => av.view === view && av.gender === 'neutral')
  }
  
  if (!anatomicalView) return undefined
  
  const normalizedName = bodyPartName.toLowerCase().trim()
  
  return anatomicalView.bodyParts.find(bp => 
    bp.name.toLowerCase() === normalizedName || 
    (bp.aliases && bp.aliases.some(alias => alias.toLowerCase().includes(normalizedName))) ||
    normalizedName.includes(bp.name.toLowerCase())
  )
}

// Helper function to get all body parts for a specific view/gender
export const getBodyPartsForView = (
  view: 'front' | 'back' | 'leftside' | 'rightside' | 'cardiorespiratory' | 'abdominal', 
  gender: 'male' | 'female' | 'neutral'
): BodyPartCoordinate[] => {
  // For specialized views, try gender-neutral first, then fall back to gendered views
  let anatomicalView = anatomicalViews.find(av => av.view === view && av.gender === gender)
  if (!anatomicalView && (view === 'cardiorespiratory' || view === 'abdominal')) {
    anatomicalView = anatomicalViews.find(av => av.view === view && av.gender === 'neutral')
  }
  
  return anatomicalView?.bodyParts || []
}

// Helper function to get the best view for a body part
export const getBestViewForBodyPart = (
  bodyPartName: string, 
  gender: 'male' | 'female'
): { view: string, coordinates: BodyPartCoordinate } | undefined => {
  const normalizedName = bodyPartName.toLowerCase().trim()
  
  // Check if it's a cardiovascular/respiratory term
  const cardioTerms = ['heart', 'lung', 'cardiac', 'pulmonary', 'chest', 'respiratory', 'cardiovascular', 'aorta', 'ventricle', 'atrium']
  if (cardioTerms.some(term => normalizedName.includes(term))) {
    const coords = findBodyPartCoordinates(bodyPartName, 'cardiorespiratory', 'neutral')
    if (coords) return { view: 'cardiorespiratory', coordinates: coords }
  }
  
  // Check if it's an abdominal term
  const abdominalTerms = ['abdomen', 'stomach', 'liver', 'kidney', 'intestine', 'bowel', 'pancreas', 'spleen', 'gallbladder', 'inguinal', 'groin']
  if (abdominalTerms.some(term => normalizedName.includes(term))) {
    const coords = findBodyPartCoordinates(bodyPartName, 'abdominal', 'neutral')
    if (coords) return { view: 'abdominal', coordinates: coords }
  }
  
  // Fall back to standard views
  const views: ('front' | 'back' | 'leftside' | 'rightside')[] = ['front', 'back', 'leftside', 'rightside']
  for (const view of views) {
    const coords = findBodyPartCoordinates(bodyPartName, view, gender)
    if (coords) return { view, coordinates: coords }
  }
  
  return undefined
}