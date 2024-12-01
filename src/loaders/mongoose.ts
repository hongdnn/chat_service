import mongoose from "mongoose"
import { mongoUrl } from "../environment"

export class Database {
    constructor() { }

    public async connectDatabase() {
        return await mongoose.connect(mongoUrl, {})
    }
}