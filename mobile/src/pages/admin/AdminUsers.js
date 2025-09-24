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
import { people, construct } from 'ionicons/icons';

const AdminUsers = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={people} />
              User Management
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
            <IonCardTitle style={{ textAlign: 'center' }}>User Management Coming Soon</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium" style={{ textAlign: 'center', display: 'block' }}>
              <p>User management features will be available in a future update.</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;
