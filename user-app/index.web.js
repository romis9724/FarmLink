import { AppRegistry } from 'react-native';
import App from './App';

// 웹에서 실행할 때 필요한 설정
const appName = 'farmlink-user-app';

// 오류 처리 추가
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #dc3545;">
        <h2>앱 로딩 중 오류가 발생했습니다</h2>
        <p>오류: ${event.error.message}</p>
        <p>브라우저 개발자 도구의 콘솔을 확인해주세요.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
          페이지 새로고침
        </button>
      </div>
    `;
  }
});

// React 오류 처리
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  AppRegistry.registerComponent(appName, () => App);
  
  // DOM이 준비될 때까지 대기
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runApp();
    });
  } else {
    runApp();
  }
  
  function runApp() {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }
    
    try {
      AppRegistry.runApplication(appName, {
        initialProps: {},
        rootTag: rootElement,
      });
    } catch (error) {
      console.error('App initialization error:', error);
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #dc3545;">
          <h2>앱 초기화 중 오류가 발생했습니다</h2>
          <p>오류: ${error.message}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
            페이지 새로고침
          </button>
        </div>
      `;
    }
  }
} catch (error) {
  console.error('Registration error:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #dc3545;">
        <h2>앱 등록 중 오류가 발생했습니다</h2>
        <p>오류: ${error.message}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
          페이지 새로고침
        </button>
      </div>
    `;
  }
}
