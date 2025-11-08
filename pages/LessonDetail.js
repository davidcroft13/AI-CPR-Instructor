import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { startScenario, sendMessage } from '../lib/api';
import { ArrowLeft, Send, Play, Volume2 } from 'lucide-react-native';

export default function LessonDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const styles = getStyles(isDark);
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [tone, setTone] = useState('guided'); // 'guided' or 'intense'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadLesson();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    }
  };

  const handleStartScenario = async () => {
    setIsLoading(true);
    try {
      const response = await startScenario(lessonId, tone);
      setConversationId(response.conversation_id);
      
      // Play audio response if available
      if (response.audio_url) {
        playAudio(response.audio_url);
      }

      setMessages([
        {
          id: Date.now(),
          type: 'ai',
          text: response.message || 'Welcome to the CPR training scenario. Let\'s begin!',
          audioUrl: response.audio_url,
        },
      ]);
    } catch (error) {
      console.error('Error starting scenario:', error);
      // For now, show a mock response since 11Labs API might not be fully configured
      const mockConversationId = `conv_${Date.now()}`;
      setConversationId(mockConversationId);
      setMessages([
        {
          id: Date.now(),
          type: 'ai',
          text: 'Welcome to the CPR training scenario. Let\'s begin! You are responding to a medical emergency. What is your first action?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(conversationId, inputMessage);
      
      if (response.audio_url) {
        playAudio(response.audio_url);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          text: response.message || 'Continue...',
          audioUrl: response.audio_url,
        },
      ]);

      // Check if scenario is complete
      if (response.completed) {
        handleScenarioComplete(response.summary, response.score);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mock response for development
      const mockResponses = [
        'Good response. Continue with the next step.',
        'That\'s correct. What would you do next?',
        'Excellent. The scenario is progressing well.',
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          text: randomResponse,
        },
      ]);

      // Simulate completion after a few messages
      if (messages.length >= 3) {
        handleScenarioComplete(
          'You successfully completed the CPR training scenario. Good job on following proper procedures!',
          85
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl) => {
    // For web, use HTML5 Audio
    if (typeof window !== 'undefined' && window.Audio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Error playing audio');
      };

      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };

  const handleScenarioComplete = async (summary, score) => {
    try {
      // Save result to Supabase
      const { error } = await supabase.from('lesson_results').insert([
        {
          user_id: user.id,
          lesson_id: lessonId,
          summary: summary,
          score: score,
        },
      ]);

      if (error) {
        console.error('Error saving result:', error);
        // Check if it's a duplicate error (lesson already completed)
        if (error.code === '23505') {
          // Update existing result instead
          const { error: updateError } = await supabase
            .from('lesson_results')
            .update({ summary, score })
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      setResult({ summary, score });
      Alert.alert(
        'Scenario Complete!',
        `Your score: ${score}%\n\n${summary}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Lessons') }]
      );
    } catch (error) {
      console.error('Error saving result:', error);
      // Still show the result even if saving failed
      setResult({ summary, score });
      Alert.alert(
        'Scenario Complete!',
        `Your score: ${score}%\n\n${summary}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Lessons') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header for Lesson Detail */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDark ? '#cbd5e1' : '#374151'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {lesson?.title || 'Lesson'}
        </Text>
        <Text style={styles.headerDescription}>{lesson?.description}</Text>
      </View>

      {/* Tone Selector */}
      {!conversationId && (
        <View style={styles.toneSelector}>
          <Text style={styles.toneSelectorTitle}>
            Select Voice Tone
          </Text>
          <View style={styles.toneButtons}>
            <TouchableOpacity
              onPress={() => setTone('guided')}
              style={[
                styles.toneButton,
                tone === 'guided' && styles.toneButtonActive,
              ]}
            >
              <Text style={[
                styles.toneButtonText,
                tone === 'guided' && styles.toneButtonTextActive,
              ]}>
                Guided Tone
              </Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              onPress={() => setTone('intense')}
              style={[
                styles.toneButton,
                tone === 'intense' && styles.toneButtonActive,
              ]}
            >
              <Text style={[
                styles.toneButtonText,
                tone === 'intense' && styles.toneButtonTextActive,
              ]}>
                Intense Tone
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && !conversationId && (
          <View style={styles.startContainer}>
            <Text style={styles.startText}>
              Ready to start the scenario? Select a voice tone and click Start.
            </Text>
            <TouchableOpacity
              onPress={handleStartScenario}
              disabled={isLoading}
              style={[styles.startButton, isLoading && styles.startButtonDisabled]}
            >
              <Play size={20} color="white" />
              <Text style={styles.startButtonText}>
                {isLoading ? 'Starting...' : 'Start Scenario'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.messagesList}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.type === 'user' && styles.messageWrapperUser,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleAI,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.type === 'user' && styles.messageTextUser,
                ]}>
                  {message.text}
                </Text>
                {message.audioUrl && message.type === 'ai' && (
                  <TouchableOpacity
                    onPress={() => playAudio(message.audioUrl)}
                    style={styles.audioButton}
                  >
                    <Volume2 size={16} color={isDark ? '#94a3b8' : '#6b7280'} />
                    <Text style={styles.audioButtonText}>
                      Play Audio
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      {conversationId && !result && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your response..."
              placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
            >
              <Send
                size={20}
                color={inputMessage.trim() && !isLoading ? 'white' : (isDark ? '#475569' : '#9ca3af')}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Result Card */}
      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              Scenario Complete!
            </Text>
            <Text style={styles.resultScore}>
              Score: {result.score}%
            </Text>
            <Text style={styles.resultSummary}>{result.summary}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  header: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#e5e7eb',
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
  },
  toneSelector: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#e5e7eb',
  },
  toneSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#374151',
    marginBottom: 12,
  },
  toneButtons: {
    flexDirection: 'row',
  },
  toneButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    alignItems: 'center',
  },
  toneButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: isDark ? '#1e293b' : '#e0e7ff',
  },
  toneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#374151',
  },
  toneButtonTextActive: {
    color: '#2563eb',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 24,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  startText: {
    color: isDark ? '#cbd5e1' : '#4b5563',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  messagesList: {
    marginTop: 8,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 16,
  },
  messageBubbleUser: {
    backgroundColor: '#2563eb',
  },
  messageBubbleAI: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    color: isDark ? '#ffffff' : '#111827',
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  audioButtonText: {
    fontSize: 12,
    color: isDark ? '#94a3b8' : '#6b7280',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: isDark ? '#cbd5e1' : '#4b5563',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    color: isDark ? '#ffffff' : '#111827',
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#2563eb',
  },
  sendButtonDisabled: {
    backgroundColor: isDark ? '#334155' : '#e5e7eb',
  },
  resultContainer: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  resultCard: {
    backgroundColor: isDark ? '#0f172a' : '#e0e7ff',
    borderRadius: 16,
    padding: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 16,
  },
  resultSummary: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#374151',
    lineHeight: 24,
  },
});
