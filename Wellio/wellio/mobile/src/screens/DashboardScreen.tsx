import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLiveTelemetry } from '../services/useLiveTelemetry';

const DashboardScreen: React.FC = () => {
  const { heartRate, steps, sleep } = useLiveTelemetry();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Telemetry</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Heart Rate</Text>
        <Text style={styles.metric}>{heartRate ? `${heartRate.bpm} bpm` : 'Waiting…'}</Text>
        {heartRate?.device && (
          <Text style={styles.meta}>
            {heartRate.device.vendor ?? 'Unknown'} {heartRate.device.model ?? ''}
          </Text>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Steps</Text>
        <Text style={styles.metric}>{steps ? steps.steps : 'Waiting…'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last Sleep</Text>
        <Text style={styles.metric}>
          {sleep ? `${sleep.stage} • ${(sleep.dur_s / 3600).toFixed(1)} h` : 'Waiting…'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f8fb'
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8
  },
  metric: {
    fontSize: 28,
    fontWeight: '700'
  },
  meta: {
    marginTop: 6,
    color: '#666'
  }
});

export default DashboardScreen;
