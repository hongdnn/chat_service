import { injectable } from "inversify";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { Message } from "../entities/message";
import { Date } from "mongoose";


export interface IMessageRepository extends IBaseRepository<Message> {
    fetchMessagesByConversation(conversationId: string, limit: number, date?: Date): Promise<any[]>
}

@injectable()
export class MessageRepository
  extends BaseRepository<Message>
  implements IMessageRepository
{
  public async fetchMessagesByConversation(conversationId: string, limit: number, date?: Date): Promise<any[]> {
    const result = await this._mongooseModel.aggregate([
        {
            $match: {
            conversation_id: conversationId,
            created_date: date ? { $lt: date } : { $lte: new Date() },
            },
        },
        { $sort: { created_date: -1 } },
        { $limit: limit },

        {
            $lookup: {
            from: "members",
            let: { userId: "$user_id", conversationId: "$conversation_id" },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $and: [
                        { $eq: ["$user_id", "$$userId"] },
                        { $eq: ["$conversation_id", "$$conversationId"] },
                    ],
                    },
                },
                },
            ],
            as: "member",
            },
        },

        { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
            from: "users",
            let: { userId: { $toObjectId: "$user_id" } },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $eq: ["$_id", "$$userId"],
                    },
                },
                },
            ],
            as: "user",
            },
        },

        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        {
            $project: {
            conversation_id: conversationId,
            message: 1,
            message_type: 1,
            created_date: 1,
            sender: {
                _id: "$user._id",
                member_id: "$member._id",
                first_name: "$user.first_name",
                last_name: "$user.last_name",
                image: "$user.image",
                nick_name: "$member.nick_name",
            },
            },
        },
        ]);

        return result.reverse();
  }
}