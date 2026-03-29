/**
 * Subscription Module Index
 * Main entry point for subscription management
 */

import { Redirect } from 'expo-router';

export default function SubscriptionIndex() {
  // Redirect to the detail screen by default
  return <Redirect href="/subscription/detail" />;
}
