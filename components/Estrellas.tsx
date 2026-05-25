import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EstrellasProps {
    calificacion: number;
    size?: number;
    showTexto?: boolean;
}

export default function Estrellas({ calificacion, size = 16, showTexto = true }: EstrellasProps) {
    const estrellas = [1, 2, 3, 4, 5];
    const redondeado = Math.round(calificacion);

    return (
        <View style={styles.container}>
            <View style={styles.estrellasContainer}>
                {estrellas.map((star) => (
                    <Text key={star} style={{ fontSize: size, color: star <= redondeado ? '#f59e0b' : '#d1d5db' }}>
                        ★
                    </Text>
                ))}
            </View>
            {showTexto && (
                <Text style={styles.texto}>
                    {calificacion.toFixed(1)}/5
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    estrellasContainer: {
        flexDirection: 'row',
    },
    texto: {
        fontSize: 12,
        color: '#6b7280',
    },
});