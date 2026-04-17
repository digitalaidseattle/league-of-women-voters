
import { supabaseClient } from '@digitalaidseattle/supabase';
import { SupabaseClient } from '@supabase/supabase-js';


type Configuration = {
    client: SupabaseClient;
}


let _configuration: Configuration;


export function initConfiguration(_opts: {
    projectUrl: string
    anonKey: string
}) {
    _configuration = {
        client: supabaseClient // createClient(opts.projectUrl, opts.anonKey)
    }
}

export function getConfiguration(): Configuration {
    return _configuration;
}