import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { getToken } from "./../../composable/local"; // Import your token fetching logic

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaceData, setNewPlaceData] = useState({
    latitude: null,
    longitude: null,
    name: "",
    description: "",
    type: "",
    address: "", // Add address field
    createdBy: "", // Initialize createdBy as an empty string
  });
  const [mapType, setMapType] = useState("standard");
  const [userProfile, setUserProfile] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchPlaces();
    getCurrentLocation();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile(data.data.user);
      setUserId(data.data.user._id); // Set the userId from the fetched profile
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching the user profile."
      );
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}places`);
      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = await response.json();
      const normalizedPlaces = data.data.places.map((place) => ({
        ...place,
        latitude: place.location.coordinates[1], // Ensure correct order
        longitude: place.location.coordinates[0], // Ensure correct order
      }));
      console.log("Fetched places:", normalizedPlaces); // Log fetched places
      setPlaces(normalizedPlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert("Error", "An error occurred while fetching the places.");
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleMapLongPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewPlaceData((prevData) => ({
      ...prevData,
      latitude,
      longitude,
    }));
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}places`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlaceData.name,
          description: newPlaceData.description,
          type: newPlaceData.type,
          address: newPlaceData.address, // Include address field
          createdBy: userId, // Ensure the createdBy field is included
          location: {
            type: "Point",
            coordinates: [newPlaceData.longitude, newPlaceData.latitude], // Set coordinates correctly
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add place");
      }
      setModalVisible(false);
      setTimeout(fetchPlaces, 1000);
    } catch (error) {
      console.error("Error adding place:", error);
      Alert.alert("Error", "An error occurred while adding the place.");
    }
  };

  const toggleMapType = () => {
    setMapType((prevMapType) =>
      prevMapType === "standard" ? "satellite" : "standard"
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        minZoomLevel={7}
        maxZoomLevel={15}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        initialRegion={{
          latitude: 35.0068,
          longitude: 10.6866,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        onLongPress={handleMapLongPress}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.latitude, // Use normalized latitude
              longitude: place.longitude, // Use normalized longitude
            }}
            title={place.name}
            description={place.type}
          >
            <Callout>
              <View>
                <Text>{place.address}</Text>
                <Text>{place.name}</Text>
                <Text>{place.type}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Text style={styles.mapTypeButtonText}>
          Switch to {mapType === "standard" ? "Satellite" : "Standard"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={(text) =>
                setNewPlaceData((prevData) => ({
                  ...prevData,
                  name: text,
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={(text) =>
                setNewPlaceData((prevData) => ({
                  ...prevData,
                  description: text,
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              onChangeText={(text) =>
                setNewPlaceData((prevData) => ({
                  ...prevData,
                  address: text,
                }))
              }
            />
            <Picker
              style={styles.picker}
              selectedValue={newPlaceData.type}
              onValueChange={(itemValue) =>
                setNewPlaceData((prevData) => ({
                  ...prevData,
                  type: itemValue,
                }))
              }
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="r+1" value="r+1" />
              <Picker.Item label="r+2" value="r+2" />
              <Picker.Item label="r+3" value="r+3" />
              <Picker.Item label="terrain vide" value="terrain vide" />
            </Picker>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapTypeButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 10,
  },
  mapTypeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Home;
