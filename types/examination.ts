// Medical Examination Types - Based on comprehensive template
export interface ExaminationTemplate {
  GeneratedOn: string;
  VitalSigns: VitalSigns;
  GeneralExamination: GeneralExamination;
  GEI: GeneralExaminationInspection;
  CVSRespExamination: CVSRespExamination;
  AbdominalInguinalExamination: AbdominalInguinalExamination;
}

export interface VitalSigns {
  TakenOn: string;
  RecordedBy: string;
  Temp: string;
  PR: string;
  RR: string;
  BP: string;
  OxygenSaturationSpO2: string;
  BodyWeight: string;
  Height: string;
  BMI: {
    Value: string;
    Status: string;
  };
}

export interface GeneralExamination {
  PatientInfo: {
    Name: string;
    Age: string;
    Sex: string;
    ID: string;
    Chaperone: string;
  };
  Observations: {
    ConsciousnessLevel: string;
    WellnessPain: string;
    HydrationStatus: string;
    GaitAndPosture: string;
  };
}

export interface GeneralExaminationInspection {
  Head: {
    Head1: string;
    Head3: string;
    Face1: string;
    Eye1: string;
    Eye2: string;
    Mouth1: string;
  };
  Neck: {
    Neck1: string;
    Neck3: string;
  };
  Shoulders: {
    "Shoulder1.1": string;
    "Shoulder1.2": string;
    Upperback: string;
  };
  Back: {
    Lowerback: string;
  };
  Arms: {
    "Arm1.1": string;
    "Elbow1.1": string;
    "Forearm1.1": string;
    "Hand1.1": string;
    "Arm1.2": string;
    "Elbow1.2": string;
    "Forearm1.2": string;
    "Hand1.2": string;
    "Triceps1.1": string;
    "Triceps1.2": string;
    "Elbow3.2": string;
    "Elbow3.1": string;
    "Forearm3.2": string;
    "Forearm3.1": string;
    "Hand3.2": string;
    "Hand3.1": string;
  };
  Legs: {
    "Hip1.1": string;
    "Hip1.2": string;
    "Hip3.2": string;
    "Hip3.1": string;
    "Buttock3.2": string;
    "Buttock3.1": string;
    "Thigh1.1": string;
    "Thigh1.2": string;
    "Thigh3.1": string;
    "Thigh3.2": string;
    "Knee1.1": string;
    "Knee1.2": string;
    "Knee3.1": string;
    "Knee3.2": string;
    "Leg1.1": string;
    "Leg1.2": string;
    "Calf3.1": string;
    "Calf3.2": string;
    "Feet1.1": string;
    "Feet1.2": string;
    "Ankle3.1": string;
    "Ankle3.2": string;
  };
}

export interface CVSRespExamination {
  PatientInfo: {
    Name: string;
    Age: string;
    Sex: string;
    ID: string;
    Chaperone: string;
  };
  Chest: {
    JVP: string;
    G: string;
    P: string;
    A: string;
    G2: string;
    M: string;
    T: string;
    G3_1: string;
    G3_2: string;
    Percussion: {
      "1_1": string;
      "1_2": string;
      "2_1": string;
      "2_2": string;
      "3_1": string;
      "3_2": string;
      "4_1": string;
      "4_2": string;
      "5_1": string;
      "5_2": string;
      "6_1": string;
      "6_2": string;
      "7_1": string;
      "7_2": string;
    };
    Auscultation: {
      "2_1_1": string;
      "2_1_2": string;
      "2_1_3": string;
      "2_2_1": string;
      "2_2_2": string;
      "2_2_3": string;
    };
  };
}

export interface AbdominalInguinalExamination {
  Stomach: string;
  Spleen: string;
  Liver: string;
  LF: string;
  Umbilicus: string;
  RF: string;
  Appendix_RIF: string;
  LIF: string;
  Bladder: string;
  Inguinal: {
    "1_1": string;
    "1_2": string;
  };
  Scrotum: string;
}

// Helper function to create empty examination template
export function createEmptyExaminationTemplate(): ExaminationTemplate {
  return {
    GeneratedOn: new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/,/g, '/').replace(/ /g, '/'),
    VitalSigns: {
      TakenOn: "",
      RecordedBy: "",
      Temp: "",
      PR: "",
      RR: "",
      BP: "",
      OxygenSaturationSpO2: "",
      BodyWeight: "",
      Height: "",
      BMI: {
        Value: "",
        Status: ""
      }
    },
    GeneralExamination: {
      PatientInfo: {
        Name: "",
        Age: "",
        Sex: "",
        ID: "",
        Chaperone: ""
      },
      Observations: {
        ConsciousnessLevel: "",
        WellnessPain: "",
        HydrationStatus: "",
        GaitAndPosture: ""
      }
    },
    GEI: {
      Head: {
        Head1: "",
        Head3: "",
        Face1: "",
        Eye1: "",
        Eye2: "",
        Mouth1: ""
      },
      Neck: {
        Neck1: "",
        Neck3: ""
      },
      Shoulders: {
        "Shoulder1.1": "",
        "Shoulder1.2": "",
        Upperback: ""
      },
      Back: {
        Lowerback: ""
      },
      Arms: {
        "Arm1.1": "",
        "Elbow1.1": "",
        "Forearm1.1": "",
        "Hand1.1": "",
        "Arm1.2": "",
        "Elbow1.2": "",
        "Forearm1.2": "",
        "Hand1.2": "",
        "Triceps1.1": "",
        "Triceps1.2": "",
        "Elbow3.2": "",
        "Elbow3.1": "",
        "Forearm3.2": "",
        "Forearm3.1": "",
        "Hand3.2": "",
        "Hand3.1": ""
      },
      Legs: {
        "Hip1.1": "",
        "Hip1.2": "",
        "Hip3.2": "",
        "Hip3.1": "",
        "Buttock3.2": "",
        "Buttock3.1": "",
        "Thigh1.1": "",
        "Thigh1.2": "",
        "Thigh3.1": "",
        "Thigh3.2": "",
        "Knee1.1": "",
        "Knee1.2": "",
        "Knee3.1": "",
        "Knee3.2": "",
        "Leg1.1": "",
        "Leg1.2": "",
        "Calf3.1": "",
        "Calf3.2": "",
        "Feet1.1": "",
        "Feet1.2": "",
        "Ankle3.1": "",
        "Ankle3.2": ""
      }
    },
    CVSRespExamination: {
      PatientInfo: {
        Name: "",
        Age: "",
        Sex: "",
        ID: "",
        Chaperone: ""
      },
      Chest: {
        JVP: "",
        G: "",
        P: "",
        A: "",
        G2: "",
        M: "",
        T: "",
        G3_1: "",
        G3_2: "",
        Percussion: {
          "1_1": "",
          "1_2": "",
          "2_1": "",
          "2_2": "",
          "3_1": "",
          "3_2": "",
          "4_1": "",
          "4_2": "",
          "5_1": "",
          "5_2": "",
          "6_1": "",
          "6_2": "",
          "7_1": "",
          "7_2": ""
        },
        Auscultation: {
          "2_1_1": "",
          "2_1_2": "",
          "2_1_3": "",
          "2_2_1": "",
          "2_2_2": "",
          "2_2_3": ""
        }
      }
    },
    AbdominalInguinalExamination: {
      Stomach: "",
      Spleen: "",
      Liver: "",
      LF: "",
      Umbilicus: "",
      RF: "",
      Appendix_RIF: "",
      LIF: "",
      Bladder: "",
      Inguinal: {
        "1_1": "",
        "1_2": ""
      },
      Scrotum: ""
    }
  };
} 