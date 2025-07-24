# API Documentation

## Authentication Endpoints

### POST /auth/register
Creates a new user account with comprehensive registration options.

#### Required Fields
- `email`: User's email address (must be valid format)
- `password`: Secure password (minimum 8 characters, must contain uppercase, lowercase, and number)
- `firstName`: User's first name (minimum 2 characters)
- `lastName`: User's last name (minimum 2 characters)
- `preferredLanguage`: Language preference for transcription services (e.g., "en-US", "es-ES")

#### Optional Fields
- `specialization`: Medical specialization (see available specializations below)
- `registrationNo`: Medical registration number
- `licenseNumber`: Medical license number
- `organizationId`: UUID of the organization (for hospital/clinic associations)
- `avatarUrl`: Profile picture URL
- `bio`: User biography or professional description

#### User Types
The system supports two main user types:
- **DOCTOR**: Licensed medical professional - can select any medical specialization
- **STUDENT**: Medical student - specialization automatically set to "ALL" for general access

#### Medical Specializations
Available specializations for doctors:
- `General Medicine`: Primary care and general practice
- `Cardiology`: Heart and cardiovascular system
- `Neurology`: Nervous system and brain disorders
- `Pediatrics`: Child and adolescent medicine
- `Internal Medicine`: Adult internal medicine
- `Surgery`: General and specialized surgery
- `Orthopedics`: Musculoskeletal system
- `Dermatology`: Skin conditions
- `Psychiatry`: Mental health and behavioral disorders
- `Obstetrics & Gynecology`: Women's health and pregnancy
- `Emergency Medicine`: Emergency and critical care
- `Radiology`: Medical imaging and diagnostics
- `Anesthesiology`: Anesthesia and pain management
- `Oncology`: Cancer treatment and management

#### Supported Languages
The system supports multiple languages for transcription services:
- `en-US`: English (US)
- `en-GB`: English (UK)
- `es-ES`: Spanish (ES)
- `fr-FR`: French (FR)
- `de-DE`: German (DE)
- `it-IT`: Italian (IT)
- `pt-PT`: Portuguese (PT)
- `ru-RU`: Russian (RU)
- `ja-JP`: Japanese (JP)
- `ko-KR`: Korean (KR)
- `zh-CN`: Chinese (CN)
- `ar-SA`: Arabic (SA)
- `hi-IN`: Hindi (IN)
- `ms-MY`: Malay (Malaysia)
- `nl-NL`: Dutch (NL)
- `sv-SE`: Swedish (SE)
- `no-NO`: Norwegian (NO)
- `da-DK`: Danish (DK)

#### Request Example
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "specialization": "Cardiology",
  "registrationNo": "REG-12345",
  "licenseNumber": "LIC-67890",
  "preferredLanguage": "en-US",
  "organizationId": "uuid-of-organization",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Experienced cardiologist with 15 years of practice"
}
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "doctor@example.com",
    "name": "John Doe",
    "specialization": "Cardiology",
    "registrationNo": "REG-12345",
    "isVerified": false
  },
  "message": "Registration successful. Please check your email for verification."
}
```

#### Error Responses
```json
{
  "success": false,
  "message": "Email, password, firstName, lastName, and preferredLanguage are required"
}
```

```json
{
  "success": false,
  "message": "Email already exists"
}
```

```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

#### Registration Features
- ✅ **User Type Validation**: Validates student vs doctor registration
- ✅ **Automatic Specialization Assignment**: Students get "ALL" specialization
- ✅ **Email Verification System**: Sends verification email after registration
- ✅ **Organization Handling**: Supports hospital/clinic associations
- ✅ **Role-based Access Control**: Different permissions for students vs doctors
- ✅ **Input Validation**: Comprehensive field validation and error handling
- ✅ **Multi-language Support**: Transcription services in patient's language
- ✅ **Professional Credentials**: Optional medical registration and license numbers

#### Registration Flow
1. **Step 1**: Personal Information (name, email, password)
2. **Step 2**: Professional Background (specialization, credentials, language)
3. **Step 3**: Terms Acceptance and Review
4. **Email Verification**: Required before login access

---

## Dashboard Statistics

### GET /health/dashboard-stats
Returns real-time statistics for the dashboard.

#### Response Example
```json
{
  "success": true,
  "data": {
    "notesProcessed": 12,
    "timeSavedPercentage": 80,
    "accuracy": 99,
    "doctorsUsing": 5,
    "additionalMetrics": {
      "totalTimeSavedHours": 4.5,
      "totalUsers": 2,
      "averageTimeSavedPerNote": 22
    }
  }
}
```

#### Response Fields
- `notesProcessed`: Total number of medical notes created (all users or filtered by user if authenticated)
- `additionalMetrics.totalTimeSavedHours`: Total hours saved (sum of all timeSavedSeconds across notes, divided by 3600)
- `additionalMetrics.averageTimeSavedPerNote`: Average minutes saved per note

#### Notes
- The backend calculates time saved using audio duration and actual AI processing time for each note.
- The frontend should use `notesProcessed` for "Notes Created" and `additionalMetrics.totalTimeSavedHours` for "Time Saved" on the dashboard. 