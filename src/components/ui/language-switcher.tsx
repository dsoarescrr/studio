import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettingsStore } from '@/lib/store';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function LanguageSwitcher({ 
  variant = 'outline', 
  size = 'default',
  showText = true
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const { setLanguage } = useSettingsStore();
  
  const languages = [
    { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
    { code: 'en-US', name: 'English', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code as 'pt-PT' | 'en-US' | 'es-ES');
    localStorage.setItem('pixel-universe-locale', code);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="h-4 w-4" />
          {showText && (
            <span className="hidden sm:inline-block">
              {currentLanguage.flag} {currentLanguage.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'bg-primary/10 font-medium' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}