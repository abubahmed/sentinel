import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const Waiting_Driver_Screen = () => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState(null) as any;
  const [initialRegion, setInitialRegion] = useState(null) as any;

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location: any = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      setInitialRegion({
        latitude: location.coords.latitude as any,
        longitude: location.coords.longitude as any,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    };

    getLocation();

    const intervalId = setInterval(async () => {
      await getLocation();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", minHeight: height, minWidth: width }}>
      <Text className="text-2xl font-bold mb-3 ml-6">Welcome, Abu</Text>
      <View
        style={{ flexDirection: "row", marginBottom: 10, paddingHorizontal: 5, paddingBottom: 2 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => router.push("/self-report")}>
            <Text style={{ color: "#fff" }} className="text-lg">
              I'm Sick
            </Text>
          </Button>
          <Button mode="contained" style={styles.button}>
            <Text style={{ color: "#fff" }} className="text-lg">
              Exposure
            </Text>
          </Button>
          <Button mode="contained" style={styles.button}>
            <Text style={{ color: "#fff" }} className="text-lg">
              Report
            </Text>
          </Button>
          <Button mode="contained" style={styles.button}>
            <Text style={{ color: "#fff" }} className="text-lg">
              Summary
            </Text>
          </Button>
        </ScrollView>
      </View>
      {initialRegion && (
        <MapView style={styles.map} initialRegion={initialRegion}>
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
            />
          )}
          
        </MapView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 4,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Waiting_Driver_Screen;
