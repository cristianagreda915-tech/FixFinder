import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import Estrellas from '../../../components/Estrellas';

export default function VerOfertas() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [ofertas, setOfertas] = useState([]);
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarOfertas();
    }, [id]);

    const cargarOfertas = async () => {
        try {
            // Obtener ofertas con datos del técnico
            const { data: ofertasData, error: ofertasError } = await supabase
                .from('ofertas')
                .select(`
                    *,
                    perfiles:tecnico_id (
                        id,
                        nombre,
                        apellido,
                        calificacion_promedio,
                        total_calificaciones
                    )
                `)
                .eq('solicitud_id', id)
                .eq('estado', 'pendiente')
                .order('precio_ofertado', { ascending: true });
            
            if (ofertasError) throw ofertasError;
            setOfertas(ofertasData || []);
            
            // Obtener datos de la solicitud
            const { data: solicitudData } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('id', id)
                .single();
            setSolicitud(solicitudData);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las ofertas');
        } finally {
            setLoading(false);
        }
    };

    const seleccionarOferta = async (ofertaId: string, precio: number, tecnicoId: string) => {
        Alert.alert(
            'Confirmar Selección',
            `¿Deseas aceptar esta oferta por $${precio.toLocaleString()}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        try {
                            // Rechazar otras ofertas
                            await supabase
                                .from('ofertas')
                                .update({ estado: 'rechazada' })
                                .eq('solicitud_id', id)
                                .neq('id', ofertaId);
                            
                            // Aceptar esta oferta
                            await supabase
                                .from('ofertas')
                                .update({ estado: 'aceptada' })
                                .eq('id', ofertaId);
                            
                            // Actualizar solicitud
                            await supabase
                                .from('solicitudes')
                                .update({ 
                                    tecnico_id: tecnicoId,
                                    precio_acordado: precio,
                                    estado: 'aceptada'
                                })
                                .eq('id', id);
                            
                            Alert.alert('Éxito', 'Oferta seleccionada');
                            router.back();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const renderOferta = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.precioContainer}>
                <Text style={styles.precio}>💰 ${item.precio_ofertado.toLocaleString()}</Text>
                <View style={styles.calificacionContainer}>
                    <Estrellas calificacion={item.perfiles?.calificacion_promedio || 0} size={14} />
                    <Text style={styles.totalCalificaciones}>
                        ({item.perfiles?.total_calificaciones || 0})
                    </Text>
                </View>
            </View>
            
            <Text style={styles.tecnico}>
                👤 {item.perfiles?.nombre} {item.perfiles?.apellido}
            </Text>
            
            {item.mensaje && (
                <Text style={styles.mensaje}>📝 "{item.mensaje}"</Text>
            )}
            
            <Pressable 
                style={styles.botonSeleccionar} 
                onPress={() => seleccionarOferta(item.id, item.precio_ofertado, item.tecnico_id)}
            >
                <Text style={styles.botonSeleccionarTexto}>✓ Seleccionar esta oferta</Text>
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
                <Text style={styles.titulo}>Ofertas para:</Text>
                <Text style={styles.subtitulo}>{solicitud?.titulo}</Text>
            </View>

            {ofertas.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>💰</Text>
                    <Text style={styles.emptyText}>No hay ofertas aún</Text>
                    <Text style={styles.emptySubtext}>Espera a que los técnicos oferten</Text>
                </View>
            ) : (
                <FlatList
                    data={ofertas}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOferta}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#111827', padding: 25, paddingTop: 50, alignItems: 'center' },
    titulo: { fontSize: 18, color: '#9ca3af' },
    subtitulo: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 5, textAlign: 'center' },
    listContainer: { padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
    precioContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    precio: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
    calificacionContainer: { alignItems: 'flex-end' },
    totalCalificaciones: { fontSize: 10, color: '#6b7280', marginTop: 2 },
    tecnico: { fontSize: 16, color: '#111827', marginBottom: 8 },
    mensaje: { fontSize: 14, color: '#6b7280', fontStyle: 'italic', marginBottom: 12 },
    botonSeleccionar: { backgroundColor: '#111827', padding: 12, borderRadius: 10, alignItems: 'center' },
    botonSeleccionarTexto: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', padding: 50 },
    emptyEmoji: { fontSize: 70, marginBottom: 15 },
    emptyText: { fontSize: 18, color: '#6b7280', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#9ca3af' },
});