import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL_MOBILE;
console.log("Backend URL:", backendUrl);

const useApi = ({ useToken }: { useToken: boolean }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const apiInstance = useMemo(() => {
    return axios.create({
      baseURL: backendUrl,
      timeout: 100000,
      headers: {
        "Content-Type": "application/json",
        Authorization: token && useToken ? `Bearer ${token}` : "",
      },
    });
  }, [token, useToken]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        setToken(savedToken);
      } catch (error) {
        console.error("Error fetching token from AsyncStorage", error);
      } finally {
        setLoading(false);
      }
    };

    if (useToken) {
      fetchToken();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return null;
  }

  return apiInstance;
};

export default useApi;
