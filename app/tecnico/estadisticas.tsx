import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Estrellas from '../../components/Estrellas';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function EstadisticasScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTrabajos: 0,
        trabajosCompletados: 0,
        calificacionPromedio: 0,
        ingresosTotales: 0,
        tasaExito: 0
    });
    const [ingresosMensuales, setIngresosMensuales] = useState([0, 0, 0, 0, 0, 0]);
    const [categoriasRanking, setCategoriasRanking] = useState<{ nombre: string; cantidad: number }[]>([]);

    useEffect(() => {
        cargarEstadisticas();
        cargarIngresosMensuales();
        cargarRankingCategorias();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: trabajos } = await supabase
                .from('solicitudes')
                .select('*')
                .eq('tecnico_id', user.id);

            const total = trabajos?.length || 0;
            const completados = trabajos?.filter(t => t.estado === 'completada') || [];
            const ingresos = completados.reduce((sum, t) => sum + (t.precio_acordado || 0), 0);
            
            const { data: calificaciones } = await supabase
                .from('calificaciones')
                .select('puntuacion')
                .eq('calificado_id', user.id);

            const promedio = calificaciones?.length 
                ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length 
                : 0;

            const tasaExito = total > 0 ? (completados.length / total) * 100 : 0;

            setStats({
                totalTrabajos: total,
                trabajosCompletados: completados.length,
                calificacionPromedio: promedio,
                ingresosTotales: ingresos,
                tasaExito: tasaExito
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const cargarIngresosMensuales = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: trabajos } = await supabase
                .from('solicitudes')
                .select('precio_acordado, created_at')
                .eq('tecnico_id', user.id)
                .eq('estado', 'completada');

            const meses = [0, 0, 0, 0, 0, 0];
            const ahora = new Date();
            
            trabajos?.forEach(trabajo => {
                const fecha = new Date(trabajo.created_at);
                const diffMeses = (ahora.getFullYear() - fecha.getFullYear()) * 12 + (ahora.getMonth() - fecha.getMonth());
                if (diffMeses >= 0 && diffMeses < 6) {
                    meses[5 - diffMeses] += trabajo.precio_acordado || 0;
                }
            });
            
            setIngresosMensuales(meses);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const cargarRankingCategorias = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: trabajos } = await supabase
                .from('solicitudes')
                .select('categoria')
                .eq('tecnico_id', user.id)
                .eq('estado', 'completada');

            const conteo: { [key: string]: number } = {};
            trabajos?.forEach(t => {
                conteo[t.categoria] = (conteo[t.categoria] || 0) + 1;
            });

            const ranking = Object.entries(conteo)
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);

            setCategoriasRanking(ranking);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoriaIcon = (categoria: string) => {
        switch (categoria) {
            case 'celulares': return '📱';
            case 'electrodomesticos': return '🔌';
            case 'fontaneria': return '🚰';
            case 'computadores': return '💻';
            default: return '🔧';
        }
    };

    const exportarReporte = async () => {
        const mensaje = `📊 Mis estadísticas en FixFinder:
🔧 Total trabajos: ${stats.totalTrabajos}
✅ Completados: ${stats.trabajosCompletados}
⭐ Calificación: ${stats.calificacionPromedio.toFixed(1)}
💰 Ingresos: $${stats.ingresosTotales.toLocaleString()}
📈 Tasa de éxito: ${stats.tasaExito.toFixed(0)}%`;
        await Share.share({ message: mensaje });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111827" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.titulo}>Mis Estadísticas</Text>
            </View>

            {/* Tarjetas principales */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>📋</Text>
                    <Text style={styles.statNumero}>{stats.totalTrabajos}</Text>
                    <Text style={styles.statLabel}>Total Trabajos</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>✅</Text>
                    <Text style={styles.statNumero}>{stats.trabajosCompletados}</Text>
                    <Text style={styles.statLabel}>Completados</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>⭐</Text>
                    <Estrellas calificacion={stats.calificacionPromedio} size={24} showTexto={false} />
                    <Text style={styles.statNumero}>{stats.calificacionPromedio.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Calificación</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>💰</Text>
                    <Text style={styles.statNumero}>${stats.ingresosTotales.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Ingresos</Text>
                </View>

                <View style={[styles.statCard, styles.statCardFull]}>
                    <Text style={styles.statEmoji}>📈</Text>
                    <Text style={styles.statNumero}>{stats.tasaExito.toFixed(0)}%</Text>
                    <Text style={styles.statLabel}>Tasa de éxito</Text>
                </View>
            </View>

            {/* Gráfico de ingresos mensuales */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitulo}>📊 Ingresos últimos 6 meses</Text>
                <LineChart
                    data={{
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                        datasets: [{ data: ingresosMensuales }]
                    }}
                    width={width - 60}
                    height={200}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    }}
                    bezier
                    style={{ borderRadius: 16, marginVertical: 10 }}
                />
            </View>

            {/* Ranking de categorías */}
            {categoriasRanking.length > 0 && (
                <View style={styles.rankingCard}>
                    <Text style={styles.rankingTitulo}>🏆 Categorías más trabajadas</Text>
                    {categoriasRanking.map((item, index) => (
                        <View key={index} style={styles.rankingItem}>
                            <Text style={styles.rankingPosicion}>{index + 1}</Text>
                            <Text style={styles.rankingNombre}>
                                {getCategoriaIcon(item.nombre)} {item.nombre}
                            </Text>
                            <Text style={styles.rankingCantidad}>{item.cantidad} trabajos</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Botón exportar reporte */}
            <Pressable style={styles.botonExportar} onPress={exportarReporte}>
                <Text style={styles.botonExportarTexto}>📤 Exportar reporte</Text>
            </Pressable>

            <View style={styles.footer} />
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
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
    statCard: { backgroundColor: 'white', width: '48%', padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', elevation: 3 },
    statCardFull: { width: '100%' },
    statEmoji: { fontSize: 40, marginBottom: 10 },
    statNumero: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    statLabel: { fontSize: 12, color: '#6b7280' },
    chartCard: { backgroundColor: 'white', margin: 15, padding: 15, borderRadius: 16, elevation: 3 },
    chartTitulo: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
    rankingCard: { backgroundColor: 'white', margin: 15, padding: 15, borderRadius: 16, elevation: 3 },
    rankingTitulo: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
    rankingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    rankingPosicion: { width: 30, fontSize: 16, fontWeight: 'bold', color: '#10b981' },
    rankingNombre: { flex: 1, fontSize: 14, color: '#111827' },
    rankingCantidad: { fontSize: 12, color: '#6b7280' },
    botonExportar: { backgroundColor: '#111827', margin: 15, padding: 14, borderRadius: 12, alignItems: 'center' },
    botonExportarTexto: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    footer: { height: 30 },
});