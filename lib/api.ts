import { supabase } from './supabase';

export const authAPI = {
    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },
    registro: async (email: string, password: string, userData: any) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (authError) throw authError;
        
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user?.id,
                ...userData,
            });
        if (profileError) throw profileError;
        
        return authData;
    },
};