import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonLoading,
  IonAlert,
  IonItem,
  IonLabel,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonActionSheet,
  IonProgressBar,
  IonChip,
  IonBadge,
} from '@ionic/react';
import {
  camera,
  image,
  arrowBack,
  checkmarkCircle,
  alertCircle,
  refresh,
  leaf,
  analytics,
  informationCircle,
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mlService } from '../services/mlService';
import { databaseService } from '../services/databaseService';

const CameraPage = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const { user } = useAuth();
  const { addNotification, isOnline } = useApp();
  const history = useHistory();

  useEffect(() => {
    // Initialize ML service when component mounts
    initializeML();
  }, []);

  const initializeML = async () => {
    try {
      await mlService.initialize();
    } catch (error) {
      console.error('Failed to initialize ML service:', error);
      setAlertMessage('Failed to initialize AI model. Please try again.');
      setShowAlert(true);
    }
  };

  const simulateProgress = () => {
    const steps = [
      { progress: 10, message: 'Loading image...' },
      { progress: 30, message: 'Preprocessing...' },
      { progress: 60, message: 'Running AI analysis...' },
      { progress: 85, message: 'Processing results...' },
      { progress: 100, message: 'Complete!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setAnalysisProgress(steps[currentStep].progress);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return interval;
  };

  const takePicture = async (source) => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
      });

      setImage(photo.dataUrl);
      setPrediction(null);
      setShowActionSheet(false);
    } catch (error) {
      console.error('Error taking picture:', error);
      if (error.message !== 'User cancelled photos app') {
        setAlertMessage('Failed to capture image. Please try again.');
        setShowAlert(true);
      }
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      setAlertMessage('Please capture an image first.');
      setShowAlert(true);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const progressInterval = simulateProgress();

    try {
      // Run prediction
      const result = await mlService.predict(image);
      
      // Save prediction to local database
      const predictionData = {
        userId: user.id,
        imageUrl: image,
        predictionResults: result,
        topPrediction: result.class,
        confidence: result.confidence,
        isOfflinePrediction: !isOnline,
        synced: false,
        createdAt: new Date().toISOString(),
      };

      const savedPrediction = await databaseService.savePrediction(predictionData);
      
      setPrediction({
        ...result,
        id: savedPrediction.id,
        timestamp: new Date(),
      });

      // Add success notification
      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: `Detected: ${result.class} (${(result.confidence * 100).toFixed(1)}% confidence)`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setAlertMessage('Failed to analyze image. Please try again.');
      setShowAlert(true);
      
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: error.message || 'Unable to process image',
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const retakePhoto = () => {
    setImage(null);
    setPrediction(null);
    setShowActionSheet(true);
  };

  const viewResults = () => {
    if (prediction && prediction.id) {
      history.push(`/results/${prediction.id}`);
    }
  };

  const goBack = () => {
    history.goBack();
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButton 
            slot="start" 
            fill="clear" 
            color="light"
            onClick={goBack}
          >
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonTitle>Disease Detection</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Image Preview */}
        {image ? (
          <IonCard>
            <div style={{ 
              position: 'relative',
              width: '100%',
              paddingBottom: '75%', // 4:3 aspect ratio
              overflow: 'hidden',
            }}>
              <img 
                src={image} 
                alt="Captured plant"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </div>
            
            <IonCardContent>
              <div style={{ display: 'flex', gap: '8px' }}>
                <IonButton 
                  expand="block" 
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  color="primary"
                >
                  <IonIcon icon={analytics} slot="start" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Plant'}
                </IonButton>
                
                <IonButton 
                  fill="outline" 
                  onClick={retakePhoto}
                  disabled={isAnalyzing}
                >
                  <IonIcon icon={refresh} slot="start" />
                  Retake
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ) : (
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
              <IonIcon 
                icon={leaf} 
                size="large" 
                color="medium" 
                style={{ fontSize: '64px', marginBottom: '16px' }}
              />
              <h2>Capture Plant Image</h2>
              <IonText color="medium">
                <p>Take a clear photo of your ginger plant to detect diseases</p>
              </IonText>
              
              <IonButton 
                expand="block" 
                onClick={() => setShowActionSheet(true)}
                style={{ marginTop: '24px' }}
              >
                <IonIcon icon={camera} slot="start" />
                Take Photo
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: 'center' }}>
                <IonSpinner name="crescent" color="primary" />
                <h3 style={{ marginTop: '16px' }}>Analyzing Image</h3>
                <IonText color="medium">
                  <p>AI is processing your plant image...</p>
                </IonText>
                <IonProgressBar 
                  value={analysisProgress / 100} 
                  color="primary"
                  style={{ marginTop: '16px' }}
                />
                <IonText color="medium">
                  <small>{analysisProgress}% complete</small>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Prediction Results */}
        {prediction && !isAnalyzing && (
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: 'center' }}>
                <IonIcon 
                  icon={getConfidenceIcon(prediction.confidence)}
                  size="large"
                  color={getConfidenceColor(prediction.confidence)}
                  style={{ fontSize: '48px', marginBottom: '16px' }}
                />
                
                <h2>{prediction.class}</h2>
                
                <IonChip color={getConfidenceColor(prediction.confidence)}>
                  <IonIcon icon={analytics} />
                  <IonLabel>{(prediction.confidence * 100).toFixed(1)}% Confidence</IonLabel>
                </IonChip>

                <div style={{ marginTop: '16px' }}>
                  <IonText color="medium">
                    <p>Analysis completed at {prediction.timestamp.toLocaleTimeString()}</p>
                  </IonText>
                </div>

                <IonButton 
                  expand="block" 
                  onClick={viewResults}
                  style={{ marginTop: '24px' }}
                >
                  <IonIcon icon={informationCircle} slot="start" />
                  View Remedies & Details
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Tips Card */}
        <IonCard>
          <IonCardContent>
            <h3>📸 Photo Tips</h3>
            <ul style={{ marginLeft: '16px' }}>
              <li>Use good lighting (natural light preferred)</li>
              <li>Focus on affected plant parts</li>
              <li>Keep the camera steady</li>
              <li>Include some healthy plant parts for comparison</li>
              <li>Avoid shadows and reflections</li>
            </ul>
          </IonCardContent>
        </IonCard>

        {/* Camera/Gallery Action Sheet */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Take Photo',
              icon: camera,
              handler: () => takePicture(CameraSource.Camera),
            },
            {
              text: 'Choose from Gallery',
              icon: image,
              handler: () => takePicture(CameraSource.Photos),
            },
            {
              text: 'Cancel',
              role: 'cancel',
            },
          ]}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Camera Error"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;
