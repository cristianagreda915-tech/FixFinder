import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Definir el tipo para las solicitudes
interface Solicitud {
    id: string;
    titulo: string;
    descripcion: string;
    direccion: string;
    presupuesto_maximo: number;
    precio_acordado: number;
    estado: string;
    created_at: string;
    tecnico_id: string;
}

export default function MisSolicitudes() {
    const router = useRouter();
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filtro, setFiltro] = useState('todas');

    const cargarSolicitudes = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('cliente_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSolicitudes(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { cargarSolicitudes(); }, []));

    const onRefresh = () => {
        setRefreshing(true);
        cargarSolicitudes();
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return '#f59e0b';
            case 'aceptada': return '#10b981';
            case 'en_progreso': return '#3b82f6';
            case 'completada': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getEstadoTexto = (estado: string) => {
        switch (estado) {
            case 'pendiente': return '⏳ Pendiente';
            case 'aceptada': return '✅ Aceptada';
            case 'en_progreso': return '🔧 En progreso';
            case 'completada': return '✔️ Completada';
            default: return estado;
        }
    };

    const solicitudesFiltradas = solicitudes.filter(item => {
        if (filtro === 'activas') return item.estado !== 'completada';
        if (filtro === 'completadas') return item.estado === 'completada';
        return true;
    });

    const renderItem = ({ item }: { item: Solicitud }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
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
            
            <Text style={styles.fecha}>📅 {new Date(item.created_at).toLocaleDateString()}</Text>
            
            {item.estado === 'pendiente' && (
            <Pressable 
                style={styles.botonVerOfertas} 
                onPress={() => router.push(`/cliente/ofertas/${item.id}` as any)}
            >
                <Text style={styles.botonVerOfertasTexto}>💰 Ver Ofertas</Text>
            </Pressable>
            )}

            {item.estado === 'completada' && (
            <Pressable 
                style={styles.botonCalificar} 
                onPress={() => router.push(`/cliente/calificar/${item.id}` as any)}
            >
            <Text style={styles.botonCalificarTexto}>⭐ Calificar Técnico</Text>
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
                <Text style={styles.titulo}>Mis Solicitudes</Text>
            </View>

            <View style={styles.filtrosContainer}>
                <Pressable style={[styles.filtroBoton, filtro === 'todas' && styles.filtroActivo]} onPress={() => setFiltro('todas')}>
                    <Text style={[styles.filtroTexto, filtro === 'todas' && styles.filtroTextoActivo]}>Todas</Text>
                </Pressable>
                <Pressable style={[styles.filtroBoton, filtro === 'activas' && styles.filtroActivo]} onPress={() => setFiltro('activas')}>
                    <Text style={[styles.filtroTexto, filtro === 'activas' && styles.filtroTextoActivo]}>Activas</Text>
                </Pressable>
                <Pressable style={[styles.filtroBoton, filtro === 'completadas' && styles.filtroActivo]} onPress={() => setFiltro('completadas')}>
                    <Text style={[styles.filtroTexto, filtro === 'completadas' && styles.filtroTextoActivo]}>Completadas</Text>
                </Pressable>
            </View>

            <FlatList
                data={solicitudesFiltradas}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📭</Text>
                        <Text style={styles.emptyText}>No tienes solicitudes</Text>
                        <Pressable style={styles.emptyBoton} onPress={() => router.push('/cliente/solicitar')}>
                            <Text style={styles.emptyBotonTexto}>Crear mi primera solicitud</Text>
                        </Pressable>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#111827',
        padding: 20,
        paddingTop: 50,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    filtrosContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    filtroBoton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#e5e7eb',
        borderRadius: 10,
        alignItems: 'center',
    },
    filtroActivo: {
        backgroundColor: '#111827',
    },
    filtroTexto: {
        color: '#111827',
        fontWeight: 'bold',
    },
    filtroTextoActivo: {
        color: 'white',
    },
    listContainer: {
        padding: 15,
        paddingTop: 0,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tituloCard: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
        marginRight: 10,
    },
    estadoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    estadoTexto: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    descripcion: {
        color: '#6b7280',
        fontSize: 14,
        marginBottom: 8,
    },
    direccion: {
        color: '#111827',
        fontSize: 13,
        marginBottom: 5,
    },
    presupuesto: {
        color: '#f59e0b',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    precioAcordado: {
        color: '#10b981',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    fecha: {
        color: '#9ca3af',
        fontSize: 11,
        marginBottom: 10,
    },
    botonVerOfertas: {
        backgroundColor: '#111827',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5,
    },
    botonVerOfertasTexto: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    botonCalificar: {
        backgroundColor: '#f59e0b',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    botonCalificarTexto: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 20,
    },
    emptyBoton: {
        backgroundColor: '#111827',
        padding: 12,
        borderRadius: 10,
    },
    emptyBotonTexto: {
        color: 'white',
        fontWeight: 'bold',
    },
});