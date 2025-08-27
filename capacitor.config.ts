import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.15b9c4063af745e1a3505ca367d55c84',
  appName: 'lifeleveler-app',
  webDir: 'dist',
  server: {
    url: 'https://15b9c406-3af7-45e1-a350-5ca367d55c84.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;