import { Tabs } from 'expo-router/js-tabs';

import { GlassTabBar } from '@/components/GlassTabBar';

/** Five tabs: Discover · Opportunities · (+) Add · Inbox · Profile, with a floating glass bar. */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(discover)" />
      <Tabs.Screen name="opportunities" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
