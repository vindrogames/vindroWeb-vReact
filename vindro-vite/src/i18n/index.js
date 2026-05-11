import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enContact from './locales/en/contact.json';
import enGames from './locales/en/games.json';
import enStory from './locales/en/story.json';
import enMadridCalc from './locales/en/madrid-calculator.json';
import enGame42 from './locales/en/game-42.json';
import enBrackets from './locales/en/brackets.json';
import enEscapeCloud from './locales/en/escape-cloud.json';
import enNotFound from './locales/en/not-found.json';
import enLogout from './locales/en/logout.json';
import enUserProfile from './locales/en/user-profile.json';
import enAutominer from './locales/en/autominer.json';

import spngCommon from './locales/spng/common.json';
import spngHome from './locales/spng/home.json';
import spngContact from './locales/spng/contact.json';
import spngGames from './locales/spng/games.json';
import spngStory from './locales/spng/story.json';
import spngMadridCalc from './locales/spng/madrid-calculator.json';
import spngGame42 from './locales/spng/game-42.json';
import spngBrackets from './locales/spng/brackets.json';
import spngEscapeCloud from './locales/spng/escape-cloud.json';
import spngNotFound from './locales/spng/not-found.json';
import spngLogout from './locales/spng/logout.json';
import spngUserProfile from './locales/spng/user-profile.json';
import spngAutominer from './locales/spng/autominer.json';

const savedTemp = sessionStorage.getItem('vindro_lang_temp');
const savedPerm = localStorage.getItem('vindro_lang');
const browser = navigator.language?.startsWith('es') ? 'spng' : 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
                home: enHome,
                contact: enContact,
                games: enGames,
                story: enStory,
                'madrid-calculator': enMadridCalc,
                'game-42': enGame42,
                brackets: enBrackets,
                'escape-cloud': enEscapeCloud,
                'not-found': enNotFound,
                logout: enLogout,
                'user-profile': enUserProfile,
                autominer: enAutominer,
            },
            spng: {
                common: spngCommon,
                home: spngHome,
                contact: spngContact,
                games: spngGames,
                story: spngStory,
                'madrid-calculator': spngMadridCalc,
                'game-42': spngGame42,
                brackets: spngBrackets,
                'escape-cloud': spngEscapeCloud,
                'not-found': spngNotFound,
                logout: spngLogout,
                'user-profile': spngUserProfile,
                autominer: spngAutominer,
            },
        },
        lng: savedTemp || savedPerm || browser,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

if (import.meta.env.DEV) window.i18n = i18n;

export const setLanguageTemporary = (lang) => {
    sessionStorage.setItem('vindro_lang_temp', lang);
    return i18n.changeLanguage(lang);
};

export const setLanguagePermanent = (lang) => {
    localStorage.setItem('vindro_lang', lang);
    sessionStorage.removeItem('vindro_lang_temp');
    return i18n.changeLanguage(lang);
};

export default i18n;
