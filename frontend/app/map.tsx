import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Dimensions } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Circle } from "react-native-maps";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import useApi from "@/util/apiClient";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const Waiting_Driver_Screen = () => {
  const apiClient = useApi({ useToken: true }) as any;
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState(null) as any;
  const [initialRegion, setInitialRegion] = useState(null) as any;
  const [exposures, setExposures] = useState([]) as any;
  const [exposurePoints, setExposurePoints] = useState([]) as any;
  const [futureExposures, setFutureExposures] = useState([]) as any;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getExposures = async () => {
      if (!apiClient) return;
      setLoading(true);
      const response = await apiClient.post("reports/all");
      console.log("All reports data: " + response.data);
      setExposures(response.data.instances);
      setExposurePoints(response.data.matches);
      setFutureExposures(response.data.future);
      setLoading(false);
    };
    getExposures();
  }, [apiClient]);

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
      <View>
        <Text className="text-2xl font-bold mb-3 ml-6">Welcome</Text>
      </View>
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
          <Button
            disabled={loading}
            mode="contained"
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/exposure",
                params: {
                  points: JSON.stringify(exposurePoints),
                },
              })
            }>
            <Text style={{ color: "#fff" }} className="text-lg">
              Exposure
            </Text>
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/future-exposure",
                params: {
                  points: JSON.stringify(futureExposures),
                },
              })
            }>
            <Text style={{ color: "#fff" }} className="text-lg">
              Future Exposure
            </Text>
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => {
              router.push("/");
            }}>
            <Text style={{ color: "#fff" }} className="text-lg">
              Log Out
            </Text>
          </Button>
        </ScrollView>
      </View>
      {initialRegion && exposures && (
        <MapView style={styles.map} initialRegion={initialRegion}>
          {currentLocation && (
            <Marker
              pinColor="blue"
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
            />
          )}
          {
            <Circle
              center={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              radius={500}
              strokeWidth={2}
              strokeColor="blue"
              fillColor="rgba(0, 0, 255, 0.2)"
            />
          }
          {exposures &&
            exposures.length > 1 &&
            exposures.map((exposure: any, index: number) => (
              <Marker
                key={index}
                pinColor="red"
                coordinate={{
                  latitude: exposure.latitude,
                  longitude: exposure.longitude,
                }}
                title={
                  exposure.title +
                  " (" +
                  exposure.description +
                  ") on " +
                  exposure.date +
                  " in " +
                  exposure.location
                }
              />
            ))}
          {exposures &&
            exposures.length > 1 &&
            exposures.map((exposure: any, index: number) => (
              <Circle
                key={index}
                center={{
                  latitude: exposure.latitude,
                  longitude: exposure.longitude,
                }}
                radius={
                  exposure.severity === "mild"
                    ? 100
                    : exposure.severity === "moderate"
                    ? 250
                    : exposure.severity === "severe"
                    ? 500
                    : 100
                }
                strokeWidth={2}
                strokeColor="red"
                fillColor="rgba(255, 0, 0, 0.1)"
              />
            ))}
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
