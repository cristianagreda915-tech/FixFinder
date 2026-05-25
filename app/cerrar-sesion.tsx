import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function CerrarSesionScreen() {
    const router = useRouter();

    useEffect(() => {
        const cerrar = async () => {
            await supabase.auth.signOut();
            router.replace('/');
        };
        cerrar();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={{ marginTop: 20, fontSize: 16, color: '#111827' }}>Cerrando sesión...</Text>
        </View>
    );
}