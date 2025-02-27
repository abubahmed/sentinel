import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../globals.css";
import {
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "react-native-vector-icons";

SplashScreen.preventAutoHideAsync();

export default function Exposure() {
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width, height } = Dimensions.get("window");
  const params = useLocalSearchParams();
  let { points } = params as any;
  points = JSON.parse(points);
  console.log("Points: ", points);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <ScrollView contentContainerStyle={{ flex: 1, alignItems: "center" }}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialIcons name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={{ width: "85%", maxWidth: 400, marginTop: 75 }}>
          {points && points.length > 0 ? (
            <Text className="text-2xl font-bold mb-6 text-center text-primary">
              At Risk of Exposure
            </Text>
          ) : (
            <Text className="text-2xl font-bold mb-6 text-center text-primary">
              No Risk of Exposure
            </Text>
          )}
        </View>

        <ScrollView
          style={{ width: "100%", marginBottom: 40, paddingTop: 5 }}
          contentContainerStyle={{ alignItems: "center" }}>
          {points &&
            points.length > 0 &&
            points.map((point: any, index: any) => (
              <View key={index} style={styles.infoBox}>
                <Text className="text-md text-center font-semibold mb-6">
                  A sick person recently had class in this location
                </Text>
                <Text className="text-md text-center">
                  Title: {point.title} ({point.description})
                </Text>
                <Text className="text-md text-center">Location: {point.location}</Text>
                <Text className="text-md text-center">Class: {point.title}</Text>
                <Text className="text-md text-center">Day: {point.day}</Text>
                <Text className="text-md text-center">
                  Times: {point.start} - {point.end}
                </Text>
                <Text className="text-md font-semibold text-center mt-6">
                  Take appropriate action to protect your health
                </Text>
              </View>
            ))}
        </ScrollView>
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
  infoBox: {
    backgroundColor: "#fff",
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    width: "80%",
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
