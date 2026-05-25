import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { solicitudesAPI, getToken, conectarSocket, getSocket, desconectarSocket } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const flatListRef = useRef(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [contacto, setContacto] = useState(null);
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState(null);

    useEffect(() => {
        cargarDatos();
        conectarSocketIO();
        
        return () => {
            desconectarSocket();
        };
    }, [id]);

    const conectarSocketIO = async () => {
        const token = getToken();
        if (!token) return;
        
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUsuarioActual(decoded);
        
        const socket = conectarSocket(decoded.userId);
        if (socket) {
            socket.on('nuevo-mensaje', (mensaje) => {
                if (mensaje.solicitud_id === id) {
                    setMensajes(prev => [...prev, mensaje]);
                    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
                }
            });
        }
    };

    const cargarDatos = async () => {
        try {
            const [contactoRes, mensajesRes] = await Promise.all([
                solicitudesAPI.obtenerContacto(id as string),
                solicitudesAPI.obtenerMensajes(id as string),
            ]);
            setContacto(contactoRes.data);
            setMensajes(mensajesRes.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const seleccionarImagen = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            enviarMensajeConImagen(result.assets[0].base64);
        }
    };

    const tomarFoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Error', 'Se necesita permiso para usar la cámara');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            enviarMensajeConImagen(result.assets[0].base64);
        }
    };

    const enviarMensajeConImagen = async (base64Image: string) => {
        const socket = getSocket();
        if (!socket || !usuarioActual || !contacto) return;

        const data = {
            solicitud_id: id,
            remitente_id: usuarioActual.userId,
            destinatario_id: contacto.id,
            mensaje: null,
            imagen_url: `data:image/jpeg;base64,${base64Image}`,
        };

        socket.emit('enviar-mensaje', data);
    };

    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;
        
        const socket = getSocket();
        if (!socket || !usuarioActual || !contacto) return;

        setEnviando(true);
        const data = {
            solicitud_id: id,
            remitente_id: usuarioActual.userId,
            destinatario_id: contacto.id,
            mensaje: nuevoMensaje,
            imagen_url: null,
        };

        socket.emit('enviar-mensaje', data);
        setNuevoMensaje('');
        setEnviando(false);
    };

    const mostrarOpcionesImagen = () => {
        Alert.alert(
            'Adjuntar imagen',
            '¿De dónde quieres seleccionar la imagen?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: '📷 Tomar foto', onPress: tomarFoto },
                { text: '🖼️ Galería', onPress: seleccionarImagen },
            ]
        );
    };

    const formatHora = (fecha: string) => {
        const date = new Date(fecha);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMensaje = ({ item }: any) => {
        const esMiMensaje = item.remitente_id === usuarioActual?.userId;
        
        return (
            <View style={[styles.mensajeContainer, esMiMensaje ? styles.mensajePropio : styles.mensajeOtro]}>
                {!esMiMensaje && (
                    <Text style={styles.mensajeNombre}>{item.nombre} {item.apellido}</Text>
                )}
                {item.mensaje && (
                    <Text style={styles.mensajeTexto}>{item.mensaje}</Text>
                )}
                {item.imagen_url && (
                    <Image source={{ uri: item.imagen_url }} style={styles.mensajeImagen} />
                )}
                <Text style={styles.mensajeHora}>{formatHora(item.created_at)}</Text>
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

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <View>
                    <Text style={styles.headerTitulo}>{contacto?.nombre} {contacto?.apellido}</Text>
                    <Text style={styles.headerSubtitulo}>
                        {contacto?.rol === 'tecnico' ? '🔧 Técnico' : '👤 Cliente'}
                    </Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={mensajes}
                keyExtractor={(item) => item.id}
                renderItem={renderMensaje}
                contentContainerStyle={styles.listaMensajes}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                    <View style={styles.emptyChat}>
                        <Text style={styles.emptyEmoji}>💬</Text>
                        <Text style={styles.emptyText}>No hay mensajes</Text>
                        <Text style={styles.emptySubtext}>Envía un mensaje para comenzar</Text>
                    </View>
                }
            />

            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={mostrarOpcionesImagen} style={styles.botonAdjuntar}>
                    <Text style={styles.botonAdjuntarTexto}>📎</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChangeText={setNuevoMensaje}
                    multiline
                />
                <Pressable style={styles.botonEnviar} onPress={enviarMensaje} disabled={enviando}>
                    {enviando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.botonEnviarTexto}>📤</Text>}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#111827', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', gap: 15 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    headerTitulo: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    headerSubtitulo: { fontSize: 12, color: '#9ca3af' },
    listaMensajes: { padding: 15, flexGrow: 1 },
    mensajeContainer: { maxWidth: '80%', marginBottom: 12, padding: 10, borderRadius: 16 },
    mensajePropio: { backgroundColor: '#111827', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    mensajeOtro: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
    mensajeNombre: { fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 'bold' },
    mensajeTexto: { fontSize: 15, color: '#111827' },
    mensajePropioTexto: { color: 'white' },
    mensajeImagen: { width: 200, height: 200, borderRadius: 12, marginTop: 5 },
    mensajeHora: { fontSize: 10, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },
    emptyChat: { alignItems: 'center', padding: 50 },
    emptyEmoji: { fontSize: 60, marginBottom: 15 },
    emptyText: { fontSize: 18, color: '#6b7280', marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: '#9ca3af' },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'center', gap: 10 },
    botonAdjuntar: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 22 },
    botonAdjuntarTexto: { fontSize: 24 },
    input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100 },
    botonEnviar: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827', borderRadius: 22 },
    botonEnviarTexto: { color: 'white', fontSize: 20 },
});