import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  ScrollView as RNScrollView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MobileHomeScreen() {
  const router = useRouter();
  const [medicineName, setMedicineName] = useState('');
  const [selectedModel, setSelectedModel] = useState<'regular' | 'simplified'>('simplified');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);
  
  // Modal states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const [browseModalVisible, setBrowseModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [recentlyViewedModalVisible, setRecentlyViewedModalVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Mock data for medicines and conditions
  const mockMedicines = [
    'Ibuprofen', 'Paracetamol', 'Aspirin', 'Cetirizine', 'Loratadine',
    'Omeprazole', 'Metformin', 'Amlodipine', 'Lisinopril', 'Atorvastatin',
    'Sertraline', 'Fluoxetine', 'Albuterol', 'Prednisone', 'Doxycycline',
    'Azithromycin', 'Ciprofloxacin', 'Metronidazole', 'Clindamycin', 'Amoxicillin'
  ];
  
  const mockConditions = [
    'Headache', 'Fever', 'Cough', 'Sore Throat', 'Allergies',
    'High Blood Pressure', 'Diabetes', 'Asthma', 'Depression', 'Anxiety',
    'Acid Reflux', 'Insomnia', 'Back Pain', 'Joint Pain', 'Skin Rash',
    'Ear Infection', 'Sinus Infection', 'Urinary Tract Infection', 'Pneumonia', 'Hypertension'
  ];

  // Load recently viewed on mount and when screen is focused
  const loadRecentlyViewed = async () => {
    try {
      const raw = await AsyncStorage.getItem('recentlyViewed');
      const items = raw ? JSON.parse(raw) : [];
      setRecentlyViewed(items);
    } catch (e) {
      setRecentlyViewed([]);
    }
  };

  const loadSavedMedicines = async () => {
    try {
      const raw = await AsyncStorage.getItem('savedMedicines');
      const items = raw ? JSON.parse(raw) : [];
      setSavedMedicines(items);
    } catch (e) {
      setSavedMedicines([]);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
    loadSavedMedicines();
  }, []);

  // Reload when HomeScreen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadRecentlyViewed();
      loadSavedMedicines();
    }, [])
  );

  const handleSearch = () => {
    if (medicineName.trim()) {
      router.push({
        pathname: '/result',
        params: {
          medicineName: medicineName.trim(),
          model: selectedModel,
          language: selectedLanguage,
        },
      });
    }
  };

  const handleMedicineSelect = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const showCategoryPicker = () => {
    setCategoryModalVisible(true);
  };

  const handleBrowseMedicines = () => setBrowseModalVisible(true);
  const handleByCondition = () => setConditionModalVisible(true);
  const handleLearnAboutPills = () => setLearnModalVisible(true);
  const handleAskPillBot = () => setChatModalVisible(true);

  const trendingMedicines = [
    { name: 'Ibuprofen', description: 'Pain relief' },
    { name: 'Paracetamol', description: 'Fever reducer' },
    { name: 'Aspirin', description: 'Blood thinner' },
    { name: 'Omeprazole', description: 'Acid reflux' },
  ];

  const handleTrendingClick = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      // Platform-specific API URLs for PillBot chat
      const getApiUrl = () => {
        if (Platform.OS === 'android') {
          return 'http://10.0.2.2:5050'; // Android emulator
        }
        return 'http://localhost:5050'; // Web & iOS simulator
      };
      
      const response = await fetch(`${getApiUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'bot', text: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not answer that.' }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not answer that.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleHistoryClick = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const tipOfTheDay = "Always consult your doctor before starting any new medication, even over-the-counter ones.";

  return (
    <SafeAreaView style={styles.container}>
      <RNScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>💊 SpillThePill</Text>
          <Text style={styles.subtitle}>Get simplified drug information with AI-powered insights</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchLabel}>🔍 Search Medicine</Text>
            
            {/* Category Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Category:</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={showCategoryPicker}
              >
                <View style={styles.dropdownButton}>
                  <Text style={styles.dropdownButtonText}>
                    {selectedCategory === 'all' ? '🔍 All' :
                     selectedCategory === 'medicines' ? '💊 Medicines' :
                     selectedCategory === 'conditions' ? '🩺 Conditions' : '🔍 All'}
                  </Text>
                  <Text style={styles.dropdownArrow}>🔽</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder={
                selectedCategory === 'medicines' ? "Search medicines..." :
                selectedCategory === 'conditions' ? "Search conditions..." :
                "Enter medicine name (e.g., Ibuprofen)"
              }
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Search Button */}
          <TouchableOpacity 
            style={[styles.searchButton, !medicineName.trim() && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!medicineName.trim()}
          >
            <Text style={styles.searchButtonIcon}>🔍</Text>
            <Text style={styles.searchButtonText}>Search Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Ask PillBot Section */}
        <View style={styles.askPillBotSection}>
          <Text style={styles.sectionTitle}>🤖 Ask PillBot</Text>
          <TouchableOpacity style={styles.askPillBotButton} onPress={handleAskPillBot}>
            <Text style={styles.askPillBotIcon}>🤖</Text>
            <Text style={styles.askPillBotText}>AI-powered medication assistant</Text>
            <Text style={styles.askPillBotSubtext}>Tap to start chatting</Text>
          </TouchableOpacity>
        </View>

        {/* Model Selection */}
        <View style={styles.modelSection}>
          <Text style={styles.sectionTitle}>📋 Choose Model</Text>
          <View style={styles.modelButtons}>
            <TouchableOpacity
              style={[
                styles.modelButton,
                selectedModel === 'regular' && styles.modelButtonActive
              ]}
              onPress={() => setSelectedModel('regular')}
            >
              <Text style={styles.modelButtonIcon}>📖</Text>
              <Text style={[
                styles.modelButtonText,
                selectedModel === 'regular' && styles.modelButtonTextActive
              ]}>
                Regular
              </Text>
              <Text style={styles.modelButtonSubtext}>Detailed info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modelButton,
                selectedModel === 'simplified' && styles.modelButtonActive
              ]}
              onPress={() => setSelectedModel('simplified')}
            >
              <Text style={styles.modelButtonIcon}>✨</Text>
              <Text style={[
                styles.modelButtonText,
                selectedModel === 'simplified' && styles.modelButtonTextActive
              ]}>
                Simplified
              </Text>
              <Text style={styles.modelButtonSubtext}>Easy to understand</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>🌍 Translation</Text>
          
          {/* Simple Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setLanguageDropdownVisible(!languageDropdownVisible)}
          >
            <View style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>
                {selectedLanguage === 'English' ? '🇺🇸 English' :
                 selectedLanguage === 'Spanish' ? '🇪🇸 Spanish' :
                 selectedLanguage === 'French' ? '🇫🇷 French' :
                 selectedLanguage === 'German' ? '🇩🇪 German' :
                 selectedLanguage === 'Italian' ? '🇮🇹 Italian' :
                 selectedLanguage === 'Portuguese' ? '🇵🇹 Portuguese' :
                 selectedLanguage === 'Russian' ? '🇷🇺 Russian' :
                 selectedLanguage === 'Chinese' ? '🇨🇳 Chinese' :
                 selectedLanguage === 'Japanese' ? '🇯🇵 Japanese' :
                 selectedLanguage === 'Korean' ? '🇰🇷 Korean' :
                 selectedLanguage === 'Hindi' ? '🇮🇳 Hindi' :
                 selectedLanguage === 'Arabic' ? '🇸🇦 Arabic' :
                 selectedLanguage === 'Turkish' ? '🇹🇷 Turkish' :
                 selectedLanguage === 'Dutch' ? '🇳🇱 Dutch' :
                 selectedLanguage === 'Swedish' ? '🇸🇪 Swedish' :
                 selectedLanguage === 'Norwegian' ? '🇳🇴 Norwegian' :
                 selectedLanguage === 'Danish' ? '🇩🇰 Danish' :
                 selectedLanguage === 'Finnish' ? '🇫🇮 Finnish' :
                 selectedLanguage === 'Polish' ? '🇵🇱 Polish' :
                 selectedLanguage === 'Czech' ? '🇨🇿 Czech' :
                 selectedLanguage === 'Hungarian' ? '🇭🇺 Hungarian' :
                 selectedLanguage === 'Romanian' ? '🇷🇴 Romanian' :
                 selectedLanguage === 'Bulgarian' ? '🇧🇬 Bulgarian' :
                 selectedLanguage === 'Greek' ? '🇬🇷 Greek' :
                 selectedLanguage === 'Hebrew' ? '🇮🇱 Hebrew' :
                 selectedLanguage === 'Thai' ? '🇹🇭 Thai' :
                 selectedLanguage === 'Vietnamese' ? '🇻🇳 Vietnamese' :
                 selectedLanguage === 'Indonesian' ? '🇮🇩 Indonesian' :
                 selectedLanguage === 'Malay' ? '🇲🇾 Malay' :
                 selectedLanguage === 'Filipino' ? '🇵🇭 Filipino' :
                 selectedLanguage === 'Bengali' ? '🇧🇩 Bengali' :
                 selectedLanguage === 'Urdu' ? '🇵🇰 Urdu' :
                 selectedLanguage === 'Persian' ? '🇮🇷 Persian' :
                 selectedLanguage === 'Ukrainian' ? '🇺🇦 Ukrainian' :
                 selectedLanguage === 'Belarusian' ? '🇧🇾 Belarusian' :
                 selectedLanguage === 'Serbian' ? '🇷🇸 Serbian' :
                 selectedLanguage === 'Croatian' ? '🇭🇷 Croatian' :
                 selectedLanguage === 'Slovenian' ? '🇸🇮 Slovenian' :
                 selectedLanguage === 'Slovak' ? '🇸🇰 Slovak' :
                 selectedLanguage === 'Lithuanian' ? '🇱🇹 Lithuanian' :
                 selectedLanguage === 'Latvian' ? '🇱🇻 Latvian' :
                 selectedLanguage === 'Estonian' ? '🇪🇪 Estonian' :
                 selectedLanguage === 'Icelandic' ? '🇮🇸 Icelandic' :
                 selectedLanguage === 'Maltese' ? '🇲🇹 Maltese' :
                 selectedLanguage === 'Georgian' ? '🇬🇪 Georgian' :
                 selectedLanguage === 'Armenian' ? '🇦🇲 Armenian' :
                 selectedLanguage === 'Azerbaijani' ? '🇦🇿 Azerbaijani' :
                 selectedLanguage === 'Kazakh' ? '🇰🇿 Kazakh' :
                 selectedLanguage === 'Uzbek' ? '🇺🇿 Uzbek' :
                 selectedLanguage === 'Kyrgyz' ? '🇰🇬 Kyrgyz' :
                 selectedLanguage === 'Tajik' ? '🇹🇯 Tajik' :
                 selectedLanguage === 'Turkmen' ? '🇹🇲 Turkmen' :
                 selectedLanguage === 'Mongolian' ? '🇲🇳 Mongolian' :
                 selectedLanguage === 'Nepali' ? '🇳🇵 Nepali' :
                 selectedLanguage === 'Sinhala' ? '🇱🇰 Sinhala' :
                 selectedLanguage === 'Khmer' ? '🇰🇭 Khmer' :
                 selectedLanguage === 'Lao' ? '🇱🇦 Lao' :
                 selectedLanguage === 'Burmese' ? '🇲🇲 Burmese' :
                 selectedLanguage === 'Amharic' ? '🇪🇹 Amharic' :
                 selectedLanguage === 'Swahili' ? '🇹🇿 Swahili' :
                 selectedLanguage === 'Yoruba' ? '🇳🇬 Yoruba' :
                 selectedLanguage === 'Zulu' ? '🇿🇦 Zulu' :
                 selectedLanguage === 'Afrikaans' ? '🇿🇦 Afrikaans' :
                 selectedLanguage === 'Albanian' ? '🇦🇱 Albanian' :
                 selectedLanguage === 'Macedonian' ? '🇲🇰 Macedonian' :
                 selectedLanguage === 'Bosnian' ? '🇧🇦 Bosnian' :
                 selectedLanguage === 'Montenegrin' ? '🇲🇪 Montenegrin' :
                 selectedLanguage === 'Kosovo' ? '🇽🇰 Kosovo' : '🇺🇸 English'}
              </Text>
              <Text style={styles.dropdownArrow}>🔽</Text>
            </View>
          </TouchableOpacity>

          {/* Simple Dropdown Options */}
          {languageDropdownVisible && (
            <View style={styles.dropdownOptions}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('English');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇺🇸 English</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Spanish');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇪🇸 Spanish</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('French');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇫🇷 French</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('German');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇩🇪 German</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Italian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇹 Italian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Portuguese');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇵🇹 Portuguese</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Russian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇷🇺 Russian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Chinese');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇨🇳 Chinese</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Japanese');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇯🇵 Japanese</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Korean');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇰🇷 Korean</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Hindi');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇳 Hindi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Marathi');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇳 Marathi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Arabic');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇸🇦 Arabic</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Turkish');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇹🇷 Turkish</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Dutch');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇳🇱 Dutch</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Swedish');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇸🇪 Swedish</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Norwegian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇳🇴 Norwegian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Danish');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇩🇰 Danish</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Finnish');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇫🇮 Finnish</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Polish');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇵🇱 Polish</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Czech');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇨🇿 Czech</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Hungarian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇭🇺 Hungarian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Romanian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇷🇴 Romanian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Bulgarian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇧🇬 Bulgarian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Greek');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇬🇷 Greek</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Hebrew');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇱 Hebrew</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Thai');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇹🇭 Thai</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Vietnamese');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇻🇳 Vietnamese</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Indonesian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇩 Indonesian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Malay');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇲🇾 Malay</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Filipino');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇵🇭 Filipino</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Bengali');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇧🇩 Bengali</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Urdu');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇵🇰 Urdu</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Persian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇷 Persian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Ukrainian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇺🇦 Ukrainian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Belarusian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇧🇾 Belarusian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Serbian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇷🇸 Serbian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Croatian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇭🇷 Croatian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Slovenian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇸🇮 Slovenian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Slovak');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇸🇰 Slovak</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Lithuanian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇱🇹 Lithuanian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Latvian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇱🇻 Latvian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Estonian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇪🇪 Estonian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Icelandic');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇮🇸 Icelandic</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Maltese');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇲🇹 Maltese</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Georgian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇬🇪 Georgian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Armenian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇦🇲 Armenian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Azerbaijani');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇦🇿 Azerbaijani</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Kazakh');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇰🇿 Kazakh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Uzbek');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇺🇿 Uzbek</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Kyrgyz');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇰🇬 Kyrgyz</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Tajik');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇹🇯 Tajik</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Turkmen');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇹🇲 Turkmen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Mongolian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇲🇳 Mongolian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Nepali');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇳🇵 Nepali</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Sinhala');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇱🇰 Sinhala</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Khmer');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇰🇭 Khmer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Lao');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇱🇦 Lao</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Burmese');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇲🇲 Burmese</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Amharic');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇪🇹 Amharic</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Swahili');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇹🇿 Swahili</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Yoruba');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇳🇬 Yoruba</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Zulu');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇿🇦 Zulu</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Afrikaans');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇿🇦 Afrikaans</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Albanian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇦🇱 Albanian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Macedonian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇲🇰 Macedonian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Bosnian');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇧🇦 Bosnian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Montenegrin');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇲🇪 Montenegrin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedLanguage('Kosovo');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>🇽🇰 Kosovo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Trending Section */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          <View style={styles.trendingList}>
            {trendingMedicines.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendingItem}
                onPress={() => handleTrendingClick(item.name)}
              >
                <Text style={styles.trendingIcon}>💊</Text>
                <Text style={styles.trendingText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tip of the Day */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>💡 Tip of the Day</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>{tipOfTheDay}</Text>
          </View>
        </View>
      </RNScrollView>

      {/* Modals */}
      <BrowseMedicinesModal 
        visible={browseModalVisible} 
        onClose={() => setBrowseModalVisible(false)}
        onMedicineSelect={handleMedicineSelect}
      />
      <ByConditionModal 
        visible={conditionModalVisible} 
        onClose={() => setConditionModalVisible(false)}
        onMedicineSelect={handleMedicineSelect}
      />
      <LearnAboutPillsModal 
        visible={learnModalVisible} 
        onClose={() => setLearnModalVisible(false)} 
      />
      <AskPillBotModal 
        visible={chatModalVisible} 
        onClose={() => setChatModalVisible(false)} 
      />
      <RecentlyViewedModal 
        visible={recentlyViewedModalVisible} 
        onClose={() => setRecentlyViewedModalVisible(false)}
        recentlyViewed={recentlyViewed}
        onMedicineSelect={handleMedicineSelect}
      />

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Choose search category:</Text>
              <View style={styles.categoryGrid}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    selectedCategory === 'all' && styles.selectedCategoryOption
                  ]}
                  onPress={() => {
                    setSelectedCategory('all');
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>🔍</Text>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === 'all' && styles.selectedCategoryName
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    selectedCategory === 'medicines' && styles.selectedCategoryOption
                  ]}
                  onPress={() => {
                    setSelectedCategory('medicines');
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>💊</Text>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === 'medicines' && styles.selectedCategoryName
                  ]}>
                    Medicines
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    selectedCategory === 'conditions' && styles.selectedCategoryOption
                  ]}
                  onPress={() => {
                    setSelectedCategory('conditions');
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>🩺</Text>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === 'conditions' && styles.selectedCategoryName
                  ]}>
                    Conditions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Modal Components
const BrowseMedicinesModal = ({ visible, onClose, onMedicineSelect }: { 
  visible: boolean; 
  onClose: () => void;
  onMedicineSelect: (medicine: string) => void;
}) => {
  const mockMedicines = [
    'Ibuprofen', 'Paracetamol', 'Aspirin', 'Amoxicillin', 'Omeprazole',
    'Metformin', 'Lisinopril', 'Atorvastatin', 'Amlodipine', 'Losartan'
  ];

  const handleMedicineSelect = (medicine: string) => {
    onMedicineSelect(medicine);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💊 Browse Medicines</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <RNScrollView style={styles.modalScrollView}>
            <Text style={styles.modalSubtitle}>Popular medicines you can search:</Text>
            {mockMedicines.map((medicine, index) => (
              <TouchableOpacity
                key={index}
                style={styles.clickableMedicineItem}
                onPress={() => handleMedicineSelect(medicine)}
              >
                <Text style={styles.medicineItemText}>💊 {medicine}</Text>
                <Text style={styles.medicineItemHint}>Tap to search</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.modalTip}>💡 Tip: Tap any medicine above to search for detailed information!</Text>
          </RNScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ByConditionModal = ({ visible, onClose, onMedicineSelect }: { 
  visible: boolean; 
  onClose: () => void;
  onMedicineSelect: (medicine: string) => void;
}) => {
  const conditions = [
    { name: 'Fever', medicines: ['Paracetamol', 'Ibuprofen'] },
    { name: 'Pain', medicines: ['Ibuprofen', 'Aspirin', 'Paracetamol'] },
    { name: 'Infection', medicines: ['Amoxicillin', 'Azithromycin'] },
    { name: 'Heartburn', medicines: ['Omeprazole', 'Ranitidine'] },
    { name: 'Diabetes', medicines: ['Metformin', 'Insulin'] },
    { name: 'High Blood Pressure', medicines: ['Lisinopril', 'Amlodipine'] },
  ];

  const handleMedicineSelect = (medicine: string) => {
    onMedicineSelect(medicine);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🩺 Browse by Condition</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <RNScrollView style={styles.modalScrollView}>
            <Text style={styles.modalSubtitle}>Select a condition to see recommended medicines:</Text>
            {conditions.map((condition, index) => (
              <View key={index} style={styles.conditionItem}>
                <Text style={styles.conditionName}>🩺 {condition.name}</Text>
                <Text style={styles.conditionMedicines}>
                  💊 {condition.medicines.join(', ')}
                </Text>
                <TouchableOpacity
                  style={styles.conditionButton}
                  onPress={() => handleMedicineSelect(condition.medicines[0])}
                >
                  <Text style={styles.conditionButtonText}>Search {condition.medicines[0]}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <Text style={styles.modalTip}>💡 Tip: Tap any condition above to search for the first recommended medicine!</Text>
          </RNScrollView>
        </View>
      </View>
    </Modal>
  );
};

const LearnAboutPillsModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📚 Learn About Pills</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              📖 This feature will help you understand:
              {'\n\n'}• How different medicines work
              {'\n'}• Common side effects
              {'\n'}• Drug interactions
              {'\n'}• Proper dosage information
              {'\n\n'}Coming soon! 🚀
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AskPillBotModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      // Platform-specific API URLs for PillBot chat
      const getApiUrl = () => {
        if (Platform.OS === 'android') {
          return 'http://10.0.2.2:5050'; // Android emulator
        }
        return 'http://localhost:5050'; // Web & iOS simulator
      };
      
      const response = await fetch(`${getApiUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'bot', text: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not answer that.' }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not answer that.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: 500, width: '95%' }]}> 
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🤖 Ask PillBot</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.modalBody, { height: 350 }]}> 
            <RNScrollView
              ref={chatScrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 10 }}
              onContentSizeChange={() => {
                if (chatScrollRef.current) {
                  (chatScrollRef.current as any).scrollToEnd({ animated: true });
                }
              }}
            >
              {chatHistory.length === 0 && (
                <Text style={{ color: '#888', fontStyle: 'italic', marginBottom: 10 }}>
                  Ask me anything about medicines!
                </Text>
              )}
              {chatHistory.map((msg, idx) => (
                <View key={idx} style={{ marginBottom: 10, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <View style={{ backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f0f0f0', borderRadius: 12, padding: 10 }}>
                    <Text style={{ color: '#333' }}>{msg.text}</Text>
                  </View>
                </View>
              ))}
              {isChatLoading && (
                <Text style={{ color: '#B3EBF2', fontStyle: 'italic' }}>PillBot is typing...</Text>
              )}
            </RNScrollView>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, marginRight: 8 }}
                placeholder="Type your question..."
                value={chatInput}
                onChangeText={setChatInput}
                editable={!isChatLoading}
              />
              <TouchableOpacity
                style={{ backgroundColor: '#B3EBF2', borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center' }}
                onPress={sendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RecentlyViewedModal = ({ 
  visible, 
  onClose, 
  recentlyViewed, 
  onMedicineSelect 
}: { 
  visible: boolean; 
  onClose: () => void;
  recentlyViewed: string[];
  onMedicineSelect: (medicine: string) => void;
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📖 Recently Viewed</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {recentlyViewed.length === 0 ? (
              <Text style={styles.modalText}>No recently viewed medicines yet. Start searching to see them here!</Text>
            ) : (
              <View>
                <Text style={styles.modalSubtitle}>Your recently searched medicines:</Text>
                {recentlyViewed.map((medicine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.clickableMedicineItem}
                    onPress={() => onMedicineSelect(medicine)}
                  >
                    <Text style={styles.medicineItemText}>💊 {medicine}</Text>
                    <Text style={styles.medicineItemHint}>Tap to search again</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#B3EBF2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
  searchSection: {
    marginBottom: 25,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  searchButton: {
    backgroundColor: '#B3EBF2',
    borderRadius: 12,
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
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickAccessSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  modelSection: {
    marginBottom: 25,
  },
  modelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modelButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modelButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#B3EBF2',
    borderWidth: 2,
  },
  modelButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  modelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modelButtonTextActive: {
    color: '#B3EBF2',
  },
  modelButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  languageSection: {
    marginBottom: 25,
  },
  languageButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageButtonText: {
    fontSize: 16,
    color: '#333',
  },
  languageButtonIcon: {
    fontSize: 16,
    color: '#666',
  },
  trendingSection: {
    marginBottom: 25,
  },
  trendingList: {
    gap: 8,
  },
  trendingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  trendingText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  tipSection: {
    marginBottom: 25,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Added padding to ensure modal doesn't touch edges
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 500,
    width: '90%',
    maxHeight: '90%', // Increased from 80% to 90%
    minHeight: 400, // Added minimum height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalBody: {
    flex: 1,
    minHeight: 300, // Added minimum height for body
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  modalScrollView: {
    flex: 1,
    minHeight: 300, // Added minimum height for scroll view
  },
  clickableMedicineItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  medicineItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  medicineItemHint: {
    fontSize: 12,
    color: '#666',
  },
  modalTip: {
    fontSize: 14,
    color: '#B3EBF2',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  conditionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conditionMedicines: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  conditionButton: {
    backgroundColor: '#B3EBF2',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  selectedLanguageOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#B3EBF2',
  },
  languageFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  selectedLanguageName: {
    color: '#B3EBF2',
    fontWeight: '500',
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 2,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  selectedCategoryOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#B3EBF2',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#B3EBF2',
    fontWeight: '500',
  },
  picker: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: 'white',
    color: '#333',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  askPillBotSection: {
    marginBottom: 25,
  },
  askPillBotButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  askPillBotIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  askPillBotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  askPillBotSubtext: {
    fontSize: 12,
    color: '#666',
  },
  simpleLanguageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  selectedSimpleLanguageOption: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#B3EBF2',
  },
  simpleLanguageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  simpleLanguageName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
}); 