import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsReady(true), 2000);
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
                <Image 
                    source={require('../assets/images/icon.png')} 
                    style={{ width: 100, height: 100, marginBottom: 20 }}
                    resizeMode="contain"
                />
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: 'white', marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>FixFinder</Text>
                <Text style={{ color: '#9ca3af', marginTop: 5, fontSize: 12 }}>Reparaciones a domicilio</Text>
            </View>
        );
    }

    return (
        <>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#111827' },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: '#f3f4f6' },
                }}
            >
                {/* Pantallas principales */}
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ title: 'Iniciar Sesión', headerBackVisible: true }} />
                <Stack.Screen name="registro" options={{ title: 'Registro de Usuario', headerBackVisible: true }} />
                <Stack.Screen name="acerca" options={{ title: 'Acerca de', headerBackVisible: true }} />
                <Stack.Screen name="soporte" options={{ title: 'Centro de Ayuda', headerBackVisible: true }} />
                <Stack.Screen name="cerrar-sesion" options={{ title: 'Cerrar Sesión', headerBackVisible: true }} />
                
                {/* Pantallas de CLIENTE */}
                <Stack.Screen name="cliente/index" options={{ title: 'FixFinder Cliente', headerBackVisible: true }} />
                <Stack.Screen name="cliente/solicitar" options={{ title: 'Nueva Solicitud', headerBackVisible: true }} />
                <Stack.Screen name="cliente/mis-solicitudes" options={{ title: 'Mis Solicitudes', headerBackVisible: true }} />
                <Stack.Screen name="cliente/perfil" options={{ title: 'Mi Perfil', headerBackVisible: true }} />
                <Stack.Screen name="cliente/ofertas/[id]" options={{ title: 'Ofertas', headerBackVisible: true }} />
                <Stack.Screen name="cliente/calificar/[id]" options={{ title: 'Calificar Técnico', headerBackVisible: true }} />
                
                {/* Pantallas de TÉCNICO */}
                <Stack.Screen name="tecnico/index" options={{ title: 'FixFinder Técnico', headerBackVisible: true }} />
                <Stack.Screen name="tecnico/solicitudes" options={{ title: 'Solicitudes Disponibles', headerBackVisible: true }} />
                <Stack.Screen name="tecnico/mis-trabajos" options={{ title: 'Mis Trabajos', headerBackVisible: true }} />
                <Stack.Screen name="tecnico/estadisticas" options={{ title: 'Estadísticas', headerBackVisible: true }} />
                <Stack.Screen name="tecnico/perfil" options={{ title: 'Mi Perfil', headerBackVisible: true }} />
                <Stack.Screen name="tecnico/calificar/[id]" options={{ title: 'Calificar Cliente', headerBackVisible: true }} />
                
                {/* Pantalla de Chat (comentada porque no se usa) */}
                {/* <Stack.Screen name="chat/[id]" options={{ title: 'Chat', headerBackVisible: true }} /> */}
                
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}