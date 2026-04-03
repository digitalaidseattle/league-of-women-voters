
import { FirebaseApp, initializeApp } from 'firebase/app';

export type FirebaseConfigurationOpts = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

export type FirebaseConfiguration = {
    opts: FirebaseConfigurationOpts;
    client: FirebaseApp;
}

let _configuration: FirebaseConfiguration;


export function initConfiguration(opts: FirebaseConfigurationOpts) {
    _configuration = {
        client: initializeApp(opts),
        opts: opts
    }
}

export function getConfiguration(): FirebaseConfiguration {
    return _configuration;
}