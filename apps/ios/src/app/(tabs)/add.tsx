import { Redirect } from 'expo-router';

/** Placeholder route for the center "+" tab. The tab bar opens /listing/new as a modal instead. */
export default function AddTab() {
  return <Redirect href="/" />;
}
