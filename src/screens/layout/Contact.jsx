import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button, Alert } from "react-native";
import * as MailComposer from "expo-mail-composer";

const Contact = () => {
  const [feedback, setFeedback] = useState("");

  const sendFeedback = () => {
    // Check if feedback is not empty
    if (!feedback.trim()) {
      Alert.alert("Feedback is required");
      return;
    }

    // Construct the email
    const emailSubject = "Feedback from App";
    const emailAddress = "azizouachem@gmail.com";

    // Open email composer with pre-filled fields
    MailComposer.composeAsync({
      recipients: [emailAddress],
      subject: emailSubject,
      body: feedback,
    })
      .then((result) => {
        if (result.status === "sent") {
          // Email sent successfully
          Alert.alert("Feedback sent successfully");
          setFeedback(""); // Clear feedback input
        } else {
          // Email not sent
          Alert.alert("Failed to send feedback");
        }
      })
      .catch((error) => {
        console.error("Error sending feedback:", error);
        Alert.alert("An error occurred while sending feedback");
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter your feedback"
        value={feedback}
        onChangeText={setFeedback}
      />
      <Button title="Send Feedback" onPress={sendFeedback} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    height: 150,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});

export default Contact;
