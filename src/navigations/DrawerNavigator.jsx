import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { navigation, setIsAuthenticated } = props;

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigation.navigate("LoginScreen");
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}> Map App</Text>
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
          drawerLabel: "List of Maps",
          drawerIcon: ({ color, size }) => (
            <SimpleLineIcons name="map" size={size} color={color} />
          ),
        }}
        component={ListofMaps}
      />
      <Drawer.Screen
        name="Profile"
        options={{
          drawerLabel: "Profile",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
        component={Profile}
      />
      <Drawer.Screen
        name="Favoris"
        options={{
          drawerLabel: "Favoris",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
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
    padding: 15,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  drawerHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: colors.gray,
  },
});

export default DrawerNavigator;
