import { injectable } from "inversify";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { Conversation } from "../entities/conversation";


export interface IConversationRepository extends IBaseRepository<Conversation> {
    
}

@injectable()
export class ConversationRepository extends BaseRepository<Conversation> implements IConversationRepository {

}