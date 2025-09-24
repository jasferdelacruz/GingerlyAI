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
import { medical, construct } from 'ionicons/icons';

const AdminRemedies = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={medical} />
              Remedy Management
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
            <IonCardTitle style={{ textAlign: 'center' }}>Remedy Management Coming Soon</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium" style={{ textAlign: 'center', display: 'block' }}>
              <p>Remedy management features will be available in a future update.</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminRemedies;
