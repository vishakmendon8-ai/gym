import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { NotificationService } from './services/notificationService'

// Initialize Service Worker for lock-screen & background push notifications
if (typeof window !== 'undefined') {
  NotificationService.registerServiceWorker();
}

// Native App Behavior: Prevent accidental zooming and gestures
if (typeof window !== 'undefined') {
  // 1. Prevent multi-touch pinch-to-zoom (WebKit gesture events)
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // 2. Prevent double-tap to zoom on mobile devices
  let lastTouchEndTime = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      // Allow rapid taps inside inputs/textareas, but prevent viewport zoom everywhere else
      const isInput = (e.target as HTMLElement)?.closest('input, textarea, select');
      if (!isInput && now - lastTouchEndTime <= 300) {
        e.preventDefault();
      }
      lastTouchEndTime = now;
    },
    { passive: false }
  );

  // 3. Prevent Ctrl + wheel/trackpad zoom
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
