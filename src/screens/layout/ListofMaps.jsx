import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Card } from "react-native-paper";
import colors from "../../constants/colors";
import { getToken } from "../../composable/local";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ListofMaps = ({ navigation }) => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserPlaces, setShowUserPlaces] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showFullDescriptions, setShowFullDescriptions] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);

  const [editPlaceData, setEditPlaceData] = useState({
    id: null,
    name: "",
    description: "",
  });

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

  const storeItem = async (item) => {
    try {
      const existingItems = await AsyncStorage.getItem("awaitedPlaces");
      const parsedItems = existingItems ? JSON.parse(existingItems) : [];
      const updatedItems = [...parsedItems, item];
      await AsyncStorage.setItem("awaitedPlaces", JSON.stringify(updatedItems));
    } catch (error) {
      console.error("Error storing item:", error);
    }
  };

  const handleAddToAwaited = async (item) => {
    try {
      await storeItem(item);
      navigation.navigate("Favoris", { selectedItem: item });
    } catch (error) {
      console.error("Error adding item to awaited places:", error);
    }
  };

  const openEditModal = (item) => {
    setEditPlaceData({
      id: item.id,
      name: item.name,
      description: item.description,
    });
    setEditModalVisible(true);
  };

  const handleEditPlace = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}places/${editPlaceData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editPlaceData.name,
            description: editPlaceData.description,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to edit place");
      }
      const updatedPlace = await response.json();
      setPlaces((prevPlaces) =>
        prevPlaces.map((place) =>
          place.id === updatedPlace.id ? updatedPlace : place
        )
      );
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error editing place:", error);
      Alert.alert("Error", "An error occurred while editing the place.");
    }
  };

  // delete
  const handleDelete = (item) => {
    setPlaceToDelete(item);
    setDeleteModalVisible(true);
  };

  // confirm delete
  const handleConfirmDelete = async () => {
    if (!placeToDelete) return;
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}places/${placeToDelete.id}`,
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
        prevPlaces.filter((place) => place.id !== placeToDelete.id)
      );
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting place:", error);
      Alert.alert("Error", "An error occurred while deleting the place.");
      setDeleteModalVisible(false);
    }
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
          <Text style={styles.placeDescription}>Type: {item.type}</Text>
          <Text style={styles.placeDescription}>
            Date de création: {formattedDate(item.createdAt)}
          </Text>
          <View style={styles.createdBy}>
            <Text style={styles.placeDescription}>
              Créé par: {item.createdBy.name}
            </Text>
            <Text style={styles.placeDescription}>
              Créé en: {formattedDate(item.createdAt)}
            </Text>
            <Text style={styles.placeDescription}>
              Modifié en: {formattedDate(item.updatedAt)}
            </Text>
          </View>
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() => handleAddToAwaited(item)}
              style={styles.iconButton}
            >
              <AntDesign name="hourglass" size={24} color={colors.primary} />
              <Text style={styles.iconLabel}>En attente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.iconButton}
            >
              <Feather name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.iconLabel2}>Modifier</Text>
            {(item.createdBy._id === userId || userIsAdmin) && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.iconButton}
              >
                <AntDesign name="delete" size={24} color={colors.red} />
                <Text style={styles.iconLabel}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
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
          {showUserPlaces ? "Toutes les places" : "Mes Places"}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={filteredPlaces}
        renderItem={renderPlace}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editPlaceData.name}
              onChangeText={(text) =>
                setEditPlaceData((prevData) => ({ ...prevData, name: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={editPlaceData.description}
              onChangeText={(text) =>
                setEditPlaceData((prevData) => ({
                  ...prevData,
                  description: text,
                }))
              }
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEditPlace}
            >
              <Text style={styles.submitButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* delete modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.confirmationText}>
              Es-tu sur de supprimer ?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: colors.red,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  iconButton: {
    padding: 5,
  },
  iconLabel: {
    fontSize: 12,
    color: colors.gray,
    right: 15,
  },
  iconLabel2: {
    fontSize: 12,
    color: colors.gray,
    top: 30,
    right: 55,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: colors.red,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ListofMaps;
