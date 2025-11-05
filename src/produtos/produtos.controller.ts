import { Request, Response } from 'express'
import { db } from '../database/banco-mongo.js'
import { ObjectId } from 'mongodb'

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
    async removerProduto(req: Request, res: Response) {
        const { id } = req.params
        try {
            const objectId = new ObjectId(id)
            const resultado = await db.collection('produtos').deleteOne({ _id: objectId })
            if (resultado.deletedCount === 0) 
                return res.status(404).json({ error: 'Produto não encontrado!' })
            res.status(200).json({ message: 'Produto removido com sucesso!' })
        } catch (error) {
            return res.status(400).json({ error: 'ID de produto inválido!' })
        }
    }
}

export default new ProdutosController()