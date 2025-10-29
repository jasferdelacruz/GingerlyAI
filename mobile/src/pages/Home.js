import React, { useEffect, useState } from 'react';
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
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonBadge,
  IonMenuButton,
} from '@ionic/react';
import {
  camera,
  leaf,
  analytics,
  sync,
  person,
  settings,
  wifi,
  cloudOffline,
  time,
  checkmarkCircle,
  alertCircle,
  shield,
  construct,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';
import { mlService } from '../services/mlService';

const Home = () => {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    pendingSync: 0,
    recentPredictions: [],
  });
  const [modelInfo, setModelInfo] = useState(null);
  
  const { user } = useAuth();
  const { isOnline, syncData, lastSyncTime, syncStatus, addNotification } = useApp();
  const history = useHistory();

  useEffect(() => {
    loadHomeData();
    initializeServices();
  }, [user]);

  const loadHomeData = async () => {
    try {
      if (!user) return;

      // Load user's prediction statistics
      const predictions = await databaseService.getPredictions(user.id, 5);
      const unsyncedPredictions = await databaseService.getUnsyncedPredictions(user.id);

      setStats({
        totalPredictions: predictions.length,
        pendingSync: unsyncedPredictions.length,
        recentPredictions: predictions.slice(0, 3),
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const initializeServices = async () => {
    try {
      // Initialize database
      await databaseService.initialize();
      
      // Initialize ML service
      await mlService.initialize();
      const info = await mlService.getModelInfo();
      setModelInfo(info);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      addNotification({
        type: 'error',
        title: 'Initialization Error',
        message: 'Some services failed to initialize. Please restart the app.',
      });
    }
  };

  const handleRefresh = async (event) => {
    try {
      if (isOnline) {
        await syncData();
      }
      await loadHomeData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      event.detail.complete();
    }
  };

  const navigateToCamera = () => {
    history.push('/camera');
  };

  const navigateToHistory = () => {
    history.push('/history');
  };

  const navigateToProfile = () => {
    history.push('/profile');
  };

  const formatLastSync = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={leaf} />
              GingerlyAI
            </div>
          </IonTitle>
          <IonChip slot="end" color={isOnline ? 'success' : 'warning'}>
            <IonIcon icon={isOnline ? wifi : cloudOffline} />
            <IonLabel>{isOnline ? 'Online' : 'Offline'}</IonLabel>
          </IonChip>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          {/* Welcome Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Welcome back, {user?.name}!</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="medium">
                {user?.role === 'admin' 
                  ? 'Welcome, Administrator! You have access to admin functions and all user features.'
                  : 'Ready to detect ginger diseases? Tap the camera button to analyze your plants.'}
              </IonText>
            </IonCardContent>
          </IonCard>

          {/* Admin Dashboard Access - Only for Admins */}
          {user?.role === 'admin' && (
            <IonCard color="primary">
              <IonCardHeader>
                <IonCardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={shield} />
                    Administrator Access
                  </div>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText>
                  <p style={{ marginBottom: '16px' }}>
                    Access admin functions to manage users, remedies, and ML models.
                  </p>
                </IonText>
                <IonButton 
                  expand="block" 
                  color="light"
                  onClick={() => history.push('/admin')}
                >
                  <IonIcon icon={shield} slot="start" />
                  Open Admin Dashboard
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}

          {/* Quick Stats */}
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonCard>
                  <IonCardContent>
                    <div style={{ textAlign: 'center' }}>
                      <IonIcon icon={analytics} size="large" color="primary" />
                      <h2>{stats.totalPredictions}</h2>
                      <IonText color="medium">Total Scans</IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard>
                  <IonCardContent>
                    <div style={{ textAlign: 'center' }}>
                      <IonIcon icon={sync} size="large" color={stats.pendingSync > 0 ? 'warning' : 'success'} />
                      <h2>{stats.pendingSync}</h2>
                      <IonText color="medium">Pending Sync</IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Model Status */}
          {modelInfo && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>AI Model Status</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                  <IonLabel>
                    <h3>{modelInfo.name}</h3>
                    <p>Version {modelInfo.version} • Ready</p>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
          )}

          {/* Sync Status */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Sync Status</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonIcon 
                  icon={time} 
                  slot="start" 
                  color={lastSyncTime ? 'success' : 'warning'} 
                />
                <IonLabel>
                  <h3>Last Sync</h3>
                  <p>{formatLastSync(lastSyncTime)}</p>
                </IonLabel>
                {syncStatus === 'syncing' && (
                  <IonBadge color="primary" slot="end">Syncing</IonBadge>
                )}
              </IonItem>
              {syncStatus === 'syncing' && <IonProgressBar type="indeterminate" />}
            </IonCardContent>
          </IonCard>

          {/* Recent Predictions */}
          {stats.recentPredictions.length > 0 && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Recent Scans</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {stats.recentPredictions.map((prediction, index) => (
                  <IonItem key={index} button>
                    <IonIcon 
                      icon={prediction.confidence > 0.7 ? checkmarkCircle : alertCircle} 
                      slot="start" 
                      color={prediction.confidence > 0.7 ? 'success' : 'warning'} 
                    />
                    <IonLabel>
                      <h3>{prediction.topPrediction}</h3>
                      <p>{(prediction.confidence * 100).toFixed(1)}% confidence</p>
                    </IonLabel>
                    <IonText slot="end" color="medium">
                      {new Date(prediction.createdAt).toLocaleDateString()}
                    </IonText>
                  </IonItem>
                ))}
                <IonButton fill="clear" expand="block" onClick={navigateToHistory}>
                  View All History
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}

          {/* Quick Actions */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Quick Actions</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton expand="block" fill="outline" onClick={navigateToHistory}>
                      <IonIcon icon={analytics} slot="start" />
                      History
                    </IonButton>
                  </IonCol>
                  <IonCol>
                    <IonButton expand="block" fill="outline" onClick={navigateToProfile}>
                      <IonIcon icon={person} slot="start" />
                      Profile
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Floating Action Button for Camera */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={navigateToCamera} color="primary">
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
