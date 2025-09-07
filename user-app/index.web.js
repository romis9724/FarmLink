import { AppRegistry } from 'react-native';
import App from './App';

// 웹에서 실행할 때 필요한 설정
const appName = 'farmlink-user-app';
AppRegistry.registerComponent(appName, () => App);

// 웹에서 실행
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
