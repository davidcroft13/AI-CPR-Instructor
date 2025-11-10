import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AppHeader from './AppHeader';
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Lessons from '../pages/Lessons';
import LessonDetail from '../pages/LessonDetail';
import Settings from '../pages/Settings';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentCancel from '../pages/PaymentCancel';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={Home}
        options={{ cardStyle: { flex: 1 } }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
      <Stack.Screen name="PaymentCancel" component={PaymentCancel} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Lessons" 
        component={Lessons}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={Settings}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccess}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PaymentCancel" 
        component={PaymentCancel}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>Loading...</Text>
      </View>
    );
  }

  const linking = {
    prefixes: Platform.OS === 'web' ? ['/'] : [],
    config: {
      screens: {
        Home: '',
        Login: 'login',
        SignUp: 'signup',
        ForgotPassword: 'forgot-password',
        PaymentSuccess: 'payment-success',
        PaymentCancel: 'payment-cancel',
        Dashboard: 'dashboard',
        Lessons: 'lessons',
        LessonDetail: 'lesson/:lessonId',
        Settings: 'settings',
      },
    },
  };

  return (
    <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#374151',
  },
});

