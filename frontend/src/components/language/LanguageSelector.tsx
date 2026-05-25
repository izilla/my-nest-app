import { LanguagesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const languages: Record<string, { nativeName: string }> = {
  en: { nativeName: 'English' },
  es: { nativeName: 'Español' },
};

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageOnClick = (language: string) => () => {
    i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='p-2'>
          <Button variant='outline' size='icon'>
            <LanguagesIcon className='h-[1.2rem] w-[1.2rem] scale-100 transition-all' />
            <span className='sr-only'>Toggle language</span>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {Object.entries(languages).map(([code, { nativeName }]) => (
          <DropdownMenuItem key={code} onClick={handleLanguageOnClick(code)}>
            {nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
