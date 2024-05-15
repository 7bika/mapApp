import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import { Avatar, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { getToken } from "../../composable/local";
import colors from "../../constants/colors";

const Profile = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    fetchUserProfile();
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
      setProfileImage(data.data.user.photo);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching the user profile."
      );
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
        const token = await getToken();
        const formData = new FormData();
        formData.append("photo", {
          uri: result.uri,
          name: "profileImage.jpg",
          type: "image/jpeg",
        });

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}users/updateMe`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileImage(data.data.user.photo);
        } else {
          Alert.alert("Failed to upload image. Please try again.");
        }
      } else {
        Alert.alert("You did not select any image.");
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("An error occurred while selecting an image.");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: "https://via.placeholder.com/800x400" }}
        style={styles.background}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            {userProfile && (
              <View style={styles.userInfo}>
                <TouchableOpacity onPress={handleSelectImage}>
                  <Avatar.Image
                    size={100}
                    source={{
                      uri: profileImage || "https://via.placeholder.com/100",
                    }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
                <Text style={styles.userName}>{userProfile.name}</Text>
                <Text style={styles.userRole}>{userProfile.role}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.editButton} onPress={handleLogout}>
              <Text style={styles.editButtonText}>Déconnecter</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgColor,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 5,
    padding: 20,
  },
  content: {
    alignItems: "center",
  },
  logoutButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  userInfo: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  userRole: {
    fontSize: 18,
    color: colors.gray,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 18,
  },
});

export default Profile;
