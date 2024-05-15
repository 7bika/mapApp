import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const Map = () => {
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState("standard");

  useEffect(() => {
    fetchExistingPlaces();
    getCurrentLocation();
  }, []);

  const fetchExistingPlaces = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}places`);
      const data = await response.json();
      setPlaces(data.data.places);
    } catch (error) {
      console.error("Error fetching existing places:", error);
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

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
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
        //provider={MapView.PROVIDER_GOOGLE}
        mapType={mapType}
        initialRegion={{
          latitude: 35.0068,
          longitude: 10.6866,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        showsUserLocation
        showsMyLocationButton
        onPress={handleMapPress}
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
              latitude: place.location.coordinates[1],
              longitude: place.location.coordinates[0],
            }}
            title={place.name}
            description={place.type}
          >
            <Callout>
              <View>
                <Text>{place.name}</Text>
                <Text>{place.type}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={toggleMapType}>
        <Text style={styles.buttonText}>
          Switch to {mapType === "standard" ? "Satellite" : "Standard"}
        </Text>
      </TouchableOpacity>
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
  locationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Map;
