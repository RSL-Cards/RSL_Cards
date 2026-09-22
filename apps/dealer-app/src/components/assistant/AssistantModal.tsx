import React, { useState, useEffect, useRef } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient as api } from "../../lib/apiClient";

export const AI_CONSENT_STORAGE_KEY = "@rsl_ai_data_consent_accepted";


interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp?: string;
}

interface AssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  { label: "Card Show Log", text: "How many cards did I buy in Chicago CardShow?" },
  { label: "Inventory Summary", text: "What is my inventory summary & total valuation?" },
  { label: "Monthly Profit", text: "How much net profit did I earn this month?" },
  { label: "Aging Stock (>60d)", text: "Show me my aging inventory sitting over 60 days" },
  { label: "Card Comps", text: "Check market comps for 2018 Prizm Luka PSA 10" },
  { label: "Top Channels", text: "Which sales channel has the highest revenue?" },
];

const TypingIndicator = () => {
  const [statusText, setStatusText] = useState("Analyzing query & checking RSL tools...");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatusText("Checking dealer database & market comps...");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.typingRow}>
      <ActivityIndicator size="small" color="#818cf8" style={{ marginRight: 8 }} />
      <Text style={styles.typingText}>{statusText}</Text>
    </View>
  );
};

export const AssistantModal: React.FC<AssistantModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "model",
      text: "👋 Hi! I'm your RSL Assistant. I have live access to your inventory, transactions, daily logs & card show records, sales analytics, and live market comps.\n\nHow can I assist your dealership today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(AI_CONSENT_STORAGE_KEY).then((value) => {
        setHasConsented(value === "true");
      });
    }
  }, [visible]);

  const handleAgreeConsent = async () => {
    try {
      await AsyncStorage.setItem(AI_CONSENT_STORAGE_KEY, "true");
      setHasConsented(true);
      setShowPrivacyNotice(false);
    } catch {
      setHasConsented(true);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "model",
        text: "✨ Chat cleared! Ask me anything about your inventory, transactions, or card comps.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const handleSend = async (textToSubmit: string = inputText) => {
    if (!textToSubmit.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = { id: Date.now().toString(), role: "user", text: textToSubmit.trim(), timestamp: timeStr };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "0")
        .slice(-8)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const res = await api.post("/v1/assistant/chat", {
        message: textToSubmit.trim(),
        history
      });

      const aiResponseText = res.data?.data?.response || res.data?.response || "I didn't quite catch that.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (e: any) {
      console.error("Assistant Error:", e.response?.data || e.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "⚠️ Connection Notice: I had trouble connecting to the live dealer database right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format bold `**text**` into styled text spans inside React Native
  const renderFormattedText = (text: string, isUser: boolean) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim());

      return (
        <View key={idx} style={[styles.lineWrapper, isBullet && styles.bulletLine]}>
          <Text style={isUser ? styles.userText : styles.modelText}>
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <Text key={pIdx} style={{ fontWeight: "bold", color: isUser ? "#fff" : "#f4f4f5" }}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        </View>
      );
    });
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.role === "user" ? styles.userBubble : styles.modelBubble]}>
      {renderFormattedText(item.text, item.role === "user")}
      {item.timestamp ? (
        <Text style={[styles.timestampText, item.role === "user" && { textAlign: "right" }]}>
          {item.timestamp}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>RSL Assistant</Text>
                <View style={styles.liveDot} />
              </View>
            </View>
            
            <View style={styles.headerRight}>
              {hasConsented && (
                <TouchableOpacity 
                  onPress={() => setShowPrivacyNotice(true)} 
                  style={styles.actionBtn}
                  accessibilityLabel="AI Data Privacy Info"
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color="#818cf8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleClearChat} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="#a1a1aa" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {hasConsented === null ? (
            <View style={styles.loadingConsent}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : !hasConsented || showPrivacyNotice ? (
            <View style={styles.consentContainer}>
              <View style={styles.consentHeader}>
                <View style={styles.consentIconBadge}>
                  <Ionicons name="sparkles" size={28} color="#6366f1" />
                </View>
                <Text style={styles.consentTitle}>AI-Powered Assistant</Text>
                <Text style={styles.consentSubtitle}>Data Privacy & Third-Party AI Notice</Text>
              </View>

              <ScrollView style={styles.consentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.disclosureCard}>
                  <View style={styles.disclosureRow}>
                    <View style={styles.rowIconCircle}>
                      <Ionicons name="document-text-outline" size={18} color="#818cf8" />
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowHeading}>1. What Data Will Be Sent</Text>
                      <Text style={styles.rowBody}>
                        When you ask questions or look up cards, your text queries and inventory search terms are sent to generate answers, market comps, and sales insights.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.disclosureDivider} />

                  <View style={styles.disclosureRow}>
                    <View style={styles.rowIconCircle}>
                      <Ionicons name="cloud-outline" size={18} color="#818cf8" />
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowHeading}>2. Third-Party AI Service Provider</Text>
                      <Text style={styles.rowBody}>
                        Queries are processed by <Text style={{ color: "#fff", fontWeight: "700" }}>Google Gemini AI (Google)</Text> using secure AI infrastructure.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.disclosureDivider} />

                  <View style={styles.disclosureRow}>
                    <View style={styles.rowIconCircle}>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#34d399" />
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowHeading}>3. Privacy & Data Protection</Text>
                      <Text style={styles.rowBody}>
                        Data is encrypted in transit and at rest. Under Google AI data privacy terms, <Text style={{ color: "#34d399", fontWeight: "700" }}>your queries and personal data are never used to train public AI models</Text>.
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.policyLinkCard}
                  onPress={() => Linking.openURL("https://rslcards.com/privacy-policy")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="shield-outline" size={16} color="#818cf8" />
                  <Text style={styles.policyLinkText}>View full RSL Cards Privacy Policy</Text>
                  <Ionicons name="open-outline" size={14} color="#818cf8" />
                </TouchableOpacity>
              </ScrollView>

              <View style={styles.consentActions}>
                {!hasConsented ? (
                  <>
                    <TouchableOpacity 
                      style={styles.declineButton} 
                      onPress={onClose}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.agreeButton} 
                      onPress={handleAgreeConsent}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.agreeButtonText}>Agree & Continue</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={styles.agreeButton} 
                    onPress={() => setShowPrivacyNotice(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.agreeButtonText}>Close Notice</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <>
              {/* Chat List */}
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListHeaderComponent={(
                  messages.length <= 2 ? (
                    <View style={styles.suggestionsContainer}>
                      <Text style={styles.suggestionsHeader}>Recommended Questions & Tools</Text>
                      <View style={styles.suggestionsList}>
                        {SUGGESTIONS.map((sug, i) => (
                          <TouchableOpacity key={i} style={styles.suggestionPill} onPress={() => handleSend(sug.text)}>
                            <Text style={styles.suggestionLabel}>{sug.label}</Text>
                            <Text style={styles.suggestionText} numberOfLines={1}>{sug.text}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : null
                )}
                ListFooterComponent={isLoading ? (
                  <View style={[styles.messageBubble, styles.modelBubble]}>
                    <TypingIndicator />
                  </View>
                ) : null}
              />

              {/* Input Area */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask about stock, profits, comps..."
                  placeholderTextColor="#71717a"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => handleSend()}
                  returnKeyType="send"
                />
                
                <TouchableOpacity 
                  onPress={() => handleSend()} 
                  style={[styles.sendBtn, (!inputText.trim() || isLoading) && { opacity: 0.4 }]}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* AI Privacy Disclaimer footer */}
              <View style={styles.privacyDisclaimerRow}>
                <Ionicons name="shield-checkmark" size={12} color="#818cf8" />
                <Text style={styles.privacyDisclaimerText}>
                  Powered by Google Gemini AI • Data is never used for model training
                </Text>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#121214",
    height: "85%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#18181b",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
    borderColor: "#6366f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34d399",
    marginLeft: 4,
  },
  liveBadgeText: {
    color: "#818cf8",
    fontSize: 9,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#a1a1aa",
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  chatList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 14,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6366f1",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1f1f23",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  lineWrapper: {
    marginVertical: 2,
  },
  bulletLine: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#818cf8",
  },
  userText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 21,
  },
  modelText: {
    color: "#e4e4e7",
    fontSize: 15,
    lineHeight: 21,
  },
  timestampText: {
    color: "#71717a",
    fontSize: 10,
    marginTop: 6,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsHeader: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionPill: {
    backgroundColor: "#18181b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  suggestionLabel: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  suggestionText: {
    color: "#d4d4d8",
    fontSize: 12,
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    alignItems: "center",
    backgroundColor: "#18181b",
  },
  input: {
    flex: 1,
    backgroundColor: "#27272a",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#6366f1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingConsent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  consentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  consentHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  consentIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  consentTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  consentSubtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  consentScroll: {
    flex: 1,
  },
  disclosureCard: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    marginBottom: 14,
  },
  disclosureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowHeading: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  rowBody: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 18,
  },
  disclosureDivider: {
    height: 1,
    backgroundColor: "#27272a",
    marginVertical: 14,
  },
  policyLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  policyLinkText: {
    color: "#818cf8",
    fontSize: 13,
    fontWeight: "600",
  },
  consentActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  declineButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  declineButtonText: {
    color: "#d4d4d8",
    fontSize: 14,
    fontWeight: "700",
  },
  agreeButton: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  agreeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  privacyDisclaimerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "#18181b",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  privacyDisclaimerText: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "500",
  },
});
