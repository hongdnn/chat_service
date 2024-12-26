import { injectable } from "inversify";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { Conversation } from "../entities/conversation";


export interface IConversationRepository extends IBaseRepository<Conversation> {
    fetchConversations(userId: string, limit: number, date?: Date): Promise<any[]>
}

@injectable()
export class ConversationRepository extends BaseRepository<Conversation> implements IConversationRepository {

    public async fetchConversations(userId: string, limit: number, date?: Date): Promise<any[]> {

        const result = await this._mongooseModel.aggregate([
            {
                $match: {
                    user_ids: { $in: [userId] },
                    ...(date && { latest_message_time: { $lt: date } })
                }
            },
            { $sort: { latest_message_time: -1 } },
            { $limit: limit },

            {
                $lookup: {
                    from: "members",
                    let: { conversationId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$conversation_id", { $toString: "$$conversationId" }]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                joined_time: 1,
                                is_admin: 1,
                                nick_name: 1
                            }
                        }
                    ],
                    as: "members"
                }
            },

            {
                $lookup: {
                    from: "users",
                    let: { memberUserIds: "$members.user_id" }, 
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: [{ $toString: "$_id" }, "$$memberUserIds"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                first_name: 1,
                                last_name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: "users"
                }
            },

            {
                $lookup: {
                    from: "messages",
                    let: { conversationId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$conversation_id", { $toString: "$$conversationId" }]
                                }
                            }
                        },
                        { $sort: { created_date: -1 } },
                        { $limit: limit }
                    ],
                    as: "messages"
                }
            },

            {
                $project: {
                    _id: 1,
                    conversation_name: 1,
                    conversation_type: 1,
                    image: 1,
                    created_date: 1,
                    members: {
                        $map: {
                            input: "$members",
                            as: "member",
                            in: {
                                $mergeObjects: [
                                    {
                                        _id: "$$member._id",
                                        user_id: "$$member.user_id",
                                        nick_name: "$$member.nick_name"
                                    },
                                    {
                                        $let: {
                                            vars: {
                                                user: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$users",
                                                                as: "user",
                                                                cond: { 
                                                                    $eq: [
                                                                        { $toString: "$$user._id" },
                                                                        "$$member.user_id"
                                                                    ]
                                                                }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: {
                                                first_name: "$$user.first_name",
                                                last_name: "$$user.last_name",
                                                image: "$$user.image"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    messages: {
                        $map: {
                            input: "$messages",
                            as: "message",
                            in: {
                                $mergeObjects: [
                                    {
                                        _id: "$$message._id",
                                        message: "$$message.message",
                                        message_type: "$$message.message_type",
                                        created_date: "$$message.created_date",
                                        conversation_id: "$$message.conversation_id"
                                    },
                                    {
                                        sender: {
                                            $let: {
                                                vars: {
                                                    member: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$members",
                                                                    as: "member",
                                                                    cond: { $eq: ["$$member.user_id", "$$message.user_id"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: {
                                                    $mergeObjects: [
                                                        {
                                                            _id: "$$member._id",
                                                            user_id: "$$member.user_id",
                                                            nick_name: "$$member.nick_name"
                                                        },
                                                        {
                                                            $let: {
                                                                vars: {
                                                                    user: {
                                                                        $arrayElemAt: [
                                                                            {
                                                                                $filter: {
                                                                                    input: "$users",
                                                                                    as: "user",
                                                                                    cond: { 
                                                                                        $eq: [
                                                                                            { $toString: "$$user._id" },
                                                                                            "$$member.user_id"
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            },
                                                                            0
                                                                        ]
                                                                    }
                                                                },
                                                                in: {
                                                                    first_name: "$$user.first_name",
                                                                    last_name: "$$user.last_name",
                                                                    image: "$$user.image"
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ])

        return result
    }
    
}