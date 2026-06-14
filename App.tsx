import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Marker,
  UrlTile,
  type LatLng,
  type MapPressEvent,
  type MarkerDragStartEndEvent,
  type Region,
} from 'react-native-maps';

const UMN_COORDINATE: LatLng = {
  latitude: -6.256803,
  longitude: 106.618092,
};

const INITIAL_REGION: Region = {
  ...UMN_COORDINATE,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

export default function App() {
  const mapRef = useRef<MapView | null>(null);
  const [markerCoordinate, setMarkerCoordinate] =
    useState<LatLng>(UMN_COORDINATE);
  const [permissionStatus, setPermissionStatus] = useState('Not requested');
  const [message, setMessage] = useState('Marker is centered at UMN.');
  const [isLocating, setIsLocating] = useState(false);

  const focusMarker = (coordinate: LatLng) => {
    mapRef.current?.animateToRegion(
      {
        ...coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  const updateMarker = (coordinate: LatLng, nextMessage: string) => {
    setMarkerCoordinate(coordinate);
    setMessage(nextMessage);
    focusMarker(coordinate);
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    setMessage('Requesting foreground location access...');

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(permission.status);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setMessage('Location permission was not granted.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateMarker(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        'Current location loaded.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to read the current location.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    updateMarker(event.nativeEvent.coordinate, 'Marker updated from map tap.');
  };

  const handleMarkerDragEnd = (event: MarkerDragStartEndEvent) => {
    updateMarker(
      event.nativeEvent.coordinate,
      'Marker updated from drag gesture.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.course}>IF670 - Module 10</Text>
            <Text style={styles.title}>Maps & Geolocation</Text>
          </View>
          <View style={styles.badge}>
            <MaterialCommunityIcons color="#064E3B" name="map-marker-radius" size={18} />
            <Text style={styles.badgeText}>OSM</Text>
          </View>
        </View>

        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            initialRegion={INITIAL_REGION}
            loadingEnabled
            mapType={Platform.OS === 'android' ? 'none' : 'standard'}
            onPress={handleMapPress}
            showsCompass
            showsScale
            style={styles.map}
          >
            <UrlTile
              maximumZ={19}
              tileSize={256}
              urlTemplate={OSM_TILE_URL}
              zIndex={-1}
            />
            <Marker
              coordinate={markerCoordinate}
              draggable
              onDragEnd={handleMarkerDragEnd}
              title="Selected Coordinate"
              description={`${formatCoordinate(markerCoordinate.latitude)}, ${formatCoordinate(markerCoordinate.longitude)}`}
            />
          </MapView>

          <View pointerEvents="none" style={styles.attribution}>
            <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={isLocating}
            onPress={getCurrentLocation}
            style={[styles.locationButton, isLocating && styles.disabledButton]}
          >
            {isLocating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons color="#FFFFFF" name="locate" size={21} />
            )}
            <Text style={styles.locationButtonText}>
              {isLocating ? 'Finding Location' : 'Get Geo Location'}
            </Text>
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Ionicons color="#2563EB" name="shield-checkmark" size={17} />
              <Text style={styles.statusText}>{permissionStatus}</Text>
            </View>
            <Text numberOfLines={1} style={styles.message}>
              {message}
            </Text>
          </View>

          <View style={styles.coordinateGrid}>
            <View style={styles.coordinateBox}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.coordinateValue}>
                {formatCoordinate(markerCoordinate.latitude)}
              </Text>
            </View>
            <View style={styles.coordinateBox}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.coordinateValue}>
                {formatCoordinate(markerCoordinate.longitude)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F766E',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F3',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  course: {
    color: '#B7F7DF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 4,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#D9F99D',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  mapWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  attribution: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 10,
  },
  attributionText: {
    color: '#334155',
    fontSize: 11,
    letterSpacing: 0,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#D9E2DD',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  locationButton: {
    alignItems: 'center',
    backgroundColor: '#E11D48',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9F1239',
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#1E3A8A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'capitalize',
  },
  message: {
    color: '#475569',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
  },
  coordinateGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  coordinateBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DDE5EA',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  coordinateLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  coordinateValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 8,
  },
});
