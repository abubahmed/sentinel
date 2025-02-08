import { DarkTheme, DefaultTheme, ServerContainer, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../globals.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { PaperProvider } from "react-native-paper";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView, ScrollView, StyleSheet, View, Dimensions } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width, height } = Dimensions.get("window");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }

  const handleSubmit = () => {
    if (isLogin) {
      console.log("Logging in with", email, password);
    } else {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
      } else {
        console.log("Signing up with", email, institution, password);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "85%", maxWidth: 400 }}>
          <Text className="text-2xl font-semibold mb-6 text-center text-primary">
            {isLogin ? "Login" : "Sign Up"}
          </Text>
          {!isLogin && (
            <TextInput
              label="Name"
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          )}
          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
          <TextInput
            label="Institution"
            mode="outlined"
            value={institution}
            onChangeText={setInstitution}
            style={styles.input}
          />
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {!isLogin && (
            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
          )}
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            <Text style={{ color: "#fff" }} className="text-lg">
              {isLogin ? "Login" : "Sign Up"}
            </Text>
          </Button>
          <View className="flex-row justify-center mt-6">
            <Text className="text-lg">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <Text
              style={{ color: "#6200ee" }}
              className="text-lg"
              onPress={() => setIsLogin(!isLogin)}>
              {isLogin ? " Sign Up" : " Login"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: "#6200ee",
  },
});
