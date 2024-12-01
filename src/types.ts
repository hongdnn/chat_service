const TYPES = {
    //services
    IUserService: Symbol.for('IUserService'),
    IMessageService: Symbol.for('IMessageService'),
    IConversationService: Symbol.for('IConversationService'),

    //repositories
    IUserRepository: Symbol.for('IUserRepository'),
    IMessageRepository: Symbol.for('IMessageRepository'),
    IConversationRepository: Symbol.for('IConversationRepository'),
    IMemberRepository: Symbol.for('IMemberRepository'),

    //others
    Token: Symbol.for('Token')
}

export { TYPES }