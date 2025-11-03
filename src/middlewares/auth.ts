import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

interface AutenticacaoRequest extends Request {
    usuario_id?: string;
}

function Auth(req: AutenticacaoRequest, res: Response, next: NextFunction) {
    console.log('Middleware de autenticação acionado')
    const authHeaders = req.headers.authorization
    console.log(authHeaders)
    if (!authHeaders) 
        return res.status(401).json({ mensagem: 'O token não foi fornecido no Bearer'})
    const token = authHeaders.split(' ')[1]!

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ mensagem: 'Middleware: Token inválido'})
        }
        if (typeof decoded === 'string' || !decoded || !('usuario_id' in decoded)) {
            return res.status(401).json({ mensagem: 'Middleware: Token inválido'})
        }
        req.usuario_id = decoded.usuario_id
        next()
    })
}

export default Auth