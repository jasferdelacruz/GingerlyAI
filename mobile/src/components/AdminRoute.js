import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IonLoading } from '@ionic/react';

const AdminRoute = ({ component: Component, ...rest }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <IonLoading isOpen={true} message="Loading..." />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && user?.role === 'admin' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/home" />
        )
      }
    />
  );
};

export default AdminRoute;
