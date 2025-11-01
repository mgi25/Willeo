import React, { useCallback, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../app';
import { selectSource, SourceKind } from '../services/SourceSelector';
import { ensurePermissions } from '../services/Permissions';

const ConnectScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Connect'>> = ({ navigation }) => {
  const [selectedSource, setSelectedSource] = useState<SourceKind | null>(null);
  const [checking, setChecking] = useState(false);

  const handleDiscover = useCallback(async () => {
    try {
      setChecking(true);
      const granted = await ensurePermissions();
      if (!granted) {
        Alert.alert('Permissions required', 'We need health or Bluetooth permissions to proceed.');
        return;
      }
      const source = await selectSource();
      setSelectedSource(source);
      if (source === 'vendor_link') {
        Alert.alert('Link wearable', 'Open the vendor link card below to connect your account.');
      } else {
        navigation.navigate('Dashboard');
      }
    } catch (err) {
      console.error('Source discovery failed', err);
      Alert.alert('Unable to connect', 'Check your permissions or try again.');
    } finally {
      setChecking(false);
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellio Auto-Connect</Text>
      <Text style={styles.subtitle}>We will automatically choose the best source for your telemetry.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Stores</Text>
        <Text>Grant Apple Health or Health Connect permissions to sync HR, steps, and sleep.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scan nearby devices</Text>
        <Text>We will look for wearables broadcasting the Heart Rate service (0x180D).</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Link vendor</Text>
        <Text>Fallback to Fitbit, Garmin, Oura, or Withings cloud accounts.</Text>
      </View>
      <Button title={checking ? 'Checking…' : 'Find best source'} onPress={handleDiscover} disabled={checking} />
      {selectedSource && <Text style={styles.footer}>Selected source: {selectedSource}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#f4f6fb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500'
  }
});

export default ConnectScreen;
