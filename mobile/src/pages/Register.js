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
import { 
  leaf, 
  mail, 
  lockClosed, 
  person, 
  call, 
  location, 
  resize 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    farmSize: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const { register, isLoading, clearError } = useAuth();
  const history = useHistory();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return 'Please fill in all required fields';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setAlertMessage(validationError);
      setShowAlert(true);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
      };

      await register(userData);
      history.replace('/home');
    } catch (error) {
      setAlertMessage(error.message || 'Registration failed');
      setShowAlert(true);
    }
  };

  const goToLogin = () => {
    clearError();
    history.push('/login');
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
          maxWidth: '400px',
          margin: '0 auto',
          paddingTop: '20px'
        }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle color="primary" style={{ textAlign: 'center' }}>
                Join GingerlyAI
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {/* Required Fields */}
              <IonItem>
                <IonIcon icon={person} slot="start" color="medium" />
                <IonLabel position="stacked">Full Name *</IonLabel>
                <IonInput
                  value={formData.name}
                  onIonInput={(e) => handleInputChange('name', e.detail.value)}
                  placeholder="Enter your full name"
                  clearInput
                />
              </IonItem>

              <IonItem style={{ marginTop: '16px' }}>
                <IonIcon icon={mail} slot="start" color="medium" />
                <IonLabel position="stacked">Email *</IonLabel>
                <IonInput
                  type="email"
                  value={formData.email}
                  onIonInput={(e) => handleInputChange('email', e.detail.value)}
                  placeholder="Enter your email"
                  clearInput
                />
              </IonItem>

              <IonItem style={{ marginTop: '16px' }}>
                <IonIcon icon={lockClosed} slot="start" color="medium" />
                <IonLabel position="stacked">Password *</IonLabel>
                <IonInput
                  type="password"
                  value={formData.password}
                  onIonInput={(e) => handleInputChange('password', e.detail.value)}
                  placeholder="At least 6 characters"
                  clearInput
                />
              </IonItem>

              <IonItem style={{ marginTop: '16px' }}>
                <IonIcon icon={lockClosed} slot="start" color="medium" />
                <IonLabel position="stacked">Confirm Password *</IonLabel>
                <IonInput
                  type="password"
                  value={formData.confirmPassword}
                  onIonInput={(e) => handleInputChange('confirmPassword', e.detail.value)}
                  placeholder="Confirm your password"
                  clearInput
                />
              </IonItem>

              {/* Optional Fields */}
              <div style={{ marginTop: '24px' }}>
                <IonText color="medium">
                  <h4>Optional Information</h4>
                </IonText>
                
                <IonItem>
                  <IonIcon icon={call} slot="start" color="medium" />
                  <IonLabel position="stacked">Phone Number</IonLabel>
                  <IonInput
                    type="tel"
                    value={formData.phone}
                    onIonInput={(e) => handleInputChange('phone', e.detail.value)}
                    placeholder="Your phone number"
                    clearInput
                  />
                </IonItem>

                <IonItem style={{ marginTop: '16px' }}>
                  <IonIcon icon={location} slot="start" color="medium" />
                  <IonLabel position="stacked">Location</IonLabel>
                  <IonInput
                    value={formData.location}
                    onIonInput={(e) => handleInputChange('location', e.detail.value)}
                    placeholder="Your farming location"
                    clearInput
                  />
                </IonItem>

                <IonItem style={{ marginTop: '16px' }}>
                  <IonIcon icon={resize} slot="start" color="medium" />
                  <IonLabel position="stacked">Farm Size (acres)</IonLabel>
                  <IonInput
                    type="number"
                    value={formData.farmSize}
                    onIonInput={(e) => handleInputChange('farmSize', e.detail.value)}
                    placeholder="Size of your farm"
                    clearInput
                  />
                </IonItem>
              </div>

              <IonButton
                expand="block"
                onClick={handleRegister}
                disabled={isLoading}
                style={{ marginTop: '24px' }}
              >
                Create Account
              </IonButton>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <IonText color="medium">
                  Already have an account?{' '}
                </IonText>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={goToLogin}
                >
                  Sign In
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={isLoading} message="Creating account..." />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Registration Error"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
