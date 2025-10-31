export interface ServiceWorker<T> {
    validate: (params: T) => void,
    getLegUrl: (params: T) => string,
    getEntities: (json: any) => any
}