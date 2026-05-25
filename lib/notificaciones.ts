import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { supabase } from './supabase';

// Configurar cómo se muestran las notificaciones en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Registrar dispositivo para notificaciones push
export async function registrarParaNotificaciones() {
    // En emulador no funcionan
    if (!Device.isDevice) {
        console.log('⚠️ Las notificaciones push requieren un dispositivo físico');
        return null;
    }

    try {
        // Solicitar permisos
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
            console.log('❌ Permiso de notificaciones denegado');
            return null;
        }

        // Obtener token de Expo
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        console.log('✅ Token de notificación:', token);
        
        // Guardar token en Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { error } = await supabase
                .from('tokens_notificacion')
                .upsert({
                    usuario_id: user.id,
                    token_expo: token,
                    dispositivo_nombre: Device.modelName || Platform.OS,
                    activo: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'usuario_id, token_expo'
                });
            
            if (error) {
                console.error('❌ Error guardando token en Supabase:', error);
            } else {
                console.log('✅ Token guardado en Supabase');
            }
        }
        
        return token;
    } catch (error) {
        console.error('❌ Error al registrar notificaciones:', error);
        return null;
    }
}

// Escuchar notificaciones entrantes
export function setupNotificationListeners() {
    // Notificación recibida en primer plano
    const subscription1 = Notifications.addNotificationReceivedListener(notification => {
        console.log('📨 Notificación recibida:', notification);
    });

    // Notificación pulsada (abre la app)
    const subscription2 = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('👆 Usuario pulsó notificación:', data);
        
        // Aquí puedes navegar según el tipo de notificación
        if (data.solicitudId) {
            // Navegar al chat o detalle de la solicitud
            // router.push(`/chat/${data.solicitudId}`);
        }
    });

    return { subscription1, subscription2 };
}

// Eliminar listeners
export function removeNotificationListeners(subscriptions: any) {
    if (subscriptions?.subscription1) {
        Notifications.removeNotificationSubscription(subscriptions.subscription1);
    }
    if (subscriptions?.subscription2) {
        Notifications.removeNotificationSubscription(subscriptions.subscription2);
    }
}

// Función para enviar notificaciones (desde el frontend a otros usuarios)
// Nota: En producción, esto debería hacerse desde una Edge Function de Supabase
export async function enviarNotificacion(destinatarioId: string, titulo: string, cuerpo: string, datos?: any) {
    try {
        // Obtener token del destinatario desde Supabase
        const { data: tokens, error } = await supabase
            .from('tokens_notificacion')
            .select('token_expo')
            .eq('usuario_id', destinatarioId)
            .eq('activo', true);
        
        if (error) throw error;
        if (!tokens || tokens.length === 0) return false;
        
        // Enviar notificación a cada token
        const messages = tokens.map(token => ({
            to: token.token_expo,
            sound: 'default',
            title: titulo,
            body: cuerpo,
            data: datos || {},
            priority: 'high',
        }));
        
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });
        
        const result = await response.json();
        console.log('📨 Notificaciones enviadas:', result);
        return true;
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);
        return false;
    }
}