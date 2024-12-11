import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../App"; // Ensure correct context import

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null); // State to store the profile image
  const { users, setUsers } = useContext(AuthContext);

  const generateId = () => {
    return Date.now().toString(); // Using timestamp as a unique id
  };

  // This function saves the new user
  const handleSave = async () => {
  if (!email || !password || !confirmPassword) {
    Alert.alert("Sign Up Failed", "All fields are required.");
    return;
  }

  if (!email.includes("@email.com")) {
    Alert.alert("Sign Up Failed", "Email must include '@email.com'.");
    return;
  }

  if (password.length < 7) {
    Alert.alert("Sign Up Failed", "Password must be at least 7 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert("Sign Up Failed", "Passwords do not match.");
    return;
  }

  const emailExists = users.some(user => user.email === email);
if (emailExists) {
  Alert.alert("Sign Up Failed", "An account with this email already exists.");
  return;
}

  let imageUrl = "https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png";

  if (profileImage) {
    const formData = new FormData();
    formData.append("image", {
      uri: profileImage,
      name: "profile.jpg", // You can change the file name as needed
      type: "image/jpeg",
    });

    try {
      const uploadResponse = await fetch("http://192.168.160.50:5000/uploadImage", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json();
        imageUrl = url;
      } else {
        Alert.alert("Error", "Failed to upload the image.");
        return;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "An error occurred while uploading the image.");
      return;
    }
  }

  const newUser = {
    id: generateId(),
    email,
    password,
    imageUrl,
  };

  try {
    const response = await fetch("http://192.168.160.50:5000/addAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      Alert.alert("Success", "User registered successfully!");
      setUsers((prevUsers) => [...prevUsers, newUser]);
      navigation.navigate("UserList");
    } else {
      Alert.alert("Error", "Failed to save user. Please try again.");
    }
  } catch (error) {
    console.error("Save user error:", error);
    Alert.alert("Error", "An error occurred while saving the user.");
  }
};


  // Function to take profile photo using camera
  const takeProfilePhoto = async () => {
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

    return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Sign Up</Text>

        <TouchableOpacity style={styles.profileImageContainer} onPress={takeProfilePhoto}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <TouchableOpacity onPress={takeProfilePhoto}>
              <Image
                source={{
                  uri: "https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png",
                }}
                style={styles.defaultProfileIcon}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#444" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  card: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  defaultProfileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    opacity: 0.6,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    width: "45%",
    backgroundColor: "#c50c0c",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});