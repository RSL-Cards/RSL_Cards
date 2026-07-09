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
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiClient as api } from "../../lib/apiClient";

let Voice: any = null;
try {
  Voice = require("@react-native-voice/voice").default;
} catch (e) {
  console.warn("Voice module not available.");
}

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
      text: "👋 Hi! I'm your RSL Assistant. I have live access to your inventory, transactions, sales analytics, and live market comps.\n\nHow can I assist your dealership today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    try {
      if (Voice) {
        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechError = (e: any) => {
          console.error(e);
          setIsListening(false);
        };
        Voice.onSpeechResults = (e: any) => {
          const text = e.value?.[0] || "";
          if (text) {
            setInputText(text);
            handleSend(text);
          }
          setIsListening(false);
        };
      }
    } catch (e) {
      console.warn("Native Voice module is not available.");
    }

    return () => {
      try {
        if (Voice && Voice.destroy) {
          Voice.destroy().then(() => {
            if (Voice.removeAllListeners) Voice.removeAllListeners();
          }).catch(() => {});
        }
      } catch (e) {}
    };
  }, []);

  const toggleListening = async () => {
    try {
      if (!Voice) throw new Error("Native module missing");
      
      if (isListening) {
        await Voice.stop();
      } else {
        await Voice.start("en-US");
      }
    } catch (e) {
      Alert.alert(
        "Microphone Unavailable",
        "React Native Voice requires native modules. Please rebuild your dev client to use voice chat."
      );
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
              <TouchableOpacity onPress={handleClearChat} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="#a1a1aa" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

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
});
