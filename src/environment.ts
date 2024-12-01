import * as dotenv from 'dotenv'

dotenv.config({ path: `.env` })

const mongoUrl = process.env.MONGO_URL
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000
const Jwt = {
    SecretKey: process.env.SOCIAL_JWT_TOKEN,
    ExpiryTimeInHours: '30d',
    ValidIssuer: "social.issuer",
    ValidAudience: "social"
}
const Bcrypt = {
    SaltRound: 10
}

export {
    mongoUrl, PORT, Jwt, Bcrypt
}


