import { Joi, Segments } from "celebrate";

export const getConversationListDto = {
    [Segments.QUERY]: Joi.object().keys({
        date: Joi.date().iso().optional(),
        size: Joi.number().integer().min(1).default(10)
    })
};
