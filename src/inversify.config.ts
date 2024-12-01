import "reflect-metadata"
import { Container } from "inversify";
import { IUserRepository, UserRepository } from "./repositories/user.repository";
import { UserModel } from "./entities/user";
import { TYPES } from "./types";
import { IUserService, UserService } from "./controllers/services/user.service";
import { Token } from "./JwtToken/JwtToken";
import { IMessageService, MessageService } from "./controllers/services/message.service";
import { IMessageRepository, MessageRepository } from "./repositories/message.repository";
import { MessageModel } from "./entities/message";
import { ConversationRepository, IConversationRepository } from "./repositories/conversation.repository";
import { ConversationModel } from "./entities/conversation";
import { IMemberRepository, MemberRepository } from "./repositories/member.repository";
import { MemberModel } from "./entities/member";
import { ConversationService, IConversationService } from "./controllers/services/conversation.service";




const myContainer = new Container()

//services
myContainer.bind<IUserService>(TYPES.IUserService).to(UserService)
myContainer.bind<IMessageService>(TYPES.IMessageService).to(MessageService)
myContainer.bind<IConversationService>(TYPES.IConversationService).to(ConversationService)


//repositories
myContainer.bind<IUserRepository>(TYPES.IUserRepository).toConstantValue(new UserRepository(UserModel))
myContainer.bind<IMessageRepository>(TYPES.IMessageRepository).toConstantValue(new MessageRepository(MessageModel))
myContainer.bind<IConversationRepository>(TYPES.IConversationRepository).toConstantValue(new ConversationRepository(ConversationModel))
myContainer.bind<IMemberRepository>(TYPES.IMemberRepository).toConstantValue(new MemberRepository(MemberModel))

//register common service
myContainer.bind<Token>(TYPES.Token).to(Token)

export { myContainer }