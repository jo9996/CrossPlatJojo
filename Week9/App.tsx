import { StatusBar } from "expo-status-bar";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PickedImage = {
  uri: string;
  source: "camera" | "gallery";
};

const getFileExtension = (uri: string) => {
  const cleanUri = uri.split("?")[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? "jpg";
};

export default function App() {
  const [image, setImage] = useState<PickedImage | null>(null);
  const [savedUri, setSavedUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openCamera = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri, source: "camera" });
      setSavedUri(null);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Gallery permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri, source: "gallery" });
      setSavedUri(null);
    }
  };

  const saveImage = async () => {
    if (!image) {
      Alert.alert("No image", "Open the camera or gallery first.");
      return;
    }

    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Photo library save permission is required.");
      return;
    }

    try {
      setIsSaving(true);
      const extension = getFileExtension(image.uri);
      const filename = `week9-${Date.now()}.${extension}`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.copyAsync({
        from: image.uri,
        to: localUri,
      });

      const info = await FileSystem.getInfoAsync(localUri);

      if (!info.exists) {
        throw new Error("The copied file could not be found in app storage.");
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
      setSavedUri(localUri);
      Alert.alert("Image saved", "The image was saved to app storage and your gallery.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save image.";
      Alert.alert("Save failed", message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.kicker}>IF670 - Module 9</Text>
        <Text style={styles.title}>Camera, Storage, Filesystem</Text>
        <Text style={styles.subtitle}>
          Capture a photo or choose one from the gallery, preview it, then save it through
          FileSystem into your media library.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={openCamera}>
            <Text style={styles.primaryButtonText}>OPEN CAMERA</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={openGallery}>
            <Text style={styles.secondaryButtonText}>OPEN GALLERY</Text>
          </Pressable>
        </View>

        <View style={styles.preview}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={styles.emptyTitle}>No image selected</Text>
              <Text style={styles.emptyText}>Use the camera or gallery button above.</Text>
            </View>
          )}
        </View>

        <Pressable
          style={[styles.saveButton, (!image || isSaving) && styles.disabledButton]}
          onPress={saveImage}
          disabled={!image || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>SAVE IMAGE</Text>
          )}
        </Pressable>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusText}>
            {savedUri
              ? `Saved to app storage: ${savedUri}`
              : image
                ? `Ready to save ${image.source} image.`
                : "Waiting for an image."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  kicker: {
    color: "#2f6f73",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#18212f",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitle: {
    color: "#55606f",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 26,
  },
  primaryButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#246bfe",
    borderRadius: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#e3f2df",
    borderColor: "#8fc87e",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: "#275d23",
    fontSize: 13,
    fontWeight: "800",
  },
  preview: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe2ee",
    borderRadius: 8,
    borderWidth: 1,
    height: 310,
    marginTop: 24,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  emptyPreview: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "#273243",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#6b7482",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    minHeight: 50,
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    backgroundColor: "#8b95a5",
  },
  statusPanel: {
    backgroundColor: "#edf3f4",
    borderRadius: 8,
    marginTop: 18,
    padding: 14,
  },
  statusLabel: {
    color: "#2f6f73",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusText: {
    color: "#384252",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
