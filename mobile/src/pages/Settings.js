import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonText,
} from '@ionic/react';
import { settings, construct } from 'ionicons/icons';

const Settings = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={settings} />
              Settings
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonIcon 
              icon={construct} 
              size="large" 
              color="primary" 
              style={{ fontSize: '64px', textAlign: 'center', display: 'block' }}
            />
            <IonCardTitle style={{ textAlign: 'center' }}>Settings Coming Soon</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium" style={{ textAlign: 'center', display: 'block' }}>
              <p>App settings and preferences will be available in a future update.</p>
              <p>For now, you can manage your profile from the Profile page.</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
