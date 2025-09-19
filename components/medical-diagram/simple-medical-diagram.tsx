"use client"

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, AlertCircle } from "lucide-react"
import { IntelligentMedicalAnalyzer, type IntelligentAnalysis, type ClinicalFinding, type MedicalContext } from "@/lib/intelligent-medical-analyzer"

// Coordinate mappings for all diagram types
const COORDINATE_MAPPINGS: Record<string, Record<string, {x: number, y: number, width: number, height: number}>> = {
  malefront: {
    "head": { "x": 256, "y": 42, "width": 30, "height": 30 },
    "face": { "x": 254, "y": 75, "width": 30, "height": 30 },
    "nose": { "x": 256, "y": 104, "width": 25, "height": 25 },
    "left_eye": { "x": 274, "y": 82, "width": 25, "height": 25 },
    "right_eye": { "x": 236, "y": 79, "width": 25, "height": 25 },
    "mouth": { "x": 258, "y": 118, "width": 25, "height": 25 },
    "left_ear": { "x": 299, "y": 92, "width": 25, "height": 25 },
    "right_ear": { "x": 213, "y": 98, "width": 25, "height": 25 },
    "neck": { "x": 254, "y": 154, "width": 30, "height": 30 },
    "chest": { "x": 256, "y": 204, "width": 40, "height": 40 },
    "abdomen": { "x": 258, "y": 309, "width": 40, "height": 40 },
    "left_shoulder": { "x": 327, "y": 164, "width": 30, "height": 30 },
    "right_shoulder": { "x": 187, "y": 166, "width": 30, "height": 30 },
    "left_arm": { "x": 354, "y": 255, "width": 30, "height": 30 },
    "right_arm": { "x": 162, "y": 253, "width": 30, "height": 30 },
    "left_elbow": { "x": 352, "y": 310, "width": 25, "height": 25 },
    "right_elbow": { "x": 160, "y": 310, "width": 25, "height": 25 },
    "left_forearm": { "x": 368, "y": 339, "width": 30, "height": 30 },
    "right_forearm": { "x": 144, "y": 341, "width": 30, "height": 30 },
    "left_wrist": { "x": 382, "y": 383, "width": 25, "height": 25 },
    "right_wrist": { "x": 136, "y": 385, "width": 25, "height": 25 },
    "left_hand": { "x": 386, "y": 418, "width": 25, "height": 25 },
    "right_hand": { "x": 124, "y": 418, "width": 25, "height": 25 },
    "left_thigh": { "x": 297, "y": 466, "width": 35, "height": 35 },
    "right_thigh": { "x": 213, "y": 470, "width": 35, "height": 35 },
    "left_knee": { "x": 289, "y": 542, "width": 25, "height": 25 },
    "right_knee": { "x": 215, "y": 542, "width": 25, "height": 25 },
    "left_calf": { "x": 287, "y": 616, "width": 30, "height": 30 },
    "right_calf": { "x": 223, "y": 618, "width": 30, "height": 30 },
    "left_ankle": { "x": 279, "y": 689, "width": 25, "height": 25 },
    "right_ankle": { "x": 229, "y": 689, "width": 25, "height": 25 },
    "left_foot": { "x": 295, "y": 722, "width": 30, "height": 30 },
    "right_foot": { "x": 221, "y": 724, "width": 30, "height": 30 },
    "heart": { "x": 299, "y": 222, "width": 25, "height": 25 },
    "lungs": { "x": 215, "y": 204, "width": 30, "height": 30 },
    "stomach": { "x": 279, "y": 259, "width": 25, "height": 25 },
    "liver": { "x": 217, "y": 253, "width": 25, "height": 25 }
  },
  femalefront: {
    // Comprehensive female front anatomy coordinates
    "head": { "x": 266, "y": 42, "width": 50, "height": 50 },
    "face": { "x": 266, "y": 89, "width": 50, "height": 50 },
    "nose": { "x": 268, "y": 107, "width": 50, "height": 50 },
    "eyes": { "x": 249, "y": 89, "width": 50, "height": 50 },
    "left_eye": { "x": 283, "y": 91, "width": 50, "height": 50 },
    "right_eye": { "x": 249, "y": 88, "width": 50, "height": 50 },
    "mouth": { "x": 267, "y": 125, "width": 50, "height": 50 },
    "left_ear": { "x": 308, "y": 94, "width": 50, "height": 50 },
    "right_ear": { "x": 225, "y": 95, "width": 50, "height": 50 },
    "neck": { "x": 266, "y": 158, "width": 50, "height": 50 },
    "chest": { "x": 266, "y": 222, "width": 50, "height": 50 },
    "heart": { "x": 307, "y": 253, "width": 50, "height": 50 },
    "lungs": { "x": 231, "y": 199, "width": 50, "height": 50 },
    "left_lung": { "x": 301, "y": 200, "width": 50, "height": 50 },
    "right_lung": { "x": 233, "y": 199, "width": 50, "height": 50 },
    "left_shoulder": { "x": 315, "y": 172, "width": 50, "height": 50 },
    "right_shoulder": { "x": 216, "y": 170, "width": 50, "height": 50 },
    "left_arm": { "x": 355, "y": 262, "width": 50, "height": 50 },
    "right_arm": { "x": 178, "y": 255, "width": 50, "height": 50 },
    "left_forearm": { "x": 375, "y": 353, "width": 50, "height": 50 },
    "right_forearm": { "x": 156, "y": 350, "width": 50, "height": 50 },
    "left_wrist": { "x": 395, "y": 414, "width": 50, "height": 50 },
    "right_wrist": { "x": 132, "y": 412, "width": 50, "height": 50 },
    "left_hand": { "x": 405, "y": 445, "width": 50, "height": 50 },
    "right_hand": { "x": 122, "y": 442, "width": 50, "height": 50 },
    "abdomen": { "x": 266, "y": 321, "width": 50, "height": 50 },
    "stomach": { "x": 285, "y": 284, "width": 50, "height": 50 },
    "liver": { "x": 234, "y": 276, "width": 50, "height": 50 },
    "kidneys": { "x": 218, "y": 313, "width": 50, "height": 50 },
    "left_kidney": { "x": 326, "y": 314, "width": 50, "height": 50 },
    "right_kidney": { "x": 218, "y": 313, "width": 50, "height": 50 },
    "pelvis": { "x": 263, "y": 397, "width": 50, "height": 50 },
    "left_hip": { "x": 332, "y": 338, "width": 50, "height": 50 },
    "right_hip": { "x": 201, "y": 338, "width": 50, "height": 50 },
    "left_thigh": { "x": 307, "y": 466, "width": 50, "height": 50 },
    "right_thigh": { "x": 223, "y": 465, "width": 50, "height": 50 },
    "left_knee": { "x": 298, "y": 575, "width": 50, "height": 50 },
    "right_knee": { "x": 225, "y": 570, "width": 50, "height": 50 },
    "left_shin": { "x": 289, "y": 634, "width": 50, "height": 50 },
    "right_shin": { "x": 238, "y": 633, "width": 50, "height": 50 },
    "left_ankle": { "x": 283, "y": 722, "width": 50, "height": 50 },
    "right_ankle": { "x": 246, "y": 720, "width": 50, "height": 50 },
    "left_foot": { "x": 313, "y": 740, "width": 50, "height": 50 },
    "right_foot": { "x": 219, "y": 742, "width": 50, "height": 50 },
    // Female-specific anatomy
    "left_breast": { "x": 291, "y": 240, "width": 70, "height": 70 },
    "right_breast": { "x": 221, "y": 240, "width": 70, "height": 70 },
    "left_nipple": { "x": 291, "y": 250, "width": 20, "height": 20 },
    "right_nipple": { "x": 221, "y": 250, "width": 20, "height": 20 },
    "uterus": { "x": 266, "y": 420, "width": 60, "height": 50 },
    "cervix": { "x": 266, "y": 445, "width": 30, "height": 25 },
    "left_ovary": { "x": 316, "y": 430, "width": 40, "height": 30 },
    "right_ovary": { "x": 216, "y": 430, "width": 40, "height": 30 },
    "left_fallopian_tube": { "x": 316, "y": 410, "width": 60, "height": 20 },
    "right_fallopian_tube": { "x": 216, "y": 410, "width": 60, "height": 20 },
    // Additional organs and structures
    "thyroid": { "x": 256, "y": 160, "width": 40, "height": 30 },
    "trachea": { "x": 256, "y": 175, "width": 28, "height": 60 },
    "esophagus": { "x": 246, "y": 180, "width": 24, "height": 60 },
    "spleen": { "x": 341, "y": 285, "width": 50, "height": 40 },
    "pancreas": { "x": 286, "y": 300, "width": 70, "height": 30 },
    "gallbladder": { "x": 231, "y": 295, "width": 40, "height": 30 },
    "left_adrenal_gland": { "x": 346, "y": 300, "width": 40, "height": 30 },
    "right_adrenal_gland": { "x": 166, "y": 300, "width": 40, "height": 30 },
    "small_intestine": { "x": 256, "y": 360, "width": 150, "height": 100 },
    "large_intestine": { "x": 256, "y": 355, "width": 190, "height": 120 },
    "appendix": { "x": 186, "y": 395, "width": 25, "height": 20 },
    "urinary_bladder": { "x": 256, "y": 455, "width": 70, "height": 50 },
    "left_ureter": { "x": 331, "y": 360, "width": 20, "height": 100 },
    "right_ureter": { "x": 181, "y": 360, "width": 20, "height": 100 },
    "diaphragm": { "x": 256, "y": 265, "width": 230, "height": 20 }
  },
  malerightside: {
    "head": { "x": 253, "y": 62, "width": 30, "height": 30 },
    "face": { "x": 263, "y": 99, "width": 30, "height": 30 },
    "nose": { "x": 296, "y": 110, "width": 25, "height": 25 },
    "right_eye": { "x": 282, "y": 85, "width": 25, "height": 25 },
    "right_ear": { "x": 234, "y": 96, "width": 25, "height": 25 },
    "mouth": { "x": 286, "y": 124, "width": 25, "height": 25 },
    "neck": { "x": 237, "y": 155, "width": 30, "height": 30 },
    "chest": { "x": 267, "y": 221, "width": 40, "height": 40 },
    "back": { "x": 170, "y": 232, "width": 35, "height": 35 },
    "abdomen": { "x": 262, "y": 308, "width": 40, "height": 40 },
    "spine": { "x": 179, "y": 292, "width": 30, "height": 30 },
    "right_shoulder": { "x": 213, "y": 193, "width": 30, "height": 30 },
    "right_arm": { "x": 206, "y": 260, "width": 30, "height": 30 },
    "right_elbow": { "x": 206, "y": 321, "width": 25, "height": 25 },
    "right_forearm": { "x": 236, "y": 366, "width": 30, "height": 30 },
    "right_wrist": { "x": 251, "y": 416, "width": 25, "height": 25 },
    "right_hand": { "x": 275, "y": 457, "width": 25, "height": 25 },
    "right_thigh": { "x": 230, "y": 486, "width": 35, "height": 35 },
    "right_knee": { "x": 248, "y": 554, "width": 25, "height": 25 },
    "right_calf": { "x": 196, "y": 609, "width": 30, "height": 30 },
    "right_ankle": { "x": 217, "y": 691, "width": 25, "height": 25 },
    "right_foot": { "x": 300, "y": 750, "width": 30, "height": 30 }
  },
  maleback: {
    "head": { "x": 258, "y": 48, "width": 30, "height": 30 },
    "left_ear": { "x": 227, "y": 96, "width": 25, "height": 25 },
    "right_ear": { "x": 287, "y": 96, "width": 25, "height": 25 },
    "neck": { "x": 258, "y": 128, "width": 30, "height": 30 },
    "upper_back": { "x": 256, "y": 181, "width": 35, "height": 35 },
    "lower_back": { "x": 258, "y": 287, "width": 35, "height": 35 },
    "spine": { "x": 258, "y": 245, "width": 30, "height": 30 },
    "left_shoulder_blade": { "x": 223, "y": 200, "width": 30, "height": 30 },
    "right_shoulder_blade": { "x": 287, "y": 202, "width": 30, "height": 30 },
    "buttocks": { "x": 258, "y": 363, "width": 35, "height": 35 },
    "left_shoulder": { "x": 205, "y": 152, "width": 30, "height": 30 },
    "right_shoulder": { "x": 303, "y": 150, "width": 30, "height": 30 },
    "left_arm": { "x": 179, "y": 236, "width": 30, "height": 30 },
    "right_arm": { "x": 343, "y": 241, "width": 30, "height": 30 },
    "left_elbow": { "x": 165, "y": 285, "width": 25, "height": 25 },
    "right_elbow": { "x": 345, "y": 283, "width": 25, "height": 25 },
    "left_forearm": { "x": 154, "y": 333, "width": 30, "height": 30 },
    "right_forearm": { "x": 362, "y": 335, "width": 30, "height": 30 },
    "left_wrist": { "x": 148, "y": 363, "width": 25, "height": 25 },
    "right_wrist": { "x": 366, "y": 361, "width": 25, "height": 25 },
    "left_hand": { "x": 136, "y": 393, "width": 25, "height": 25 },
    "right_hand": { "x": 374, "y": 391, "width": 25, "height": 25 },
    "left_hip": { "x": 205, "y": 317, "width": 30, "height": 30 },
    "right_hip": { "x": 307, "y": 315, "width": 30, "height": 30 },
    "left_thigh": { "x": 223, "y": 438, "width": 35, "height": 35 },
    "right_thigh": { "x": 287, "y": 438, "width": 35, "height": 35 },
    "left_calf": { "x": 223, "y": 563, "width": 30, "height": 30 },
    "right_calf": { "x": 283, "y": 565, "width": 30, "height": 30 },
    "left_ankle": { "x": 231, "y": 671, "width": 25, "height": 25 },
    "right_ankle": { "x": 272, "y": 675, "width": 25, "height": 25 }
  },
  maleleftside: {
    "head": { "x": 250, "y": 70, "width": 90, "height": 90 },
    "face": { "x": 240, "y": 105, "width": 70, "height": 70 },
    "nose": { "x": 205, "y": 104, "width": 40, "height": 40 },
    "left_eye": { "x": 220, "y": 89, "width": 35, "height": 35 },
    "left_ear": { "x": 270, "y": 101, "width": 40, "height": 40 },
    "mouth": { "x": 213, "y": 128, "width": 50, "height": 30 },
    "neck": { "x": 270, "y": 147, "width": 60, "height": 50 },
    "chest": { "x": 228, "y": 213, "width": 100, "height": 80 },
    "back": { "x": 321, "y": 230, "width": 80, "height": 80 },
    "abdomen": { "x": 216, "y": 311, "width": 100, "height": 70 },
    "spine": { "x": 319, "y": 271, "width": 50, "height": 150 },
    "left_shoulder": { "x": 279, "y": 183, "width": 60, "height": 60 },
    "left_arm": { "x": 282, "y": 259, "width": 60, "height": 80 },
    "left_elbow": { "x": 277, "y": 317, "width": 50, "height": 50 },
    "left_forearm": { "x": 252, "y": 362, "width": 60, "height": 80 },
    "left_wrist": { "x": 232, "y": 400, "width": 50, "height": 40 },
    "left_hand": { "x": 211, "y": 445, "width": 70, "height": 80 },
    "left_thigh": { "x": 257, "y": 450, "width": 90, "height": 120 },
    "left_knee": { "x": 244, "y": 526, "width": 70, "height": 60 },
    "left_calf": { "x": 311, "y": 584, "width": 70, "height": 90 },
    "left_ankle": { "x": 283, "y": 671, "width": 50, "height": 40 }
  },
  malecardiorespi: {
    "trachea_suprasternal_notch": { "x": 251, "y": 170, "width": 30, "height": 30 },
    "lower_sternal_border": { "x": 255, "y": 362, "width": 30, "height": 30 },
    "parasternal_heave_area": { "x": 332, "y": 251, "width": 30, "height": 30 },
    "aortic_area": { "x": 217, "y": 249, "width": 30, "height": 30 },
    "pulmonary_area": { "x": 296, "y": 250, "width": 30, "height": 30 },
    "tricuspid_area": { "x": 278, "y": 353, "width": 30, "height": 30 },
    "mitral_area": { "x": 351, "y": 387, "width": 30, "height": 30 },
    "apex_beat_5th_ics_midclavicular": { "x": 358, "y": 366, "width": 30, "height": 30 },
    "carotid_artery_right": { "x": 217, "y": 147, "width": 28, "height": 28 },
    "carotid_artery_left": { "x": 291, "y": 143, "width": 28, "height": 28 },
    "jugular_venous_pressure_point": { "x": 201, "y": 117, "width": 28, "height": 28 },
    "upper_chest_expansion_right": { "x": 127, "y": 286, "width": 34, "height": 34 },
    "upper_chest_expansion_left": { "x": 333, "y": 251, "width": 34, "height": 34 },
    "lower_chest_expansion_right": { "x": 148, "y": 391, "width": 34, "height": 34 },
    "lower_chest_expansion_left": { "x": 329, "y": 393, "width": 34, "height": 34 },
    "tactile_fremitus_upper_right": { "x": 153, "y": 242, "width": 34, "height": 34 },
    "tactile_fremitus_upper_left": { "x": 383, "y": 251, "width": 34, "height": 34 },
    "tactile_fremitus_lower_right": { "x": 149, "y": 391, "width": 34, "height": 34 },
    "tactile_fremitus_lower_left": { "x": 330, "y": 397, "width": 34, "height": 34 },
    "percussion_above_clavicle_right": { "x": 157, "y": 157, "width": 32, "height": 32 },
    "percussion_above_clavicle_left": { "x": 332, "y": 161, "width": 32, "height": 32 },
    "percussion_clavicle_right": { "x": 151, "y": 188, "width": 32, "height": 32 },
    "percussion_clavicle_left": { "x": 335, "y": 190, "width": 32, "height": 32 },
    "percussion_2nd_ics_right": { "x": 155, "y": 244, "width": 32, "height": 32 },
    "percussion_2nd_ics_left": { "x": 334, "y": 251, "width": 32, "height": 32 },
    "percussion_3rd_ics_right": { "x": 154, "y": 283, "width": 32, "height": 32 },
    "percussion_3rd_ics_left": { "x": 331, "y": 284, "width": 32, "height": 32 },
    "percussion_4th_ics_right": { "x": 154, "y": 327, "width": 32, "height": 32 },
    "percussion_4th_ics_left": { "x": 329, "y": 330, "width": 32, "height": 32 },
    "auscultation_upper_right": { "x": 153, "y": 242, "width": 34, "height": 34 },
    "auscultation_upper_left": { "x": 340, "y": 219, "width": 34, "height": 34 },
    "auscultation_middle_right": { "x": 153, "y": 301, "width": 34, "height": 34 },
    "auscultation_middle_left": { "x": 330, "y": 306, "width": 34, "height": 34 },
    "auscultation_lower_right": { "x": 148, "y": 391, "width": 34, "height": 34 },
    "auscultation_lower_left": { "x": 329, "y": 395, "width": 34, "height": 34 },
    "mitral_area_to_axilla": { "x": 420, "y": 346, "width": 40, "height": 40 }
  },
  femalecardiorespi: {
    "trachea_suprasternal_notch": { "x": 250, "y": 168, "width": 30, "height": 30 },
    "lower_sternal_border": { "x": 252, "y": 355, "width": 30, "height": 30 },
    "parasternal_heave_area": { "x": 328, "y": 242, "width": 30, "height": 30 },
    "aortic_area": { "x": 217, "y": 243, "width": 30, "height": 30 },
    "pulmonary_area": { "x": 300, "y": 243, "width": 30, "height": 30 },
    "tricuspid_area": { "x": 274, "y": 345, "width": 30, "height": 30 },
    "mitral_area": { "x": 343, "y": 383, "width": 30, "height": 30 },
    "apex_beat_5th_ics_midclavicular": { "x": 351, "y": 366, "width": 30, "height": 30 },
    "carotid_artery_right": { "x": 217, "y": 132, "width": 28, "height": 28 },
    "carotid_artery_left": { "x": 293, "y": 131, "width": 28, "height": 28 },
    "jugular_venous_pressure_point": { "x": 201, "y": 105, "width": 28, "height": 28 },
    "upper_chest_expansion_right": { "x": 171, "y": 240, "width": 34, "height": 34 },
    "upper_chest_expansion_left": { "x": 332, "y": 242, "width": 34, "height": 34 },
    "lower_chest_expansion_right": { "x": 173, "y": 395, "width": 34, "height": 34 },
    "lower_chest_expansion_left": { "x": 331, "y": 395, "width": 34, "height": 34 },
    "tactile_fremitus_upper_right": { "x": 139, "y": 279, "width": 34, "height": 34 },
    "tactile_fremitus_upper_left": { "x": 329, "y": 240, "width": 34, "height": 34 },
    "tactile_fremitus_lower_right": { "x": 170, "y": 398, "width": 34, "height": 34 },
    "tactile_fremitus_lower_left": { "x": 330, "y": 394, "width": 34, "height": 34 },
    "percussion_above_clavicle_right": { "x": 163, "y": 144, "width": 32, "height": 32 },
    "percussion_above_clavicle_left": { "x": 335, "y": 145, "width": 32, "height": 32 },
    "percussion_clavicle_right": { "x": 162, "y": 171, "width": 32, "height": 32 },
    "percussion_clavicle_left": { "x": 335, "y": 176, "width": 32, "height": 32 },
    "percussion_2nd_ics_right": { "x": 168, "y": 240, "width": 32, "height": 32 },
    "percussion_2nd_ics_left": { "x": 331, "y": 242, "width": 32, "height": 32 },
    "percussion_3rd_ics_right": { "x": 169, "y": 281, "width": 32, "height": 32 },
    "percussion_3rd_ics_left": { "x": 331, "y": 273, "width": 32, "height": 32 },
    "percussion_4th_ics_right": { "x": 169, "y": 323, "width": 32, "height": 32 },
    "percussion_4th_ics_left": { "x": 332, "y": 324, "width": 32, "height": 32 },
    "auscultation_upper_right": { "x": 168, "y": 237, "width": 34, "height": 34 },
    "auscultation_upper_left": { "x": 331, "y": 240, "width": 34, "height": 34 },
    "auscultation_middle_right": { "x": 169, "y": 300, "width": 34, "height": 34 },
    "auscultation_middle_left": { "x": 331, "y": 299, "width": 34, "height": 34 },
    "auscultation_lower_right": { "x": 169, "y": 395, "width": 34, "height": 34 },
    "auscultation_lower_left": { "x": 331, "y": 395, "width": 34, "height": 34 },
    "mitral_area_to_axilla": { "x": 400, "y": 345, "width": 40, "height": 40 }
  },
  femaleback: {
    // Comprehensive female back anatomy coordinates
    "head": { "x": 256, "y": 42, "width": 50, "height": 50 },
    "left_ear": { "x": 299, "y": 92, "width": 50, "height": 50 },
    "right_ear": { "x": 213, "y": 98, "width": 50, "height": 50 },
    "neck": { "x": 254, "y": 154, "width": 50, "height": 50 },
    "upper_back": { "x": 256, "y": 204, "width": 50, "height": 50 },
    "lower_back": { "x": 258, "y": 309, "width": 50, "height": 50 },
    "spine": { "x": 258, "y": 259, "width": 50, "height": 50 },
    "left_shoulder_blade": { "x": 293, "y": 204, "width": 50, "height": 50 },
    "right_shoulder_blade": { "x": 217, "y": 204, "width": 50, "height": 50 },
    "buttocks": { "x": 258, "y": 381, "width": 50, "height": 50 },
    "left_shoulder": { "x": 327, "y": 164, "width": 50, "height": 50 },
    "right_shoulder": { "x": 187, "y": 166, "width": 50, "height": 50 },
    "left_arm": { "x": 354, "y": 255, "width": 50, "height": 50 },
    "right_arm": { "x": 162, "y": 253, "width": 50, "height": 50 },
    "left_elbow": { "x": 368, "y": 339, "width": 50, "height": 50 },
    "right_elbow": { "x": 144, "y": 341, "width": 50, "height": 50 },
    "left_forearm": { "x": 382, "y": 383, "width": 50, "height": 50 },
    "right_forearm": { "x": 136, "y": 385, "width": 50, "height": 50 },
    "left_wrist": { "x": 386, "y": 418, "width": 50, "height": 50 },
    "right_wrist": { "x": 124, "y": 418, "width": 50, "height": 50 },
    "left_hand": { "x": 386, "y": 418, "width": 50, "height": 50 },
    "right_hand": { "x": 124, "y": 418, "width": 50, "height": 50 },
    "left_hip": { "x": 309, "y": 351, "width": 50, "height": 50 },
    "right_hip": { "x": 197, "y": 347, "width": 50, "height": 50 },
    "left_thigh": { "x": 297, "y": 466, "width": 50, "height": 50 },
    "right_thigh": { "x": 213, "y": 470, "width": 50, "height": 50 },
    "left_calf": { "x": 287, "y": 616, "width": 50, "height": 50 },
    "right_calf": { "x": 223, "y": 618, "width": 50, "height": 50 },
    "left_ankle": { "x": 279, "y": 689, "width": 50, "height": 50 },
    "right_ankle": { "x": 229, "y": 689, "width": 50, "height": 50 },
    "left_foot": { "x": 295, "y": 722, "width": 50, "height": 50 },
    "right_foot": { "x": 221, "y": 724, "width": 50, "height": 50 },
    // Spinal anatomy
    "cervical_spine": { "x": 256, "y": 140, "width": 40, "height": 40 },
    "thoracic_spine": { "x": 256, "y": 220, "width": 40, "height": 80 },
    "lumbar_spine": { "x": 256, "y": 300, "width": 50, "height": 80 },
    "sacrum": { "x": 256, "y": 400, "width": 60, "height": 60 },
    "coccyx": { "x": 256, "y": 440, "width": 30, "height": 30 },
    // Muscle groups
    "trapezius": { "x": 256, "y": 170, "width": 200, "height": 100 },
    "latissimus_dorsi": { "x": 256, "y": 280, "width": 220, "height": 120 },
    "erector_spinae": { "x": 256, "y": 320, "width": 100, "height": 150 },
    "gluteus_maximus_left": { "x": 326, "y": 420, "width": 100, "height": 100 },
    "gluteus_maximus_right": { "x": 186, "y": 420, "width": 100, "height": 100 },
    "hamstring_left": { "x": 306, "y": 520, "width": 70, "height": 120 },
    "hamstring_right": { "x": 206, "y": 520, "width": 70, "height": 120 },
    "achilles_tendon_left": { "x": 296, "y": 690, "width": 30, "height": 60 },
    "achilles_tendon_right": { "x": 216, "y": 690, "width": 30, "height": 60 },
    // Additional anatomical structures
    "scapula_spine_left": { "x": 316, "y": 200, "width": 50, "height": 30 },
    "scapula_spine_right": { "x": 196, "y": 200, "width": 50, "height": 30 },
    "left_kidney_posterior": { "x": 316, "y": 280, "width": 60, "height": 60 },
    "right_kidney_posterior": { "x": 196, "y": 280, "width": 60, "height": 60 },
    "posterior_lungs": { "x": 256, "y": 200, "width": 200, "height": 150 }
  },
  femalerightside: {
    // Corrected female right side lateral profile coordinates (35 points)
    "head": { "x": 258, "y": 49, "width": 50, "height": 50 },
    "face": { "x": 272, "y": 99, "width": 50, "height": 50 },
    "nose": { "x": 313, "y": 103, "width": 50, "height": 50 },
    "right_eye": { "x": 294, "y": 80, "width": 50, "height": 50 },
    "right_ear": { "x": 239, "y": 90, "width": 50, "height": 50 },
    "mouth": { "x": 301, "y": 119, "width": 50, "height": 50 },
    "neck": { "x": 250, "y": 153, "width": 50, "height": 50 },
    "chest": { "x": 287, "y": 216, "width": 50, "height": 50 },
    "back": { "x": 184, "y": 220, "width": 50, "height": 50 },
    "abdomen": { "x": 297, "y": 304, "width": 50, "height": 50 },
    "spine": { "x": 181, "y": 279, "width": 50, "height": 50 },
    "right_shoulder": { "x": 233, "y": 218, "width": 50, "height": 50 },
    "right_elbow": { "x": 225, "y": 321, "width": 50, "height": 50 },
    "right_arm": { "x": 223, "y": 260, "width": 50, "height": 50 },
    "right_forearm": { "x": 244, "y": 367, "width": 50, "height": 50 },
    "right_wrist": { "x": 278, "y": 424, "width": 50, "height": 50 },
    "right_hand": { "x": 299, "y": 465, "width": 50, "height": 50 },
    "right_hip": { "x": 213, "y": 456, "width": 50, "height": 50 },
    "right_thigh": { "x": 239, "y": 505, "width": 50, "height": 50 },
    "right_knee": { "x": 266, "y": 573, "width": 50, "height": 50 },
    "right_calf": { "x": 186, "y": 619, "width": 50, "height": 50 },
    "right_ankle": { "x": 240, "y": 714, "width": 50, "height": 50 },
    "right_foot": { "x": 291, "y": 734, "width": 50, "height": 50 },
    // Visible organs from right lateral profile
    "right_lung_profile": { "x": 280, "y": 220, "width": 120, "height": 140 },
    "heart_shadow": { "x": 290, "y": 280, "width": 80, "height": 80 },
    "diaphragm_dome_right": { "x": 280, "y": 330, "width": 100, "height": 30 },
    "liver_edge": { "x": 280, "y": 280, "width": 80, "height": 40 },
    // Female anatomy visible from lateral profile
    "right_breast": { "x": 310, "y": 240, "width": 70, "height": 70 },
    "right_nipple": { "x": 315, "y": 255, "width": 20, "height": 20 },
    // Muscle groups visible from right lateral profile
    "pectoralis_major_right": { "x": 316, "y": 229, "width": 90, "height": 70 },
    "rectus_abdominis_right": { "x": 300, "y": 320, "width": 70, "height": 100 },
    "gluteus_maximus_right": { "x": 280, "y": 440, "width": 100, "height": 100 },
    "hamstring_right_profile": { "x": 196, "y": 525, "width": 70, "height": 120 },
    "gastrocnemius_right": { "x": 240, "y": 600, "width": 60, "height": 100 },
    "achilles_tendon_right": { "x": 240, "y": 690, "width": 30, "height": 60 }
  },
  femaleleftside: {
    // Corrected female left side lateral profile coordinates (35 points)
    "head": { "x": 258, "y": 49, "width": 50, "height": 50 },
    "face": { "x": 242, "y": 90, "width": 50, "height": 50 },
    "nose": { "x": 211, "y": 91, "width": 50, "height": 50 },
    "left_eye": { "x": 225, "y": 77, "width": 50, "height": 50 },
    "left_ear": { "x": 277, "y": 86, "width": 50, "height": 50 },
    "mouth": { "x": 215, "y": 116, "width": 50, "height": 50 },
    "neck": { "x": 255, "y": 148, "width": 50, "height": 50 },
    "chest": { "x": 287, "y": 216, "width": 50, "height": 50 },
    "back": { "x": 333, "y": 214, "width": 50, "height": 50 },
    "abdomen": { "x": 194, "y": 344, "width": 50, "height": 50 },
    "spine": { "x": 325, "y": 269, "width": 50, "height": 50 },
    "left_shoulder": { "x": 294, "y": 188, "width": 50, "height": 50 },
    "left_elbow": { "x": 285, "y": 309, "width": 50, "height": 50 },
    "left_arm": { "x": 292, "y": 250, "width": 50, "height": 50 },
    "left_forearm": { "x": 268, "y": 359, "width": 50, "height": 50 },
    "left_wrist": { "x": 239, "y": 391, "width": 50, "height": 50 },
    "left_hand": { "x": 215, "y": 429, "width": 50, "height": 50 },
    "left_hip": { "x": 283, "y": 416, "width": 50, "height": 50 },
    "left_thigh": { "x": 254, "y": 471, "width": 50, "height": 50 },
    "left_knee": { "x": 249, "y": 558, "width": 50, "height": 50 },
    "left_calf": { "x": 320, "y": 608, "width": 50, "height": 50 },
    "left_ankle": { "x": 289, "y": 699, "width": 50, "height": 50 },
    "left_foot": { "x": 221, "y": 735, "width": 50, "height": 50 },
    // Internal organs (left lateral profile view)
    "left_lung_profile": { "x": 241, "y": 220, "width": 120, "height": 140 },
    "heart_shadow": { "x": 245, "y": 274, "width": 80, "height": 80 },
    "diaphragm_dome_left": { "x": 204, "y": 313, "width": 100, "height": 30 },
    "spleen_edge": { "x": 230, "y": 310, "width": 60, "height": 40 },
    // Female-specific anatomy (left side)
    "left_breast": { "x": 227, "y": 239, "width": 70, "height": 70 },
    "left_nipple": { "x": 206, "y": 263, "width": 20, "height": 20 },
    // Muscle groups (left side)
    "pectoralis_major_left": { "x": 214, "y": 216, "width": 90, "height": 70 },
    "rectus_abdominis_left": { "x": 215, "y": 342, "width": 70, "height": 100 },
    "gluteus_maximus_left": { "x": 235, "y": 420, "width": 100, "height": 100 },
    "hamstring_left_profile": { "x": 311, "y": 510, "width": 70, "height": 120 },
    "gastrocnemius_left": { "x": 250, "y": 600, "width": 60, "height": 100 },
    "achilles_tendon_left": { "x": 264, "y": 693, "width": 30, "height": 60 }
  },
  maleabdominallinguinal: {
    // Male abdominal/inguinal examination coordinates (26 points)
    "right_upper_quadrant": { "x": 134, "y": 223, "width": 40, "height": 40 },
    "left_upper_quadrant": { "x": 378, "y": 225, "width": 40, "height": 40 },
    "right_lower_quadrant": { "x": 141, "y": 426, "width": 40, "height": 40 },
    "left_lower_quadrant": { "x": 366, "y": 427, "width": 40, "height": 40 },
    "liver_edge": { "x": 148, "y": 185, "width": 35, "height": 35 },
    "gallbladder": { "x": 172, "y": 205, "width": 30, "height": 30 },
    "spleen": { "x": 366, "y": 177, "width": 35, "height": 35 },
    "left_kidney": { "x": 417, "y": 309, "width": 32, "height": 32 },
    "right_kidney": { "x": 88, "y": 310, "width": 32, "height": 32 },
    "bladder": { "x": 252, "y": 540, "width": 35, "height": 35 },
    "appendix": { "x": 170, "y": 431, "width": 30, "height": 30 },
    "umbilicus": { "x": 251, "y": 352, "width": 25, "height": 25 },
    "right_inguinal_canal": { "x": 142, "y": 508, "width": 35, "height": 35 },
    "left_inguinal_canal": { "x": 357, "y": 507, "width": 35, "height": 35 },
    "right_inguinal_lymph_nodes": { "x": 161, "y": 555, "width": 30, "height": 30 },
    "left_inguinal_lymph_nodes": { "x": 337, "y": 559, "width": 30, "height": 30 },
    "right_femoral_triangle": { "x": 126, "y": 557, "width": 32, "height": 32 },
    "left_femoral_triangle": { "x": 372, "y": 558, "width": 32, "height": 32 },
    "right_direct_hernia": { "x": 168, "y": 528, "width": 28, "height": 28 },
    "left_direct_hernia": { "x": 331, "y": 532, "width": 28, "height": 28 },
    "right_indirect_hernia": { "x": 198, "y": 589, "width": 28, "height": 28 },
    "left_indirect_hernia": { "x": 307, "y": 592, "width": 28, "height": 28 },
    "epigastrium": { "x": 255, "y": 200, "width": 35, "height": 35 },
    "hypogastrium": { "x": 251, "y": 489, "width": 35, "height": 35 },
    "right_flank": { "x": 140, "y": 312, "width": 30, "height": 30 },
    "left_flank": { "x": 375, "y": 310, "width": 30, "height": 30 }
  },
  femaleabdominallinguinal: {
    // Female abdominal/inguinal examination coordinates (26 points)
    "right_upper_quadrant": { "x": 134, "y": 223, "width": 40, "height": 40 },
    "left_upper_quadrant": { "x": 378, "y": 225, "width": 40, "height": 40 },
    "right_lower_quadrant": { "x": 141, "y": 426, "width": 40, "height": 40 },
    "left_lower_quadrant": { "x": 366, "y": 427, "width": 40, "height": 40 },
    "liver_edge": { "x": 148, "y": 185, "width": 35, "height": 35 },
    "gallbladder": { "x": 172, "y": 205, "width": 30, "height": 30 },
    "spleen": { "x": 366, "y": 177, "width": 35, "height": 35 },
    "left_kidney": { "x": 417, "y": 309, "width": 32, "height": 32 },
    "right_kidney": { "x": 88, "y": 310, "width": 32, "height": 32 },
    "bladder": { "x": 252, "y": 540, "width": 35, "height": 35 },
    "appendix": { "x": 170, "y": 431, "width": 30, "height": 30 },
    "umbilicus": { "x": 251, "y": 352, "width": 25, "height": 25 },
    "right_inguinal_canal": { "x": 142, "y": 508, "width": 35, "height": 35 },
    "left_inguinal_canal": { "x": 357, "y": 507, "width": 35, "height": 35 },
    "right_inguinal_lymph_nodes": { "x": 161, "y": 555, "width": 30, "height": 30 },
    "left_inguinal_lymph_nodes": { "x": 337, "y": 559, "width": 30, "height": 30 },
    "right_femoral_triangle": { "x": 126, "y": 557, "width": 32, "height": 32 },
    "left_femoral_triangle": { "x": 372, "y": 558, "width": 32, "height": 32 },
    "right_direct_hernia": { "x": 168, "y": 528, "width": 28, "height": 28 },
    "left_direct_hernia": { "x": 331, "y": 532, "width": 28, "height": 28 },
    "right_indirect_hernia": { "x": 198, "y": 589, "width": 28, "height": 28 },
    "left_indirect_hernia": { "x": 307, "y": 592, "width": 28, "height": 28 },
    "epigastrium": { "x": 255, "y": 200, "width": 35, "height": 35 },
    "hypogastrium": { "x": 251, "y": 489, "width": 35, "height": 35 },
    "right_flank": { "x": 140, "y": 312, "width": 30, "height": 30 },
    "left_flank": { "x": 375, "y": 310, "width": 30, "height": 30 }
  }
  // Add more mappings for other diagram types as needed
}

