
import { FirebaseApp, initializeApp } from 'firebase/app';

export type ConfigurationOpts = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

export type Configuration = {
    opts: ConfigurationOpts;
    client: FirebaseApp;
}

let _configuration: Configuration;


export function initConfiguration(opts: ConfigurationOpts) {
    _configuration = {
        client: initializeApp(opts),
        opts: opts
    }
}

export function getConfiguration(): Configuration {
    return _configuration;
}