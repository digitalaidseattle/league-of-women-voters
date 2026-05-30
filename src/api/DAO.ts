import { DataAccessOptions, Entity, Identifier, PageInfo, QueryModel } from "@digitalaidseattle/core";


export interface DAO<T extends Entity> {

    getAll(): Promise<T[]>;
    getById(id: Identifier): Promise<T>;
    find(queryModel: QueryModel, opts?: DataAccessOptions<T>): Promise<PageInfo<T>>
    upsert(entity: T): Promise<T>;

}