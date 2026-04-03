import { Identifier } from "@digitalaidseattle/core";


export interface DAO<T> {

    getAll(): Promise<T[]>;
    getById(id: Identifier): Promise<T>;

}
