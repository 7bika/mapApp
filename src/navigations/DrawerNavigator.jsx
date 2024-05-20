import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  SimpleLineIcons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Home from "./../screens/layout/Home";
import Favoris from "./../screens/layout/Favoris";
import Contact from "./../screens/layout/Contact";
import Profile from "./../screens/layout/Profile";
import ListofMaps from "./../screens/layout/ListofMaps";
import colors from "../constants/colors";
import EditUser from "../screens/layout/EditUser";
import { useNavigation } from "@react-navigation/native";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { setIsAuthenticated } = props;

  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}users/logout`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setIsAuthenticated(false);
        navigation.navigate("LoginScreen");
      } else {
        Alert.alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("An error occurred while logging out.");
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToRnGwDt0jnjyObLRudmZP_2urlpsGZljaaO_bo0wd5g&s",
          }}
          style={styles.drawerHeaderImage}
          resizeMode="contain"
        />
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity onPress={handleLogout}>
        <View style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color={colors.gray} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = (props) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveBackgroundColor: colors.primary,
        drawerInactiveBackgroundColor: colors.white,
        drawerActiveTintColor: colors.white,
        drawerInactiveTintColor: colors.gray,
        drawerLabelStyle: { fontSize: 16 },
      }}
      drawerContent={(drawerProps) => (
        <CustomDrawerContent
          {...drawerProps}
          setIsAuthenticated={props.setIsAuthenticated}
        />
      )}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <SimpleLineIcons name="home" size={size} color={color} />
          ),
        }}
        component={Home}
      />
      <Drawer.Screen
        name="List of Maps"
        options={{
          drawerLabel: "Liste des Places",
          drawerIcon: ({ color, size }) => (
            <SimpleLineIcons name="map" size={size} color={color} />
          ),
        }}
        component={ListofMaps}
      />
      <Drawer.Screen
        name="Profile"
        options={{
          drawerLabel: "Profil",
          drawerIcon: ({ color, size }) => (
            <SimpleLineIcons name="user" size={size} color={color} />
          ),
        }}
        component={Profile}
      />
      <Drawer.Screen
        name="Settings"
        options={{
          drawerLabel: "paramètres de profil",
          drawerIcon: ({ color, size }) => (
            <SimpleLineIcons name="settings" size={size} color={color} />
          ),
        }}
        component={EditUser}
      />
      <Drawer.Screen
        name="Favoris"
        options={{
          drawerLabel: "Liste d'attente",
          drawerIcon: ({ color, size }) => (
            <SimpleLineIcons name="hourglass" size={size} color={color} />
          ),
        }}
        component={Favoris}
      />
      <Drawer.Screen
        name="Contact"
        options={{
          drawerLabel: "Contact",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="message-alert-outline"
              size={size}
              color={color}
            />
          ),
        }}
        component={Contact}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  drawerHeaderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
  },
  logoutButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: colors.gray,
  },
});

export default DrawerNavigator;
