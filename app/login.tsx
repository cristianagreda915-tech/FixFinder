import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    Alert.alert('Error', 'Email o contraseña incorrectos');
                } else if (error.message.includes('Email not confirmed')) {
                    Alert.alert('Error', 'Confirma tu email antes de iniciar sesión');
                } else {
                    Alert.alert('Error', error.message);
                }
                return;
            }
            
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', data.user.id)
                .single();
            
            if (profileError) {
                Alert.alert('Error', 'Error al obtener información del usuario');
                return;
            }
            
            Alert.alert('Éxito', `¡Bienvenido ${profile.rol === 'cliente' ? 'Cliente' : 'Técnico'}!`);
            
            if (profile?.rol === 'cliente') {
                router.replace('/cliente');
            } else {
                router.replace('/tecnico');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>🔧</Text>
                <Text style={styles.titulo}>FixFinder</Text>
                <Text style={styles.subtitulo}>Reparaciones a domicilio</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Pressable style={styles.boton} onPress={handleLogin}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Iniciar Sesión</Text>}
                </Pressable>

                <Pressable onPress={() => router.push('/registro')}>
                    <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { backgroundColor: '#111827', padding: 40, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    emoji: { fontSize: 60, marginBottom: 10 },
    titulo: { fontSize: 34, fontWeight: 'bold', color: 'white' },
    subtitulo: { fontSize: 16, color: '#9ca3af', marginTop: 5 },
    card: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 20, elevation: 5 },
    label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
    boton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    link: { textAlign: 'center', marginTop: 20, color: '#111827', fontSize: 14 },
});