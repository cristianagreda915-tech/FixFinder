import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Alert,
    ScrollView,
    TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

// Definir los tipos
interface Solicitud {
    id: string;
    titulo: string;
    descripcion: string;
    cliente_id: string;
    tecnico_id: string;
    estado: string;
    precio_acordado: number;
}

interface Cliente {
    id: string;
    nombre: string;
    apellido: string;
}

export default function CalificarClienteScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [puntuacion, setPuntuacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [yaCalifico, setYaCalifico] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            const { data: solicitudData, error: solicitudError } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('id', id)
                .single();
            
            if (solicitudError) throw solicitudError;
            setSolicitud(solicitudData as Solicitud);
            
            if (solicitudData.cliente_id) {
                const { data: clienteData } = await supabase
                    .from('profiles')
                    .select('id, nombre, apellido')
                    .eq('id', solicitudData.cliente_id)
                    .single();
                setCliente(clienteData as Cliente);
            }
            
            const { data: calificacionData } = await supabase
                .from('calificaciones')
                .select('*')
                .eq('solicitud_id', id)
                .maybeSingle();
            
            setYaCalifico(!!calificacionData);
            
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const enviarCalificacion = async () => {
        if (yaCalifico) {
            Alert.alert('Info', 'Ya calificaste este trabajo');
            return;
        }
        
        if (puntuacion === 0) {
            Alert.alert('Error', 'Selecciona una calificación');
            return;
        }
        
        setEnviando(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase
                .from('calificaciones')
                .insert({
                    solicitud_id: id,
                    calificador_id: user?.id,
                    calificado_id: solicitud?.cliente_id,
                    puntuacion: puntuacion,
                    comentario: comentario
                });
            
            if (error) throw error;
            
            Alert.alert('Éxito', 'Calificación enviada. ¡Gracias!');
            router.back();
            
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setEnviando(false);
        }
    };

    const renderEstrellas = () => {
        return (
            <View style={styles.estrellasContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                        key={star}
                        onPress={() => setPuntuacion(star)}
                        style={styles.estrellaBoton}
                    >
                        <Text style={[styles.estrella, puntuacion >= star && styles.estrellaActiva]}>
                            {puntuacion >= star ? '★' : '☆'}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111827" />
            </View>
        );
    }

    if (!solicitud) {
        return (
            <View style={styles.centered}>
                <Text style={{ fontSize: 18, color: '#6b7280' }}>No se encontró la solicitud</Text>
                <Pressable style={styles.boton} onPress={() => router.back()}>
                    <Text style={styles.botonTexto}>Volver</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.titulo}>Calificar Cliente</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitulo}>📋 Trabajo realizado</Text>
                <Text style={styles.trabajoTitulo}>{solicitud.titulo}</Text>
                <Text style={styles.trabajoDescripcion}>{solicitud.descripcion}</Text>
            </View>

            {cliente && (
                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>👤 Cliente</Text>
                    <Text style={styles.clienteNombre}>{cliente.nombre} {cliente.apellido}</Text>
                </View>
            )}

            <View style={styles.card}>
                <Text style={styles.cardTitulo}>⭐ Calificar al cliente</Text>
                {yaCalifico ? (
                    <View style={styles.calificadoContainer}>
                        <Text style={styles.calificadoTexto}>✅ Ya calificaste este trabajo</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.label}>Tu calificación</Text>
                        {renderEstrellas()}
                        <Text style={styles.label}>Comentario (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="¿Cómo fue tu experiencia con el cliente?"
                            value={comentario}
                            onChangeText={setComentario}
                            multiline
                            numberOfLines={3}
                        />
                        <Pressable style={styles.botonCalificar} onPress={enviarCalificacion} disabled={enviando}>
                            {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Enviar Calificación</Text>}
                        </Pressable>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
    header: { backgroundColor: '#111827', padding: 20, paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    titulo: { fontSize: 20, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center', marginRight: 40 },
    card: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 16, elevation: 3 },
    cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
    trabajoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    trabajoDescripcion: { fontSize: 14, color: '#6b7280', marginBottom: 10 },
    clienteNombre: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8, marginTop: 15 },
    estrellasContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
    estrellaBoton: { padding: 5 },
    estrella: { fontSize: 40, color: '#d1d5db' },
    estrellaActiva: { color: '#f59e0b' },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16, textAlignVertical: 'top', minHeight: 80 },
    botonCalificar: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    calificadoContainer: { alignItems: 'center', padding: 20, backgroundColor: '#d1fae5', borderRadius: 12 },
    calificadoTexto: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
    boton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
});