interface SimpleMedicalDiagramProps {
  patientGender: 'male' | 'female'
  medicalNoteText?: string
  analysisMode?: 'intelligent' | 'basic'
}



export default function SimpleMedicalDiagram({ 
  patientGender, 
  medicalNoteText,
  analysisMode = 'intelligent' 
}: SimpleMedicalDiagramProps) {

  // Function to identify relevant body parts from medical text
  const getRelevantBodyParts = (text: string, diagramType: string): string[] => {
    if (!text) return []
    
    const lowerText = text.toLowerCase()
    const relevantParts: string[] = []
    
    // Get available coordinates for this diagram type
    const coordinates = COORDINATE_MAPPINGS[`${patientGender}${diagramType}`] || {}
    const availableParts = Object.keys(coordinates)
    
    // Map medical terms to body parts
    const bodyPartMappings: Record<string, string[]> = {
      'head': ['head', 'skull'],
      'face': ['face', 'facial'],
      'eye': ['left_eye', 'right_eye'],
      'eyes': ['left_eye', 'right_eye'],
      'left_eye': ['left_eye'],
      'right_eye': ['right_eye'],
      'nose': ['nose'],
      'mouth': ['mouth'],
      'ear': ['left_ear', 'right_ear'],
      'left_ear': ['left_ear'],
      'right_ear': ['right_ear'],
      'neck': ['neck', 'cervical_spine'],
      'chest': ['chest'],
      'abdomen': ['abdomen'],
      'shoulder': ['left_shoulder', 'right_shoulder'],
      'left_shoulder': ['left_shoulder'],
      'right_shoulder': ['right_shoulder'],
      'arm': ['left_arm', 'right_arm'],
      'left_arm': ['left_arm'],
      'right_arm': ['right_arm'],
      'elbow': ['left_elbow', 'right_elbow'],
      'left_elbow': ['left_elbow'],
      'right_elbow': ['right_elbow'],
      'hand': ['left_hand', 'right_hand'],
      'left_hand': ['left_hand'],
      'right_hand': ['right_hand'],
      'wrist': ['left_wrist', 'right_wrist'],
      'left_wrist': ['left_wrist'],
      'right_wrist': ['right_wrist'],
      'leg': ['left_thigh', 'right_thigh', 'left_calf', 'right_calf'],
      'thigh': ['left_thigh', 'right_thigh'],
      'knee': ['left_knee', 'right_knee'],
      'left_knee': ['left_knee'],
      'right_knee': ['right_knee'],
      'ankle': ['left_ankle', 'right_ankle'],
      'foot': ['left_foot', 'right_foot'],
      'heart': ['mitral_area', 'aortic_area', 'pulmonary_area', 'tricuspid_area', 'apex_beat_5th_ics_midclavicular'],
      'heart sounds': ['mitral_area', 'aortic_area', 'pulmonary_area', 'tricuspid_area', 'apex_beat_5th_ics_midclavicular'],
      'heart sound': ['mitral_area', 'aortic_area', 'pulmonary_area', 'tricuspid_area', 'apex_beat_5th_ics_midclavicular'],
      'lungs': ['auscultation_upper_right', 'auscultation_upper_left', 'auscultation_middle_right', 'auscultation_middle_left', 'auscultation_lower_right', 'auscultation_lower_left'],
      'stomach': ['stomach'],
      'liver': ['liver'],
      'spine': ['spine', 'cervical_spine', 'thoracic_spine', 'lumbar_spine', 'sacrum', 'coccyx'],
      'back': ['upper_back', 'lower_back', 'spine'],
      'upper back': ['upper_back', 'thoracic_spine', 'trapezius'],
      'lower back': ['lower_back', 'lumbar_spine', 'erector_spinae'],
      'cervical': ['cervical_spine'],
      'thoracic': ['thoracic_spine'],
      'lumbar': ['lumbar_spine'],
      'sacrum': ['sacrum'],
      'coccyx': ['coccyx'],
      'shoulder blade': ['left_shoulder_blade', 'right_shoulder_blade'],
      'scapula': ['left_shoulder_blade', 'right_shoulder_blade', 'scapula_spine_left', 'scapula_spine_right'],
      'buttocks': ['buttocks', 'gluteus_maximus_left', 'gluteus_maximus_right'],
      'glutes': ['gluteus_maximus_left', 'gluteus_maximus_right'],
      'hamstring': ['hamstring_left', 'hamstring_right'],
      'trapezius': ['trapezius'],
      'latissimus': ['latissimus_dorsi'],
      'erector spinae': ['erector_spinae'],
      'achilles': ['achilles_tendon_left', 'achilles_tendon_right'],
      'posterior': ['upper_back', 'lower_back', 'spine'],
      // Cardiorespiratory examination terms
      'aortic': ['aortic_area'],
      'pulmonary': ['pulmonary_area'],
      'tricuspid': ['tricuspid_area'],
      'mitral': ['mitral_area'],
      'apex': ['apex_beat_5th_ics_midclavicular'],
      'carotid': ['carotid_artery_right', 'carotid_artery_left'],
      'jugular': ['jugular_venous_pressure_point'],
      'percussion': ['percussion_2nd_ics_right', 'percussion_2nd_ics_left', 'percussion_3rd_ics_right', 'percussion_3rd_ics_left'],
      'auscultation': ['auscultation_upper_right', 'auscultation_upper_left', 'auscultation_middle_right', 'auscultation_middle_left'],
      'breath sounds': ['auscultation_upper_right', 'auscultation_upper_left', 'auscultation_lower_right', 'auscultation_lower_left'],
      'chest expansion': ['upper_chest_expansion_right', 'upper_chest_expansion_left', 'lower_chest_expansion_right', 'lower_chest_expansion_left'],
      'fremitus': ['tactile_fremitus_upper_right', 'tactile_fremitus_upper_left', 'tactile_fremitus_lower_right', 'tactile_fremitus_lower_left'],
      'trachea': ['trachea_suprasternal_notch'],
      'sternum': ['lower_sternal_border'],
      'parasternal': ['parasternal_heave_area']
    }
    
    // Check for mentions of body parts in the text
    Object.entries(bodyPartMappings).forEach(([term, parts]) => {
      if (lowerText.includes(term)) {
        parts.forEach(part => {
          if (availableParts.includes(part) && !relevantParts.includes(part)) {
            relevantParts.push(part)
          }
        })
      }
    })
    
    // If no specific parts found, show commonly examined areas
    if (relevantParts.length === 0) {
      const commonParts = ['head', 'chest', 'abdomen', 'heart', 'lungs'].filter(part => 
        availableParts.includes(part)
      )
      return commonParts
    }
    
    return relevantParts
  }
  
  // Intelligent Medical Text Analysis for Clinical Understanding
  const getIntelligentAnalysis = (): IntelligentAnalysis => {
    if (!medicalNoteText) {
      return IntelligentMedicalAnalyzer.getInstance().analyzeMedicalText('', {
        patientGender,
        examinationType: 'general' as const,
        bodySystems: []
      })
    }

    // Use intelligent medical analyzer
    const analyzer = IntelligentMedicalAnalyzer.getInstance()
    const context: MedicalContext = {
      patientGender,
      examinationType: 'comprehensive' as const,
      bodySystems: ['cardiovascular', 'respiratory', 'gastrointestinal', 'neurological', 'musculoskeletal']
    }
    
    return analyzer.analyzeMedicalText(medicalNoteText, context)
  }

  // Get intelligent analysis for display
  const intelligentAnalysis = getIntelligentAnalysis()


  return (
    <div>
      <Card className="shadow-lg">
        <CardContent className="px-4 py-2 pt-4">
          <div className="space-y-4">
            {intelligentAnalysis.recommendedDiagrams.map((diagramType, index) => (
              <div key={diagramType} className="border rounded-lg p-3 bg-gray-50">

                {/* Side-by-side Layout: Image Left, Findings Right */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left Side - Medical Diagram */}
                  <div className="md:w-1/2 flex-shrink-0">
                    <div className="relative max-w-xs mx-auto md:mx-0">
                      <div className="relative w-full overflow-hidden rounded-lg border bg-gray-100 shadow-sm">
                        <Image
                          src={`/medical-images/${diagramType}.png`}
                          alt={`${diagramType} medical diagram`}
                          width={512}
                          height={768}
                          className="w-full h-auto object-contain"
                          priority={index === 0}
                        />
                        
                        {/* Numbered Coordinate Markers - Connected to Findings */}
                        {(() => {
                          const relevantParts = getRelevantBodyParts(medicalNoteText || '', diagramType)
                          const coordinates = COORDINATE_MAPPINGS[diagramType] || {}
                          
                          // Get findings for this diagram type to create numbered markers
                          const findingsForThisDiagram = intelligentAnalysis.findings.map(f => f.text) || []
                          
                          return relevantParts.map((partName, partIndex) => {
                            const coord = coordinates[partName]
                            if (!coord) return null
                            
                            // Find which finding corresponds to this body part
                            const findingIndex = findingsForThisDiagram.findIndex(finding => 
                              finding.toLowerCase().includes(partName.toLowerCase()) ||
                              partName.toLowerCase().includes(finding.toLowerCase().split(' ')[0])
                            )
                            
                            // If no direct match, assign sequential number
                            const markerNumber = findingIndex >= 0 ? findingIndex + 1 : partIndex + 1
                            
                            return (
                              <div
                                key={partName}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                                style={{
                                  left: `${(coord.x / 512) * 100}%`,
                                  top: `${(coord.y / 768) * 100}%`,
                                }}
                              >
                                {/* Numbered Marker - Connected to Findings */}
                                <div
                                  className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer flex items-center justify-center"
                                  style={{
                                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
                                  }}
                                  title={`${partName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Finding #${markerNumber}`}
                                >
                                  <span className="text-white text-xs font-bold">
                                    {markerNumber}
                                  </span>
                                </div>
                                
                                {/* Enhanced Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-blue-700 shadow-lg"
                                     style={{ zIndex: 1000 }}>
                                  <div className="font-semibold">Finding #{markerNumber}</div>
                                  <div className="text-blue-100">
                                    {partName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  {findingIndex >= 0 && (
                                    <div className="text-blue-200 mt-1 border-t border-blue-500 pt-1">
                                      {findingsForThisDiagram[findingIndex]}
                                    </div>
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Relevant Findings */}
                  <div className="md:w-1/2 flex-shrink-0 min-w-0 md:pr-4">
                    <div className="mb-3">
                      <h5 className="text-md font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        Relevant Findings
                      </h5>
                      <p className="text-sm text-gray-600">
                        Examination findings related to this body region
                      </p>
                    </div>

                                         <div className="space-y-2">
                       {intelligentAnalysis.findings.map((finding, findingIndex) => {
                         // Use the intelligent finding directly
                         const intelligentFinding = finding
                         
                         return (
                           <div
                             key={findingIndex}
                             className={`p-2 rounded-lg border bg-white hover:shadow-md transition-shadow mr-2 border-l-4 ${
                               intelligentFinding?.clinicalSignificance === 'abnormal' 
                                 ? 'border-l-red-500' 
                                 : intelligentFinding?.clinicalSignificance === 'normal'
                                 ? 'border-l-green-500'
                                 : 'border-l-blue-500'
                             }`}
                           >
                             <div className="flex items-start gap-2">
                               {/* Finding Number - Now Matches Diagram Markers */}
                               <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-md ${
                                 intelligentFinding?.clinicalSignificance === 'abnormal'
                                   ? 'bg-red-500'
                                   : intelligentFinding?.clinicalSignificance === 'normal'
                                   ? 'bg-green-500'
                                   : 'bg-blue-500'
                               }`}>
                                 {findingIndex + 1}
                               </div>
                               
                               {/* Finding Details */}
                               <div className="flex-1 min-w-0">
                                 <p className="text-sm text-gray-800 font-medium capitalize break-words">
                                   {finding.text}
                                 </p>
                                 
                                 {/* Clinical Intelligence Details */}
                                 {intelligentFinding && (
                                   <div className="mt-2 space-y-1">
                                     <div className="flex items-center gap-2">
                                       <Badge 
                                         variant="outline" 
                                         className={`text-xs ${
                                           intelligentFinding.clinicalSignificance === 'abnormal'
                                             ? 'bg-red-50 text-red-700 border-red-300'
                                             : intelligentFinding.clinicalSignificance === 'normal'
                                             ? 'bg-green-50 text-green-700 border-green-300'
                                             : 'bg-gray-50 text-gray-700 border-gray-300'
                                         }`}
                                       >
                                         {intelligentFinding.clinicalSignificance.charAt(0).toUpperCase() + intelligentFinding.clinicalSignificance.slice(1)}
                                       </Badge>
                                       {intelligentFinding.severity && (
                                         <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                           {intelligentFinding.severity}
                                         </Badge>
                                       )}
                                       {intelligentFinding.laterality && (
                                         <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                                           {intelligentFinding.laterality}
                                         </Badge>
                                       )}
                                     </div>
                                     <p className="text-xs text-gray-600">
                                       {intelligentFinding.anatomicalLocation} • Priority: {intelligentFinding.priority}/5
                                     </p>
                                   </div>
                                 )}
                                 
                                 <p className="text-xs text-blue-600 mt-1 font-medium">
                                   ← See marker #{findingIndex + 1} on diagram
                                 </p>
                               </div>
                             </div>
                           </div>
                         )
                       })}
                      
                      {intelligentAnalysis.findings.length === 0 && (
                        <div className="text-center py-3 text-gray-500 text-sm mr-2">
                          No specific findings for this region
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
