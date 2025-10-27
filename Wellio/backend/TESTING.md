# Wellio Smartwatch Backend – Manual Test Guide

This guide helps you verify the `POST /upload_data` and `GET /fetch_data` endpoints when the Flask backend is running locally at `http://127.0.0.1:5000/`.

## Windows PowerShell Tests
```powershell
# === PowerShell (Windows) ===
# Run inside VS Code's integrated terminal (PowerShell) or Windows Terminal.

# 1) Upload smartwatch data
Invoke-WebRequest -Uri "http://127.0.0.1:5000/upload_data" -Method POST `
  -Body '{"user_id":"U001","heart_rate":75,"steps":3200,"stress_level":2,"sleep_hours":7.2}' `
  -ContentType "application/json"

# Expected response body:
# {
#   "message": "Data received successfully ✅"
# }

# 2) Fetch all saved smartwatch records
Invoke-WebRequest -Uri "http://127.0.0.1:5000/fetch_data" -Method GET

# Sample JSON output (trimmed example):
# [
#   {
#     "user_id": "U001",
#     "heart_rate": 75,
#     "steps": 3200,
#     "stress_level": 2,
#     "sleep_hours": 7.2,
#     "timestamp": "2024-05-24T10:42:11.123456"
#   }
# ]
```

### PowerShell Tips
- If PowerShell returns an error about double quotes, ensure the JSON uses escaped quotes (`\"`).
- Add `| Select-Object -ExpandProperty Content` to show only the response JSON without metadata.

## Linux / macOS Tests (curl)
```bash
# === Linux / macOS (curl) ===
# Run inside your terminal or macOS Terminal/iTerm2.

# 1) Upload smartwatch data
curl -X POST http://127.0.0.1:5000/upload_data \
  -H "Content-Type: application/json" \
  -d '{"user_id":"U001","heart_rate":75,"steps":3200,"stress_level":2,"sleep_hours":7.2}'

# Expected output
# {"message":"Data received successfully ✅"}

# 2) Fetch all saved smartwatch records
curl http://127.0.0.1:5000/fetch_data

# Sample JSON output (trimmed example)
# [
#   {
#     "user_id": "U001",
#     "heart_rate": 75,
#     "steps": 3200,
#     "stress_level": 2,
#     "sleep_hours": 7.2,
#     "timestamp": "2024-05-24T10:42:11.123456"
#   }
# ]
```

### curl Tips
- Use `curl -v` for verbose output if you need to debug headers or connection issues.
- If the output is hard to read, pipe to `jq` (e.g., `curl ... | jq`).

## Developer Notes
- **Restarting the Flask server:**
  - If you are using the built-in development server, stop it with `Ctrl+C` and restart with `flask run` or `python app.py` from the `backend/` directory.
- **MongoDB connection issues:**
  - Ensure the MongoDB service is running. On Linux/macOS use `sudo service mongod start`; on Windows start the `MongoDB` service from Services or `net start MongoDB` in an elevated PowerShell.
  - Verify connection strings in your environment variables or configuration files.
- **Common tooling differences:**
  - PowerShell requires escaping double quotes inside JSON payloads; backticks (`\``) are used for line continuation.
  - `curl` on Linux/macOS uses backslashes (`\`) for line continuation and does not require escaping inner double quotes in single-quoted JSON.

## Analytics JSON Preview

Once multiple smartwatch entries are stored, `GET /fetch_data` responds with both raw records and computed insights:

```json
{
  "records": [
    {
      "user_id": "U001",
      "heart_rate": 75,
      "steps": 3200,
      "stress_level": 2,
      "sleep_hours": 7.2,
      "timestamp": "2024-05-24T10:42:11.123456"
    },
    {
      "user_id": "U001",
      "heart_rate": 88,
      "steps": 4800,
      "stress_level": 3,
      "sleep_hours": 6.0,
      "timestamp": "2024-05-24T21:19:44.654321"
    },
    {
      "user_id": "U001",
      "heart_rate": 92,
      "steps": 5100,
      "stress_level": 4,
      "sleep_hours": 5.5,
      "timestamp": "2024-05-25T07:10:04.789654"
    }
  ],
  "analytics": {
    "avg_heart_rate": 85.0,
    "avg_sleep": 6.2,
    "stress_status": "High Stress ⚠️ More than half of entries show elevated stress.",
    "wellness_score": 56
  },
  "ai_suggestion": "You seem slightly stressed. Try a 5-minute deep breathing exercise."
}
```

Use this sample to validate that analytics and placeholder AI suggestions are serialized correctly.
