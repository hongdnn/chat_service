import * as jwt from 'jsonwebtoken'
import * as environment from '../environment'


export const authenticate = (req, res, next)=>{
    const bearerHeader = req.headers['authorization']
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1]
        jwt.verify(bearerToken, environment.Jwt.SecretKey, (err, authData) => {
            if (err) {
                res.status(401).send('Unauthorized')
            } else {
                req.user = authData
                next()
            }
        })
    } else {
        res.sendStatus(401)
    }
} 