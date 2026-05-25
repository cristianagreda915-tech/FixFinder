import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SolicitudesDisponibles() {
    const router = useRouter();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const cargarSolicitudes = async () => {
        try {
            console.log('Cargando solicitudes...');
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('No hay usuario autenticado');
                router.push('/login');
                return;
            }
            
            console.log('Usuario ID:', user.id);
            
            // Obtener solicitudes pendientes (no aceptadas por nadie aún)
            const { data, error } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('estado', 'pendiente')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error al cargar:', error);
                Alert.alert('Error', error.message);
                return;
            }
            
            console.log('Solicitudes encontradas:', data?.length || 0);
            setSolicitudes(data || []);
            
        } catch (error: any) {
            console.error('Error general:', error);
            Alert.alert('Error', error.message || 'Error al cargar solicitudes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarSolicitudes();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        cargarSolicitudes();
    };

    const aceptarSolicitud = async (solicitud: any) => {
        Alert.alert(
            'Aceptar Trabajo',
            `¿Deseas aceptar este trabajo?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        
                        const { error } = await supabase
                            .from('solicitudes')
                            .update({ 
                                estado: 'aceptada', 
                                tecnico_id: user?.id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', solicitud.id);
                        
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            Alert.alert('Éxito', 'Trabajo aceptado');
                            cargarSolicitudes();
                        }
                    }
                }
            ]
        );
    };

    const getCategoriaIcon = (categoria: string) => {
        switch (categoria) {
            case 'celulares': return '📱';
            case 'electrodomesticos': return '🔌';
            case 'fontaneria': return '🚰';
            case 'computadores': return '💻';
            default: return '🔧';
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.categoriaIcon}>{getCategoriaIcon(item.categoria)}</Text>
                <Text style={styles.tituloCard}>{item.titulo}</Text>
            </View>
            <Text style={styles.descripcion} numberOfLines={3}>{item.descripcion}</Text>
            <Text style={styles.direccion}>📍 {item.direccion}</Text>
            {item.presupuesto_maximo && (
                <Text style={styles.presupuesto}>💰 Presupuesto: ${item.presupuesto_maximo.toLocaleString()}</Text>
            )}
            <Text style={styles.fecha}>📅 {new Date(item.created_at).toLocaleDateString()}</Text>
            
            <Pressable style={styles.botonAceptar} onPress={() => aceptarSolicitud(item)}>
                <Text style={styles.botonAceptarTexto}>✓ Aceptar Trabajo</Text>
            </Pressable>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111827" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.titulo}>Solicitudes Disponibles</Text>
            </View>

            <FlatList
                data={solicitudes}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🎉</Text>
                        <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
                        <Text style={styles.emptySubtext}>Vuelve más tarde</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#111827', padding: 20, paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    titulo: { fontSize: 20, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center', marginRight: 40 },
    listContainer: { padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    categoriaIcon: { fontSize: 24 },
    tituloCard: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 },
    descripcion: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
    direccion: { color: '#111827', fontSize: 13, marginBottom: 5 },
    presupuesto: { color: '#10b981', fontSize: 13, fontWeight: 'bold', marginBottom: 5 },
    fecha: { color: '#9ca3af', fontSize: 11, marginBottom: 12 },
    botonAceptar: { backgroundColor: '#10b981', padding: 12, borderRadius: 10, alignItems: 'center' },
    botonAceptarTexto: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', padding: 50 },
    emptyEmoji: { fontSize: 70, marginBottom: 15 },
    emptyText: { fontSize: 18, color: '#6b7280', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#9ca3af' },
});