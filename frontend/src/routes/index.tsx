import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const { t } = useTranslation();

  return (
    <Suspense fallback='loading'>
      <div className='p-8'>
        <h1 className='text-4xl font-bold'>{t('welcome')}</h1>
        <p className='mt-4 text-lg'>{t('Please sign up')}
          <Link to='/signup' className='text-green-500 underline ml-1'>{t('here')}</Link>.
        </p>
      </div>
    </Suspense>
  );
}
