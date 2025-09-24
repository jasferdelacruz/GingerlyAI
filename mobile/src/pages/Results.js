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
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonList,
  IonAccordion,
  IonAccordionGroup,
  IonSpinner,
  IonAlert,
} from '@ionic/react';
import {
  arrowBack,
  leaf,
  analytics,
  medkit,
  shield,
  warning,
  checkmarkCircle,
  informationCircle,
  share,
  bookmark,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { databaseService } from '../services/databaseService';

const Results = () => {
  const [prediction, setPrediction] = useState(null);
  const [remedy, setRemedy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const { id } = useParams();
  const { user } = useAuth();
  const history = useHistory();

  useEffect(() => {
    loadPredictionData();
  }, [id]);

  const loadPredictionData = async () => {
    try {
      setLoading(true);
      
      // Load prediction details
      const predictionData = await databaseService.getPrediction(id);
      
      if (!predictionData) {
        setAlertMessage('Prediction not found');
        setShowAlert(true);
        return;
      }

      setPrediction(predictionData);

      // Load remedy information for the detected disease
      const remedyData = await databaseService.getRemedyByDisease(predictionData.topPrediction);
      setRemedy(remedyData);

    } catch (error) {
      console.error('Failed to load prediction data:', error);
      setAlertMessage('Failed to load results. Please try again.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'medium';
    }
  };

  const goBack = () => {
    history.goBack();
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GingerlyAI Disease Detection',
          text: `Detected: ${prediction.topPrediction} with ${(prediction.confidence * 100).toFixed(1)}% confidence`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButton slot="start" fill="clear" color="light" onClick={goBack}>
              <IonIcon icon={arrowBack} />
            </IonButton>
            <IonTitle>Loading Results...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" color="primary" />
            <p>Loading analysis results...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!prediction) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButton slot="start" fill="clear" color="light" onClick={goBack}>
              <IonIcon icon={arrowBack} />
            </IonButton>
            <IonTitle>Results Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardContent style={{ textAlign: 'center' }}>
              <IonIcon icon={warning} size="large" color="warning" />
              <h2>Results Not Found</h2>
              <IonButton onClick={goBack}>Go Back</IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButton slot="start" fill="clear" color="light" onClick={goBack}>
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonTitle>Detection Results</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={shareResults}>
            <IonIcon icon={share} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Image & Basic Results */}
        <IonCard>
          {prediction.imageUrl && (
            <div style={{ 
              position: 'relative',
              width: '100%',
              paddingBottom: '60%',
              overflow: 'hidden',
            }}>
              <img 
                src={prediction.imageUrl} 
                alt="Analyzed plant"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          
          <IonCardContent>
            <div style={{ textAlign: 'center' }}>
              <h1>{prediction.topPrediction}</h1>
              
              <IonChip color={getConfidenceColor(prediction.confidence)}>
                <IonIcon icon={analytics} />
                <IonLabel>{(prediction.confidence * 100).toFixed(1)}% Confidence</IonLabel>
              </IonChip>

              <div style={{ marginTop: '16px' }}>
                <IonText color="medium">
                  <p>Analyzed on {new Date(prediction.createdAt).toLocaleString()}</p>
                </IonText>
                
                {prediction.isOfflinePrediction && (
                  <IonBadge color="warning">Offline Analysis</IonBadge>
                )}
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Disease Information */}
        {remedy && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={informationCircle} style={{ marginRight: '8px' }} />
                Disease Information
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonIcon icon={warning} slot="start" color={getSeverityColor(remedy.severity)} />
                <IonLabel>
                  <h3>Severity Level</h3>
                  <p>{remedy.severity || 'Unknown'}</p>
                </IonLabel>
              </IonItem>
              
              <div style={{ marginTop: '16px' }}>
                <IonText>
                  <p>{remedy.description}</p>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Detailed Analysis */}
        {remedy && (
          <IonAccordionGroup>
            {/* Symptoms */}
            {remedy.symptoms && remedy.symptoms.length > 0 && (
              <IonAccordion value="symptoms">
                <IonItem slot="header">
                  <IonIcon icon={leaf} slot="start" color="warning" />
                  <IonLabel>Symptoms</IonLabel>
                </IonItem>
                <div slot="content" className="ion-padding">
                  <IonList>
                    {remedy.symptoms.map((symptom, index) => (
                      <IonItem key={index}>
                        <IonLabel>• {symptom}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </div>
              </IonAccordion>
            )}

            {/* Causes */}
            {remedy.causes && remedy.causes.length > 0 && (
              <IonAccordion value="causes">
                <IonItem slot="header">
                  <IonIcon icon={analytics} slot="start" color="danger" />
                  <IonLabel>Causes</IonLabel>
                </IonItem>
                <div slot="content" className="ion-padding">
                  <IonList>
                    {remedy.causes.map((cause, index) => (
                      <IonItem key={index}>
                        <IonLabel>• {cause}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </div>
              </IonAccordion>
            )}

            {/* Treatments */}
            {remedy.treatments && remedy.treatments.length > 0 && (
              <IonAccordion value="treatments">
                <IonItem slot="header">
                  <IonIcon icon={medkit} slot="start" color="primary" />
                  <IonLabel>Treatments</IonLabel>
                </IonItem>
                <div slot="content" className="ion-padding">
                  <IonList>
                    {remedy.treatments.map((treatment, index) => (
                      <IonItem key={index}>
                        <IonIcon icon={checkmarkCircle} slot="start" color="success" size="small" />
                        <IonLabel className="ion-text-wrap">{treatment}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </div>
              </IonAccordion>
            )}

            {/* Prevention */}
            {remedy.preventionMeasures && remedy.preventionMeasures.length > 0 && (
              <IonAccordion value="prevention">
                <IonItem slot="header">
                  <IonIcon icon={shield} slot="start" color="success" />
                  <IonLabel>Prevention</IonLabel>
                </IonItem>
                <div slot="content" className="ion-padding">
                  <IonList>
                    {remedy.preventionMeasures.map((prevention, index) => (
                      <IonItem key={index}>
                        <IonIcon icon={shield} slot="start" color="success" size="small" />
                        <IonLabel className="ion-text-wrap">{prevention}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </div>
              </IonAccordion>
            )}
          </IonAccordionGroup>
        )}

        {/* No Remedy Available */}
        {!remedy && (
          <IonCard>
            <IonCardContent style={{ textAlign: 'center' }}>
              <IonIcon icon={informationCircle} size="large" color="warning" />
              <h3>Remedy Information Not Available</h3>
              <IonText color="medium">
                <p>Detailed remedy information for this condition is not currently available in our database.</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <IonButton expand="block" fill="outline" onClick={() => history.push('/camera')}>
            <IonIcon icon={leaf} slot="start" />
            Analyze Another Plant
          </IonButton>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={[{
            text: 'OK',
            handler: goBack
          }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Results;
