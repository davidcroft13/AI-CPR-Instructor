import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import { Trophy, BookOpen, TrendingUp, Users } from 'lucide-react-native';

export default function Dashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [stats, setStats] = useState({
    averageScore: 0,
    totalSessions: 0,
    lessonsCompleted: 0,
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [isTeamView, setIsTeamView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*, teams(*)')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      setUserData(userProfile);

      // Get lesson results
      const { data: results, error: resultsError } = await supabase
        .from('lesson_results')
        .select('*')
        .eq('user_id', user.id);

      if (resultsError) throw resultsError;

      // Calculate stats
      const totalSessions = results.length;
      const averageScore =
        totalSessions > 0
          ? results.reduce((sum, r) => sum + (r.score || 0), 0) / totalSessions
          : 0;
      const lessonsCompleted = new Set(results.map((r) => r.lesson_id)).size;

      setStats({
        averageScore: Math.round(averageScore),
        totalSessions,
        lessonsCompleted,
      });

      // Get team members if user is team owner
      if (userProfile?.is_team_owner && userProfile?.team_id) {
        const { data: members, error: membersError } = await supabase
          .from('users')
          .select('*, lesson_results(*)')
          .eq('team_id', userProfile.team_id);

        if (membersError) throw membersError;
        setTeamMembers(members || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <View style={styles.wrapper}>
      <AppHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>
              Dashboard
            </Text>
            <Text style={styles.subtitle}>
              Welcome back, {userData?.name || 'User'}!
            </Text>
          </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <Trophy size={24} color="#2563eb" />
                <Text style={styles.statValue}>
                  {stats.averageScore}%
                </Text>
              </View>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <BookOpen size={24} color="#2563eb" />
                <Text style={styles.statValue}>
                  {stats.lessonsCompleted}
                </Text>
              </View>
              <Text style={styles.statLabel}>Lessons Completed</Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <TrendingUp size={24} color="#2563eb" />
                <Text style={styles.statValue}>
                  {stats.totalSessions}
                </Text>
              </View>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
          </View>
        </View>

        {/* Team View Toggle */}
        {userData?.is_team_owner && (
          <TouchableOpacity
            onPress={() => setIsTeamView(!isTeamView)}
            style={styles.teamToggleButton}
          >
            <View style={styles.teamToggleContent}>
              <Users size={20} color="#2563eb" />
              <Text style={styles.teamToggleText}>
                Team View
              </Text>
            </View>
            <Text style={styles.teamToggleText}>
              {isTeamView ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Team Members Table */}
        {isTeamView && userData?.is_team_owner && (
          <View style={styles.teamCard}>
            <Text style={styles.teamCardTitle}>
              Team Performance
            </Text>
            <View style={styles.teamMembersList}>
              {teamMembers.map((member) => {
                const memberResults = member.lesson_results || [];
                const avgScore =
                  memberResults.length > 0
                    ? Math.round(
                        memberResults.reduce((sum, r) => sum + (r.score || 0), 0) /
                          memberResults.length
                      )
                    : 0;
                const completedLessons = new Set(memberResults.map((r) => r.lesson_id)).size;
                return (
                  <View
                    key={member.id}
                    style={styles.teamMemberItem}
                  >
                    <View style={styles.teamMemberInfo}>
                      <Text style={styles.teamMemberName}>
                        {member.name}
                      </Text>
                      <Text style={styles.teamMemberEmail}>{member.email}</Text>
                      <Text style={styles.teamMemberStats}>
                        {completedLessons} lesson{completedLessons !== 1 ? 's' : ''} completed
                      </Text>
                    </View>
                    <View style={styles.teamMemberScore}>
                      <Text style={styles.teamMemberScoreText}>
                        {avgScore}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Lessons')}
          style={styles.browseButton}
        >
          <Text style={styles.browseButtonText}>
            Browse Lessons
          </Text>
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
  content: {
    padding: 24,
    paddingTop: 32,
  },
  welcomeSection: {
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
    fontSize: 18,
    color: isDark ? '#cbd5e1' : '#4b5563',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCardWrapper: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  teamToggleButton: {
    backgroundColor: isDark ? '#1e293b' : '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamToggleText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  teamCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
  },
  teamCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 16,
  },
  teamMembersList: {
    marginTop: 8,
  },
  teamMemberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#e5e7eb',
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#111827',
    fontSize: 16,
    marginBottom: 4,
  },
  teamMemberEmail: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#4b5563',
    marginBottom: 4,
  },
  teamMemberStats: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#6b7280',
  },
  teamMemberScore: {
    alignItems: 'flex-end',
  },
  teamMemberScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  browseButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
