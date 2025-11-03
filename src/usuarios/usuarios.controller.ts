import { Request, Response } from 'express'
import { db } from '../database/banco-mongo.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

class UsuariosController {
    async cadastrarUsuario(req: Request, res: Response) {
        const { nome, idade, email, senha } = req.body
        if (!nome || !email || !senha) 
            return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios'})
        if (senha.length < 6)
            return res.status(400).json({ mensagem: 'A senha deve ter no mínimo 6 caracteres'})
        if (!email.includes('@') || !email.includes('.'))
            return res.status(400).json({ mensagem: 'Email inválido'})

        const senhaCriptografada = bcrypt.hashSync(senha, 10)
        const usuario = { nome, email, senha: senhaCriptografada }

        const resultado = await db.collection('usuarios').insertOne(usuario)
        res.status(201).json({ nome, idade, email, _id: resultado.insertedId})
    }

    async listar(req: Request, res: Response) {
        const usuarios = await db.collection('usuarios').find().toArray()
        const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario)
        res.status(200).json(usuariosSemSenha)
    }

    async loginUsuario(req: Request, res: Response) {
        const { email, senha } = req.body
        if (!email || !senha) 
            return res.status(400).json({ mensagem: 'Email e senha são obrigatórios'})

        const usuario = await db.collection('usuarios').findOne({ email })
        if (!usuario)
            return res.status(404).json({ mensagem: 'Usuário não encontrado'})
        const senhaValida = bcrypt.compareSync(senha, usuario.senha)
        if (!senhaValida)
            return res.status(401).json({ mensagem: 'Senha inválida'})

        const token = jwt.sign({ usuario_id: usuario._id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
        res.status(200).json({ token})
    }
}

export default new UsuariosController()