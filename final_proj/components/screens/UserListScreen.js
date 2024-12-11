import React, { useContext, useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, TextInput } from "react-native";
import { AuthContext } from "../../App";  // Correct import path
import { useNavigation } from "@react-navigation/native";
import io from "socket.io-client";

const socket = io("http://192.168.160.50:5000"); // Your backend URL

export default function UserListScreen({ route }) {
  const { users, setUsers } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch the initial list of users from the server
    fetch("http://192.168.160.50:5000/accounts")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error fetching accounts:", error));

    // Listen for updates from the server
    socket.on("updateAccounts", (updatedAccounts) => {
      setUsers(updatedAccounts);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("updateAccounts");
    };
  }, [setUsers]);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const logout = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("UserDetail", { user: item, setUsers })}>
            <View style={styles.userContainer}>
              <Image
                source={{ uri: item.imageUrl || "https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png" }}
                style={styles.userImage}
              />
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No users found</Text>}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userEmail: {
    fontSize: 16,
  },
  noResults: {
    textAlign: "center",
    fontSize: 18,
    color: "gray",
  },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#c50c0c",
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
