import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../globals.css";
import { Text, SafeAreaView, ScrollView, StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import { Button, TextInput, SegmentedButtons } from "react-native-paper";
import useApi from "@/util/apiClient";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "react-native-vector-icons";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const router = useRouter();
  const apiClient: any = useApi({ useToken: true });
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width, height } = Dimensions.get("window");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dates, setDates] = useState<any[]>([]);
  const [date, setDate] = useState(new Date(Date.now()));
  const [severity, setSeverity] = useState("mild");

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
        severity,
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

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialIcons name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: "85%", maxWidth: 400 }}>
          <Text className="text-2xl font-bold mb-6 text-center text-primary">
            Self Report Your Illness
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
          <Text className="text-xl mb-2 align-center text-center font-semibold">Dates of Exposure</Text>
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
          <Text className="text-xl mb-2 align-center text-center font-semibold mt-4">Severity</Text>
          <SegmentedButtons
            style={{
              marginVertical: 16,
              marginTop: 4,
            }}
            value={severity}
            onValueChange={setSeverity}
            buttons={[
              {
                value: "mild",
                label: "Mild",
              },
              {
                value: "moderate",
                label: "Moderate",
              },
              { value: "severe", label: "Severe" },
            ]}
          />
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
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
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
    marginTop: 14,
    paddingVertical: 8,
    backgroundColor: "#6200ee",
  },
});
