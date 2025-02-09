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
import AsyncStorage from "@react-native-async-storage/async-storage";
import useApi from "@/util/apiClient";
import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const router = useRouter();
  const apiClient = useApi({ useToken: false });
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width, height } = Dimensions.get("window");
  const [authState, setAuthState] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }

  const handleSubmit = async () => {
    if (authState === "login") {
      router.push("/schedule");
      return
      console.log("Logging in with", email, password);
      if (!email || !password) {
        console.error("Email and password are required");
        return;
      }
      if (!apiClient) {
        console.error("API client is not initialized");
        return;
      }
      try {
        const response = await apiClient.post("users/login", {
          email,
          password,
        });
        console.log("Login response", response.data);
        const { token, success, user } = response.data;
        if (!success) {
          alert("Invalid credentials");
          return;
        }
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("email", user.email);
        await AsyncStorage.setItem("institution", user.institution);
        await AsyncStorage.setItem("name", user.name);
        console.log("Login successful");
        router.push("/schedule");
      } catch (error) {
        console.error("Login error", error);
      }
    } else if (authState === "signup") {
      console.log("Signing up with", email, password, confirmPassword);
      if (!name || !email || !institution || !password || !confirmPassword) {
        console.error("All fields are required");
        return;
      }
      if (password !== confirmPassword) {
        console.error("Passwords do not match");
        return;
      }
      if (!apiClient) {
        console.error("API client is not initialized");
        return;
      }
      try {
        const response = await apiClient.post("users/signup", {
          name,
          email,
          institution,
          password,
        });
        console.log("Signup response", response.data);
        const { success } = response.data;
        if (!success) {
          alert("Unsuccessful signup");
          return;
        }
        setAuthState("verify");
        console.log("Signup successful, proceed to verification");
      } catch (error) {
        console.error("Signup error", error);
      }
    } else if (authState === "verify") {
      console.log("Verifying with code", verificationCode);
      if (!verificationCode) {
        console.error("Verification code is required");
        return;
      }
      if (!apiClient) {
        console.error("API client is not initialized");
        return;
      }
      try {
        const response = await apiClient.post("users/verify", {
          email,
          verification_code: verificationCode,
        });
        console.log("Verification response", response.data);
        const { success, token, user } = response.data;
        if (!success) {
          alert("Invalid verification code");
          return;
        }
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("email", user.email);
        await AsyncStorage.setItem("institution", user.institution);
        await AsyncStorage.setItem("name", user.name);
        console.log("Verification successful");
        router.push("/schedule");
      } catch (error) {
        console.error("Verification error", error);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "85%", maxWidth: 400 }}>
          <Text className="text-2xl font-bold mb-6 text-center text-primary">
            {authState === "login" ? "Login" : authState === "signup" ? "Sign Up" : "Verify"}
          </Text>
          {authState === "signup" && (
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
          {authState !== "verify" && (
            <TextInput
              label="Institution"
              mode="outlined"
              value={institution}
              onChangeText={setInstitution}
              style={styles.input}
            />
          )}
          {authState !== "verify" && (
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          )}
          {authState === "signup" && (
            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
          )}
          {authState === "verify" && (
            <TextInput
              label="Verification Code"
              mode="outlined"
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={styles.input}
            />
          )}
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            <Text style={{ color: "#fff" }} className="text-lg">
              {authState === "login" ? "Login" : authState === "signup" ? "Sign Up" : "Verify"}
            </Text>
          </Button>
          <View className="flex-row justify-center mt-6">
            <Text className="text-lg">
              {authState === "login"
                ? "Don't have an account?"
                : authState === "signup"
                ? "Already have an account?"
                : "Need to sign up?"}
            </Text>
            <Text
              style={{ color: "#6200ee" }}
              className="text-lg"
              onPress={() =>
                setAuthState(
                  authState === "login" ? "signup" : authState === "signup" ? "login" : "signup"
                )
              }>
              {authState === "login" ? " Sign Up" : authState === "signup" ? " Login" : " Sign Up"}
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
