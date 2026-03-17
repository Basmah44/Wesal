import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Animated } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import labelsAr from "../backend/models/labels_ar.json";

const SIGN_IMAGES: Record<string, any> = {
  Alef: require("../assets/images/sign_images/Alef.png"),
  Ba: require("../assets/images/sign_images/Ba.png"),
  Ta: require("../assets/images/sign_images/Ta.png"),
  Tha: require("../assets/images/sign_images/Tha.png"),
  Jeem: require("../assets/images/sign_images/Jeem.png"),
  Ha: require("../assets/images/sign_images/Ha.png"),
  Khaa: require("../assets/images/sign_images/Khaa.png"),
  Dal: require("../assets/images/sign_images/Dal.png"),
  Thal: require("../assets/images/sign_images/Thal.png"),
  Ra: require("../assets/images/sign_images/Ra.png"),
  Zay: require("../assets/images/sign_images/Zay.png"),
  Seen: require("../assets/images/sign_images/Seen.png"),
  Sheen: require("../assets/images/sign_images/Sheen.png"),
  Sad: require("../assets/images/sign_images/Sad.png"),
  Dad: require("../assets/images/sign_images/Dad.png"),
  Tah: require("../assets/images/sign_images/Tah.png"),
  Zah: require("../assets/images/sign_images/Zah.png"),
  Ain: require("../assets/images/sign_images/Ain.png"),
  Ghain: require("../assets/images/sign_images/Ghain.png"),
  Fa: require("../assets/images/sign_images/Fa.png"),
  Qaf: require("../assets/images/sign_images/Qaf.png"),
  Kaf: require("../assets/images/sign_images/Kaf.png"),
  Lam: require("../assets/images/sign_images/Lam.png"),
  Meem: require("../assets/images/sign_images/Meem.png"),
  Noon: require("../assets/images/sign_images/Noon.png"),
  Waw: require("../assets/images/sign_images/Waw.png"),
  Ya: require("../assets/images/sign_images/Ya.png"),

  Home: require("../assets/images/sign_images/Home.png"),
  School: require("../assets/images/sign_images/School.png"),
  Friend: require("../assets/images/sign_images/Friend.png"),
  Father: require("../assets/images/sign_images/Father.png"),
  Mother: require("../assets/images/sign_images/Mother.png"),
  Company: require("../assets/images/sign_images/Company.png"),
  Good: require("../assets/images/sign_images/Good.png"),
  Smile: require("../assets/images/sign_images/Smile.png"),
  Sorry: require("../assets/images/sign_images/Sorry.png"),
};

function normalizeArabic(text: string) {
  return text
    .trim()
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

export default function TextToSign() {
  const router = useRouter();

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [errorText, setErrorText] = useState("");

  const reverseMap = useMemo(() => {
    const map: any = {};
    Object.entries(labelsAr).forEach(([english, arabic]) => {
      map[normalizeArabic(String(arabic))] = english;
    });
    return map;
  }, []);

  const convert = () => {
    const cleaned = normalizeArabic(inputText);

    if (!cleaned) {
      setErrorText("اكتبي كلمة أولاً");
      setResults([]);
      return;
    }

    const words = cleaned.split(" ");

    const found: any[] = [];
    const unsupported: string[] = [];

    words.forEach((word) => {
      const key = reverseMap[word];

      if (key && SIGN_IMAGES[key]) {
        found.push({
          arabic: word,
          image: SIGN_IMAGES[key],
          key: key,
        });
      } else {
        unsupported.push(word);
      }
    });

    setResults(found);

    if (unsupported.length > 0) {
      setErrorText("بعض الكلمات غير موجودة");
    } else {
      setErrorText("");
    }
  };

  const saveFavorite = async (key: string) => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      let favorites = stored ? JSON.parse(stored) : [];

      if (!favorites.includes(key)) {
        favorites.push(key);
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
      }
    } catch (e) {
      console.log("favorite error", e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#0B0016", "#210040", "#3C006E", "#120022"]}
        style={styles.background}
      />

      <View style={styles.light1} />
      <View style={styles.light2} />
      <View style={styles.light3} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>تحويل النص إلى إشارة</Text>

          <View style={{ width: 26 }} />
        </View>

        <Animated.View
          style={[styles.logoWrap, { transform: [{ scale: pulse }] }]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>TEXT</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
            <Ionicons name="hand-left-outline" size={22} color="white" />
          </View>
        </Animated.View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            في بالك كلمة ولا تعرف معناها بلغة الإشارة؟
          </Text>

          <Text style={styles.heroSub}>
            اكتب الكلمة وسيعرض التطبيق الإشارة الخاصة بها
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>النص</Text>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="مثال: بيت"
            placeholderTextColor="#bbb"
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={convert}>
            <Ionicons name="sparkles" size={18} color="white" />
            <Text style={styles.buttonText}>عرض الإشارة</Text>
          </TouchableOpacity>
        </View>

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        {results.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.resultTitle}>النتائج</Text>

            {results.map((item, index) => (
              <View key={index} style={styles.card}>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => saveFavorite(item.key)}
                >
                  <Ionicons name="star-outline" size={18} color="white" />
                </TouchableOpacity>

                <Text style={styles.word}>{item.arabic}</Text>

                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  light1: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    backgroundColor: "white",
    opacity: 0.08,
    borderRadius: 200,
  },

  light2: {
    position: "absolute",
    top: 120,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: "white",
    opacity: 0.05,
    borderRadius: 200,
  },

  light3: {
    position: "absolute",
    bottom: -100,
    alignSelf: "center",
    width: 400,
    height: 200,
    backgroundColor: "white",
    opacity: 0.04,
    borderRadius: 200,
  },

  container: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 60,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },

  heroCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 26,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  heroTitle: {
    color: "white",
    fontSize: 22,
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
  },

  heroSub: {
    color: "#ddd",
    marginTop: 6,
    fontSize: 14,
  },

  inputCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  label: {
    color: "white",
    marginBottom: 8,
    fontSize: 16,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    color: "white",
    fontSize: 16,
  },

  button: {
    marginTop: 16,
    backgroundColor: "#7C3AED",
    borderRadius: 28,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  resultTitle: {
    color: "white",
    fontSize: 22,
    marginBottom: 14,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },

  word: {
    color: "white",
    fontSize: 20,
    marginBottom: 10,
  },

  image: {
    width: 230,
    height: 230,
  },

  error: {
    color: "#ffb3b3",
    marginTop: 10,
  },

  logoWrap: {
    alignItems: "center",
    marginBottom: 18,
  },

  logoCircle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  logoText: {
    color: "white",
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: "600",
  },
});
