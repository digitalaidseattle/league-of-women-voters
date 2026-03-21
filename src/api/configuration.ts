
import { createClient, SupabaseClient } from '@supabase/supabase-js';


type Configuration = {
    client: SupabaseClient;
}


let _configuration: Configuration;


export function initConfiguration(opts: {
    projectUrl: string
    anonKey: string
}) {
    _configuration = {
        client: createClient(opts.projectUrl, opts.anonKey)
    }
}

export function getConfiguration(): Configuration {
    return _configuration;
}