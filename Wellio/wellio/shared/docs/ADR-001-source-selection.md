# ADR-001: Source Selection Strategy

## Status
Accepted

## Context
Wellio must prioritize on-device health stores to ensure low-latency telemetry and reduce manual pairing. BLE and vendor clouds act as fallbacks when local data is missing.

## Decision
Implement a deterministic priority order: HealthKit on iOS, Health Connect on Android, BLE heart-rate devices when available, and finally vendor cloud connectors. The SourceSelector service encapsulates this order and ensures permissions are granted before probing.

## Consequences
* Users with native health permissions receive background updates automatically.
* BLE scanning occurs only when stores are empty, reducing power consumption.
* Vendor connectors remain available for closed ecosystems but require OAuth flows.
