import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react-native';

export default function PaymentSuccess() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      let sessionId = route.params?.session_id;
      
      // For web, get from URL params
      if (Platform.OS === 'web' && typeof window !== 'undefined' && !sessionId) {
        const urlParams = new URLSearchParams(window.location.search);
        sessionId = urlParams.get('session_id');
      }
      
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      // Verify payment with backend
      const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        // Payment verified, user account should be activated
        // The backend webhook should have already handled this
        setLoading(false);
      } else {
        setError(data.message || 'Payment verification failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Failed to verify payment');
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Verifying payment...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>Payment Verification Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={64} color="#10b981" />
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.description}>
          Your account has been activated. You can now access all lessons and features.
        </Text>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Continue to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
  },
});

