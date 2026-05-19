import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ilyasdemirkiran.ozyurt',
  appName: 'Özyurt',
  webDir: "dist",
  android: {
    path: "android",
  },
  plugins: {
    // FirebaseAuthentication: {
    //   authDomain: "fiperde-58c6d.firebaseapp.com",
    //   skipNativeAuth: false,
    //   providers: ["phone"],
    // },
    // "CapacitorUpdater": {
    //   "autoUpdate": false,
    // }
  },
};

export default config;

