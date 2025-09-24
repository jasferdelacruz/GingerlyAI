const config = {
  appId: 'com.gingerlyai.mobile',
  appName: 'GingerlyAI',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4CAF50',
      showSpinner: false
    },
    Camera: {
      permissions: {
        camera: 'This app uses the camera to capture images of ginger plants for disease detection.',
        photos: 'This app needs access to photos to select images for disease analysis.'
      }
    },
    Geolocation: {
      permissions: {
        location: 'This app uses location to tag where disease predictions were made.'
      }
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#4CAF50'
    }
  }
};

module.exports = config;
