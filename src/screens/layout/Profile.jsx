import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Avatar, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // Fetch user profile data when the component mounts
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/me`
      );

      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/logout`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        navigation.navigate("LoginScreen");
      } else {
        Alert.alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("An error occurred while logging out.");
    }
  };

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.cancelled) {
        setProfileImage(result.uri);
      } else {
        Alert.alert("You did not select any image.");
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("An error occurred while selecting an image.");
    }
  };

  const handleEditUser = () => {
    navigation.navigate("EditUser");
  };
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {userProfile && (
            <View style={styles.userInfo}>
              <Avatar.Image
                size={100}
                source={{ uri: profileImage || userProfile.profileImageUrl }}
                onPress={handleSelectImage}
              />
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userRole}>{userProfile.role}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handleEditUser}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  card: {
    width: "80%",
  },
  content: {
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: "#0066FF",
    textDecorationLine: "underline",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  userRole: {
    color: "#999999",
    marginTop: 5,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#0066FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default Profile;
