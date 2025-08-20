import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function WebHomeScreen() {
  const router = useRouter();
  const { isAuthenticated, getSavedMedicines, removeSavedMedicine, login, logout, user } = useAuth();
  const [medicineName, setMedicineName] = useState('');
  const [selectedModel, setSelectedModel] = useState<'regular' | 'simplified'>('simplified');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);
  const [showAllSaved, setShowAllSaved] = useState(false);
  
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

  // Trending medicines for the sidebar
  const trendingMedicines = mockMedicines.slice(0, 5);

  // Modal states
  const [browseModalVisible, setBrowseModalVisible] = useState(false);
  const [conditionModalVisible, setConditionModalVisible] = useState(false);
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [pillBotModalVisible, setPillBotModalVisible] = useState(false);
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load saved medicines on component mount
  useEffect(() => {
    const loadSavedMedicines = async () => {
      if (isAuthenticated) {
        try {
          const medicines = await getSavedMedicines();
          setSavedMedicines(medicines);
        } catch (error) {
          console.error('Error loading saved medicines:', error);
        }
      } else {
        setSavedMedicines([]);
      }
    };

    loadSavedMedicines();
  }, [isAuthenticated, getSavedMedicines]);

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

  const handleSavedMedicineClick = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const handleDeleteSavedMedicine = async (medicineToDelete: string) => {
    try {
      await removeSavedMedicine(medicineToDelete);
      const updatedMedicines = savedMedicines.filter(medicine => medicine !== medicineToDelete);
      setSavedMedicines(updatedMedicines);
    } catch (error) {
      console.error('Error deleting saved medicine:', error);
    }
  };

  const handleMedicineSelect = (medicine: string) => {
    setMedicineName(medicine);
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const handleBrowseMedicines = () => {
    setSelectedCategory('medicines');
    setBrowseModalVisible(true);
  };

  const handleByCondition = () => {
    setSelectedCategory('conditions');
    setConditionModalVisible(true);
  };

  const handleLearnAboutPills = () => {
    setLearnModalVisible(true);
  };

  const handleAskPillBot = () => {
    setChatModalVisible(true);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const botMessage = data.response;
        setChatHistory(prev => [...prev, { role: 'bot', text: botMessage }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not answer that. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not answer that. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const tipOfTheDay = "Always consult your doctor before starting any new medication, even over-the-counter ones.";

  return (
    <div style={{
      background: '#E0F7FA', // Page Background
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: '#424242', // Main text color
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(179, 235, 242, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            💊 SpillThePill
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#757575', // Sub text color
            margin: '0',
            textShadow: '0 1px 2px rgba(179, 235, 242, 0.2)',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Get simplified drug information with AI-powered insights
          </p>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
          {/* Left Side - Search */}
          <div style={{ flex: 1 }}>
            {/* Search Section */}
            <div style={{
              background: '#F8FFFF', // subtle blue-white
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(179, 235, 242, 0.15)',
              border: '1px solid rgba(179, 235, 242, 0.3)',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#757575', // instead of black
                margin: '0 0 1.5rem 0',
                textAlign: 'center'
              }}>
                🔍 Search Medicine
              </h2>

              {/* Search Input and Dropdown */}
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e1e5e9',
                    fontSize: '16px',
                    minWidth: '160px',
                    flexShrink: 0,
                    background: '#f8f9fa'
                  }}
                >
                  <option value="all">🔍 All</option>
                  <option value="medicines">💊 Medicines</option>
                  <option value="conditions">🩺 Conditions</option>
                </select>

                <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder={
                      selectedCategory === 'medicines' ? "Search medicines..." :
                      selectedCategory === 'conditions' ? "Search conditions..." :
                      "Enter medicine name (e.g., Ibuprofen)"
                    }
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      paddingRight: '0px',
                      borderRadius: '12px',
                      border: '1px solid #e1e5e9',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!medicineName.trim()}
                    style={{
                      position: 'absolute',
                      right: '0px',
                      top: '0px',
                      height: '100%',
                      width: '100px',
                      background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)', // Button gradient
                      border: 'none',
                      borderRadius: '0 12px 12px 0',
                      color: '#424242', // Button text color
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <button
                    onClick={() => setSelectedModel('simplified')}
                    style={{
                      padding: '1rem 2.5rem',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: selectedModel === 'simplified' 
                        ? '#FDC5DC' // Button: Simplified
                        : '#f8f9fa',
                      color: selectedModel === 'simplified' ? '#424242' : '#333', // Button text color
                      border: selectedModel === 'simplified' ? 'none' : '1px solid #e1e5e9',
                      minWidth: '140px'
                    }}
                  >
                    🧠 Simplified
                  </button>
                  <button
                    onClick={() => setSelectedModel('regular')}
                    style={{
                      padding: '1rem 2.5rem',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: selectedModel === 'regular' 
                        ? '#C8E6C9' // Button: Detailed
                        : '#f8f9fa',
                      color: selectedModel === 'regular' ? '#424242' : '#333', // Button text color
                      border: selectedModel === 'regular' ? 'none' : '1px solid #e1e5e9',
                      minWidth: '140px'
                    }}
                  >
                    📋 Detailed
                  </button>
                </div>

                {/* Language Selection */}
                <div style={{ textAlign: 'center' }}>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e1e5e9',
                      fontSize: '16px',
                      background: '#f8f9fa',
                      minWidth: '180px'
                    }}
                  >
                    <option value="English">🇺🇸 English</option>
                    <option value="Spanish">🇪🇸 Spanish</option>
                    <option value="French">🇫🇷 French</option>
                    <option value="German">🇩🇪 German</option>
                    <option value="Italian">🇮🇹 Italian</option>
                    <option value="Portuguese">🇵🇹 Portuguese</option>
                    <option value="Russian">🇷🇺 Russian</option>
                    <option value="Chinese">🇨🇳 Chinese</option>
                    <option value="Japanese">🇯🇵 Japanese</option>
                    <option value="Korean">🇰🇷 Korean</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Arabic">🇸🇦 Arabic</option>
                    <option value="Turkish">🇹🇷 Turkish</option>
                    <option value="Dutch">🇳🇱 Dutch</option>
                    <option value="Swedish">🇸🇪 Swedish</option>
                    <option value="Norwegian">🇳🇴 Norwegian</option>
                    <option value="Danish">🇩🇰 Danish</option>
                    <option value="Finnish">🇫🇮 Finnish</option>
                    <option value="Polish">🇵🇱 Polish</option>
                    <option value="Czech">🇨🇿 Czech</option>
                    <option value="Hungarian">🇭🇺 Hungarian</option>
                    <option value="Romanian">🇷🇴 Romanian</option>
                    <option value="Bulgarian">🇧🇬 Bulgarian</option>
                    <option value="Greek">🇬🇷 Greek</option>
                    <option value="Hebrew">🇮🇱 Hebrew</option>
                    <option value="Thai">🇹🇭 Thai</option>
                    <option value="Vietnamese">🇻🇳 Vietnamese</option>
                    <option value="Indonesian">🇮🇩 Indonesian</option>
                    <option value="Malay">🇲🇾 Malay</option>
                    <option value="Filipino">🇵🇭 Filipino</option>
                    <option value="Bengali">🇧🇩 Bengali</option>
                    <option value="Urdu">🇵🇰 Urdu</option>
                    <option value="Persian">🇮🇷 Persian</option>
                    <option value="Ukrainian">🇺🇦 Ukrainian</option>
                    <option value="Belarusian">🇧🇾 Belarusian</option>
                    <option value="Serbian">🇷🇸 Serbian</option>
                    <option value="Croatian">🇭🇷 Croatian</option>
                    <option value="Slovenian">🇸🇮 Slovenian</option>
                    <option value="Slovak">🇸🇰 Slovak</option>
                    <option value="Lithuanian">🇱🇹 Lithuanian</option>
                    <option value="Latvian">🇱🇻 Latvian</option>
                    <option value="Estonian">🇪🇪 Estonian</option>
                    <option value="Icelandic">🇮🇸 Icelandic</option>
                    <option value="Maltese">🇲🇹 Maltese</option>
                    <option value="Georgian">🇬🇪 Georgian</option>
                    <option value="Armenian">🇦🇲 Armenian</option>
                    <option value="Azerbaijani">🇦🇿 Azerbaijani</option>
                    <option value="Kazakh">🇰🇿 Kazakh</option>
                    <option value="Uzbek">🇺🇿 Uzbek</option>
                    <option value="Kyrgyz">🇰🇬 Kyrgyz</option>
                    <option value="Tajik">🇹🇯 Tajik</option>
                    <option value="Turkmen">🇹🇲 Turkmen</option>
                    <option value="Mongolian">🇲🇳 Mongolian</option>
                    <option value="Nepali">🇳🇵 Nepali</option>
                    <option value="Sinhala">🇱🇰 Sinhala</option>
                    <option value="Khmer">🇰🇭 Khmer</option>
                    <option value="Lao">🇱🇦 Lao</option>
                    <option value="Burmese">🇲🇲 Burmese</option>
                    <option value="Amharic">🇪🇹 Amharic</option>
                    <option value="Swahili">🇹🇿 Swahili</option>
                    <option value="Yoruba">🇳🇬 Yoruba</option>
                    <option value="Zulu">🇿🇦 Zulu</option>
                    <option value="Afrikaans">🇿🇦 Afrikaans</option>
                    <option value="Albanian">🇦🇱 Albanian</option>
                    <option value="Macedonian">🇲🇰 Macedonian</option>
                    <option value="Bosnian">🇧🇦 Bosnian</option>
                    <option value="Montenegrin">🇲🇪 Montenegrin</option>
                    <option value="Kosovo">🇽🇰 Kosovo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Saved Results Section */}
            <div style={{
              background: '#FFFFFF', // Saved/Trending Box
              borderRadius: '16px',
              padding: '1.5rem',
              marginTop: '1.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', // Soft drop shadow
              border: '1px solid rgba(179, 235, 242, 0.3)'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#424242', // Main text color
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💊 Saved Results
              </h3>
              
              {savedMedicines.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#757575', // Sub text color
                  fontSize: '14px',
                  fontStyle: 'italic',
                  padding: '1rem'
                }}>
                  No saved medicines yet
                </div>
              ) : (
                <div>
                  {(showAllSaved ? savedMedicines : savedMedicines.slice(0, 5)).map((medicine, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <button
                        onClick={() => handleSavedMedicineClick(medicine)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#424242', // Main text color
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          textAlign: 'left',
                          flex: 1
                        }}
                        onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                          e.currentTarget.style.color = '#757575';
                        }}
                        onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.color = '#424242';
                        }}
                      >
                        {medicine}
                      </button>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSavedMedicineClick(medicine)}
                          style={{
                            background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)', // Button gradient
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          👁️
                        </button>
                        
                        <button
                          onClick={() => handleDeleteSavedMedicine(medicine)}
                          style={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {savedMedicines.length > 5 && (
                    <button
                      onClick={() => setShowAllSaved(!showAllSaved)}
                      style={{
                        background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)', // Button gradient
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: '#424242', // Button text color
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        marginTop: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {showAllSaved ? 'Show Less' : `View More (${savedMedicines.length - 5} more)`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ 
            width: '350px', 
            flexShrink: 0,
            marginTop: '2rem'
          }}>
            {/* Tip of the Day Button */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              zIndex: 10
            }}>
              <button
                onClick={() => setTipModalVisible(true)}
                style={{
                  background: '#FFF9C4', // Trending Icons
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                💡
              </button>
            </div>

            {/* User Authentication */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 10
            }}>
              <button
                onClick={isAuthenticated ? logout : () => router.push('/profile')}
                style={{
                  background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)', // Button gradient
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  color: '#424242', // Button text color
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isAuthenticated ? `${user?.name || 'User'} (Sign Out)` : 'Login / Signup'}
              </button>
            </div>

            {/* Ask PillBot Section */}
            <div style={{
              background: 'linear-gradient(135deg, #B3EBF2, #D1C4E9)', // PillBot Box gradient
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 32px rgba(179, 235, 242, 0.15)',
              color: 'white'
            }}>
              <button
                onClick={handleAskPillBot}
                style={{
                  background: 'linear-gradient(135deg, #B3EBF2, #D1C4E9)', // PillBot Box gradient
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  color: '#424242', // Button text color
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(179, 235, 242, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(179, 235, 242, 0.4)';
                }}
                onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(179, 235, 242, 0.3)';
                }}
              >
                <span style={{ fontSize: '24px' }}>🤖</span>
                <span>Ask PillBot</span>
                <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400', color: '#424242' }}>
                  AI-powered medication assistant
                </span>
              </button>
            </div>

            {/* Trending Now Section */}
            <div style={{
              background: '#FFFFFF', // Saved/Trending Box
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(179, 235, 242, 0.3)',
              marginTop: '1rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' // Soft drop shadow
            }}>
              <h3 style={{
                color: '#424242', // Main text color
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔥 Trending Now
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {trendingMedicines.map((medicine, index) => (
                  <button
                    key={index}
                    onClick={() => handleMedicineSelect(medicine)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(179, 235, 242, 0.3)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      color: '#424242', // Main text color
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                      e.currentTarget.style.background = 'rgba(179, 235, 242, 0.2)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ color: '#FFF9C4', fontSize: '16px' }}>💊</span> {/* Trending Icons */}
                    {medicine}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip of the Day Modal */}
      {tipModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setTipModalVisible(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1.2rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>

            {/* Modal Content */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>
                💡
              </div>
              
              <h2 style={{
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 0 0.5rem 0',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Tip of the Day
              </h2>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '2rem',
                marginTop: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#333',
                  lineHeight: '1.6',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  {tipOfTheDay}
                </p>
              </div>
              
              <button
                onClick={() => setTipModalVisible(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  marginTop: '1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#B3EBF2',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                }}
              >
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Medicines Modal */}
      {browseModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setBrowseModalVisible(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              💊 Browse Medicines
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {mockMedicines.map((medicine, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMedicineName(medicine);
                    setBrowseModalVisible(false);
                    setTimeout(() => {
                      handleSearch();
                    }, 500);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(179, 235, 242, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {medicine}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* By Condition Modal */}
      {conditionModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setConditionModalVisible(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              🩺 Browse by Condition
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {mockConditions.map((condition, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMedicineName(condition);
                    setConditionModalVisible(false);
                    setTimeout(() => {
                      handleSearch();
                    }, 500);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(179, 235, 242, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learn About Pills Modal */}
      {learnModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setLearnModalVisible(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>
                📚
              </div>
              
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '1rem'
              }}>
                Learn About Pills
              </h2>
              
              <p style={{
                fontSize: '1rem',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Coming soon! This feature will provide educational content about medications, 
                their uses, side effects, and important safety information.
              </p>
              
              <button
                onClick={() => setLearnModalVisible(false)}
                style={{
                  background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask PillBot Modal */}
      {chatModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button
              onClick={() => setChatModalVisible(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2.5rem'
              }}>
                🤖
              </div>
              
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                Ask PillBot
              </h2>
              
              <p style={{
                fontSize: '1rem',
                color: '#666',
                lineHeight: '1.6'
              }}>
                AI-powered medication assistant
              </p>
            </div>
            
            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              maxHeight: '300px'
            }}>
              {chatHistory.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  Start a conversation with PillBot...
                </div>
              ) : (
                chatHistory.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '1rem',
                      textAlign: message.role === 'user' ? 'right' : 'left'
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      wordWrap: 'break-word',
                      background: message.role === 'user' 
                        ? 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)'
                        : '#e9ecef',
                      color: message.role === 'user' ? 'white' : '#333',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {message.text}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div style={{
                  textAlign: 'left',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: '#e9ecef',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    🤖 PillBot is typing...
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask PillBot anything about medications..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendChatMessage();
                  }
                }}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || isChatLoading}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #FDC5DC 0%, #C8E6C9 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: (!chatInput.trim() || isChatLoading) ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                  if (chatInput.trim() && !isChatLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 