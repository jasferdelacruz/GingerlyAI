import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Context Providers */
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

/* Pages */
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Results from './pages/Results';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRemedies from './pages/admin/AdminRemedies';
import AdminModels from './pages/admin/AdminModels';

/* Components */
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

setupIonicReact();

const App = () => {
  useEffect(() => {
    // Initialize app
    console.log('GingerlyAI Mobile App Started');
  }, []);

  return (
    <IonApp>
      <AuthProvider>
        <AppProvider>
          <IonReactRouter>
            <IonRouterOutlet>
              {/* Public Routes */}
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              
              {/* Protected User Routes */}
              <ProtectedRoute exact path="/home" component={Home} />
              <ProtectedRoute exact path="/camera" component={Camera} />
              <ProtectedRoute exact path="/results/:predictionId" component={Results} />
              <ProtectedRoute exact path="/history" component={History} />
              <ProtectedRoute exact path="/profile" component={Profile} />
              <ProtectedRoute exact path="/settings" component={Settings} />
              
              {/* Admin Routes */}
              <AdminRoute exact path="/admin" component={AdminDashboard} />
              <AdminRoute exact path="/admin/users" component={AdminUsers} />
              <AdminRoute exact path="/admin/remedies" component={AdminRemedies} />
              <AdminRoute exact path="/admin/models" component={AdminModels} />
              
              {/* Default Redirects */}
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
              
              {/* Catch all - redirect to home */}
              <Route>
                <Redirect to="/home" />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </AppProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
