import { Database } from './mongoose'
import { ExpressLoader } from './express'

declare module 'mongoose' {
    interface CollationOptions {
        locale: string,
        caseLevel: boolean,
        caseFirst: string,
        strength: number,
        numericOrdering: boolean,
        alternate: string,
        maxVariable: string,
        backwards: boolean
    }

}

export const loader = async({ expressApp }) => {
    const db = new Database()
    try{
        await db.connectDatabase()
        console.log('MongoDB Initialized')
    }catch(error){
        console.log(error)
        console.log('Connect database failed.');
    }
    const el = new ExpressLoader()
    el.configExpress(expressApp)
    console.log('Express Initialized')
}