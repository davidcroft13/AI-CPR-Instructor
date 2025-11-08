import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import { CheckCircle, Circle } from 'lucide-react-native';

export default function Lessons() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLessons();
  }, [user]);

  const loadLessons = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Get completed lessons
      const { data: results, error: resultsError } = await supabase
        .from('lesson_results')
        .select('lesson_id')
        .eq('user_id', user.id);

      if (resultsError) throw resultsError;
      setCompletedLessons(
        new Set((results || []).map((r) => r.lesson_id))
      );
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLessons();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return { bg: isDark ? '#064e3b' : '#d1fae5', text: isDark ? '#6ee7b7' : '#065f46' };
      case 'intermediate':
        return { bg: isDark ? '#78350f' : '#fef3c7', text: isDark ? '#fcd34d' : '#92400e' };
      case 'advanced':
        return { bg: isDark ? '#7f1d1d' : '#fee2e2', text: isDark ? '#fca5a5' : '#991b1b' };
      default:
        return { bg: isDark ? '#1e293b' : '#f3f4f6', text: isDark ? '#cbd5e1' : '#4b5563' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

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
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Lessons
            </Text>
            <Text style={styles.subtitle}>
              Practice CPR scenarios with AI-powered training
            </Text>
          </View>

        <View style={styles.lessonsList}>
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.has(lesson.id);
            const difficultyColors = getDifficultyColor(lesson.difficulty);
            return (
              <TouchableOpacity
                key={lesson.id}
                onPress={() =>
                  navigation.navigate('LessonDetail', { lessonId: lesson.id })
                }
                style={styles.lessonCard}
              >
                <View style={styles.lessonCardHeader}>
                  <View style={styles.lessonCardContent}>
                    <Text style={styles.lessonTitle}>
                      {lesson.title}
                    </Text>
                    <Text style={styles.lessonDescription}>
                      {lesson.description}
                    </Text>
                  </View>
                  {isCompleted ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <Circle size={24} color={isDark ? '#475569' : '#9ca3af'} />
                  )}
                </View>

                <View style={styles.lessonCardFooter}>
                  <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors.bg }]}>
                    <Text style={[styles.difficultyText, { color: difficultyColors.text }]}>
                      {lesson.difficulty || 'Beginner'}
                    </Text>
                  </View>
                  {isCompleted && (
                    <Text style={styles.completedText}>
                      Completed
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {lessons.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No lessons available yet. Check back soon!
              </Text>
            </View>
          )}
        </View>
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
    color: isDark ? '#cbd5e1' : '#4b5563',
    fontSize: 16,
  },
  content: {
    padding: 24,
    paddingTop: 32,
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
  lessonsList: {
    marginTop: 8,
  },
  lessonCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lessonCardContent: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    lineHeight: 22,
  },
  lessonCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  emptyState: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
  },
  emptyStateText: {
    color: isDark ? '#cbd5e1' : '#4b5563',
    fontSize: 16,
    textAlign: 'center',
  },
});
