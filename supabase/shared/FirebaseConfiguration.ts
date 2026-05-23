
import { FirebaseApp, initializeApp } from 'npm:firebase/app';

export type ConfigurationOpts = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

export class FirebaseConfiguration {

    private static instance: FirebaseConfiguration;

    static getInstance(): FirebaseConfiguration {
        if (!FirebaseConfiguration.instance) {
            throw new Error('Firebase needs to be configured.');
        }
        return FirebaseConfiguration.instance
    }

    static props(props: ConfigurationOpts) {
        FirebaseConfiguration.instance = new FirebaseConfiguration(props);
    }

    client: FirebaseApp;

    private constructor(props: ConfigurationOpts) {
        this.client = initializeApp(props)
    }

    getClient() {
        if (!this.client) {
            console.trace();
            throw new Error('System needs to be configured.');
        }
        return this.client;
    }

}