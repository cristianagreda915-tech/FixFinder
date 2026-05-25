import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function SoporteScreen() {
    const router = useRouter();
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);

    const enviarMensaje = () => {
        if (!mensaje.trim()) {
            Alert.alert('Error', 'Escribe tu mensaje');
            return;
        }
        setEnviando(true);
        Linking.openURL(`mailto:soporte@fixfinder.com?subject=Ayuda FixFinder&body=${encodeURIComponent(mensaje)}`);
        Alert.alert('Enviado', 'Tu mensaje ha sido enviado. Te responderemos pronto');
        setMensaje('');
        setEnviando(false);
    };

    const preguntasFrecuentes = [
        {
            pregunta: '¿Cómo funciona FixFinder?',
            respuesta: 'Publicas tu reparación, los técnicos ofertan su precio y tú eliges la mejor oferta.'
        },
        {
            pregunta: '¿Es seguro pagar por la app?',
            respuesta: 'Sí, el pago es seguro y solo se libera cuando confirmas la recepción del servicio.'
        },
        {
            pregunta: '¿Qué pasa si el técnico no completa el trabajo?',
            respuesta: 'Puedes calificarlo negativamente y contactar a soporte para resolver el problema.'
        },
        {
            pregunta: '¿Cómo me registro como técnico?',
            respuesta: 'Al registrarte selecciona la opción "Técnico" y completa tu perfil con tu especialidad.'
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.titulo}>Centro de Ayuda</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>📞 Contacto directo</Text>
                
                <Pressable style={styles.contactoItem} onPress={() => Linking.openURL('tel:+573001234567')}>
                    <Text style={styles.contactoEmoji}>📱</Text>
                    <Text style={styles.contactoTexto}>+57 300 123 4567</Text>
                </Pressable>
                
                <Pressable style={styles.contactoItem} onPress={() => Linking.openURL('mailto:soporte@fixfinder.com')}>
                    <Text style={styles.contactoEmoji}>✉️</Text>
                    <Text style={styles.contactoTexto}>soporte@fixfinder.com</Text>
                </Pressable>
                
                <Pressable style={styles.contactoItem} onPress={() => Linking.openURL('https://wa.me/573001234567')}>
                    <Text style={styles.contactoEmoji}>💬</Text>
                    <Text style={styles.contactoTexto}>WhatsApp: +57 300 123 4567</Text>
                </Pressable>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>❓ Preguntas frecuentes</Text>
                
                {preguntasFrecuentes.map((item, index) => (
                    <View key={index} style={styles.faqItem}>
                        <Text style={styles.faqPregunta}>{item.pregunta}</Text>
                        <Text style={styles.faqRespuesta}>{item.respuesta}</Text>
                    </View>
                ))}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>📝 Envíanos tu mensaje</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Escribe tu consulta aquí..."
                    value={mensaje}
                    onChangeText={setMensaje}
                    multiline
                    numberOfLines={4}
                />
                <Pressable style={styles.boton} onPress={enviarMensaje} disabled={enviando}>
                    <Text style={styles.botonTexto}>{enviando ? 'Enviando...' : 'Enviar mensaje'}</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { backgroundColor: '#111827', padding: 20, paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    titulo: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center', marginRight: 40 },
    card: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 20, elevation: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
    contactoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    contactoEmoji: { fontSize: 24, marginRight: 15 },
    contactoTexto: { fontSize: 16, color: '#111827' },
    divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
    faqItem: { marginBottom: 15 },
    faqPregunta: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    faqRespuesta: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
    textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 15 },
    boton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center' },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});