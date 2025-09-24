import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonAlert,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { leaf, mail, lockClosed } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const { login, isLoading, error, clearError } = useAuth();
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertMessage('Please enter both email and password');
      setShowAlert(true);
      return;
    }

    try {
      await login(email, password);
      history.replace('/home');
    } catch (error) {
      setAlertMessage(error.message || 'Login failed');
      setShowAlert(true);
    }
  };

  const goToRegister = () => {
    clearError();
    history.push('/register');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={leaf} />
              GingerlyAI
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          height: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle color="primary" style={{ textAlign: 'center' }}>
                Welcome Back
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <IonItem>
                <IonIcon icon={mail} slot="start" color="medium" />
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value)}
                  placeholder="Enter your email"
                  clearInput
                />
              </IonItem>

              <IonItem style={{ marginTop: '16px' }}>
                <IonIcon icon={lockClosed} slot="start" color="medium" />
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value)}
                  placeholder="Enter your password"
                  clearInput
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={handleLogin}
                disabled={isLoading}
                style={{ marginTop: '24px' }}
              >
                Sign In
              </IonButton>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <IonText color="medium">
                  Don't have an account?{' '}
                </IonText>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={goToRegister}
                >
                  Sign Up
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <IonText color="medium" style={{ fontSize: '0.875rem' }}>
              AI-powered ginger disease detection
              <br />
              for farmers and agriculture professionals
            </IonText>
          </div>
        </div>

        <IonLoading isOpen={isLoading} message="Signing in..." />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Login Error"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
