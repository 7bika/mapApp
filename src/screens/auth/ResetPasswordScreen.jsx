import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import colors from "../../constants/colors";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";

const ResetPasswordScreen = ({ navigation, resetToken }) => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTokenVerified, setIsTokenVerified] = useState(false);

  const verifyToken = async () => {
    setLoading(true);
    try {
      const result = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}users/valid/${token}`
      );
      console.log(result.data, "result");

      if (result.data.isExist) {
        setIsTokenVerified(true);
        setError(null);
      } else {
        setIsTokenVerified(false);
        setError("Invalid token");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while verifying the token.");
      setIsTokenVerified(false);
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the API to reset the password
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}users/resetPassword/${token}`,
        {
          password: password,
          passwordConfirm: confirmPassword,
        }
      );

      setLoading(false);
      navigation.navigate("LoginScreen"); // Redirect to the login screen after successful password reset
    } catch (error) {
      setLoading(false);
      setError(
        error.response && error.response.data
          ? error.response.data.message
          : "Failed to reset password. Please try again later."
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.goBack}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={15} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {isTokenVerified ? "Reset Password" : "Enter Token"}
      </Text>

      {!isTokenVerified && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Token"
            placeholderTextColor={colors.gray}
            value={token}
            onChangeText={setToken}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={verifyToken}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Verify Token</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {isTokenVerified && (
        <>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry // Hide entered characters
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={colors.gray}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry // Hide entered characters
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  goBack: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#0A96E7",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.primary,
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: colors.black,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
  },
});

export default ResetPasswordScreen;
