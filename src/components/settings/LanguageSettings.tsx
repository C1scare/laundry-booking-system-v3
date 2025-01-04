import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSettingsProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => Promise<void>;
  className?: string;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Finnish' },
];

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  currentLanguage,
  onLanguageChange,
  className = ''
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLanguage === currentLanguage) return;

    setError('');
    setSuccessMessage('');
    setIsChanging(true);

    try {
      await onLanguageChange(selectedLanguage);
      setSuccessMessage('Language updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update language');
      setSelectedLanguage(currentLanguage); // Reset to current language on error
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <Globe className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-medium">Language Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {AVAILABLE_LANGUAGES.map((language) => (
            <label
              key={language.code}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer
                ${selectedLanguage === language.code 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-200'
                }
              `}
            >
              <input
                type="radio"
                name="language"
                value={language.code}
                checked={selectedLanguage === language.code}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="hidden"
                disabled={isChanging}
              />
              <div className="ml-2">
                <div className="font-medium">{language.name}</div>
                <div className="text-sm text-gray-500">{language.nativeName}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={isChanging || selectedLanguage === currentLanguage}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg 
                   hover:bg-blue-600 transition-colors
                   disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isChanging ? 'Updating...' : 'Update Language'}
        </button>
      </form>

      <div className="text-sm text-gray-500">
        <p>Note: Changing the language will reload the application.</p>
      </div>
    </div>
  );
};

export default LanguageSettings;