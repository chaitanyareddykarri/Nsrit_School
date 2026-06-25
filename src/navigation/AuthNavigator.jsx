import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import PhoneLoginHelpScreen from '../screens/auth/PhoneLoginHelpScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="PhoneLoginHelp" component={PhoneLoginHelpScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    <Stack.Screen
      name="RoleSelection"
      component={RoleSelectionScreen}
      options={{gestureEnabled: false}}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
