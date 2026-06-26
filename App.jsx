import React, {useEffect} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import {QueryClientProvider} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import {colors, paperTheme} from './src/theme';
import queryClient from './src/queryClient';
import fcmService from './src/services/notifications/fcmService';

const App = () => {
  useEffect(() => {
    fcmService.setBackgroundMessageHandler();
    const unsubscribe = fcmService.onMessage(remoteMessage => {
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title,
        text2: remoteMessage.notification?.body,
        visibilityTime: 5000,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <SafeAreaProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={colors.background}
              />
              <AppNavigator />
              <Toast />
            </SafeAreaProvider>
          </PaperProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
