import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import { User, Mail, Lock, Users, CreditCard, LogOut, UserPlus, X, Sun, Moon } from 'lucide-react-native';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { isDark, themePreference, toggleTheme } = useTheme();
  const styles = getStyles(isDark);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [voicePreference, setVoicePreference] = useState('guided');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, teams(*)')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserData(data);
      setName(data.name || '');
      setVoicePreference(data.voice_preference || 'guided');

      // Load team members if owner
      if (data.is_team_owner && data.team_id) {
        const { data: members, error: membersError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('team_id', data.team_id);

        if (membersError) throw membersError;
        setTeamMembers(members || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name,
          voice_preference: voicePreference,
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
      await loadUserData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!userData?.is_team_owner || !userData?.team_id) {
      Alert.alert('Error', 'You must be a team owner to invite members');
      return;
    }

    setInviting(true);
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', inviteEmail)
        .single();

      if (existingUser) {
        // User exists, add them to team
        const { error: updateError } = await supabase
          .from('users')
          .update({ team_id: userData.team_id })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;
        Alert.alert('Success', `${inviteEmail} has been added to your team!`);
      } else {
        // User doesn't exist - send invitation
        // In a real app, you'd send an email with invite link
        // For now, we'll just show the invite code
        Alert.alert(
          'Invitation',
          `Share this invite code with ${inviteEmail}:\n\n${userData.teams?.invite_code}\n\nThey can use this code when signing up to join your team. They will be required to pay $99.00 for their seat during signup.`,
          [{ text: 'OK' }]
        );
      }

      setInviteEmail('');
      await loadUserData();
    } catch (error) {
      if (error.code === 'PGRST116') {
        // User doesn't exist, show invite code
        Alert.alert(
          'Invitation',
          `Share this invite code with ${inviteEmail}:\n\n${userData.teams?.invite_code}\n\nThey can use this code when signing up to join your team. They will be required to pay $99.00 for their seat during signup.`,
          [{ text: 'OK' }]
        );
        setInviteEmail('');
      } else {
        Alert.alert('Error', error.message || 'Failed to send invitation');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from your team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .update({ team_id: null })
                .eq('id', memberId);

              if (error) throw error;
              Alert.alert('Success', 'Member removed from team');
              await loadUserData();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleUpdatePassword = async () => {
    Alert.alert(
      'Update Password',
      'A password reset email will be sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(
                user.email
              );
              if (error) throw error;
              Alert.alert(
                'Success',
                'Password reset email sent! Check your inbox.'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to send reset email');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AppHeader />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your account and preferences</Text>
          </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Profile Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name
            </Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email
            </Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6b7280" />
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Voice Preference
            </Text>
            <View style={styles.voiceButtons}>
              <TouchableOpacity
                onPress={() => setVoicePreference('guided')}
                style={[
                  styles.voiceButton,
                  voicePreference === 'guided' && styles.voiceButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.voiceButtonText,
                    voicePreference === 'guided' && styles.voiceButtonTextActive,
                  ]}
                >
                  Guided
                </Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity
                onPress={() => setVoicePreference('intense')}
                style={[
                  styles.voiceButton,
                  voicePreference === 'intense' && styles.voiceButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.voiceButtonText,
                    voicePreference === 'intense' && styles.voiceButtonTextActive,
                  ]}
                >
                  Intense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            style={styles.updateButton}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Password
          </Text>
          <TouchableOpacity
            onPress={handleUpdatePassword}
            style={styles.passwordButton}
          >
            <Lock size={20} color="#6b7280" />
            <Text style={styles.passwordButtonText}>
              Update Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Appearance
          </Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              onPress={() => toggleTheme('light')}
              style={[
                styles.themeButton,
                themePreference === 'light' && styles.themeButtonActive,
              ]}
            >
              <Sun size={20} color={themePreference === 'light' ? '#ffffff' : (isDark ? '#cbd5e1' : '#4b5563')} />
              <View style={{ width: 8 }} />
              <Text
                style={[
                  styles.themeButtonText,
                  themePreference === 'light' && styles.themeButtonTextActive,
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              onPress={() => toggleTheme('dark')}
              style={[
                styles.themeButton,
                themePreference === 'dark' && styles.themeButtonActive,
              ]}
            >
              <Moon size={20} color={themePreference === 'dark' ? '#ffffff' : (isDark ? '#cbd5e1' : '#4b5563')} />
              <View style={{ width: 8 }} />
              <Text
                style={[
                  styles.themeButtonText,
                  themePreference === 'dark' && styles.themeButtonTextActive,
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              onPress={() => toggleTheme('system')}
              style={[
                styles.themeButton,
                themePreference === 'system' && styles.themeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  themePreference === 'system' && styles.themeButtonTextActive,
                ]}
              >
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team Management */}
        {userData?.is_team_owner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Team Management
            </Text>
            <View style={styles.teamInfo}>
              <Text style={styles.teamInfoText}>
                Team: {userData.teams?.name}
              </Text>
              <Text style={styles.teamInfoText}>
                Invite Code: {userData.teams?.invite_code}
              </Text>
            </View>

            {/* Invite Member */}
            <View style={styles.inviteSection}>
              <Text style={styles.label}>Invite Team Member</Text>
              <View style={styles.inviteInputContainer}>
                <View style={styles.inviteInputWrapper}>
                  <Mail size={20} color="#6b7280" />
                  <TextInput
                    style={styles.inviteInput}
                    placeholder="Enter email address"
                    placeholderTextColor="#9ca3af"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ width: 12 }} />
                <TouchableOpacity
                  onPress={handleInviteMember}
                  disabled={inviting || !inviteEmail}
                  style={[
                    styles.inviteButton,
                    (!inviteEmail || inviting) && styles.inviteButtonDisabled,
                  ]}
                >
                  <UserPlus size={20} color="#ffffff" />
                  <View style={{ width: 8 }} />
                  <Text style={styles.inviteButtonText}>
                    {inviting ? 'Inviting...' : 'Invite'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Team Members List */}
            <View style={styles.membersSection}>
              <Text style={styles.membersTitle}>
                Team Members ({teamMembers.length})
              </Text>
              {teamMembers.map((member) => (
                <View
                  key={member.id}
                  style={styles.memberRow}
                >
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.name}
                    </Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  {member.id !== user.id && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.id)}
                      style={styles.removeButton}
                    >
                      <X size={16} color="#dc2626" />
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Billing (Placeholder) */}
        {userData?.is_team_owner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Billing
            </Text>
            <View style={styles.billingPlaceholder}>
              <CreditCard size={20} color="#6b7280" />
              <Text style={styles.billingText}>
                Stripe integration coming soon
              </Text>
            </View>
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  loadingText: {
    color: isDark ? '#94a3b8' : '#4b5563',
    fontSize: 16,
  },
  content: {
    padding: 24,
    paddingTop: 32,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    fontWeight: '500',
  },
  section: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    backgroundColor: isDark ? '#0f172a' : '#f9fafb',
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
  emailText: {
    marginLeft: 12,
    color: isDark ? '#94a3b8' : '#4b5563',
    fontSize: 16,
  },
  voiceButtons: {
    flexDirection: 'row',
  },
  voiceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    alignItems: 'center',
  },
  voiceButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  voiceButtonTextActive: {
    color: '#ffffff',
  },
  updateButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#0f172a' : '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  passwordButtonText: {
    marginLeft: 12,
    color: isDark ? '#ffffff' : '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  themeButtons: {
    flexDirection: 'row',
    maxWidth: 400,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
  },
  themeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  themeButtonTextActive: {
    color: '#ffffff',
  },
  teamInfo: {
    marginBottom: 24,
  },
  teamInfoText: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#4b5563',
    marginBottom: 8,
  },
  inviteSection: {
    marginBottom: 24,
  },
  inviteInputContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  inviteInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#0f172a' : '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    maxWidth: 300,
  },
  inviteInput: {
    flex: 1,
    marginLeft: 12,
    color: isDark ? '#ffffff' : '#111827',
    fontSize: 16,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  membersSection: {
    marginTop: 8,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#374151',
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#e5e7eb',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#4b5563',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  billingPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#0f172a' : '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  billingText: {
    marginLeft: 12,
    color: isDark ? '#94a3b8' : '#4b5563',
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#1e293b' : '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  signOutText: {
    marginLeft: 8,
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
