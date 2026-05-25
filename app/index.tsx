import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import CarruselImagenes from '../components/CarruselImagenes';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
        >
            <StatusBar style="light" />
            
            <View style={styles.header}>
                <Image 
                    source={require('../assets/images/icon.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.titulo}>FixFinder</Text>
                <Text style={styles.subtitulo}>Reparaciones a domicilio</Text>
            </View>
            
            {/* Carrusel de imágenes */}
            <CarruselImagenes />
            
            <View style={styles.card}>
                <Text style={styles.bienvenida}>¡Bienvenido a FixFinder!</Text>
                <Text style={styles.descripcion}>
                    Conectamos clientes con técnicos especializados para reparaciones rápidas y confiables
                </Text>
                
                <Pressable 
                    style={styles.botonCliente} 
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.botonTexto}>📱 Cliente</Text>
                </Pressable>
                
                <Pressable 
                    style={styles.botonTecnico} 
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.botonTextoSec}>🔧 Soy técnico</Text>
                </Pressable>
            </View>

            <View style={styles.categorias}>
                <Text style={styles.categoriasTitulo}>Categorías disponibles</Text>
                <View style={styles.gridCategorias}>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>📱</Text>
                        <Text style={styles.categoriaTexto}>Celulares</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>🔌</Text>
                        <Text style={styles.categoriaTexto}>Electrodomésticos</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>🚰</Text>
                        <Text style={styles.categoriaTexto}>Fontanería</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>💻</Text>
                        <Text style={styles.categoriaTexto}>Computadores</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>🔧</Text>
                        <Text style={styles.categoriaTexto}>Electrónica</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>🧹</Text>
                        <Text style={styles.categoriaTexto}>Limpieza</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>🔒</Text>
                        <Text style={styles.categoriaTexto}>Cerrajería</Text>
                    </View>
                    <View style={styles.categoriaItem}>
                        <Text style={styles.categoriaEmoji}>🪑</Text>
                        <Text style={styles.categoriaTexto}>Muebles</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerTexto}>FixFinder - Reparaciones a domicilio</Text>
                <Text style={styles.footerVersion}>Versión 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    scrollContent: { flexGrow: 1, paddingBottom: 30 },
    header: { backgroundColor: '#111827', padding: 40, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    logo: { width: 80, height: 80, marginBottom: 10 },
    titulo: { fontSize: 34, fontWeight: 'bold', color: 'white', marginBottom: 8 },
    subtitulo: { fontSize: 16, color: '#9ca3af' },
    card: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 20, elevation: 5 },
    bienvenida: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12, textAlign: 'center' },
    descripcion: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
    botonCliente: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    botonTecnico: { backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#111827' },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    botonTextoSec: { color: '#111827', fontWeight: 'bold', fontSize: 16 },
    categorias: { marginHorizontal: 20, marginBottom: 20 },
    categoriasTitulo: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
    gridCategorias: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    categoriaItem: { backgroundColor: 'white', width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 12, elevation: 2 },
    categoriaEmoji: { fontSize: 30, marginBottom: 8 },
    categoriaTexto: { fontSize: 14, color: '#111827', fontWeight: '500' },
    footer: { alignItems: 'center', padding: 20, marginTop: 10 },
    footerTexto: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
    footerVersion: { fontSize: 10, color: '#9ca3af', marginTop: 5 },
});