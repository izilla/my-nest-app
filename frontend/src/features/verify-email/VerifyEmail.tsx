import { useTranslation } from 'react-i18next';

export const VerifyEmail = () => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center justify-center h-full w-full gap-4'>
      <h1 className='text-2xl font-bold'>{t('verify-email.title')}</h1>
      <p className='tex-center text-lg'>{t('verify-email.message')}</p>
    </div>
  );
};
