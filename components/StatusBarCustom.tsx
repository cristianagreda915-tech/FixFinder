import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function StatusBarCustom() {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
        });
        return () => unsubscribe();
    }, []);

    if (isConnected) return null;

    return (
        <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>📡 Sin conexión a internet. Algunas funciones pueden no estar disponibles</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    offlineBar: { backgroundColor: '#ef4444', padding: 10, alignItems: 'center' },
    offlineText: { color: 'white', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
});