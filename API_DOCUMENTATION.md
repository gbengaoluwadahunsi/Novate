# Dashboard Statistics

## GET /health/dashboard-stats
Returns real-time statistics for the dashboard.

### Response Example
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

### Response Fields
- `notesProcessed`: Total number of medical notes created (all users or filtered by user if authenticated)
- `additionalMetrics.totalTimeSavedHours`: Total hours saved (sum of all timeSavedSeconds across notes, divided by 3600)
- `additionalMetrics.averageTimeSavedPerNote`: Average minutes saved per note

### Notes
- The backend calculates time saved using audio duration and actual AI processing time for each note.
- The frontend should use `notesProcessed` for "Notes Created" and `additionalMetrics.totalTimeSavedHours` for "Time Saved" on the dashboard. 