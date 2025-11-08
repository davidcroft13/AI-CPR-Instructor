import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail } from 'lucide-react-native';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-8">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-8"
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </Text>
        <Text className="text-gray-600 mb-8">
          Enter your email and we'll send you a link to reset your password
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <Mail size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="bg-blue-600 rounded-xl py-4 px-8 items-center mb-6"
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

