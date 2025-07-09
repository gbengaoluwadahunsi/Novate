# Dashboard Data Fetching

- The frontend should call `GET /health/dashboard-stats` to display dashboard statistics.
- For "Notes Created": use `data.notesProcessed` from the response.
- For "Time Saved": use `data.additionalMetrics.totalTimeSavedHours` (display as hours/minutes).
- The backend calculates time saved using audio duration and actual AI processing time for each note.
- If the backend response format changes, update the frontend to match the new structure. 