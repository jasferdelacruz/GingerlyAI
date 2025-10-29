import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IonButton,
  IonIcon,
  IonActionSheet,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { languageOutline, checkmark } from 'ionicons/icons';
import { LANGUAGES, changeLanguage } from '../i18n/config';
import './LanguageSwitcher.css';

/**
 * Language Switcher Component
 * Allows users to switch between English and Tagalog
 */
const LanguageSwitcher = ({ variant = 'button' }) => {
  const { i18n } = useTranslation();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (lang) => {
    if (lang && lang !== currentLanguage) {
      await changeLanguage(lang);
      // Optionally reload the app or trigger a re-render
      window.location.reload();
    }
  };

  // Button variant - shows current language with flag
  if (variant === 'button') {
    return (
      <>
        <IonButton
          onClick={() => setShowActionSheet(true)}
          fill="outline"
          size="small"
          className="language-switcher-button"
        >
          <IonIcon icon={languageOutline} slot="start" />
          {LANGUAGES[currentLanguage]?.flag} {LANGUAGES[currentLanguage]?.nativeName}
        </IonButton>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Select Language / Pumili ng Wika"
          buttons={[
            {
              text: `🇺🇸 English`,
              role: currentLanguage === 'en' ? 'selected' : undefined,
              icon: currentLanguage === 'en' ? checkmark : undefined,
              handler: () => handleLanguageChange('en')
            },
            {
              text: `🇵🇭 Tagalog`,
              role: currentLanguage === 'tl' ? 'selected' : undefined,
              icon: currentLanguage === 'tl' ? checkmark : undefined,
              handler: () => handleLanguageChange('tl')
            },
            {
              text: 'Cancel / Kanselahin',
              role: 'cancel'
            }
          ]}
        />
      </>
    );
  }

  // Select variant - for use in settings
  if (variant === 'select') {
    return (
      <IonSelect
        value={currentLanguage}
        onIonChange={(e) => handleLanguageChange(e.detail.value)}
        interface="action-sheet"
        className="language-switcher-select"
      >
        <IonSelectOption value="en">
          🇺🇸 English
        </IonSelectOption>
        <IonSelectOption value="tl">
          🇵🇭 Tagalog
        </IonSelectOption>
      </IonSelect>
    );
  }

  // Item variant - for use in lists
  if (variant === 'item') {
    return (
      <IonItem button onClick={() => setShowActionSheet(true)}>
        <IonIcon icon={languageOutline} slot="start" />
        <IonLabel>
          <h2>Language / Wika</h2>
          <p>{LANGUAGES[currentLanguage]?.flag} {LANGUAGES[currentLanguage]?.nativeName}</p>
        </IonLabel>
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Select Language / Pumili ng Wika"
          buttons={[
            {
              text: `🇺🇸 English`,
              role: currentLanguage === 'en' ? 'selected' : undefined,
              icon: currentLanguage === 'en' ? checkmark : undefined,
              handler: () => handleLanguageChange('en')
            },
            {
              text: `🇵🇭 Tagalog`,
              role: currentLanguage === 'tl' ? 'selected' : undefined,
              icon: currentLanguage === 'tl' ? checkmark : undefined,
              handler: () => handleLanguageChange('tl')
            },
            {
              text: 'Cancel / Kanselahin',
              role: 'cancel'
            }
          ]}
        />
      </IonItem>
    );
  }

  return null;
};

export default LanguageSwitcher;

