import { Redirect } from 'expo-router';
import { useAppSelector } from '@/store/hooks';

export default function Index() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Redirect href={'/(app)/(tabs)' as any} />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
