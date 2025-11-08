import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getStripe, redirectToCheckout, createCheckoutSession, PAYMENT_AMOUNTS } from '../lib/stripe';
import { CreditCard, Lock, Check } from 'lucide-react-native';

export default function PaymentCheckout({ 
  paymentType, // 'signup' or 'team_member_seat'
  userEmail,
  userName,
  teamId,
  onPaymentSuccess,
  onPaymentCancel,
}) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [loading, setLoading] = useState(false);
  const [amount] = useState(PAYMENT_AMOUNTS[paymentType === 'signup' ? 'SIGNUP' : 'TEAM_MEMBER_SEAT']);

  const handlePayment = async () => {
    if (!userEmail || !userName) {
      Alert.alert('Error', 'User information is required for payment');
      return;
    }

    setLoading(true);
    try {
      // Get base URL for redirects
      const baseUrl = Platform.OS === 'web' && typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:19006';

      console.log('Starting payment flow with baseUrl:', baseUrl);
      console.log('Payment details:', { paymentType, amount, userEmail, userName, teamId });

      // Create checkout session
      const sessionId = await createCheckoutSession({
        paymentType,
        amount,
        userEmail,
        userName,
        teamId,
        successUrl: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/payment-cancel`,
      });

      console.log('Checkout session created:', sessionId);

      // Redirect to Stripe Checkout
      await redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to process payment. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  const formatAmount = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <CreditCard size={32} color="#2563eb" />
          <Text style={styles.title}>Complete Payment</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            {paymentType === 'signup' 
              ? 'To complete your registration, please proceed with payment.'
              : 'To join this team, please pay for your seat.'}
          </Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>{formatAmount(amount)}</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Check size={16} color={isDark ? '#10b981' : '#059669'} />
              <Text style={styles.featureText}>Secure payment via Stripe</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={isDark ? '#10b981' : '#059669'} />
              <Text style={styles.featureText}>Full access to all lessons</Text>
            </View>
            <View style={styles.feature}>
              <Check size={16} color={isDark ? '#10b981' : '#059669'} />
              <Text style={styles.featureText}>Instant account activation</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading}
            style={[styles.payButton, loading && styles.payButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Lock size={20} color="#ffffff" />
                <Text style={styles.payButtonText}>
                  Pay {formatAmount(amount)}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.securityNote}>
            Your payment is secure and encrypted. You'll be redirected to Stripe's secure checkout page.
          </Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  card: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginTop: 12,
  },
  content: {
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  amountContainer: {
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#6b7280',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2563eb',
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#4b5563',
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityNote: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

