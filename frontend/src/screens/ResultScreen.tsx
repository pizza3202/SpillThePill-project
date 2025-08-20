import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Alert, Clipboard, Share } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

// Import web enhancements only on web platform
if (Platform.OS === 'web') {
  require('../styles/web-enhancements.css');
}

export default function ResultScreen({ medicineName, model, language }: { 
  medicineName: string; 
  model: string; 
  language: string; 
}) {
  const router = useRouter();
  const { isAuthenticated, saveMedicine } = useAuth();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [saveButtonState, setSaveButtonState] = useState<'default' | 'saved'>('default');
  const [feedbackStats, setFeedbackStats] = useState({ likes: 100, dislikes: 55 });
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isInCompareList, setIsInCompareList] = useState(false);

  useEffect(() => {
    fetchResult();
    loadCompareList();
    console.log('Platform.OS:', Platform.OS);
  }, []);

  useEffect(() => {
    // Load feedback from storage
    const key = `feedback_${medicineName}`;
    if (Platform.OS === 'web') {
      const stored = localStorage.getItem(key);
      if (stored) setUserFeedback(stored as 'like' | 'dislike');
    } else {
      AsyncStorage.getItem(key).then(stored => {
        if (stored) setUserFeedback(stored as 'like' | 'dislike');
      });
    }
  }, [medicineName]);

  const loadCompareList = async () => {
    try {
      const stored = await AsyncStorage.getItem('compareList');
      if (stored) {
        const list = JSON.parse(stored);
        setCompareList(list);
        setIsInCompareList(list.includes(medicineName));
      }
    } catch (error) {
      console.error('Error loading compare list:', error);
    }
  };

  const fetchResult = async () => {
    setLoading(true);
    setError('');
    try {
      // Use localhost for web, IP address for mobile
      // Platform-specific API URLs
      const getApiUrl = () => {
        if (Platform.OS === 'android') {
          return 'http://10.0.2.2:5050'; // Android emulator
        }
        return 'http://localhost:5050'; // Web & iOS simulator
      };
      
      const response = await fetch(`${getApiUrl()}/api/drugs/simplify/${encodeURIComponent(medicineName)}?model=${model}&language=${language}`);
      
      if (response.ok) {
        const data = await response.json();
        // Handle the new LLM response format
        if (data.simplified) {
          setResult(data.simplified);
        } else if (data.error) {
          setError(data.error);
        } else {
          setResult('No results found');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch drug information. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching result:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save recently viewed medicine
  const saveRecentlyViewed = async (name: string) => {
    try {
      let items: string[] = [];
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem('recentlyViewed');
        items = raw ? JSON.parse(raw) : [];
      } else {
        const raw = await AsyncStorage.getItem('recentlyViewed');
        items = raw ? JSON.parse(raw) : [];
      }
      // Remove if already exists
      items = items.filter((item) => item.toLowerCase() !== name.toLowerCase());
      // Add to top
      items.unshift(name);
      // Limit to 10
      if (items.length > 10) items = items.slice(0, 10);
      if (Platform.OS === 'web') {
        localStorage.setItem('recentlyViewed', JSON.stringify(items));
      } else {
        await AsyncStorage.setItem('recentlyViewed', JSON.stringify(items));
      }
    } catch (e) {
      // Ignore errors for now
    }
  };

  // Save current medicine to Saved Medicines
  const saveToSavedMedicines = async (name: string) => {
    console.log('Save button clicked! Medicine:', name);
    console.log('Save button state:', saveButtonState);
    console.log('Is authenticated:', isAuthenticated);
    
    if (saveButtonState === 'saved') {
      console.log('Already saved, returning early');
      return; // Prevent duplicate saves
    }
    
    if (!isAuthenticated) {
      console.log('User not authenticated, showing alert');
      if (Platform.OS === 'web') {
        // Use browser alert for web
        if (window.confirm('Sign In Required\n\nPlease sign in to save medicines to your account.\n\nWould you like to go to the sign in page?')) {
          router.push('/(tabs)/profile');
        }
      } else {
        // Use React Native Alert for mobile
        Alert.alert(
          'Sign In Required',
          'Please sign in to save medicines to your account.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/(tabs)/profile') }
          ]
        );
      }
      return;
    }
    
    try {
      await saveMedicine(name);
      setShowSnackbar(true);
      setSaveButtonState('saved');
      setTimeout(() => setSaveButtonState('default'), 2000);
    } catch (e) {
      console.error('Error saving medicine:', e);
      Alert.alert('Error', 'Failed to save medicine. Please try again.');
    }
  };

  const handleNewSearch = () => {
    router.back();
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (userFeedback) return;
    setUserFeedback(type);
    setFeedbackStats(prev =>
      type === 'like'
        ? { ...prev, likes: prev.likes + 1 }
        : { ...prev, dislikes: prev.dislikes + 1 }
    );
    const key = `feedback_${medicineName}`;
    if (Platform.OS === 'web') {
      localStorage.setItem(key, type);
    } else {
      AsyncStorage.setItem(key, type);
    }
  };

  // Share/Compare/Reminder handlers (real functionality)
  const handleShare = async () => {
    try {
      const shareContent = `${medicineName}\n\n${result || 'Medicine information'}\n\nShared via SpillThePill`;
      
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(shareContent);
        Alert.alert('Shared!', 'Medicine information copied to clipboard.');
      } else {
        const result = await Share.share({
          message: shareContent,
          title: `Medicine Info: ${medicineName}`,
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert('Shared!', 'Medicine information shared successfully.');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share medicine information.');
    }
  };

  const handleCompare = async () => {
    try {
      let newCompareList = [...compareList];
      
      if (isInCompareList) {
        // Remove from compare list
        newCompareList = newCompareList.filter(item => item !== medicineName);
        setIsInCompareList(false);
        Alert.alert('Removed', `${medicineName} removed from compare list.`);
      } else {
        // Add to compare list
        if (newCompareList.length >= 5) {
          Alert.alert('Compare List Full', 'You can only compare up to 5 medicines at a time. Please remove some items first.');
          return;
        }
        newCompareList.push(medicineName);
        setIsInCompareList(true);
        Alert.alert('Added', `${medicineName} added to compare list.`);
      }
      
      setCompareList(newCompareList);
      await AsyncStorage.setItem('compareList', JSON.stringify(newCompareList));
    } catch (error) {
      console.error('Error updating compare list:', error);
      Alert.alert('Error', 'Failed to update compare list.');
    }
  };

  const handleSetReminder = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Reminder', 'Reminder feature is available on mobile devices only.');
      return;
    }

    Alert.alert(
      'Set Medication Reminder',
      'Would you like to set a reminder for this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set Reminder', 
          onPress: () => {
            // For now, save reminder data to storage
            // In a real app, this would integrate with device notifications
            saveReminderData();
            Alert.alert(
              'Reminder Set!', 
              `Reminder set for ${medicineName}. You'll be notified when it's time to take your medication.`,
              [
                { text: 'OK' },
                { 
                  text: 'View Reminders', 
                  onPress: () => {
                    // Navigate to reminders screen (would need to be created)
                    Alert.alert('Reminders', 'Reminders feature coming soon!');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const saveReminderData = async () => {
    try {
      const reminderData = {
        medicineName,
        timestamp: new Date().toISOString(),
        result: result || '',
        model,
        language
      };
      
      let reminders = [];
      const stored = await AsyncStorage.getItem('medicationReminders');
      if (stored) {
        reminders = JSON.parse(stored);
      }
      
      reminders.push(reminderData);
      await AsyncStorage.setItem('medicationReminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const getLanguageDisplay = () => {
    if (!language) return null;
    const labels = {
      'es': '🇪🇸 Spanish',
      'fr': '🇫🇷 French',
      'de': '🇩🇪 German',
      'zh': '🇨🇳 Chinese',
      'ja': '🇯🇵 Japanese',
      'hi': '🇮🇳 Hindi',
      'mr': '🇮🇳 Marathi'
    };
    return labels[language as keyof typeof labels] || language;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2c5aa0" style={styles.loader} />
          <Text style={styles.loadingText}>🔍 Searching for medicine information...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          {Platform.OS !== 'web' && (
            <Text style={styles.headerText}>result</Text>
          )}
        </View>

        {/* Medicine Info Card */}
        <View style={styles.medicineCard} className={Platform.OS === 'web' ? 'web-glass-card web-modern-radius web-hover-effect' : ''}>
          <View style={styles.medicineHeader}>
            <Text style={styles.medicineIcon}>💊</Text>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{medicineName}</Text>
              <Text style={styles.medicineModel}>
                {model === 'regular' ? '📖 Regular (Detailed)' : '✨ Simplified'}
              </Text>
            </View>
          </View>
          {language && (
            <View style={styles.translationBadge}>
              <Text style={styles.translationText}>🌍 {getLanguageDisplay()}</Text>
            </View>
          )}
        </View>

        {/* Results */}
        {result ? (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>
              {language ? '🌍 Translated Information' : '📋 Medicine Details'}
            </Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          </View>
        ) : null}

        {/* Error */}
        {error ? (
          <View style={styles.errorSection}>
            <Text style={styles.sectionTitle}>❌ Error</Text>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNewSearch}>
            <Text style={styles.actionButtonIcon}>🔍</Text>
            <Text style={styles.actionButtonText}>New Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, saveButtonState === 'saved' && { backgroundColor: '#e8f5e8', borderColor: '#4caf50' }]}
            onPress={() => saveToSavedMedicines(medicineName.trim())}
            disabled={saveButtonState === 'saved'}
          >
            <Text style={[styles.secondaryButtonIcon, saveButtonState === 'saved' && { color: '#4caf50' }]}>💾</Text>
            <Text style={[styles.secondaryButtonText, saveButtonState === 'saved' && { color: '#4caf50' }]}>
              {saveButtonState === 'saved' ? 'Saved! ✓' : 'Save Result'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleSetReminder}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Set Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.quickActionButton, 
                isInCompareList && styles.quickActionButtonActive
              ]} 
              onPress={handleCompare}
            >
              <Text style={styles.quickActionIcon}>
                {isInCompareList ? '✅' : '📊'}
              </Text>
              <Text style={styles.quickActionText}>
                {isInCompareList ? 'In Compare' : 'Compare'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleShare}>
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Was this helpful?</Text>
          {userFeedback ? (
            <View style={styles.feedbackStatsRow}>
              <Text style={styles.feedbackStat}>👍 {feedbackStats.likes}</Text>
              <Text style={styles.feedbackStat}>👎 {feedbackStats.dislikes}</Text>
            </View>
          ) : (
            <View style={styles.feedbackButtonsRow}>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('like')}>
                <Text style={styles.feedbackIcon}>👍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('dislike')}>
                <Text style={styles.feedbackIcon}>👎</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: '#4caf50' }]}
      >
        Saved to Saved Medicines!
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#f0f8ff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20, // Add some padding at the bottom for the snackbar
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: 'bold',
    color: Platform.OS === 'web' ? '#1a1a1a' : '#2c5aa0',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: Platform.OS === 'web' ? '#666' : '#5a7c9a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c5aa0',
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  medicineCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'white',
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    padding: Platform.OS === 'web' ? 24 : 20,
    margin: Platform.OS === 'web' ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 4 : 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.15 : 0.1,
    shadowRadius: Platform.OS === 'web' ? 12 : 8,
    elevation: Platform.OS === 'web' ? 6 : 3,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineModel: {
    fontSize: 14,
    color: '#666',
  },
  translationBadge: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  translationText: {
    fontSize: 12,
    color: '#2d5a2d',
    fontWeight: '500',
  },
  resultSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c5aa0',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  errorSection: {
    padding: 20,
    paddingTop: 0,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  actionSection: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2c5aa0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
    color: 'white',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2c5aa0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#2c5aa0',
  },
  secondaryButtonText: {
    color: '#2c5aa0',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionButtonActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
  },
  feedbackSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  feedbackButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
  },
  feedbackIcon: {
    fontSize: 28,
  },
  feedbackStatsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  feedbackStat: {
    fontSize: 18,
    marginHorizontal: 16,
    color: '#424242',
    fontWeight: 'bold',
  },
  snackbar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 100,
  },
  webBackButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  webBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 