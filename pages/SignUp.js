import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import PaymentCheckout from '../components/PaymentCheckout';
import { ArrowLeft, Mail, Lock, User, Users, CreditCard } from 'lucide-react-native';

export default function SignUp() {
  const navigation = useNavigation();
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupType, setSignupType] = useState('solo'); // 'solo' or 'team'
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [teamIdFromInvite, setTeamIdFromInvite] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const handleContinueToPayment = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (signupType === 'team' && !teamName && !inviteCode) {
      Alert.alert('Error', 'Please enter a team name or invite code');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // If invite code is provided, verify it and get team ID
    let teamId = null;
    if (inviteCode) {
      try {
        const { data: team, error } = await supabase
          .from('teams')
          .select('id, name')
          .eq('invite_code', inviteCode.toUpperCase())
          .single();

        if (error || !team) {
          Alert.alert('Error', 'Invalid invite code');
          return;
        }

        teamId = team.id;
        setTeamIdFromInvite(teamId);
      } catch (error) {
        Alert.alert('Error', 'Failed to verify invite code');
        return;
      }
    }

    // Create account first and send verification email
    if (!accountCreated) {
      setLoading(true);
      try {
        const { data, error } = await signUp(email, password, { name });
        
        if (error) {
          // If user already exists, check if email is verified
          if (error.message.includes('already registered')) {
            Alert.alert('Error', 'An account with this email already exists. Please sign in instead.');
            return;
          }
          throw error;
        }

        setAccountCreated(true);
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required
          Alert.alert(
            'Email Verification Required',
            'We\'ve sent a verification email to ' + email + '. Please check your inbox and click the verification link before proceeding with payment.',
            [
              {
                text: 'I\'ve verified my email',
                onPress: () => verifyEmailAndContinue(email, password, name, signupType, teamName, inviteCode, teamId)
              },
              {
                text: 'Resend Email',
                onPress: () => resendVerificationEmail(email)
              }
            ]
          );
          setLoading(false);
          return;
        } else if (data.session) {
          // Email confirmation not required (or already verified)
          setEmailVerified(true);
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to create account');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Store signup data for after payment
    setSignupData({
      name,
      email,
      password,
      signupType: inviteCode ? 'team_member' : signupType,
      teamName,
      inviteCode,
      teamId,
    });
    setShowPayment(true);
  };

  const verifyEmailAndContinue = async (email, password, name, signupType, teamName, inviteCode, teamId) => {
    setLoading(true);
    try {
      // Try to sign in to verify email was confirmed
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert('Email Not Verified', 'Please check your email and click the verification link.');
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data.session) {
        setEmailVerified(true);
        setAccountCreated(true);
        // Continue to payment
        setSignupData({
          name,
          email,
          password,
          signupType: inviteCode ? 'team_member' : signupType,
          teamName,
          inviteCode,
          teamId,
        });
        setShowPayment(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
  };

  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    }
  };

  const handlePaymentSuccess = async () => {
    // After payment success, create the account
    if (!signupData) {
      Alert.alert('Error', 'Signup data not found');
      return;
    }

    setLoading(true);
    try {
      // Get current user from session (account should already be created)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // If no user, try to sign in (user may have verified email)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signupData.email,
          password: signupData.password,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please verify your email before completing payment');
          }
          throw error;
        }
        
        if (!data.user) {
          throw new Error('User not found. Please verify your email and try again.');
        }
        
        // Use the signed-in user
        var finalUser = data.user;
      } else {
        var finalUser = user;
      }

      // Create user profile and team
      if (finalUser) {
        let teamData;
        
        if (signupData.teamId) {
          // Joining existing team via invite code
          teamData = { id: signupData.teamId };
        } else if (signupData.signupType === 'team') {
          // Create team with provided name
          const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert([
              {
                name: signupData.teamName,
                invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              },
            ])
            .select()
            .single();

          if (teamError) throw teamError;
          teamData = newTeam;
        } else {
          // Create solo team (auto-generated name)
          const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert([
              {
                name: `${signupData.name}'s Team`,
                invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              },
            ])
            .select()
            .single();

          if (teamError) throw teamError;
          teamData = newTeam;
        }

        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: finalUser.id,
              email: finalUser.email,
              name: signupData.name,
              team_id: teamData.id,
              is_team_owner: signupData.signupType === 'team' && !signupData.teamId,
              payment_status: 'paid', // Mark as paid after successful payment
            },
          ]);

        if (userError) throw userError;

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([
            {
              user_id: finalUser.id,
              team_id: teamData.id,
              amount: 9900, // $99.00 in cents
              status: 'succeeded',
              payment_type: signupData.teamId ? 'team_member_seat' : 'signup',
            },
          ]);

        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
          // Don't fail the signup if payment record fails
        }

        // User is logged in, navigation will happen automatically via AuthContext
        Alert.alert('Success', 'Account setup complete! Welcome to CPR AI Trainer.');
      } else {
        throw new Error('Failed to get user information');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowPayment(false);
    setSignupData(null);
  };

  if (showPayment && signupData) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={isDark ? '#cbd5e1' : '#374151'} />
          </TouchableOpacity>
          <PaymentCheckout
            paymentType={signupData.teamId ? 'team_member_seat' : 'signup'}
            userEmail={signupData.email}
            userName={signupData.name}
            teamId={signupData.teamId}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={handleBack}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDark ? '#cbd5e1' : '#374151'} />
        </TouchableOpacity>

        <Text style={styles.title}>
          Create Account
        </Text>
        <Text style={styles.subtitle}>
          Start your CPR training journey
        </Text>

        {/* Signup Type Selection */}
        <View style={styles.signupTypeContainer}>
          <Text style={styles.label}>I'm signing up as:</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              onPress={() => setSignupType('solo')}
              style={[
                styles.typeButton,
                signupType === 'solo' && styles.typeButtonActive,
              ]}
            >
              <User size={20} color={signupType === 'solo' ? '#ffffff' : (isDark ? '#cbd5e1' : '#4b5563')} />
              <View style={{ width: 8 }} />
              <Text style={[
                styles.typeButtonText,
                signupType === 'solo' && styles.typeButtonTextActive,
              ]}>
                Solo Learner
              </Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              onPress={() => setSignupType('team')}
              style={[
                styles.typeButton,
                signupType === 'team' && styles.typeButtonActive,
              ]}
            >
              <Users size={20} color={signupType === 'team' ? '#ffffff' : (isDark ? '#cbd5e1' : '#4b5563')} />
              <View style={{ width: 8 }} />
              <Text style={[
                styles.typeButtonText,
                signupType === 'team' && styles.typeButtonTextActive,
              ]}>
                Team Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invite Code (Optional)</Text>
            <View style={styles.inputContainer}>
              <Users size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter team invite code"
                placeholderTextColor="#9ca3af"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />
            </View>
            {inviteCode && (
              <Text style={styles.inviteNote}>
                You'll join the team associated with this invite code
              </Text>
            )}
          </View>

          {signupType === 'team' && !inviteCode && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Team Name</Text>
              <View style={styles.inputContainer}>
                <Users size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter team name"
                  placeholderTextColor="#9ca3af"
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <CreditCard size={20} color="#2563eb" />
          <Text style={styles.paymentInfoText}>
            Payment of $99.00 required to complete registration
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinueToPayment}
          disabled={loading}
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Processing...' : 'Continue to Payment'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    marginBottom: 32,
  },
  signupTypeContainer: {
    marginBottom: 24,
  },
  typeButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    backgroundColor: isDark ? '#1e293b' : '#f9fafb',
  },
  typeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e293b' : '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    maxWidth: 400,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: isDark ? '#ffffff' : '#111827',
    fontSize: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e293b' : '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#c7d2fe',
  },
  paymentInfoText: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#1e40af',
    marginLeft: 12,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 24,
    maxWidth: 400,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: isDark ? '#94a3b8' : '#4b5563',
    fontSize: 14,
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  inviteNote: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
