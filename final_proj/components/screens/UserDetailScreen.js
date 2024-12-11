import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function UserDetailScreen({ route, navigation }) {
  const { user, setUsers } = route.params;  // Get user data passed from the previous screen
  const [email, setEmail] = useState(user.email);  // Editable email state
  const [password, setPassword] = useState("");  // Leave password empty
  const [confirmPassword, setConfirmPassword] = useState("");  // Leave confirm password empty
  const [profileImage, setProfileImage] = useState(user.imageUrl || "https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png");  // Editable image URL state

  // Function to open image picker for either camera or gallery
  const pickImage = async () => {
    const action = await Alert.alert(
      "Choose Image Source",
      "Select image from camera or gallery.",
      [
        {
          text: "Camera",
          onPress: () => openCamera(),
        },
        {
          text: "Gallery",
          onPress: () => openGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Function to launch the camera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to grant permission to access the camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Update the image URI with the photo taken
    }
  };

  // Function to open the gallery
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to grant permission to access the gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Update the image URI with the selected image
    }
  };

  // Function to save the updated user data
  const handleSave = async () => {
  if (password !== confirmPassword) {
    Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
    return;
  }

  try {
    let imageUrl = profileImage;

    // Upload image to server if it's a new image
    if (profileImage !== user.imageUrl) {
      const formData = new FormData();
      formData.append("image", {
        uri: profileImage,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      const imageResponse = await fetch("http://192.168.160.50:5000/uploadImage", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.url; // Get the uploaded image URL
      } else {
        Alert.alert("Image Upload Failed", "Could not upload the image. Please try again.");
        return;
      }
    }

    // Prepare the updated data
    const updatedData = {
      newEmail: email,
      newPassword: password,
      newImageUrl: imageUrl,
    };

    // Update the account on the server
    const response = await fetch(`http://192.168.160.50:5000/updateAccount/${user.email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const updatedUser = { ...user, email, password, imageUrl };
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? updatedUser : u))
      );

      Alert.alert("Success", "User details updated successfully!");
      navigation.navigate("UserList"); // Go back to the UserList screen
    } else {
      const errorText = await response.text();
      Alert.alert("Update Failed", errorText || "Could not update user details.");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    Alert.alert("Error", "An error occurred while updating user details.");
  }
};


  return (
  <View style={styles.container}>
    <View style={styles.card}>
      {/* Editable Profile Image with TouchableOpacity */}
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      </TouchableOpacity>

      {/* Editable Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Label for New Password */}
      <Text style={styles.label}>Create New Password?</Text>
      
      {/* Editable New Password Input */}
      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Editable Confirm New Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginLeft: 20,
  },
  saveButton: {
    backgroundColor: "#c50c0c",
    marginTop: 15,
    width: 90,
    height: 35,
    borderRadius: 5,
    justifyContent: "center",
  },
  saveText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },
  card: {
  backgroundColor: "white",
  borderRadius: 10,
  padding: 30,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: .25,
  shadowRadius: 5,
  elevation: 5, // For Android shadow
  marginVertical: 10,
  marginTop: 65,
  width: "90%",
},
});