import React, { createContext, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, Text } from "react-native";
import LoginScreen from "./components/screens/LoginScreen";
import UserListScreen from "./components/screens/UserListScreen";
import SignUpScreen from "./components/screens/SignUpScreen";
import UserDetailScreen from "./components/screens/UserDetailScreen"; // Added this

// Create a context for managing users
export const AuthContext = createContext();

const Stack = createStackNavigator();

export default function App() {
  const [users, setUsers] = useState([
    { id: "1", email: "final@email.com", password: "final123", imageUrl:"https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png" }, // Default user with an ID
  ]);

  useEffect(() => {
    const defaultUser = { id:"1", email: "final@email.com", password: "final123", imageUrl: users.imageUrl || "https://static-00.iconduck.com/assets.00/profile-circle-icon-1023x1024-ucnnjrj1.png"};
    // Send default user to the server
    const sendDefaultUser = async () => {
      try {
        const response = await fetch("http://192.168.160.50:5000/addAccount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(defaultUser),
        });
        if (!response.ok) {
          console.error("Failed to add default user to the server.");
        }
      } catch (error) {
        console.error("Error sending default user:", error);
      }
    };

    sendDefaultUser();
  }, []);

  return (
    <AuthContext.Provider value={{ users, setUsers }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "BALANDACA & FERNANDEZ",
              headerStyle: { backgroundColor: "#c50c0c" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="UserList"
            component={UserListScreen}
            options={({ navigation }) => ({
              title: "BALANDACA & FERNANDEZ",
              headerStyle: { backgroundColor: "#c50c0c" },
              headerTintColor: "#fff",
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate("SignUp")}
                  style={{ marginRight: 15 }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    Add
                  </Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              title: "BALANDACA & FERNANDEZ",
              headerStyle: { backgroundColor: "#c50c0c" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={{
              title: "User Details",
              headerStyle: { backgroundColor: "#c50c0c" },
              headerTintColor: "#fff",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

