import React, { useState, useEffect } from 'react';
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
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonLoading,
  IonAlert,
  IonList,
  IonAvatar,
  IonBadge,
  IonMenuButton,
  IonToast,
} from '@ionic/react';
import {
  person,
  mail,
  call,
  location,
  resize,
  save,
  logOut,
  settings,
  analytics,
  shield,
  leaf,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    farmSize: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuratePredictions: 0,
    lastScanDate: null,
  });
  
  const { user, logout, updateUser, isLoading } = useAuth();
  const { clearData } = useApp();
  const history = useHistory();

  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        farmSize: user.farmSize?.toString() || '',
      });
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      if (!user) return;

      const predictions = await databaseService.getPredictions(user.id);
      const accuratePredictions = predictions.filter(p => p.confidence >= 0.7);
      const lastScan = predictions.length > 0 ? 
        new Date(Math.max(...predictions.map(p => new Date(p.createdAt)))) : null;

      setStats({
        totalPredictions: predictions.length,
        accuratePredictions: accuratePredictions.length,
        lastScanDate: lastScan,
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const validateProfile = () => {
    if (!userProfile.name.trim()) {
      return 'Name is required';
    }
    if (!userProfile.email.trim()) {
      return 'Email is required';
    }
    if (userProfile.farmSize && (isNaN(userProfile.farmSize) || parseFloat(userProfile.farmSize) < 0)) {
      return 'Farm size must be a valid positive number';
    }
    return null;
  };

  const saveProfile = async () => {
    const validationError = validateProfile();
    if (validationError) {
      setToastMessage(validationError);
      setShowToast(true);
      return;
    }

    try {
      const updatedData = {
        name: userProfile.name,
        phone: userProfile.phone || null,
        location: userProfile.location || null,
        farmSize: userProfile.farmSize ? parseFloat(userProfile.farmSize) : null,
      };

      await updateUser(updatedData);
      setIsEditing(false);
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setToastMessage('Failed to update profile. Please try again.');
      setShowToast(true);
    }
  };

  const cancelEdit = () => {
    // Reset to original values
    if (user) {
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        farmSize: user.farmSize?.toString() || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      await clearData();
      history.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setToastMessage('Logout failed. Please try again.');
      setShowToast(true);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastScan = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days <= 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Profile</IonTitle>
          {user?.role === 'admin' && (
            <IonBadge slot="end" color="warning">Admin</IonBadge>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Profile Header */}
        <IonCard>
          <IonCardContent style={{ textAlign: 'center' }}>
            <IonAvatar style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 16px',
              backgroundColor: 'var(--ion-color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IonText style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                {getInitials(userProfile.name || 'User')}
              </IonText>
            </IonAvatar>
            
            <h1>{userProfile.name}</h1>
            <IonText color="medium">
              <p>{userProfile.email}</p>
            </IonText>
            
            {user?.role === 'admin' && (
              <IonBadge color="warning">
                <IonIcon icon={shield} style={{ marginRight: '4px' }} />
                Administrator
              </IonBadge>
            )}
          </IonCardContent>
        </IonCard>

        {/* Stats Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={analytics} style={{ marginRight: '8px' }} />
              Your Statistics
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
              <div>
                <h2 style={{ color: 'var(--ion-color-primary)' }}>{stats.totalPredictions}</h2>
                <IonText color="medium">Total Scans</IonText>
              </div>
              <div>
                <h2 style={{ color: 'var(--ion-color-success)' }}>{stats.accuratePredictions}</h2>
                <IonText color="medium">High Confidence</IonText>
              </div>
            </div>
            
            <IonItem style={{ marginTop: '16px' }}>
              <IonIcon icon={leaf} slot="start" color="success" />
              <IonLabel>
                <h3>Last Scan</h3>
                <p>{formatLastScan(stats.lastScanDate)}</p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Profile Information */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Profile Information
              <IonButton 
                fill="clear" 
                size="small"
                onClick={() => isEditing ? cancelEdit() : setIsEditing(true)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </IonButton>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={person} slot="start" color="primary" />
                <IonLabel position="stacked">Full Name</IonLabel>
                <IonInput
                  value={userProfile.name}
                  onIonInput={(e) => handleInputChange('name', e.detail.value)}
                  readonly={!isEditing}
                  placeholder="Enter your full name"
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={mail} slot="start" color="primary" />
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  value={userProfile.email}
                  readonly={true}
                  placeholder="Email cannot be changed"
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={call} slot="start" color="primary" />
                <IonLabel position="stacked">Phone Number</IonLabel>
                <IonInput
                  value={userProfile.phone}
                  onIonInput={(e) => handleInputChange('phone', e.detail.value)}
                  readonly={!isEditing}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={location} slot="start" color="primary" />
                <IonLabel position="stacked">Location</IonLabel>
                <IonInput
                  value={userProfile.location}
                  onIonInput={(e) => handleInputChange('location', e.detail.value)}
                  readonly={!isEditing}
                  placeholder="Enter your farming location"
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={resize} slot="start" color="primary" />
                <IonLabel position="stacked">Farm Size (acres)</IonLabel>
                <IonInput
                  value={userProfile.farmSize}
                  onIonInput={(e) => handleInputChange('farmSize', e.detail.value)}
                  readonly={!isEditing}
                  placeholder="Enter your farm size"
                  type="number"
                />
              </IonItem>
            </IonList>

            {isEditing && (
              <IonButton 
                expand="block" 
                onClick={saveProfile}
                disabled={isLoading}
                style={{ marginTop: '16px' }}
              >
                <IonIcon icon={save} slot="start" />
                Save Changes
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>

        {/* Quick Actions */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Settings & Actions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton 
              expand="block" 
              fill="outline" 
              onClick={() => history.push('/settings')}
              style={{ marginBottom: '8px' }}
            >
              <IonIcon icon={settings} slot="start" />
              App Settings
            </IonButton>

            {user?.role === 'admin' && (
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={() => history.push('/admin')}
                style={{ marginBottom: '8px' }}
              >
                <IonIcon icon={shield} slot="start" />
                Admin Dashboard
              </IonButton>
            )}

            <IonButton 
              expand="block" 
              color="danger" 
              fill="outline"
              onClick={() => setShowLogoutAlert(true)}
            >
              <IonIcon icon={logOut} slot="start" />
              Sign Out
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={isLoading} message="Updating profile..." />

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Sign Out"
          message="Are you sure you want to sign out? Any unsynced data will remain on this device."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Sign Out',
              role: 'destructive',
              handler: handleLogout,
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
