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
import { PaperProvider, RadioButton } from "react-native-paper";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView, ScrollView, StyleSheet, View, Dimensions } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useApi from "@/util/apiClient";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-paper-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const router = useRouter();
  const apiClient: any = useApi({ useToken: false });
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width, height } = Dimensions.get("window");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dates, setDates] = useState<any[]>([]);
  const [date, setDate] = useState(new Date(Date.now()));

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) {
    return null;
  }

  const handleSubmit = async () => {
    if (!title || !description) {
      console.error("All fields are required");
      return;
    }
    if (!apiClient) {
      console.error("API client is not initialized");
      return;
    }
    try {
      const datesStrings = dates.map((date) => date.toISOString().split("T")[0]);
      const response: any = await apiClient.post("reports/create", {
        title,
        description,
        dates: datesStrings,
      });
      console.log("Response:", response.data);
      const { success } = response.data;
      if (!success) {
        console.error("Failed to submit report");
        return;
      }
      console.log("Report submitted successfully");
      router.push("/map");
    } catch (error: any) {
      console.error("Error submitting form", error);
    }
  };

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "85%", maxWidth: 400 }}>
          <Text className="text-2xl font-bold mb-6 text-center text-primary">
            Self Report an Illness
          </Text>
          <TextInput
            label="Title"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            label="Description"
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            multiline
          />
          <Text className="text-lg mb-2 align-center text-center">Dates of Exposure</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 4,
            }}>
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={"date"}
              is24Hour={true}
              onChange={onChange}
              textColor="black"
              accentColor="black"
              style={{
                marginRight: 12,
              }}
            />
            <Button
              onPress={() => {
                setDates([...dates, date]);
              }}
              mode="contained"
              style={[styles.miniButton]}
              className="text-lg color-black font-medium">
              <Text className="text-lg">Add Date</Text>
            </Button>
          </View>
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
  descriptionInput: {
    height: 150,
    textAlignVertical: "top",
    marginBottom: 18,
  },
  miniButton: {
    backgroundColor: "#6200ee",
  },
  button: {
    marginTop: 18,
    paddingVertical: 8,
    backgroundColor: "#6200ee",
  },
});
