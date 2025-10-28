import { Request, Response } from 'express'
import { db } from '../database/banco-mongo.js'
class ProdutosController {
    async adicionarProtudo(req: Request, res: Response) {
        const { nome, preco, urlImagem, categoria, descricao } = req.body
        if (!nome || !preco || !urlImagem || !categoria || !descricao) 
            return res.status(400).json({ error: 'Todos os campos devem ser preenchidos!'})

        const produto = { nome, preco, urlImagem, categoria, descricao }
        const resultado = await db.collection('produtos').insertOne(produto)
        res.status(201).json({ nome, preco, urlImagem, categoria, descricao, _id: resultado.insertedId })
    }
    async listarProdutos(req: Request, res: Response) {
        const produtos = await db.collection('produtos').find().toArray()
        res.status(200).json(produtos)
    }
}

export default new ProdutosController()