import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

// Tus imágenes de reparaciones
const imagenes = [
    'https://tse1.mm.bing.net/th/id/OIP.9YqRj3JhYZg-C7raKUACeAHaE8?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://tse3.mm.bing.net/th/id/OIP.2M1KJmToLo_WoM1L56glpAHaE4?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://img.freepik.com/fotos-premium/tecnico-reparacion-computadoras-reparando-computadora-portatil_665346-9878.jpg?w=2000',
    'https://tse2.mm.bing.net/th/id/OIP.KK0kaZHsKy4E_tmOzIazvAHaE7?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://tse4.mm.bing.net/th/id/OIP.S878x3SKcHQXBtcq_ujMlQHaE8?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3',
];

export default function CarruselImagenes() {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setIndice((prev) => (prev + 1) % imagenes.length);
        }, 3000);
        return () => clearInterval(intervalo);
    }, []);

    return (
        <View style={styles.container}>
            <Image 
                source={{ uri: imagenes[indice] }} 
                style={styles.imagen}
                resizeMode="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginVertical: 15 
    },
    imagen: { 
        width: width - 60, 
        height: 180, 
        borderRadius: 15 
    },
});