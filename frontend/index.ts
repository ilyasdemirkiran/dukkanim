import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

// react-native-css-interop kütüphanesinin arka planda ImageBackground import etmesinden
// kaynaklanan kütüphane içi deprecation uyarısını filtreliyoruz
LogBox.ignoreLogs([
  'ImageBackground is deprecated',
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

