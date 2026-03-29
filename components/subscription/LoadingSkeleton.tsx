/**
 * Loading Skeleton Component
 * Animated loading placeholder for subscription content
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View as RNView } from 'react-native';
import { View } from '../Themed';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = 8,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const SubscriptionDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.card}>
        <Skeleton width="40%" height={24} style={{ marginBottom: 12 }} />
        <Skeleton width="60%" height={32} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={16} />
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <Skeleton width="30%" height={20} style={{ marginBottom: 12 }} />
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={16} />
      </View>

      {/* Features Card */}
      <View style={styles.card}>
        <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.featureRow}>
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width="70%" height={16} style={{ marginLeft: 12 }} />
          </View>
        ))}
      </View>

      {/* Buttons */}
      <Skeleton width="100%" height={50} borderRadius={12} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={50} borderRadius={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});
