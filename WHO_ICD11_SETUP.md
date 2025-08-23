# WHO ICD-11 API Setup Guide

## Overview

This application now uses the **official WHO ICD-11 API** for medical coding, replacing the previous LLM-based approach that was prone to hallucination. This ensures accurate, authoritative ICD-11 codes directly from the World Health Organization.

## Benefits of WHO API Approach

✅ **No Hallucination**: Real ICD-11 codes only, no made-up codes  
✅ **Authoritative**: Direct from WHO, the official source  
✅ **Up-to-Date**: Always current with latest ICD-11 version  
✅ **Confidence Scoring**: Match scores show reliability  
✅ **Consistent**: Same input always gives same output  
✅ **Traceable**: Full audit trail and code definitions  

## Getting Started

### Step 1: Register for WHO ICD-11 API Access

1. **Visit**: https://icd.who.int/icdapi
2. **Create Account**: Register with WHO
3. **Apply for API Access**: Submit application for API credentials
4. **Wait for Approval**: WHO will review your application (usually 1-5 business days)
5. **Receive Credentials**: You'll get `client_id` and `client_secret`

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# WHO ICD-11 API Credentials
WHO_ICD11_CLIENT_ID=your_client_id_here
WHO_ICD11_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Test the Setup

Run the test script to verify everything is working:

```bash
npm run test:who-icd11
```

This will test:
- ✅ Configuration (credentials set)
- ✅ Connection (API authentication)
- ✅ Code Generation (sample medical conditions)
- ✅ Error Handling (empty inputs)

### Step 4: Verify in Application

1. Open any medical note in the dashboard
2. The ICD-11 codes should now generate using the WHO API
3. You'll see real ICD-11 codes with confidence scores
4. No more hallucinated or invalid codes

## API Usage Examples

### Input:
```json
{
  "diagnosis": "Acute myocardial infarction, hypertension",
  "chiefComplaint": "Chest pain radiating to left arm",
  "assessment": "Probable heart attack with elevated BP"
}
```

### Output:
```json
{
  "success": true,
  "codes": {
    "primary": [
      {
        "code": "BA41",
        "title": "Acute myocardial infarction",
        "confidence": 0.95,
        "matchType": "exact",
        "uri": "http://id.who.int/icd/entity/BA41"
      }
    ],
    "secondary": [
      {
        "code": "BA00",
        "title": "Essential hypertension", 
        "confidence": 0.87,
        "matchType": "partial"
      }
    ],
    "extractedTerms": [
      "Acute myocardial infarction",
      "hypertension"
    ],
    "processingTime": 1250
  }
}
```

## Troubleshooting

### Common Issues

**❌ "WHO ICD-11 API not configured"**
- Solution: Add `WHO_ICD11_CLIENT_ID` and `WHO_ICD11_CLIENT_SECRET` to your `.env` file

**❌ "Authentication failed"** 
- Solution: Verify your credentials are correct
- Check if your API access has been approved by WHO

**❌ "No codes generated"**
- This is normal for very generic text
- The system is conservative to prevent false matches
- Try more specific medical terminology

**❌ "Low confidence matches"**
- The system flags uncertain matches for review
- This prevents incorrect coding
- You can manually review and select appropriate codes

### Getting Help

1. **Test Script**: Run `npm run test:who-icd11` for diagnostic information
2. **Check Logs**: Look at console logs for detailed error messages  
3. **WHO Support**: Contact WHO if API access issues persist
4. **Application Logs**: Check the network tab in browser dev tools

## Migration Notes

### What Changed

- **Removed**: `lib/simple-icd11-service.ts` (LLM-based)
- **Added**: `lib/who-icd11-service.ts` (WHO API-based)
- **Updated**: API endpoint uses WHO service
- **Enhanced**: Better error handling and confidence scoring

### Backward Compatibility

- All existing interfaces remain the same
- Medical note components continue to work without changes
- PDF generation includes ICD-11 codes as before
- Same API endpoints (`/api/simple-icd11`)

### Performance

- **Initial Request**: ~1-3 seconds (includes authentication)
- **Subsequent Requests**: ~0.5-1.5 seconds (cached token)
- **Token Refresh**: Automatic, transparent to users
- **Rate Limits**: Handled gracefully with retries

## API Limits & Best Practices

### WHO API Limits
- **Authentication**: Tokens expire after 1 hour
- **Rate Limiting**: Conservative usage recommended
- **Fair Use**: Don't abuse the free tier

### Best Practices
- ✅ Cache results when possible
- ✅ Batch similar requests
- ✅ Handle network failures gracefully
- ✅ Monitor processing times
- ✅ Review low-confidence matches manually

## Security

- ✅ Credentials stored in environment variables
- ✅ No sensitive data in logs
- ✅ Automatic token refresh
- ✅ Error details sanitized in production
- ✅ HTTPS-only communication with WHO API

---

For questions about this setup, check the test script output or review the implementation in `lib/who-icd11-service.ts`.