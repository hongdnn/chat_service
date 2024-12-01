import { injectable } from "inversify";
import { Document, PaginateModel } from "mongoose";


export interface IBaseRepository<T> {
    create(entity: T): Promise<T | null>
    update(id: string, updateFields: {}): Promise<T | null>
    getAll(): Promise<T[]>
    getById(id: string): Promise<T | null>
    delete(id: string): Promise<boolean>
    findByCondition(condition: any): Promise<T[]>
    getListIdByCondition(condition: any): Promise<string[]>
    fetchPaginatedResults(condition: any, offset: number, limit: number, sort: {}): Promise<T[]>
    findByConditionAndPaging(condition: any, offset: number, limit: number, sort: {}): Promise<{ data: T[], infoPaging: any }>
}

@injectable()
export abstract class BaseRepository<T> implements IBaseRepository<T> {
    protected _mongooseModel: PaginateModel<Document<T>>

    constructor(mongooseModel: PaginateModel<Document<T>>) {
        this._mongooseModel = mongooseModel
    }

    public async create(entity: T): Promise<T | null> {
        const result = await this._mongooseModel.create(entity)
        return result.toObject<T>()
    }
    public async update(id: string, updateFields: {}): Promise<T> {
        const result = await this._mongooseModel.findByIdAndUpdate({ _id: id }, updateFields, { new: true })
        if (result !== null) {
            return result.toObject<T>()
        }
        return null
    }

    public async getAll(): Promise<T[]> {
        const result = await this._mongooseModel.find()
        const list: T[] = []
        result.map(e => list.push(e.toObject<T>()))
        return list
    }

    public async getById(id: string): Promise<T> {
        const result = await this._mongooseModel.findById(id)
        if (result !== null) {
            return result.toObject<T>()
        }
        return null
    }
    public async delete(id: string): Promise<boolean> {
        const result = await this._mongooseModel.findByIdAndDelete(id)
        if (result !== null) {
            return true
        }
        return false
    }
    public async findByCondition(condition: any): Promise<T[]> {
        const result = await this._mongooseModel.find(condition)
        let listT: T[] = []
        result.map(d => listT.push(d.toObject<T>()))
        return listT
    }
    public async getListIdByCondition(condition: any): Promise<string[]> {
        const result = await this._mongooseModel.find(condition, { _id: 1 })
        let listId: string[] = []
        result.map(d => listId.push(d.id))
        return listId
    }
    public async findByConditionAndPaging(condition: any, offset: number, limit: number, sort: {}): Promise<{ data: T[]; infoPaging: any; }> {
        const result = await this._mongooseModel.paginate(condition, { offset, limit, sort: sort })
        const docs = result.docs
        let listPost: T[] = []
        docs.map(d => listPost.push(d.toObject<T>()))
        delete result.docs
        return { data: listPost, infoPaging: result }
    }

    public async fetchPaginatedResults(condition: any, offset: number, limit: number, sort: {}): Promise<T[]> {
        const result = await this._mongooseModel
            .find(condition)
            .sort(sort)
            .skip(offset)
            .limit(limit)

        let listData: T[] = result.map(d => d.toObject<T>());
        return listData;
    }
}