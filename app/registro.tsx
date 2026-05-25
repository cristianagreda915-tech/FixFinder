import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function RegistroScreen() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
//*****/
    const [rol, setRol] = useState('cliente');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!nombre || !apellido || !email || !password || !telefono
            //*****/
            ) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });
            
            if (authError) {
                // Mensajes de error más amigables
                if (authError.message.includes('rate limit')) {
                    Alert.alert('Error', 'Demasiados intentos. Espera 15 minutos o usa otro email');
                } else if (authError.message.includes('already registered')) {
                    Alert.alert('Error', 'Este email ya está registrado. Inicia sesión o usa otro email');
                } else if (authError.message.includes('password')) {
                    Alert.alert('Error', 'La contraseña es muy débil. Usa al menos 6 caracteres');
                } else if (authError.message.includes('email')) {
                    Alert.alert('Error', 'El email no es válido. Ingresa un email correcto');
                } else {
                    Alert.alert('Error', authError.message);
                }
                return;
            }
            
            if (!authData.user) {
                Alert.alert('Error', 'No se pudo crear el usuario. Intenta nuevamente');
                return;
            }
            
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: email,
                    nombre: nombre,
                    apellido: apellido,
                    telefono: telefono,
                    //*****/
                    rol: rol,
                });
            
            if (profileError) {
                console.log('Error detallado:', profileError);
                Alert.alert('Error', 'Error al crear perfil: ' + profileError.message);
                return;
            }
            
            Alert.alert('Éxito', '¡Registro exitoso! Ahora puedes iniciar sesión');
            router.push('/login');
            
        } catch (error: any) {
            console.log('Error general:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>📝</Text>
                <Text style={styles.titulo}>Crear Cuenta</Text>
                <Text style={styles.subtitulo}>Regístrate en FixFinder</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} placeholder="Tu nombre" value={nombre} onChangeText={setNombre} />

                <Text style={styles.label}>Apellido</Text>
                <TextInput style={styles.input} placeholder="Tu apellido" value={apellido} onChangeText={setApellido} />

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="tu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.label}>Contraseña</Text>
                <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry />

                //****/

                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} placeholder="3001234567" value={telefono} onChangeText={setTelefono} keyboardType="numeric" />

                <Text style={styles.label}>Registrarme como:</Text>
                <View style={styles.radioGroup}>
                    <Pressable style={styles.radioOption} onPress={() => setRol('cliente')}>
                        <Text style={[styles.radioText, rol === 'cliente' && styles.radioSelected]}>📱 Cliente</Text>
                    </Pressable>
                    <Pressable style={styles.radioOption} onPress={() => setRol('tecnico')}>
                        <Text style={[styles.radioText, rol === 'tecnico' && styles.radioSelected]}>🔧 Técnico</Text>
                    </Pressable>
                </View>

                <Pressable style={styles.boton} onPress={handleRegister}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Registrarme</Text>}
                </Pressable>

                <Pressable onPress={() => router.push('/login')}>
                    <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { backgroundColor: '#111827', padding: 40, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    emoji: { fontSize: 50, marginBottom: 10 },
    titulo: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    subtitulo: { fontSize: 16, color: '#9ca3af', marginTop: 5 },
    card: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 20, elevation: 5 },
    label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
    boton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    link: { textAlign: 'center', marginTop: 20, color: '#111827', fontSize: 14 },
    radioGroup: { flexDirection: 'row', gap: 20, marginTop: 10, marginBottom: 20 },
    radioOption: { flex: 1, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 10, alignItems: 'center' },
    radioText: { fontSize: 16 },
    radioSelected: { fontWeight: 'bold', color: '#111827' },
});