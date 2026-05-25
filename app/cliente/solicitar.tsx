import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SolicitarReparacion() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        categoria: 'electrodomesticos',
        direccion: '',
        presupuesto_maximo: ''
    });

    const categorias = [
        { id: 'celulares', nombre: '📱 Celulares', emoji: '📱' },
        { id: 'electrodomesticos', nombre: '🔌 Electrodomésticos', emoji: '🔌' },
        { id: 'fontaneria', nombre: '🚰 Fontanería', emoji: '🚰' },
        { id: 'computadores', nombre: '💻 Computadores', emoji: '💻' },
    ];

    // Validaciones mejoradas
    const validarPresupuesto = (precio: string) => {
        if (!precio) return true;
        const num = parseFloat(precio);
        return !isNaN(num) && num > 0 && num < 10000000;
    };

    const validarDireccion = (dir: string) => {
        return dir.length >= 5;
    };

    const handleSubmit = async () => {
        if (!form.titulo || !form.descripcion || !form.direccion) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (!validarDireccion(form.direccion)) {
            Alert.alert('Error', 'La dirección debe ser más específica (mínimo 5 caracteres)');
            return;
        }

        if (form.presupuesto_maximo && !validarPresupuesto(form.presupuesto_maximo)) {
            Alert.alert('Error', 'Ingresa un presupuesto válido (máximo 10,000,000)');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'No hay sesión activa');
                router.push('/login');
                return;
            }

            const data = {
                cliente_id: user.id,
                titulo: form.titulo,
                descripcion: form.descripcion,
                categoria: form.categoria,
                direccion: form.direccion,
                presupuesto_maximo: form.presupuesto_maximo ? parseFloat(form.presupuesto_maximo) : null,
                estado: 'pendiente'
            };

            const { error } = await supabase.from('solicitudes').insert(data);
            
            if (error) throw error;

            Alert.alert('Éxito', 'Solicitud creada correctamente');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al crear la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>🔧</Text>
                <Text style={styles.titulo}>Nueva Solicitud</Text>
                <Text style={styles.subtitulo}>Describe tu problema</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Título de la reparación</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Lavadora no centrifuga"
                    value={form.titulo}
                    onChangeText={(text) => setForm({ ...form, titulo: text })}
                />

                <Text style={styles.label}>Descripción del problema</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe detalladamente la falla..."
                    value={form.descripcion}
                    onChangeText={(text) => setForm({ ...form, descripcion: text })}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoriasContainer}>
                    {categorias.map((cat) => (
                        <Pressable
                            key={cat.id}
                            style={[
                                styles.categoriaBoton,
                                form.categoria === cat.id && styles.categoriaBotonActivo
                            ]}
                            onPress={() => setForm({ ...form, categoria: cat.id })}
                        >
                            <Text style={styles.categoriaEmoji}>{cat.emoji}</Text>
                            <Text style={[
                                styles.categoriaTexto,
                                form.categoria === cat.id && styles.categoriaTextoActivo
                            ]}>
                                {cat.nombre}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Dirección</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Calle, número, barrio, ciudad"
                    value={form.direccion}
                    onChangeText={(text) => setForm({ ...form, direccion: text })}
                />

                <Text style={styles.label}>Presupuesto máximo (opcional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 150000"
                    value={form.presupuesto_maximo}
                    onChangeText={(text) => setForm({ ...form, presupuesto_maximo: text })}
                    keyboardType="numeric"
                />

                <Pressable style={styles.boton} onPress={handleSubmit}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Publicar Solicitud</Text>}
                </Pressable>

                <Pressable style={styles.botonCancelar} onPress={() => router.back()}>
                    <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { backgroundColor: '#111827', padding: 30, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    emoji: { fontSize: 50, marginBottom: 10 },
    titulo: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    subtitulo: { fontSize: 14, color: '#9ca3af', marginTop: 5 },
    card: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 20, elevation: 5 },
    label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8, marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoriaBoton: { flex: 1, minWidth: '45%', padding: 12, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    categoriaBotonActivo: { backgroundColor: '#111827' },
    categoriaEmoji: { fontSize: 24, marginBottom: 5 },
    categoriaTexto: { fontSize: 12, color: '#111827' },
    categoriaTextoActivo: { color: 'white' },
    boton: { backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    botonTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    botonCancelar: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    botonCancelarTexto: { color: '#6b7280', fontSize: 14 },
});