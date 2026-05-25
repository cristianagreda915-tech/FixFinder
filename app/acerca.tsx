import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function AcercaScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.titulo}>Acerca de FixFinder</Text>
            </View>

            <View style={styles.card}>
                <Image 
                    source={require('../assets/images/icon.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                
                <Text style={styles.appName}>FixFinder</Text>
                <Text style={styles.version}>Versión 1.0.0</Text>
                
                <Text style={styles.description}>
                    Conectamos clientes con técnicos especializados para reparaciones rápidas, seguras y confiables.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>📞 Contacto</Text>
                <Text style={styles.contactText}>Email: soporte@fixfinder.com</Text>
                <Text style={styles.contactText}>Teléfono: +57 300 123 4567</Text>
                <Text style={styles.contactText}>WhatsApp: +57 300 123 4567</Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>📜 Términos y condiciones</Text>
                <Text style={styles.legalText}>
                    Al usar FixFinder aceptas nuestros términos y condiciones. Los datos proporcionados serán tratados según nuestra política de privacidad.
                </Text>
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
    card: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 20, alignItems: 'center', elevation: 5 },
    logo: { width: 80, height: 80, marginBottom: 10 },
    appName: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    version: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
    description: { fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
    divider: { height: 1, backgroundColor: '#e5e7eb', width: '100%', marginVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10, alignSelf: 'flex-start' },
    contactText: { fontSize: 14, color: '#4b5563', marginBottom: 8, alignSelf: 'flex-start' },
    legalText: { fontSize: 12, color: '#6b7280', textAlign: 'justify', marginBottom: 20, lineHeight: 18 },
});