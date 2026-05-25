import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el handler de notificaciones
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Solicitar permisos
export async function solicitarPermisosNotificaciones() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

// Programar recordatorio
export async function programarRecordatorio(titulo: string, cuerpo: string, segundos: number) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: titulo,
                body: cuerpo,
                sound: 'default',
            },
            trigger: {
                seconds: segundos,
            },
        });
        console.log('✅ Recordatorio programado');
    } catch (error) {
        console.error('❌ Error al programar recordatorio:', error);
    }
}

// Recordatorio de solicitud pendiente
export async function recordatorioSolicitudPendiente() {
    await programarRecordatorio(
        '🔧 Solicitud pendiente',
        'Tienes una solicitud sin revisar. Revisa tus ofertas ahora',
        3600 // 1 hora
    );
}

// Recordatorio de trabajo por completar
export async function recordatorioTrabajoPendiente() {
    await programarRecordatorio(
        '✅ Trabajo pendiente',
        'Tienes un trabajo por completar. No olvides finalizarlo',
        86400 // 24 horas
    );
}

// Recordatorio de calificación pendiente
export async function recordatorioCalificacion() {
    await programarRecordatorio(
        '⭐ Califica tu experiencia',
        '¡Cuéntanos cómo fue tu experiencia! Tu opinión es importante',
        172800 // 48 horas
    );
}