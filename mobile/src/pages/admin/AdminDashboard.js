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
  IonBackButton,
  IonButtons,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonItem,
  IonLabel,
  IonChip,
} from '@ionic/react';
import { 
  shield, 
  people, 
  medkit, 
  cube,
  analytics,
  settings,
  arrowForward,
  checkmarkCircle,
  alertCircle,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRemedies: 7,
    totalModels: 1,
    activePredictions: 0,
  });

  useEffect(() => {
    // Load admin stats
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // TODO: Fetch actual stats from backend
      setStats({
        totalUsers: 15,
        totalRemedies: 7,
        totalModels: 1,
        activePredictions: 127,
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  const navigateTo = (path) => {
    history.push(path);
  };

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
          <IonChip slot="end" color="danger">
            <IonIcon icon={shield} />
            <IonLabel>Admin</IonLabel>
          </IonChip>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Welcome Card */}
        <IonCard color="primary">
          <IonCardHeader>
            <IonCardTitle>Welcome, Administrator!</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>Logged in as: <strong>{user?.name}</strong></p>
              <p>Role: <strong>System Administrator</strong></p>
              <p>You have full access to manage users, remedies, and ML models.</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Quick Stats */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>System Overview</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <IonIcon icon={people} size="large" color="primary" style={{ fontSize: '48px' }} />
                    <h2 style={{ margin: '8px 0 4px 0', fontSize: '32px' }}>{stats.totalUsers}</h2>
                    <IonText color="medium">
                      <small>Total Users</small>
                    </IonText>
                  </div>
                </IonCol>
                <IonCol size="6">
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <IonIcon icon={medkit} size="large" color="success" style={{ fontSize: '48px' }} />
                    <h2 style={{ margin: '8px 0 4px 0', fontSize: '32px' }}>{stats.totalRemedies}</h2>
                    <IonText color="medium">
                      <small>Remedies</small>
                    </IonText>
                  </div>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <IonIcon icon={cube} size="large" color="tertiary" style={{ fontSize: '48px' }} />
                    <h2 style={{ margin: '8px 0 4px 0', fontSize: '32px' }}>{stats.totalModels}</h2>
                    <IonText color="medium">
                      <small>ML Models</small>
                    </IonText>
                  </div>
                </IonCol>
                <IonCol size="6">
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <IonIcon icon={analytics} size="large" color="warning" style={{ fontSize: '48px' }} />
                    <h2 style={{ margin: '8px 0 4px 0', fontSize: '32px' }}>{stats.activePredictions}</h2>
                    <IonText color="medium">
                      <small>Predictions</small>
                    </IonText>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Admin Functions */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Administrative Functions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: 0 }}>
            {/* User Management */}
            <IonItem button onClick={() => navigateTo('/admin/users')} detail>
              <IonIcon icon={people} slot="start" color="primary" />
              <IonLabel>
                <h2>User Management</h2>
                <p>Manage farmer accounts, permissions, and access</p>
              </IonLabel>
              <IonBadge slot="end" color="primary">{stats.totalUsers}</IonBadge>
            </IonItem>

            {/* Remedy Management */}
            <IonItem button onClick={() => navigateTo('/admin/remedies')} detail>
              <IonIcon icon={medkit} slot="start" color="success" />
              <IonLabel>
                <h2>Remedy Management</h2>
                <p>Add, edit, or remove disease remedies</p>
              </IonLabel>
              <IonBadge slot="end" color="success">{stats.totalRemedies}</IonBadge>
            </IonItem>

            {/* Model Management */}
            <IonItem button onClick={() => navigateTo('/admin/models')} detail>
              <IonIcon icon={cube} slot="start" color="tertiary" />
              <IonLabel>
                <h2>ML Model Management</h2>
                <p>Upload and manage disease detection models</p>
              </IonLabel>
              <IonBadge slot="end" color="tertiary">{stats.totalModels}</IonBadge>
            </IonItem>

            {/* System Analytics */}
            <IonItem button detail>
              <IonIcon icon={analytics} slot="start" color="warning" />
              <IonLabel>
                <h2>System Analytics</h2>
                <p>View usage statistics and reports</p>
              </IonLabel>
              <IonChip slot="end" color="medium">
                <IonLabel>Coming Soon</IonLabel>
              </IonChip>
            </IonItem>

            {/* System Settings */}
            <IonItem button detail>
              <IonIcon icon={settings} slot="start" color="medium" />
              <IonLabel>
                <h2>System Settings</h2>
                <p>Configure system preferences and options</p>
              </IonLabel>
              <IonChip slot="end" color="medium">
                <IonLabel>Coming Soon</IonLabel>
              </IonChip>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* System Status */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>System Status</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon icon={checkmarkCircle} slot="start" color="success" />
              <IonLabel>
                <h3>Backend API</h3>
                <p>All services operational</p>
              </IonLabel>
              <IonBadge color="success" slot="end">Online</IonBadge>
            </IonItem>
            <IonItem lines="none">
              <IonIcon icon={checkmarkCircle} slot="start" color="success" />
              <IonLabel>
                <h3>Database</h3>
                <p>Connected and synchronized</p>
              </IonLabel>
              <IonBadge color="success" slot="end">Active</IonBadge>
            </IonItem>
            <IonItem lines="none">
              <IonIcon icon={checkmarkCircle} slot="start" color="success" />
              <IonLabel>
                <h3>ML Model</h3>
                <p>Ready for predictions</p>
              </IonLabel>
              <IonBadge color="success" slot="end">Ready</IonBadge>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Quick Help */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Quick Help</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <h3>Admin Functions:</h3>
              <ul style={{ marginLeft: '20px' }}>
                <li><strong>User Management</strong>: Create, edit, or deactivate user accounts</li>
                <li><strong>Remedy Management</strong>: Update disease information and treatments</li>
                <li><strong>Model Management</strong>: Upload new ML models for disease detection</li>
              </ul>
              <p><strong>Note:</strong> As an administrator, you also have access to all regular user features like disease detection and history.</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
