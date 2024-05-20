import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../constants/colors";

const Favoris = ({ navigation }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("awaitedPlaces");
      if (storedItems !== null) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error fetching awaited places:", error);
    }
  };

  const deleteItem = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    AsyncStorage.setItem("awaitedPlaces", JSON.stringify(updatedItems))
      .then(() => {
        console.log("Item deleted from AsyncStorage");
      })
      .catch((error) => {
        console.error("Error deleting item from AsyncStorage:", error);
        Alert.alert("Error", "An error occurred while deleting the item.");
      });
  };

  const toggleDescription = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, showDescription: !item.showDescription }
          : item
      )
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No awaited places</Text>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.showDescription ? (
                <>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <TouchableOpacity
                    style={styles.showLessButton}
                    onPress={() => toggleDescription(item.id)}
                  >
                    <Text style={styles.showLessButtonText}>Show Less</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.itemDescription}>
                    {item.description.length > 100
                      ? item.description.substring(0, 100) + "..."
                      : item.description}
                  </Text>
                  {item.description.length > 100 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => toggleDescription(item.id)}
                    >
                      <Text style={styles.showMoreButtonText}>Show More</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              <Text style={styles.itemType}>Type: {item.type}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteItem(item.id)}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  itemContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 20,
    borderRadius: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDescription: {
    fontSize: 16,
    color: "#555",
  },
  showMoreButton: {
    marginTop: 5,
    alignSelf: "flex-end",
  },
  showMoreButtonText: {
    color: "blue",
  },
  showLessButton: {
    marginTop: 5,
    alignSelf: "flex-end",
  },
  showLessButtonText: {
    color: "blue",
  },
  itemType: {
    fontSize: 16,
    color: "#777",
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Favoris;
