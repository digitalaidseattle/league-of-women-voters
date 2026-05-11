import { SupabaseConfiguration } from 'npm:@digitalaidseattle/supabase';
import { FirebaseConfiguration } from './FirebaseConfiguration.ts';


export function configure() {
    FirebaseConfiguration.props({
        apiKey: Deno.env.get("FIREBASE_API_KEY"),
        authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
        projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
        storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
        messagingSenderId: Deno.env.get("FIREBASE_MESSAGING_SENDER_ID"),
        appId: Deno.env.get("FIREBASE_APP_ID"),
        measurementId: Deno.env.get("FIREBASE_MEASUREMENT_ID")
    });

    SupabaseConfiguration.props({
        supabaseUrl: Deno.env.get("SUPABASE_URL"),
        anonKey: Deno.env.get("SUPABASE_ANON_KEY")
    });
}
