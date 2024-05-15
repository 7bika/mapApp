import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import Button from "./../../components/Button";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "./../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { login } from "../../apis/api";

const LoginScreen = ({ navigation, setIsAuthenticated }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [error, setError] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const isValidEmail = (email) => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password) => {
    return password.length > 5 && /\d/.test(password);
  };

  const storeData = async (value, user) => {
    try {
      await AsyncStorage.setItem("token", JSON.stringify(value));
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    if (!isValidEmail(email) || !isValidPassword(password)) {
      setError("Invalid email or password");
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    const data = { email, password };
    try {
      const res = await login(data);
      console.log(res.data.status, res.data.token, "datasss");
      if (res.data.status.trim() !== "success" || res.statusCode === 401) {
        setError(res.data.message || "An error occurred during login");
        setErrorModalVisible(true);
      } else {
        await storeData(res.data.token, res.data.data.user);
        setLoading(false);
        setSuccessModalVisible(true);
        const dataFromLocal = await AsyncStorage.getItem("token");
        const token = JSON.parse(dataFromLocal);
        console.log(token, "token");
        setIsAuthenticated(true);
        navigation.navigate("Home");
        setSuccessModalVisible(false);
      }
    } catch (error) {
      setError("An error occurred during login");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, marginHorizontal: 22 }}>
        <View style={{ marginVertical: 22 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              marginVertical: 12,
              color: COLORS.black,
            }}
          >
            BIENVENUE! 👋
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: COLORS.black,
            }}
          >
            Re-bonjour tu nous as manqué!
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 400,
              marginVertical: 8,
            }}
          >
            Email address
          </Text>

          <View
            style={{
              width: "100%",
              height: 48,
              borderColor: COLORS.black,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 22,
            }}
          >
            <TextInput
              placeholder="Enter your email address"
              placeholderTextColor={COLORS.black}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                width: "100%",
              }}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 400,
              marginVertical: 8,
            }}
          >
            Password
          </Text>

          <View
            style={{
              width: "100%",
              height: 48,
              borderColor: COLORS.black,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 22,
            }}
          >
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={COLORS.black}
              secureTextEntry={isPasswordShown}
              autoCapitalize="none"
              style={{
                width: "100%",
              }}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />

            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: "absolute",
                right: 12,
              }}
            >
              {isPasswordShown == true ? (
                <Ionicons name="eye-off" size={24} color={COLORS.black} />
              ) : (
                <Ionicons name="eye" size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginVertical: 6,
          }}
        >
          <Checkbox
            style={{ marginRight: 8 }}
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? COLORS.primary : undefined}
          />

          <Text>Remenber Me</Text>
        </View>

        <Button
          title="Login"
          filled
          style={{
            marginTop: 18,
            marginBottom: 4,
          }}
          loading={loading}
          onPress={fetchData}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: COLORS.grey,
              marginHorizontal: 10,
            }}
          />
          <Text style={{ fontSize: 14 }}>Or Login with</Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: COLORS.grey,
              marginHorizontal: 10,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 22,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.black }}>
            Vous n'avez pas un compte ?
          </Text>
          <Pressable onPress={() => navigation.navigate("SignupScreen")}>
            <Text
              style={{
                fontSize: 16,
                color: COLORS.primary,
                fontWeight: "bold",
                marginLeft: 6,
              }}
            >
              Register
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 22,
          }}
        >
          <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
            <Text
              style={{
                fontSize: 16,
                color: COLORS.primary,
                fontWeight: "bold",
                marginLeft: 6,
              }}
            >
              Oublié ton mot de passe ?
            </Text>
          </Pressable>
        </View>

        {/* Error Modal */}
        <Modal
          visible={errorModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalText}>{error}</Text>
              <TouchableOpacity
                onPress={() => setErrorModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={successModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Success</Text>
              <Text style={styles.modalText}>Login successful!</Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderColor: COLORS.black,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIconContainer: {
    position: "absolute",
    right: 16,
    top: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  registerText: {
    fontSize: 16,
    textAlign: "center",
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    width: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.black,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: COLORS.black,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});

export default LoginScreen;
