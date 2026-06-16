import useTrans from '@/hooks/useTrans';
import s from './about.module.scss';
import { __INFO } from '@/config/info';
import { openUrl } from '@tauri-apps/plugin-opener';

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className={s.text} style={{ cursor: 'pointer' }} onClick={() => openUrl(href)}>
      {children}
    </div>
  );
}

export default function About(props: { onClose: () => void }) {
  const t = useTrans('menu.options.pages.system.options.about.');
  return (
    <div className={s.about}>
      <div className={s.backButton} onClick={props.onClose}>
        <i className="bi bi-caret-left-fill" />
      </div>
      <div className={s.title}>{t('title')}</div>
      <div className={s.title}>{t('subTitle')}</div>
      <div className={s.title}>{t('version')}</div>
      <div className={s.text}>{__INFO.version}</div>
      <div className={s.text}>{__INFO.mod}</div>
      <div className={s.title}>{t('credit')}</div>
      <Link href="https://github.com/maincoretech/WebGAL_k">WebGAL_k</Link>
      <Link href="https://github.com/OpenWebGAL/WebGAL">WebGAL</Link>
      <Link href="https://openwebgal.com/">openwebgal.com</Link>
      <div style={{ marginTop: 10 }}>
        <Link href={t('fontLicense')}>{t('font')}</Link>
      </div>
    </div>
  );
}
