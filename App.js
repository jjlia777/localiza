import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';


export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const destination = {
    latitude: -23.54, // Latitude de exemplo
    longitude: -46.36, // Longitude de exemplo
  };
  const [route, setRoute] = useState([]);

  const calculateRoute = async (origin, destination) => {
    try {
      // Coordenadas de origem e destino
      const originCoords = `${origin.longitude},${origin.latitude}`;
      const destinationCoords = `${destination.longitude},${destination.latitude}`;
      
      // URL do servidor OSRM
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords};${destinationCoords}?overview=full&geometries=geojson`;
  
      // Fazer a requisição usando fetch
      const response = await fetch(osrmUrl);
      const data = await response.json();
  
      // Verificar se a resposta contém a rota
      if (data.routes && data.routes.length > 0) {
        // Extrair a geometria (linha) da rota
        const routeData = data.routes[0].geometry.coordinates;
  
        // Converter as coordenadas para o formato esperado pelo react-native-maps
        const routeCoordinates = routeData.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
  
        // Atualizar o estado da rota
        setRoute(routeCoordinates);
      }
    } catch (error) {
      console.error("Erro ao calcular a rota:", error);
    }
  };

  useEffect(() => {
    (async () => {
      // Solicita permissão para acessar a localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão para acessar localização negada.');
        return;
      }

      // Obtém a localização atual
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      calculateRoute(location.coords, destination);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      > 
      <Marker
          coordinate={{
            latitude: -23.537995660647702,
            longitude: -46.35843376436415,
          }}
          title="Você está aqui"
          description="Seu nome"
        >
          <FontAwesome name="home" size={40} color="blue" />
        </Marker>
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Você está aqui"
          description="Seu nome"
        >
          <FontAwesome name="bus" size={40} color="yellow" />
        </Marker>
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
        {/* </MapView> apenas para localização */}       
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
