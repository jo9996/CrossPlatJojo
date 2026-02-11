import { Image, ScrollView, StyleSheet, Text, View, ImageSourcePropType } from "react-native";

interface Operator {
  name: string;
  subclass: string;
  image: ImageSourcePropType;
}

const OPERATORS: Operator[] = [
  { name: "Skyfire", subclass: "Splash Caster", image: require('../assets/images/skfire.png') },
  { name: "Lin", subclass: "Phalanx Caster", image: require('../assets/images/lin.png') },
  { name: "Muelsyse", subclass: "Tactician Vanguard", image: require('../assets/images/mlyss.png') },
  { name: "Viviana", subclass: "Arts Fighter Guard", image: require('../assets/images/vvana.png') },
];

export default function Index() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {OPERATORS.map((op, index) => (
          <View key={index} style={styles.itemContainer}>
            <Image source={op.image} style={styles.image} />
            <Text style={styles.text}>{op.name}</Text>
            <Text style={styles.subtext}>{op.subclass}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 20 },
  itemContainer: { alignItems: 'center', marginBottom: 20 },
  image: { width: 100, height: 100, marginTop: 20, marginBottom: 10 },
  text: { fontSize: 20, fontWeight: 'bold' },
  subtext: { fontSize: 16, color: '#666' }
});