import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import { Trophy, BookOpen, TrendingUp, Users, ArrowRight } from 'lucide-react-native';
import { useHover } from '../hooks/useHover';

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
  const heroWave = useRef(new Animated.Value(0)).current;
  const statAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const [heroButtonHovered, heroButtonHoverHandlers] = useHover();
  const [browseHovered, browseHoverHandlers] = useHover();
  const [teamToggleHovered, teamToggleHoverHandlers] = useHover();

  const heroGlowStyle = useMemo(() => ({
    opacity: heroWave.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.65],
    }),
    transform: [
      {
        translateY: heroWave.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  }), [heroWave]);

  const statCardTransforms = useMemo(
    () =>
      statAnimations.map((anim) => ({
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      })),
    [statAnimations]
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(heroWave, {
        toValue: 1,
        duration: 5000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [heroWave]);

  useEffect(() => {
    statAnimations.forEach((anim) => anim.setValue(0));
    Animated.stagger(
      150,
      statAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        })
      )
    ).start();
  }, [stats.averageScore, stats.lessonsCompleted, stats.totalSessions]);

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

          <View style={styles.dashboardHero}>
            <Animated.View style={[styles.dashboardHeroGlow, heroGlowStyle]} />
            <View style={styles.dashboardHeroContent}>
              <View style={styles.dashboardHeroText}>
                <Text style={styles.heroLabel}>Live Practice Mode</Text>
                <Text style={styles.heroHeadline}>
                  Ready for your next immersive CPR scenario?
                </Text>
                <Text style={styles.heroDescription}>
                  Continue exactly where you left off and keep your streak alive. Each lesson adapts to your voice responses in real time.
                </Text>
                <View style={styles.heroChips}>
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipValue}>+12%</Text>
                    <Text style={styles.heroChipLabel}>Skill growth</Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipValue}>4 lessons</Text>
                    <Text style={styles.heroChipLabel}>In progress</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Lessons')}
                  style={[styles.heroActionButton, heroButtonHovered && styles.hoverLift]}
                  {...heroButtonHoverHandlers}
                >
                  <Text style={styles.heroActionText}>Resume training</Text>
                  <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
              <View style={styles.dashboardHeroVisual}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=900&q=80' }}
                  style={styles.dashboardHeroImage}
                />
                <View style={styles.dashboardHeroOverlay} />
              </View>
            </View>
          </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statCardWrapper, statCardTransforms[0]]}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <Trophy size={24} color="#2563eb" />
                <Text style={styles.statValue}>
                  {stats.averageScore}%
                </Text>
              </View>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.statCardWrapper, statCardTransforms[1]]}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <BookOpen size={24} color="#2563eb" />
                <Text style={styles.statValue}>
                  {stats.lessonsCompleted}
                </Text>
              </View>
              <Text style={styles.statLabel}>Lessons Completed</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.statCardWrapper, statCardTransforms[2]]}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <TrendingUp size={24} color="#2563eb" />
                <Text style={styles.statValue}>
                  {stats.totalSessions}
                </Text>
              </View>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
          </Animated.View>
        </View>

        {/* Team View Toggle */}
        {userData?.is_team_owner && (
          <TouchableOpacity
            onPress={() => setIsTeamView(!isTeamView)}
            style={[styles.teamToggleButton, teamToggleHovered && styles.cardHoverLift]}
            {...teamToggleHoverHandlers}
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
                const progressWidth = Math.min(Math.max(avgScore, 0), 100);
                const initials =
                  member?.name
                    ? member.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : (member.email || '?').slice(0, 2).toUpperCase();
                return (
                  <View
                    key={member.id}
                    style={styles.teamMemberItem}
                  >
                    <View style={styles.teamMemberLeft}>
                      <View style={styles.teamMemberAvatar}>
                        <Text style={styles.teamMemberInitial}>{initials}</Text>
                      </View>
                      <View style={styles.teamMemberInfo}>
                        <Text style={styles.teamMemberName}>
                          {member.name}
                        </Text>
                        <Text style={styles.teamMemberEmail}>{member.email}</Text>
                        <Text style={styles.teamMemberStats}>
                          {completedLessons} lesson{completedLessons !== 1 ? 's' : ''} completed
                        </Text>
                      </View>
                    </View>
                    <View style={styles.teamMemberScore}>
                      <Text style={styles.teamMemberScoreText}>
                        {avgScore}%
                      </Text>
                      <View style={styles.teamProgressBar}>
                        <View style={[styles.teamProgressFill, { width: `${progressWidth}%` }]} />
                      </View>
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
          style={[styles.browseButton, browseHovered && styles.hoverLift]}
          {...browseHoverHandlers}
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
  dashboardHero: {
    backgroundColor: isDark ? '#0f172a' : '#eef2ff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: isDark ? '#1f2a44' : '#c7d2fe',
    overflow: 'hidden',
  },
  dashboardHeroGlow: {
    position: 'absolute',
    right: 40,
    top: 20,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#60a5fa',
    opacity: 0.4,
  },
  dashboardHeroContent: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  dashboardHeroText: {
    flex: 1,
  },
  heroLabel: {
    color: '#38bdf8',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroHeadline: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#475569',
    marginBottom: 20,
    lineHeight: 22,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  heroChip: {
    backgroundColor: isDark ? '#172554' : '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: isDark ? '#1e3a8a' : '#e0e7ff',
  },
  heroChipValue: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#c7d2fe' : '#1d4ed8',
  },
  heroChipLabel: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#6b7280',
  },
  heroActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: 'flex-start',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  heroActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardHeroVisual: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },
  dashboardHeroImage: {
    width: '100%',
    height: 260,
  },
  dashboardHeroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
    marginBottom: 24,
  },
  statCardWrapper: {
    width: '33.33%',
    paddingHorizontal: 12,
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
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#c7d2fe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.3 : 0.12,
    shadowRadius: 16,
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
  teamMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: isDark ? '#1d4ed8' : '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  teamMemberInitial: {
    color: isDark ? '#e0f2fe' : '#1e3a8a',
    fontWeight: '700',
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
    minWidth: 140,
  },
  teamMemberScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  teamProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
    marginTop: 8,
  },
  teamProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22d3ee',
  },
  browseButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  hoverLift: {
    transform: [{ translateY: -4 }],
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  cardHoverLift: {
    transform: [{ translateY: -4 }],
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
});
