import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { Avatar, Card } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import styles from "./AppStyles";
import userData from "./data.json";

export default function App() {
  return (
    <SafeAreaProvider>
      <Stack.Screen options={{ title: "User List" }} />

      <ScrollView>
        <View style={styles.container}>
          {userData.map((user, index) => (
            <Card style={styles.cardContainer} key={index} mode="outlined">
              <Card.Title
                title={user.name}
                titleVariant="titleMedium"
                titleStyle={{ fontWeight: 'bold' }}
                subtitle={user.email}
                left={(props) => (
                  <Avatar.Image 
                    {...props} 
                    size={50} 
                    source={{ uri: user.photo_url }} 
                  />
                )}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
