import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Card } from "react-native-paper";
import colors from "../../constants/colors";
import { getToken } from "../../composable/local"; // Make sure to import your token fetching utility

const ListofMaps = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserPlaces, setShowUserPlaces] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showFullDescriptions, setShowFullDescriptions] = useState({});

  useEffect(() => {
    fetchUser();
    fetchPlaces();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setUserId(data.data.user._id);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  console.log(userId);

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}places`);
      if (!response.ok) {
        throw new Error("Failed to fetch places");
      }
      const data = await response.json();
      setPlaces(data.data.places);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert("Error", "An error occurred while fetching the places.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showUserPlaces) {
      setFilteredPlaces(
        places.filter((place) => place.createdBy._id === userId)
      );
    } else {
      setFilteredPlaces(places);
    }
  }, [showUserPlaces, places, userId]);

  const handleTogglePlaces = () => {
    setShowUserPlaces(!showUserPlaces);
  };

  const toggleDescription = (id) => {
    setShowFullDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderPlace = ({ item }) => {
    const formattedDescription = showFullDescriptions[item.id]
      ? item.description
      : item.description.slice(0, 30) +
        (item.description.length > 30 ? "..." : "");

    const formattedDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const handleDelete = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}places/${item.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete place");
        }
        setPlaces((prevPlaces) =>
          prevPlaces.filter((place) => place.id !== item.id)
        );
      } catch (error) {
        console.error("Error deleting place:", error);
        Alert.alert("Error", "An error occurred while deleting the place.");
      }
    };

    const userIsAdmin = false;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.placeDescription}>
            {formattedDescription}
            {item.description.length > 30 && (
              <Text
                style={styles.readMore}
                onPress={() => toggleDescription(item.id)}
              >
                {showFullDescriptions[item.id] ? " Show less" : " Read more"}
              </Text>
            )}
          </Text>
          <Text style={styles.placeDescription}>type : {item.type}</Text>
          <Text style={styles.placeDescription}>
            Date de création: {formattedDate(item.createdAt)}
          </Text>
          <View style={styles.createdBy}>
            <Text style={styles.placeDescription}>
              Créer par: {item.createdBy.name}
            </Text>
            <Text style={styles.placeDescription}>
              Créer en: {formattedDate(item.createdAt)}
            </Text>
            <Text style={styles.placeDescription}>
              Modifier en: {formattedDate(item.updatedAt)}
            </Text>
          </View>
          {/* Render delete button if the user is admin or creator of the place */}
          {(item.createdBy._id === userId || userIsAdmin) && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleTogglePlaces}
      >
        <Text style={styles.toggleButtonText}>
          {showUserPlaces ? "Show All Places" : "Show My Places"}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={filteredPlaces}
        renderItem={renderPlace}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayLight,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingVertical: 10,
  },
  card: {
    marginVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 15,
  },
  placeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  placeDescription: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 5,
  },
  readMore: {
    color: colors.primary,
    fontWeight: "bold",
  },
  createdBy: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteButton: {
    color: colors.red, // or any color you prefer for delete button
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default ListofMaps;
