import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.scss';
import './assets/style/animation.scss';
import 'modern-css-reset/dist/reset.min.css';

/** i18n */
import i18n from 'i18next';
import { initReactI18next, Trans } from 'react-i18next';
import { defaultLanguage, i18nTranslationResources, language } from './config/language';
import { Provider } from 'react-redux';
import { webgalStore } from './store/store';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: i18nTranslationResources || {},
    lng: language[defaultLanguage] || 'zhCn', // if you're using a language detector, do not define the lng option
    fallbackLng: 'zhCn',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .then(() => console.log('WebGAL i18n Ready!'));

const root = createRoot(document.querySelector('#root')!);
root.render(
  <StrictMode>
    <Trans>
      <Provider store={webgalStore}>
        <App />
      </Provider>
    </Trans>
  </StrictMode>,
);

// Service Worker: relays game/* requests to Tauri hexz IPC
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/webgal-serviceworker.js', { scope: '/' });
  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    if (e.data?.type !== 'HEXZ_READ_FILE') return;
    const port = e.ports[0];
    (window as any).__TAURI_INTERNALS__
      .invoke('read_hexz_file', { path: e.data.path })
      .then((bytes: number[]) => port.postMessage({ ok: true, bytes }))
      .catch((err: unknown) => port.postMessage({ ok: false, error: String(err) }));
  });
}