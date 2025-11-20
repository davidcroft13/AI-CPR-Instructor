import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Play, ArrowRight, Check, Zap, Users, Award, Brain, Shield, Clock, Target, MessageSquare, Sun, Moon } from 'lucide-react-native';
import { useHover } from '../hooks/useHover';

export default function Home() {
  const navigation = useNavigation();
  const { isDark, themePreference, toggleTheme } = useTheme();
  const styles = getStyles(isDark);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [hoveredOfferCard, setHoveredOfferCard] = useState(null);
  const [hoveredFeatureCard, setHoveredFeatureCard] = useState(null);
  const [signUpHovered, signUpHoverHandlers] = useHover();
  const [primaryHovered, primaryHoverHandlers] = useHover();
  const [secondaryHovered, secondaryHoverHandlers] = useHover();
  const [ctaHovered, ctaHoverHandlers] = useHover();
  const heroFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [heroFloat]);

  const heroVisualStyle = {
    transform: [
      {
        translateY: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        scale: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
  };

  const heroGlowOpacity = heroFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  const galleryImages = [
    'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
  ];

  const handlePlaySample = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement 11Labs voice sample playback
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
      >
              {/* Navigation Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.logo}>CPR AI Trainer</Text>
                  <View style={styles.headerButtons}>
                    <TouchableOpacity
                      onPress={() => toggleTheme(isDark ? 'light' : 'dark')}
                      style={styles.themeToggleButton}
                    >
                      {isDark ? (
                        <Sun size={20} color={isDark ? '#ffffff' : '#111827'} />
                      ) : (
                        <Moon size={20} color={isDark ? '#ffffff' : '#111827'} />
                      )}
                    </TouchableOpacity>
                    <View style={{ width: 12 }} />
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SignUp')}
                      style={[styles.signUpButton, signUpHovered && styles.buttonHoverElevated]}
                      {...signUpHoverHandlers}
                    >
                      <Text style={styles.signUpButtonText}>Get Started</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroBackdrop} />
        <Animated.View style={[styles.heroGlow, { opacity: heroGlowOpacity }]} />
        <View style={styles.heroContent}>
          <View style={styles.heroTextColumn}>
            <Text style={styles.heroEyebrow}>Immersive CPR Training Platform</Text>
            <Text style={styles.heroTitle}>
              Master CPR Through{'\n'}
              <Text style={styles.heroTitleAccent}>AI-Powered Voice Training</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Experience lifelike emergency scenarios with conversational AI. 
              Practice life-saving skills in a safe, realistic environment powered by advanced voice technology from 11Labs.
            </Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                style={[styles.primaryButton, primaryHovered && styles.buttonHoverElevated]}
                {...primaryHoverHandlers}
              >
                <Text style={styles.primaryButtonText}>Start Training</Text>
                <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
              <View style={{ width: 16 }} />
              <TouchableOpacity
                onPress={handlePlaySample}
                style={[styles.secondaryButton, secondaryHovered && styles.secondaryButtonHover]}
                {...secondaryHoverHandlers}
              >
                <Play size={20} color={isDark ? '#fff' : '#2563eb'} />
                <Text style={styles.secondaryButtonText}>Listen to Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Indicators */}
            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Check size={16} color={isDark ? '#10b981' : '#059669'} />
                <View style={{ width: 6 }} />
                <Text style={styles.trustText}>Secure payment via Stripe</Text>
              </View>
              <View style={{ width: 24 }} />
              <View style={styles.trustItem}>
                <Check size={16} color={isDark ? '#10b981' : '#059669'} />
                <View style={{ width: 6 }} />
                <Text style={styles.trustText}>Used by medical teams</Text>
              </View>
              <View style={{ width: 24 }} />
              <View style={styles.trustItem}>
                <Check size={16} color={isDark ? '#10b981' : '#059669'} />
                <View style={{ width: 6 }} />
                <Text style={styles.trustText}>Industry-leading AI technology</Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>40+</Text>
                <Text style={styles.heroStatLabel}>Interactive Scenarios</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>3 min</Text>
                <Text style={styles.heroStatLabel}>Average Feedback Time</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>11Labs</Text>
                <Text style={styles.heroStatLabel}>Voice Technology</Text>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.heroVisual, heroVisualStyle]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80' }}
              style={styles.heroImage}
            />
            <View style={styles.heroImageOverlay} />
            <Animated.View style={[styles.heroPulse, { opacity: heroGlowOpacity }]} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.heroGallery}>
        {galleryImages.map((uri) => (
          <View key={uri} style={styles.galleryCard}>
            <Image source={{ uri }} style={styles.galleryImage} />
            <View style={styles.galleryOverlay}>
              <Text style={styles.galleryText}>Live training snapshot</Text>
            </View>
          </View>
        ))}
      </View>

      {/* What We Offer Section */}
      <View style={styles.offerSection}>
        <Text style={styles.sectionTitle}>What We Offer</Text>
        <Text style={styles.sectionSubtitle}>
          Comprehensive CPR training platform with advanced AI conversation technology
        </Text>

        <View style={styles.offerGrid}>
          <TouchableOpacity
            style={[
              styles.offerCard,
              hoveredOfferCard === 'conversational' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredOfferCard('conversational')}
            onMouseLeave={() => setHoveredOfferCard(null)}
            onPress={() => setExpandedOffer(expandedOffer === 'conversational' ? null : 'conversational')}
          >
            <View style={styles.offerHeader}>
              <View style={styles.offerIcon}>
                <MessageSquare size={28} color="#2563eb" />
              </View>
              <View style={styles.offerTitleContainer}>
                <Text style={styles.offerTitle}>Conversational AI Training</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedOffer === 'conversational' ? '−' : '+'}</Text>
            </View>
            {expandedOffer === 'conversational' && (
              <Text style={styles.offerDescription}>
                Engage in realistic two-way conversations with our AI instructor. Practice your responses to emergency scenarios through natural voice or text interactions powered by 11Labs advanced voice technology.
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.offerCard,
              hoveredOfferCard === 'scenarios' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredOfferCard('scenarios')}
            onMouseLeave={() => setHoveredOfferCard(null)}
            onPress={() => setExpandedOffer(expandedOffer === 'scenarios' ? null : 'scenarios')}
          >
            <View style={styles.offerHeader}>
              <View style={styles.offerIcon}>
                <Target size={28} color="#2563eb" />
              </View>
              <View style={styles.offerTitleContainer}>
                <Text style={styles.offerTitle}>Multiple Training Scenarios</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedOffer === 'scenarios' ? '−' : '+'}</Text>
            </View>
            {expandedOffer === 'scenarios' && (
              <Text style={styles.offerDescription}>
                Access a comprehensive library of CPR scenarios ranging from basic adult CPR to advanced multi-victim emergencies. Each scenario is designed to test different aspects of your emergency response skills.
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.offerCard,
              hoveredOfferCard === 'voice' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredOfferCard('voice')}
            onMouseLeave={() => setHoveredOfferCard(null)}
            onPress={() => setExpandedOffer(expandedOffer === 'voice' ? null : 'voice')}
          >
            <View style={styles.offerHeader}>
              <View style={styles.offerIcon}>
                <Clock size={28} color="#2563eb" />
              </View>
              <View style={styles.offerTitleContainer}>
                <Text style={styles.offerTitle}>Voice Tone Options</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedOffer === 'voice' ? '−' : '+'}</Text>
            </View>
            {expandedOffer === 'voice' && (
              <Text style={styles.offerDescription}>
                Choose between guided and intense training modes. The guided tone provides supportive, step-by-step instruction, while the intense mode simulates high-pressure emergency situations for advanced training.
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.offerCard,
              hoveredOfferCard === 'analytics' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredOfferCard('analytics')}
            onMouseLeave={() => setHoveredOfferCard(null)}
            onPress={() => setExpandedOffer(expandedOffer === 'analytics' ? null : 'analytics')}
          >
            <View style={styles.offerHeader}>
              <View style={styles.offerIcon}>
                <Shield size={28} color="#2563eb" />
              </View>
              <View style={styles.offerTitleContainer}>
                <Text style={styles.offerTitle}>Performance Analytics</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedOffer === 'analytics' ? '−' : '+'}</Text>
            </View>
            {expandedOffer === 'analytics' && (
              <Text style={styles.offerDescription}>
                Receive detailed performance summaries after each training session. Track your scores, improvement over time, and identify areas that need more practice. All data is securely stored and accessible anytime.
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <Text style={styles.sectionSubtitle}>
          Everything you need to master CPR and emergency response
        </Text>

        <View style={styles.featuresGrid}>
          <TouchableOpacity
            style={[
              styles.featureCard,
              hoveredFeatureCard === 'ai' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredFeatureCard('ai')}
            onMouseLeave={() => setHoveredFeatureCard(null)}
            onPress={() => setExpandedFeature(expandedFeature === 'ai' ? null : 'ai')}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureIcon}>
                <Brain size={24} color="#2563eb" />
              </View>
              <View style={styles.featureTitleContainer}>
                <Text style={styles.featureTitle}>AI-Powered Scenarios</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedFeature === 'ai' ? '−' : '+'}</Text>
            </View>
            {expandedFeature === 'ai' && (
              <Text style={styles.featureDescription}>
                Realistic emergency situations generated by advanced AI. Respond naturally through voice or text and receive instant, contextual feedback based on your responses.
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.featureCard,
              hoveredFeatureCard === 'feedback' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredFeatureCard('feedback')}
            onMouseLeave={() => setHoveredFeatureCard(null)}
            onPress={() => setExpandedFeature(expandedFeature === 'feedback' ? null : 'feedback')}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureIcon}>
                <Zap size={24} color="#2563eb" />
              </View>
              <View style={styles.featureTitleContainer}>
                <Text style={styles.featureTitle}>Instant Feedback</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedFeature === 'feedback' ? '−' : '+'}</Text>
            </View>
            {expandedFeature === 'feedback' && (
              <Text style={styles.featureDescription}>
                Get detailed performance summaries and scores immediately after each session. Understand what you did well and where you can improve with specific, actionable recommendations.
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.featureCard,
              hoveredFeatureCard === 'team' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredFeatureCard('team')}
            onMouseLeave={() => setHoveredFeatureCard(null)}
            onPress={() => setExpandedFeature(expandedFeature === 'team' ? null : 'team')}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureIcon}>
                <Users size={24} color="#2563eb" />
              </View>
              <View style={styles.featureTitleContainer}>
                <Text style={styles.featureTitle}>Team Collaboration</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedFeature === 'team' ? '−' : '+'}</Text>
            </View>
            {expandedFeature === 'team' && (
              <Text style={styles.featureDescription}>
                Create teams, invite members, and track collective progress. Perfect for medical institutions, training programs, and organizations that need to monitor team-wide certification readiness.
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.featureCard,
              hoveredFeatureCard === 'certification' && styles.cardHover,
            ]}
            onMouseEnter={() => setHoveredFeatureCard('certification')}
            onMouseLeave={() => setHoveredFeatureCard(null)}
            onPress={() => setExpandedFeature(expandedFeature === 'certification' ? null : 'certification')}
          >
            <View style={styles.featureHeader}>
              <View style={styles.featureIcon}>
                <Award size={24} color="#2563eb" />
              </View>
              <View style={styles.featureTitleContainer}>
                <Text style={styles.featureTitle}>Certification Ready</Text>
              </View>
              <Text style={styles.expandIcon}>{expandedFeature === 'certification' ? '−' : '+'}</Text>
            </View>
            {expandedFeature === 'certification' && (
              <Text style={styles.featureDescription}>
                Practice scenarios aligned with official CPR guidelines and certification requirements. Prepare for certification exams with confidence using our comprehensive training platform.
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={{ width: 20 }} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Choose Your Scenario</Text>
              <Text style={styles.stepDescription}>
                Browse our library of CPR training scenarios. Select from beginner-level introductions to advanced multi-victim emergency situations. Each scenario is designed to test specific skills and knowledge areas.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={{ width: 20 }} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Practice with AI Instructor</Text>
              <Text style={styles.stepDescription}>
                Engage in realistic conversations with our AI-powered instructor. The system presents emergency scenarios, and you respond by describing your actions. Choose your preferred voice tone - guided for learning or intense for advanced pressure training.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={{ width: 20 }} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Receive Detailed Feedback</Text>
              <Text style={styles.stepDescription}>
                After completing each scenario, receive a comprehensive performance summary including your score, a detailed breakdown of your responses, and personalized recommendations for improvement. Track your progress over time.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pricing/CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Start Your CPR Training?</Text>
        <Text style={styles.ctaSubtitle}>
          Join medical professionals and students mastering life-saving skills with our AI-powered training platform
        </Text>
        <Text style={styles.pricingNote}>
          Secure payment processing via Stripe. Start your training today.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={[styles.ctaButton, ctaHovered && styles.ctaButtonHover]}
          {...ctaHoverHandlers}
        >
          <Text style={styles.ctaButtonText}>Get Started</Text>
          <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.footerLogo}>CPR AI Trainer</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <View style={{ width: 24 }} />
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <View style={{ width: 24 }} />
            <TouchableOpacity>
              <Text style={styles.footerLink}>Contact</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>
            © 2024 CPR AI Trainer. All rights reserved.
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  wrapper: {
    flex: 1,
    height: '100vh',
  },
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1e293b' : '#e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: isDark ? '#334155' : '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
  },
  signUpButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 120,
    backgroundColor: isDark ? '#020617' : '#f0f6ff',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackdrop: {
    position: 'absolute',
    top: -200,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: '#2563eb',
    opacity: 0.08,
  },
  heroGlow: {
    position: 'absolute',
    bottom: -150,
    right: -50,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: '#22d3ee',
  },
  heroContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  heroTextColumn: {
    flex: 1,
    zIndex: 2,
  },
  heroEyebrow: {
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '800',
    color: isDark ? '#ffffff' : '#111827',
    lineHeight: 64,
    marginBottom: 24,
    textAlign: 'left',
  },
  heroTitleAccent: {
    color: '#2563eb',
  },
  heroSubtitle: {
    fontSize: 20,
    color: isDark ? '#cbd5e1' : '#4b5563',
    lineHeight: 30,
    textAlign: 'left',
    marginBottom: 40,
  },
  heroButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
  },
  secondaryButtonHover: {
    transform: [{ translateY: -3 }],
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
  },
  secondaryButtonText: {
    color: isDark ? '#ffffff' : '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    color: isDark ? '#94a3b8' : '#6b7280',
    fontSize: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 32,
    gap: 16,
  },
  heroStatCard: {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderRadius: 16,
    padding: 16,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDark ? 0.4 : 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? '#1e293b' : '#e5e7eb',
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#e0f2fe' : '#0f172a',
  },
  heroStatLabel: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#475569',
    marginTop: 4,
  },
  heroVisual: {
    flex: 1,
    maxWidth: 480,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.1)',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 520,
    borderRadius: 28,
  },
  heroImageOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  heroPulse: {
    position: 'absolute',
    inset: 0,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.4)',
    borderRadius: 28,
  },
  heroGallery: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    flexWrap: 'wrap',
    gap: 16,
    marginTop: -60,
    marginBottom: 40,
  },
  galleryCard: {
    flexGrow: 1,
    flexBasis: '32%',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 140,
    maxHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  galleryText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  offerSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: isDark ? '#1e293b' : '#f9fafb',
  },
  sectionTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: isDark ? '#cbd5e1' : '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 700,
    alignSelf: 'center',
  },
  offerGrid: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  offerCard: {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    marginBottom: 16,
  },
  cardHover: {
    transform: [{ translateY: -4 }],
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: isDark ? '#1e293b' : '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  offerTitleContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#111827',
  },
  offerDescription: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    lineHeight: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#e5e7eb',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
  },
  featuresGrid: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  featureCard: {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e5e7eb',
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: isDark ? '#1e293b' : '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTitleContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#111827',
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: isDark ? '#cbd5e1' : '#4b5563',
    width: 32,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    lineHeight: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#e5e7eb',
  },
  howItWorksSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: isDark ? '#1e293b' : '#f9fafb',
  },
  stepsContainer: {
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: isDark ? '#cbd5e1' : '#4b5563',
    lineHeight: 24,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 100,
    backgroundColor: isDark ? '#0f172a' : '#2563eb',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  pricingNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  ctaButtonHover: {
    transform: [{ translateY: -4 }],
    backgroundColor: '#dbeafe',
  },
  ctaButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: isDark ? '#0f172a' : '#111827',
  },
  footerContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  footerLink: {
    color: '#9ca3af',
    fontSize: 14,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
  },
  buttonHoverElevated: {
    transform: [{ translateY: -4 }],
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
});
