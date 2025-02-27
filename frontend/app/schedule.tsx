import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Text, Image, SafeAreaView, ScrollView, StyleSheet, View, Dimensions } from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import useApi from "@/util/apiClient";
import "../globals.css";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const router = useRouter();
  const apiClient = useApi({ useToken: true });
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width, height } = Dimensions.get("window");
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const base64 = await convertToBase64(result.assets[0].uri);
      setImageBase64(base64);
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }

  const convertToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!image) {
      console.error("All fields are required");
      return;
    }
    if (!apiClient) {
      console.error("API client is not initialized");
      return;
    }
    try {
      const imageResponse = await apiClient.post("schedule/upload", { image: imageBase64 });
      console.log("Image upload response", imageResponse.data);
      const { success: imageSuccess } = imageResponse.data;
      if (!imageSuccess) {
        alert("Image upload unsuccessful");
        return;
      }
      router.push("/map");
    } catch (error) {
      console.error("Signup error", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "85%", maxWidth: 400 }}>
          <Text className="text-2xl font-bold mb-6 text-center">Upload Your Schedule</Text>
          <View className="flex-row justify-center items-center mb-4">
            {image && <Image source={{ uri: image }} style={styles.image} />}
          </View>
          <Button mode="contained" style={styles.button} onPress={pickImage}>
            <Text style={{ color: "#fff" }} className="text-lg">
              Upload Image
            </Text>
          </Button>
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            <Text style={{ color: "#fff" }} className="text-lg">
              Submit
            </Text>
          </Button>
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
  image: {
    width: 300,
    height: 300,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: "#6200ee",
  },
});
