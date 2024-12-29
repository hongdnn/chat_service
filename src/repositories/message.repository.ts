import { injectable } from "inversify";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { Message } from "../entities/message";


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
          ...(date && { created_date: { $lt: date } }),
        },
      },
      { $sort: { created_date: -1 } },
      { $limit: limit },

      //Group all member_ids first
      {
        $group: {
          _id: null,
          messages: { $push: "$$ROOT" },
          uniqueMemberIds: { $addToSet: "$member_id" },
        },
      },

      // Single lookup to members collection
      {
        $lookup: {
          from: "members",
          let: { memberIds: "$uniqueMemberIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: "$_id" }, "$$memberIds"],
                },
              },
            },
          ],
          as: "allMembers",
        },
      },

      {
        $set: {
          uniqueUserIds: {
            $reduce: {
              input: "$allMembers",
              initialValue: [],
              in: {
                $setUnion: ["$$value", ["$$this.user_id"]],
              },
            },
          },
        },
      },

      // Single lookup to users collection
      {
        $lookup: {
          from: "users",
          let: { userIds: "$uniqueUserIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: "$_id" }, "$$userIds"],
                },
              },
            },
          ],
          as: "allUsers",
        },
      },

      { $unwind: "$messages" },
      {
        $project: {
          _id: "$messages._id",
          conversation_id: conversationId,
          message_type: "$messages.message_type",
          created_date: "$messages.created_date",
          message: "$messages.message",
          sender: {
            $let: {
              vars: {
                member: {
                  $first: {
                    $filter: {
                      input: "$allMembers",
                      cond: {
                        $eq: [
                          { $toString: "$$this._id" },
                          "$messages.member_id",
                        ],
                      },
                    },
                  },
                },
              },
              in: {
                $let: {
                  vars: {
                    user: {
                      $first: {
                        $filter: {
                          input: "$allUsers",
                          cond: {
                            $eq: [
                              { $toString: "$$this._id" },
                              "$$member.user_id",
                            ],
                          },
                        },
                      },
                    },
                  },
                  in: {
                    _id: { $toString: "$$user._id" },
                    member_id: { $toString: "$$member._id" },
                    first_name: "$$user.first_name",
                    last_name: "$$user.last_name",
                    image: "$$user.image",
                    nick_name: "$$member.nick_name",
                  },
                },
              },
            },
          },
        },
      },
    ]);

    return result.reverse();
  }
}