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
}

interface AssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "What is my inventory worth?",
  "How much did I sell last month?",
  "What are recent comps for Prizm Silver Luka?",
  "Should I lower prices on my active slabs?",
];

const TypingIndicator = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <Text style={styles.modelText}>RSL Agent is thinking{dots}</Text>;
};

export const AssistantModal: React.FC<AssistantModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "model", text: "Hi! I'm RSL Assistant. Ask me about your inventory, recent sales, or card comps." }
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
        "React Native Voice requires native modules. Please rebuild your dev client (npx expo run:ios or npx expo run:android) to use voice chat."
      );
    }
  };

  const handleSend = async (textToSubmit: string = inputText) => {
    if (!textToSubmit.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: textToSubmit.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Build history for backend, keeping last 5 messages
      const history = messages.slice(-5).filter(m => m.id !== "0").map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await api.post("/v1/assistant/chat", {
        message: textToSubmit.trim(),
        history
      });

      const aiResponseText = res.data.data.response;
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "model", text: aiResponseText }]);
    } catch (e: any) {
      console.error("Assistant Error:", e.response?.data || e.message);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "model", text: "Sorry, I had trouble processing that request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.role === "user" ? styles.userBubble : styles.modelBubble]}>
      <Text style={item.role === "user" ? styles.userText : styles.modelText}>{item.text}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>RSL Assistant</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={(
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((sug, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionPill} onPress={() => handleSend(sug)}>
                    <Text style={styles.suggestionText}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            ListFooterComponent={isLoading ? (
              <View style={[styles.messageBubble, styles.modelBubble, { flexDirection: 'row', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color="#e4e4e7" style={{ marginRight: 8 }} />
                <TypingIndicator />
              </View>
            ) : null}
          />

          <View style={styles.inputRow}>
            {/* Voice button temporarily disabled until native rebuild
            <TouchableOpacity onPress={toggleListening} style={styles.micBtn}>
              <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#ef4444" : "#a1a1aa"} />
            </TouchableOpacity>
            */}
            
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor="#a1a1aa"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            
            <TouchableOpacity 
              onPress={() => handleSend()} 
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && { opacity: 0.5 }]}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="#fff" />
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#18181b",
    height: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  chatList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6366f1",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#27272a",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "#fff",
    fontSize: 16,
  },
  modelText: {
    color: "#e4e4e7",
    fontSize: 16,
  },
  suggestions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionPill: {
    backgroundColor: "#27272a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  suggestionText: {
    color: "#d4d4d8",
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    alignItems: "center",
    backgroundColor: "#18181b",
  },
  micBtn: {
    marginRight: 12,
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#27272a",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendBtn: {
    marginLeft: 12,
    backgroundColor: "#6366f1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
