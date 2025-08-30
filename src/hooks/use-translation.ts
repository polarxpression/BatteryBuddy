import { translations, TranslationKey } from '@/lib/translations';

export const useTranslation = () => {
  const t = (key: TranslationKey) => {
    return translations[key] || key;
  };

  return { t };
};