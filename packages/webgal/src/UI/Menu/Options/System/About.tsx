import useTrans from '@/hooks/useTrans';
// import { Left } from '@icon-park/react';
import s from './about.module.scss';
import { __INFO } from '@/config/info';

export default function About(props: { onClose: () => void }) {
  const t = useTrans('menu.options.pages.system.options.about.');
  return (
    <div className={s.about}>
      <div className={s.backButton} onClick={props.onClose}>
        <i className="bi bi-arrow-left" />
        {/* <Left className={s.icon} theme="outline" size="35" strokeWidth={3} fill="#ffffff80" /> */}
      </div>
      <div className={s.title}>{t('subTitle')}</div>
      <div className={s.title}>{t('version')}</div>
      <div className={s.text}>{__INFO.version}</div>
      <div className={s.text}>{__INFO.mod}</div>
      <div className={s.title}>{t('sourceK')}</div>
      <div className={s.text}>
        <a target="_blank" href="https://github.com/maincoretech/WebGAL_k">
          The WebGAL_k repository
        </a>
      </div>
      <div className={s.title}>{t('source')}</div>
      <div className={s.text}>
        <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL">
          The WebGAL repository
        </a>
      </div>
      {/* <div className={s.title}>{t('contributors')}</div>
      <div className={s.text}>
        <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL/graphs/contributors">
          https://github.com/OpenWebGAL/WebGAL/graphs/contributors
        </a>
      </div> */}
      <div className={s.title}>{t('website')}</div>
      <div className={s.text}>
        <a target="_blank" href="https://openwebgal.com/">
          openwebgal site
        </a>
      </div>
    </div>
  );
}
