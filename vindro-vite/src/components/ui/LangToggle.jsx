import { useTranslation } from 'react-i18next';
import { useLoading } from '../../contexts/LoadingContext';
import { setLanguageTemporary } from '../../i18n';

const LangToggle = () => {
    const { i18n } = useTranslation();
    const { showLoader, hideLoader } = useLoading();
    const current = i18n.language;

    const handleChange = async (lang) => {
        if (lang === current) return;
        showLoader();
        await setLanguageTemporary(lang);
        hideLoader();
    };

    return (
        <div className="lang-toggle">
            <button
                className={current === 'en' ? 'active' : ''}
                onClick={() => handleChange('en')}
            >
                eng
            </button>
            <span>|</span>
            <button
                className={current === 'spng' ? 'active' : ''}
                onClick={() => handleChange('spng')}
            >
                spng
            </button>
        </div>
    );
};

export default LangToggle;
