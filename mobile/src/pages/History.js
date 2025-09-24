import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonBadge,
  IonChip,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonFab,
  IonFabButton,
  IonMenuButton,
} from '@ionic/react';
import {
  analytics,
  leaf,
  checkmarkCircle,
  alertCircle,
  time,
  sync,
  trash,
  eye,
  cloudOffline,
  wifi,
  camera,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [predictionToDelete, setPredictionToDelete] = useState(null);
  
  const { user } = useAuth();
  const { isOnline, syncData } = useApp();
  const history = useHistory();

  useEffect(() => {
    loadPredictions();
  }, [user]);

  useEffect(() => {
    filterPredictions();
  }, [predictions, searchText, selectedSegment]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const userPredictions = await databaseService.getPredictions(user.id);
      setPredictions(userPredictions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPredictions = () => {
    let filtered = predictions;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(p => 
        p.topPrediction.toLowerCase().includes(searchText.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by segment
    switch (selectedSegment) {
      case 'synced':
        filtered = filtered.filter(p => p.synced);
        break;
      case 'unsynced':
        filtered = filtered.filter(p => !p.synced);
        break;
      case 'offline':
        filtered = filtered.filter(p => p.isOfflinePrediction);
        break;
      // 'all' shows everything
    }

    setFilteredPredictions(filtered);
  };

  const handleRefresh = async (event) => {
    try {
      if (isOnline) {
        await syncData();
      }
      await loadPredictions();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      event.detail.complete();
    }
  };

  const viewPrediction = (predictionId) => {
    history.push(`/results/${predictionId}`);
  };

  const confirmDelete = (prediction) => {
    setPredictionToDelete(prediction);
    setShowDeleteAlert(true);
  };

  const deletePrediction = async () => {
    if (!predictionToDelete) return;

    try {
      await databaseService.deletePrediction(predictionToDelete.id);
      await loadPredictions();
      setShowDeleteAlert(false);
      setPredictionToDelete(null);
    } catch (error) {
      console.error('Failed to delete prediction:', error);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.7) return checkmarkCircle;
    return alertCircle;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getSyncStatusInfo = () => {
    const syncedCount = predictions.filter(p => p.synced).length;
    const unsyncedCount = predictions.length - syncedCount;
    
    return { syncedCount, unsyncedCount };
  };

  const { syncedCount, unsyncedCount } = getSyncStatusInfo();

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonMenuButton slot="start" />
            <IonTitle>Analysis History</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" color="primary" />
            <p>Loading your analysis history...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Analysis History</IonTitle>
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
          {/* Summary Stats */}
          <IonCard>
            <IonCardContent>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <h2>{predictions.length}</h2>
                  <IonText color="medium">Total Scans</IonText>
                </div>
                <div>
                  <h2 style={{ color: syncedCount > 0 ? 'var(--ion-color-success)' : 'var(--ion-color-medium)' }}>
                    {syncedCount}
                  </h2>
                  <IonText color="medium">Synced</IonText>
                </div>
                <div>
                  <h2 style={{ color: unsyncedCount > 0 ? 'var(--ion-color-warning)' : 'var(--ion-color-medium)' }}>
                    {unsyncedCount}
                  </h2>
                  <IonText color="medium">Pending</IonText>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Search */}
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value)}
            placeholder="Search predictions..."
            showClearButton="focus"
          />

          {/* Filter Segments */}
          <IonSegment 
            value={selectedSegment} 
            onIonChange={(e) => setSelectedSegment(e.detail.value)}
          >
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="synced">
              <IonLabel>Synced</IonLabel>
              {syncedCount > 0 && <IonBadge color="success">{syncedCount}</IonBadge>}
            </IonSegmentButton>
            <IonSegmentButton value="unsynced">
              <IonLabel>Pending</IonLabel>
              {unsyncedCount > 0 && <IonBadge color="warning">{unsyncedCount}</IonBadge>}
            </IonSegmentButton>
            <IonSegmentButton value="offline">
              <IonLabel>Offline</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Predictions List */}
        {filteredPredictions.length === 0 ? (
          <div className="ion-padding">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                <IonIcon 
                  icon={analytics} 
                  size="large" 
                  color="medium" 
                  style={{ fontSize: '64px', marginBottom: '16px' }}
                />
                <h2>No Predictions Found</h2>
                <IonText color="medium">
                  <p>
                    {searchText.trim() || selectedSegment !== 'all' 
                      ? 'No predictions match your current filters.'
                      : 'Start by analyzing your first plant!'
                    }
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <IonList>
            {filteredPredictions.map((prediction) => (
              <IonItemSliding key={prediction.id}>
                <IonItem 
                  button 
                  onClick={() => viewPrediction(prediction.id)}
                >
                  {prediction.imageUrl && (
                    <div 
                      slot="start" 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginRight: '16px',
                      }}
                    >
                      <img 
                        src={prediction.imageUrl} 
                        alt="Plant"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}
                  
                  <IonLabel>
                    <h2>{prediction.topPrediction}</h2>
                    <p>
                      <IonIcon 
                        icon={getConfidenceIcon(prediction.confidence)}
                        color={getConfidenceColor(prediction.confidence)}
                        style={{ marginRight: '4px' }}
                      />
                      {(prediction.confidence * 100).toFixed(1)}% confidence
                    </p>
                    <IonText color="medium">
                      <small>{formatDate(prediction.createdAt)}</small>
                    </IonText>
                  </IonLabel>

                  <div slot="end" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {prediction.isOfflinePrediction && (
                      <IonBadge color="medium" style={{ fontSize: '10px' }}>
                        <IonIcon icon={cloudOffline} style={{ fontSize: '10px' }} />
                        Offline
                      </IonBadge>
                    )}
                    
                    <IonBadge color={prediction.synced ? 'success' : 'warning'} style={{ fontSize: '10px' }}>
                      <IonIcon icon={prediction.synced ? sync : time} style={{ fontSize: '10px' }} />
                      {prediction.synced ? 'Synced' : 'Pending'}
                    </IonBadge>
                  </div>
                </IonItem>

                <IonItemOptions side="end">
                  <IonItemOption 
                    color="primary" 
                    onClick={() => viewPrediction(prediction.id)}
                  >
                    <IonIcon icon={eye} />
                    View
                  </IonItemOption>
                  <IonItemOption 
                    color="danger" 
                    onClick={() => confirmDelete(prediction)}
                  >
                    <IonIcon icon={trash} />
                    Delete
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}

        {/* Floating Action Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/camera')} color="primary">
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>

        {/* Delete Confirmation */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Prediction"
          message={`Are you sure you want to delete this prediction for "${predictionToDelete?.topPrediction}"? This action cannot be undone.`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: deletePrediction,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default History;
