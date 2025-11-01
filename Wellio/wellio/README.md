# Wellio Auto-Connect Wearables

This monorepo contains the mobile and backend code for Wellio's auto-connect wearable telemetry system.

## Structure

```
wellio/
  mobile/        # React Native (Expo bare) application
  backend/       # FastAPI service with Postgres + Redis
  shared/        # Shared schemas and docs
```

## Mobile Setup

1. Install dependencies: `cd mobile && yarn install`.
2. Generate native iOS/Android projects with Expo bare workflow if needed.
3. Configure environment variable `EXPO_PUBLIC_API_URL` to point at the backend.
4. Run the app on a simulator or device: `yarn ios` or `yarn android`.

HealthKit and Health Connect native modules are included under `src/sources` with bridging stubs enabling background delivery and aggregate polling. BLE heart rate streaming uses `react-native-ble-plx` and requires the Nearby Devices permission on Android 12+.

## Backend Setup

1. Copy `.env.example` to `.env` and set secret values.
2. `cd backend`
3. Start the stack with Docker Compose: `docker compose up --build`.
4. The API is available at `http://localhost:8000`.

Key endpoints:

* `POST /v1/telemetry` – ingest canonical telemetry with idempotency enforced via Redis.
* `GET /v1/summary` – daily aggregates for the dashboard.
* `/oauth/{vendor}` – OAuth flows for Fitbit, Garmin, Oura, and Withings.
* `/webhooks/{vendor}` – vendor webhook receivers.

## Testing

Backend unit tests:

```
cd backend
pytest
```

## Licensing

All code © Wellio. Use under company agreements only.
