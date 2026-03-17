import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SignLanguageApp = () => {
  const router = useRouter();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      router.push("/SignPage");
    }, 100);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#05010A", "#1A0033", "#2E005C", "#120022"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            marginBottom: 1,
          }}
        >
          <Image
            source={require("../assets/images/logo2png.png")}
            style={{
              width: 350,
              height: 350,
            }}
            resizeMode="contain"
          />
        </Animated.View>

        <Text
          style={{
            color: "white",
            fontSize: 48,
            fontWeight: "900",
            letterSpacing: 2,
            marginBottom: 6,
            fontFamily: "calibril-bold",
          }}
        >
          وصال
        </Text>

        <Text
          style={{
            color: "#C8B6FF",
            fontSize: 16,
            marginBottom: 30,
            letterSpacing: 0,
            fontFamily: "calibril-regular",
          }}
        >
          تم تطويرة بأياد سعودية لخدمة مجتمع الصم
        </Text>

        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity onPress={handleGetStarted}>
            <LinearGradient
              colors={["#A855F7", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 80,
                paddingVertical: 18,
                borderRadius: 40,
                shadowColor: "#A855F7",
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 15,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  letterSpacing: 2,
                }}
              >
                GET STARTED
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default SignLanguageApp;
