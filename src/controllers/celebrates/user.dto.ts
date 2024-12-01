import { Joi, Segments } from "celebrate";


export const createUserDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false}).keys({
        last_name: Joi.string().trim().required(),
        first_name: Joi.string().trim().required(),
        email: Joi.string().required().regex(/^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/),
        password: Joi.string().trim().required(),
        phone: Joi.string().trim(),
    })
}

export const loginDto = {
    [Segments.BODY]: Joi.object().options({ abortEarly: false }).keys({ 
        email: Joi.string().trim().required().regex(/^[a-z][a-z0-9_.]{0,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/),
        password: Joi.string().trim().required()
    })
}