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
import { shield, construct } from 'ionicons/icons';

const AdminDashboard = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={shield} />
              Admin Dashboard
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
            <IonCardTitle style={{ textAlign: 'center' }}>Admin Features Coming Soon</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium" style={{ textAlign: 'center', display: 'block' }}>
              <p>Admin dashboard with user management, remedy management, and model management will be available in a future update.</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
