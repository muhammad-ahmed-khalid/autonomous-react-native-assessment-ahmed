/**
 * Subscription Layout
 * Stack navigation for subscription screens
 */

import { Stack } from 'expo-router';

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="plans" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="billing-history" />
    </Stack>
  );
}
