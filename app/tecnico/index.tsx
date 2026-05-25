import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function TecnicoInicio() {
    const router = useRouter();

    const cerrarSesion = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.header}>
                <Text style={styles.emoji}>🔧</Text>
                <Text style={styles.titulo}>FixFinder</Text>
                <Text style={styles.subtitulo}>Bienvenido Técnico</Text>
            </View>

            <View style={styles.menuContainer}>
                <Pressable style={styles.botonDisponibles} onPress={() => router.push('/tecnico/solicitudes')}>
                    <Text style={styles.botonEmoji}>📋</Text>
                    <Text style={styles.botonTitulo}>Solicitudes</Text>
                    <Text style={styles.botonDescripcion}>Ver trabajos disponibles</Text>
                </Pressable>

                <Pressable style={styles.botonMisTrabajos} onPress={() => router.push('/tecnico/mis-trabajos')}>
                    <Text style={styles.botonEmoji}>✅</Text>
                    <Text style={styles.botonTitulo}>Mis Trabajos</Text>
                    <Text style={styles.botonDescripcion}>Trabajos que has aceptado</Text>
                </Pressable>

                <Pressable style={styles.botonEstadisticas} onPress={() => router.push('/tecnico/estadisticas')}>
                    <Text style={styles.botonEmoji}>📊</Text>
                    <Text style={styles.botonTitulo}>Estadísticas</Text>
                    <Text style={styles.botonDescripcion}>Mis métricas y rendimiento</Text>
                </Pressable>

                <Pressable style={styles.botonPerfil} onPress={() => router.push('/tecnico/perfil')}>
                    <Text style={styles.botonEmoji}>👤</Text>
                    <Text style={styles.botonTitulo}>Mi Perfil</Text>
                    <Text style={styles.botonDescripcion}>Editar mi información</Text>
                </Pressable>

                <Pressable style={styles.botonSoporte} onPress={() => router.push('/soporte')}>
                    <Text style={styles.botonEmoji}>❓</Text>
                    <Text style={styles.botonTitulo}>Ayuda</Text>
                    <Text style={styles.botonDescripcion}>Centro de ayuda</Text>
                </Pressable>

                <Pressable style={styles.botonAcerca} onPress={() => router.push('/acerca')}>
                    <Text style={styles.botonEmoji}>ℹ️</Text>
                    <Text style={styles.botonTitulo}>Acerca de</Text>
                    <Text style={styles.botonDescripcion}>Información de la app</Text>
                </Pressable>

                <Pressable style={styles.botonCerrar} onPress={cerrarSesion}>
                    <Text style={styles.botonEmoji}>🚪</Text>
                    <Text style={styles.botonTitulo}>Cerrar Sesión</Text>
                    <Text style={styles.botonDescripcion}>Salir de la aplicación</Text>
                </Pressable>
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
    emoji: { fontSize: 60, marginBottom: 10 },
    titulo: { fontSize: 34, fontWeight: 'bold', color: 'white' },
    subtitulo: { fontSize: 16, color: '#9ca3af', marginTop: 5 },
    menuContainer: { padding: 20, gap: 20 },
    botonDisponibles: { backgroundColor: '#111827', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    botonMisTrabajos: { backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: '#e5e7eb' },
    botonEstadisticas: { backgroundColor: '#f59e0b', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    botonPerfil: { backgroundColor: '#10b981', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    botonSoporte: { backgroundColor: '#8b5cf6', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    botonAcerca: { backgroundColor: '#3b82f6', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    botonCerrar: { backgroundColor: '#ef4444', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    botonEmoji: { fontSize: 50, marginBottom: 10 },
    botonTitulo: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    botonDescripcion: { fontSize: 14, color: '#6b7280' },
    footer: { alignItems: 'center', padding: 20, marginTop: 10 },
    footerTexto: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
    footerVersion: { fontSize: 10, color: '#9ca3af', marginTop: 5 },
});