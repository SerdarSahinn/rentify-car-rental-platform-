import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Açık';
      case 'dark':
        return 'Koyu';
      case 'system':
        return 'Sistem';
      default:
        return 'Açık';
    }
  };

  const getNextTheme = () => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      case 'system':
        return 'light';
      default:
        return 'light';
    }
  };

  const handleToggle = () => {
    setTheme(getNextTheme());
  };

  return (
    <div className="relative">
      {/* Ana Toggle Butonu */}
      <button
        onClick={handleToggle}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300
          ${isDark 
            ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
          }
          hover:scale-105 active:scale-95
        `}
        title={`Tema: ${getThemeText()}`}
      >
        {getThemeIcon()}
        <span className="text-sm hidden sm:inline">{getThemeText()}</span>
      </button>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Tema Değiştir
      </div>
    </div>
  );
};

export default ThemeToggle;
