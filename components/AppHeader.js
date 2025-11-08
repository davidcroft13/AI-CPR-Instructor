import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, BookOpen, Settings, Sun, Moon } from 'lucide-react-native';

export default function AppHeader() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark, themePreference, toggleTheme } = useTheme();
  const styles = getStyles(isDark);
  
  const currentRoute = route.name;

  const navItems = [
    { name: 'Dashboard', route: 'Dashboard', icon: BarChart3 },
    { name: 'Lessons', route: 'Lessons', icon: BookOpen },
    { name: 'Settings', route: 'Settings', icon: Settings },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.logo}>CPR AI Trainer</Text>
        
        <View style={styles.navContainer}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => navigation.navigate(item.route)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <Icon 
                  size={20} 
                  color={isActive 
                    ? '#2563eb' 
                    : (isDark ? '#94a3b8' : '#6b7280')} 
                />
                <Text style={[
                  styles.navText,
                  isActive && styles.navTextActive
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => toggleTheme(isDark ? 'light' : 'dark')}
          style={styles.themeButton}
        >
          {isDark ? (
            <Sun size={20} color={isDark ? '#fbbf24' : '#f59e0b'} />
          ) : (
            <Moon size={20} color={isDark ? '#cbd5e1' : '#4b5563'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDark) => StyleSheet.create({
  header: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#e5e7eb',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    letterSpacing: -0.5,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navItemActive: {
    backgroundColor: isDark ? '#0f172a' : '#eff6ff',
  },
  navText: {
    fontSize: 15,
    fontWeight: '500',
    color: isDark ? '#94a3b8' : '#6b7280',
    marginLeft: 8,
  },
  navTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

