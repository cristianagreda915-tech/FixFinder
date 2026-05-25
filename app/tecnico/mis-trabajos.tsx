import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Definir el tipo para los trabajos
interface Trabajo {
    id: string;
    titulo: string;
    descripcion: string;
    direccion: string;
    categoria: string;
    presupuesto_maximo: number;
    precio_acordado: number;
    estado: string;
    created_at: string;
    cliente_id: string;
}

export default function MisTrabajos() {
    const router = useRouter();
    const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const cargarTrabajos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            
            const { data, error } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('tecnico_id', user.id)
                .neq('estado', 'pendiente')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setTrabajos(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { cargarTrabajos(); }, []));

    const onRefresh = () => {
        setRefreshing(true);
        cargarTrabajos();
    };

    const actualizarEstado = async (id: string, estado: string, mensaje: string) => {
        Alert.alert('Actualizar Estado', mensaje, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                onPress: async () => {
                    const { error } = await supabase
                        .from('solicitudes')
                        .update({ estado, updated_at: new Date().toISOString() })
                        .eq('id', id);
                    
                    if (error) {
                        Alert.alert('Error', error.message);
                    } else {
                        Alert.alert('Éxito', `Trabajo ${estado === 'completada' ? 'completado' : 'actualizado'}`);
                        cargarTrabajos();
                    }
                }
            }
        ]);
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'aceptada': return '#10b981';
            case 'en_progreso': return '#3b82f6';
            case 'completada': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getEstadoTexto = (estado: string) => {
        switch (estado) {
            case 'aceptada': return '✅ Aceptada';
            case 'en_progreso': return '🔧 En progreso';
            case 'completada': return '✔️ Completada';
            default: return estado;
        }
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

    const renderItem = ({ item }: { item: Trabajo }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.categoriaIcon}>{getCategoriaIcon(item.categoria)}</Text>
                <Text style={styles.tituloCard}>{item.titulo}</Text>
                <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.estadoTexto}>{getEstadoTexto(item.estado)}</Text>
                </View>
            </View>
            
            <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
            <Text style={styles.direccion}>📍 {item.direccion}</Text>
            
            {item.presupuesto_maximo ? (
                <Text style={styles.presupuesto}>💰 Presupuesto: ${item.presupuesto_maximo.toLocaleString()}</Text>
            ) : null}
            
            {item.precio_acordado ? (
                <Text style={styles.precioAcordado}>✅ Precio acordado: ${item.precio_acordado.toLocaleString()}</Text>
            ) : null}
            
            <View style={styles.botonesContainer}>
                {item.estado === 'aceptada' && (
                    <Pressable style={[styles.botonAccion, styles.botonProgreso]} onPress={() => actualizarEstado(item.id, 'en_progreso', '¿Iniciar el trabajo?')}>
                        <Text style={styles.botonTexto}>🔧 Iniciar Trabajo</Text>
                    </Pressable>
                )}
                
                {item.estado === 'en_progreso' && (
                    <Pressable style={[styles.botonAccion, styles.botonCompletar]} onPress={() => actualizarEstado(item.id, 'completada', '¿Completar este trabajo?')}>
                        <Text style={styles.botonTexto}>✓ Completar Trabajo</Text>
                    </Pressable>
                )}
            </View>
            
            {item.estado === 'completada' && (
                <Pressable style={styles.botonCalificar} onPress={() => router.push(`/tecnico/calificar/${item.id}`)}>
                    <Text style={styles.botonCalificarTexto}>⭐ Calificar Cliente</Text>
                </Pressable>
            )}
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
                <Text style={styles.titulo}>Mis Trabajos</Text>
            </View>

            <FlatList
                data={trabajos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🔧</Text>
                        <Text style={styles.emptyText}>No tienes trabajos asignados</Text>
                        <Pressable style={styles.emptyBoton} onPress={() => router.push('/tecnico/solicitudes')}>
                            <Text style={styles.emptyBotonTexto}>Ver solicitudes disponibles</Text>
                        </Pressable>
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
    titulo: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center', marginRight: 40 },
    listContainer: { padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' },
    categoriaIcon: { fontSize: 22 },
    tituloCard: { fontSize: 15, fontWeight: 'bold', color: '#111827', flex: 1 },
    estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    estadoTexto: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    descripcion: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
    direccion: { color: '#111827', fontSize: 13, marginBottom: 5 },
    presupuesto: { color: '#f59e0b', fontSize: 13, fontWeight: 'bold', marginBottom: 5 },
    precioAcordado: { color: '#10b981', fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
    botonesContainer: { flexDirection: 'row', gap: 10, marginTop: 5 },
    botonAccion: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
    botonProgreso: { backgroundColor: '#3b82f6' },
    botonCompletar: { backgroundColor: '#8b5cf6' },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    botonCalificar: { backgroundColor: '#f59e0b', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    botonCalificarTexto: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', padding: 50 },
    emptyEmoji: { fontSize: 70, marginBottom: 15 },
    emptyText: { fontSize: 18, color: '#6b7280', marginBottom: 8 },
    emptyBoton: { backgroundColor: '#111827', padding: 12, borderRadius: 10, marginTop: 15 },
    emptyBotonTexto: { color: 'white', fontWeight: 'bold' },
});