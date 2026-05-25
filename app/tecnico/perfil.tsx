import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function PerfilScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
    const [passActual, setPassActual] = useState('');
    const [passNueva, setPassNueva] = useState('');
    const [passConfirmar, setPassConfirmar] = useState('');
    const [perfil, setPerfil] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        email: ''
    });

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setPerfil({
                        nombre: data.nombre || '',
                        apellido: data.apellido || '',
                        telefono: data.telefono || '',
                        email: user.email || ''
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const guardarPerfil = async () => {
        if (!perfil.nombre || !perfil.apellido || !perfil.telefono) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        setGuardando(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    nombre: perfil.nombre,
                    apellido: perfil.apellido,
                    telefono: perfil.telefono,
                })
                .eq('id', user.id);

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Éxito', 'Perfil actualizado correctamente');
            }
        }
        setGuardando(false);
    };

    const cambiarPassword = async () => {
        if (!passActual || !passNueva || !passConfirmar) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }
        if (passNueva !== passConfirmar) {
            Alert.alert('Error', 'Las nuevas contraseñas no coinciden');
            return;
        }
        if (passNueva.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: passNueva });
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Éxito', 'Contraseña actualizada correctamente');
            setMostrarCambioPass(false);
            setPassActual('');
            setPassNueva('');
            setPassConfirmar('');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111827" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.titulo}>Mi Perfil</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                    style={styles.input}
                    value={perfil.nombre}
                    onChangeText={(text) => setPerfil({ ...perfil, nombre: text })}
                    placeholder="Tu nombre"
                />

                <Text style={styles.label}>Apellido</Text>
                <TextInput
                    style={styles.input}
                    value={perfil.apellido}
                    onChangeText={(text) => setPerfil({ ...perfil, apellido: text })}
                    placeholder="Tu apellido"
                />

                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                    style={styles.input}
                    value={perfil.telefono}
                    onChangeText={(text) => setPerfil({ ...perfil, telefono: text })}
                    placeholder="3001234567"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={perfil.email}
                    editable={false}
                />

                <Pressable style={styles.boton} onPress={guardarPerfil} disabled={guardando}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Guardar Cambios</Text>}
                </Pressable>

                <Pressable style={styles.botonSecundario} onPress={() => setMostrarCambioPass(!mostrarCambioPass)}>
                    <Text style={styles.botonSecundarioTexto}>🔒 Cambiar contraseña</Text>
                </Pressable>

                {mostrarCambioPass && (
                    <View>
                        <Text style={styles.label}>Contraseña actual</Text>
                        <TextInput style={styles.input} secureTextEntry value={passActual} onChangeText={setPassActual} />
                        <Text style={styles.label}>Nueva contraseña</Text>
                        <TextInput style={styles.input} secureTextEntry value={passNueva} onChangeText={setPassNueva} />
                        <Text style={styles.label}>Confirmar nueva contraseña</Text>
                        <Text style={styles.input} secureTextEntry value={passConfirmar} onChangeText={setPassConfirmar} />
                        <Pressable style={styles.boton} onPress={cambiarPassword}>
                            <Text style={styles.botonTexto}>Actualizar contraseña</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#111827', padding: 20, paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    titulo: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center', marginRight: 40 },
    card: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 20, elevation: 5 },
    label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8, marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16 },
    inputDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
    boton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    botonSecundario: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#d1d5db' },
    botonSecundarioTexto: { color: '#111827', fontWeight: 'bold', fontSize: 16 },
});