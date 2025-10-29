import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonProgressBar,
  IonText,
} from '@ionic/react';
import {
  checkmarkCircle,
  closeCircle,
  alertCircle,
  flask,
  download,
} from 'ionicons/icons';
import { runOfflineTests } from '../tests/offlineTests';
import './TestOffline.css';

const TestOffline = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  const runTests = async () => {
    setTesting(true);
    setTestResults(null);
    setProgress(0);
    setCurrentTest('Initializing tests...');

    try {
      // Simulate progress updates (in real implementation, tests would emit progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.1, 0.9));
      }, 500);

      const results = await runOfflineTests();

      clearInterval(progressInterval);
      setProgress(1);
      setCurrentTest('Tests completed!');
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
      setCurrentTest('Test execution failed!');
    } finally {
      setTesting(false);
    }
  };

  const downloadResults = () => {
    if (!testResults) return;

    const dataStr = JSON.stringify(testResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `gingerlyai-test-results-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusColor = (passed) => {
    return passed ? 'success' : 'danger';
  };

  const getStatusIcon = (passed) => {
    return passed ? checkmarkCircle : closeCircle;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>🧪 Offline Functionality Tests</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Header Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={flask} /> Test Offline Features
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              This test suite verifies that all offline functionality is working correctly:
            </p>
            <ul>
              <li>Database initialization and storage</li>
              <li>ML model loading and inference</li>
              <li>Offline prediction saving</li>
              <li>Sync functionality</li>
              <li>Performance benchmarks</li>
            </ul>

            <IonButton
              expand="block"
              onClick={runTests}
              disabled={testing}
              className="ion-margin-top"
            >
              {testing ? (
                <>
                  <IonSpinner name="crescent" className="ion-margin-end" />
                  Running Tests...
                </>
              ) : (
                <>
                  <IonIcon icon={flask} slot="start" />
                  Run All Tests
                </>
              )}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Progress Bar */}
        {testing && (
          <IonCard>
            <IonCardContent>
              <IonText>
                <p>
                  <strong>{currentTest}</strong>
                </p>
              </IonText>
              <IonProgressBar value={progress} />
              <IonText color="medium">
                <p className="ion-text-center ion-margin-top">
                  {Math.round(progress * 100)}% Complete
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {/* Summary Card */}
        {testResults && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>📊 Test Summary</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="summary-grid">
                <div className="summary-item">
                  <IonText color="medium">
                    <p>Total Tests</p>
                  </IonText>
                  <h2>{testResults.total}</h2>
                </div>

                <div className="summary-item">
                  <IonText color="success">
                    <p>✅ Passed</p>
                  </IonText>
                  <h2>{testResults.passed}</h2>
                </div>

                <div className="summary-item">
                  <IonText color="danger">
                    <p>❌ Failed</p>
                  </IonText>
                  <h2>{testResults.failed}</h2>
                </div>

                <div className="summary-item">
                  <IonText color="medium">
                    <p>⏱️ Duration</p>
                  </IonText>
                  <h2>{(testResults.duration / 1000).toFixed(2)}s</h2>
                </div>
              </div>

              <div className="pass-rate ion-margin-top">
                <IonText>
                  <h3>
                    Pass Rate:{' '}
                    <IonBadge
                      color={testResults.failed === 0 ? 'success' : 'warning'}
                    >
                      {((testResults.passed / testResults.total) * 100).toFixed(2)}%
                    </IonBadge>
                  </h3>
                </IonText>
              </div>

              <IonButton
                expand="block"
                fill="outline"
                onClick={downloadResults}
                className="ion-margin-top"
              >
                <IonIcon icon={download} slot="start" />
                Download Results (JSON)
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Detailed Results */}
        {testResults && testResults.results && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>🔍 Detailed Results</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {testResults.results.map((result, index) => (
                  <IonItem key={index} lines="full">
                    <IonIcon
                      icon={getStatusIcon(result.passed)}
                      color={getStatusColor(result.passed)}
                      slot="start"
                    />
                    <IonLabel>
                      <h3>{result.testName}</h3>
                      {result.message && (
                        <p>{result.message}</p>
                      )}
                    </IonLabel>
                    <IonBadge
                      color={getStatusColor(result.passed)}
                      slot="end"
                    >
                      {result.passed ? 'PASS' : 'FAIL'}
                    </IonBadge>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Final Status */}
        {testResults && (
          <IonCard color={testResults.failed === 0 ? 'success' : 'warning'}>
            <IonCardContent className="ion-text-center">
              <IonIcon
                icon={testResults.failed === 0 ? checkmarkCircle : alertCircle}
                style={{ fontSize: '48px' }}
              />
              <h2>
                {testResults.failed === 0
                  ? '🎉 All Tests Passed!'
                  : '⚠️ Some Tests Failed'}
              </h2>
              <p>
                {testResults.failed === 0
                  ? 'All offline functionality is working correctly.'
                  : 'Please review the failed tests above and check the console for details.'}
              </p>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TestOffline;

