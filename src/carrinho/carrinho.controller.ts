// src/carrinho/carrinho.controller.ts

import { Request, Response } from 'express'
import { db } from '../database/banco-mongo.js'
import { ObjectId } from 'bson'

// Interfaces locais (não precisam de 'export')
interface ItemCarrinho {
    produtoId: string,
    quantidade: number,
    precoUnitario: number,
    nome: string
}
interface Carrinho {
    usuarioId: string,
    itens: ItemCarrinho[],
    dataAtualizacao: Date,
    total: number
}

// Interface para o 'req' que vem do middleware 'auth.ts'
interface AutenticacaoRequest extends Request {
    usuarioId?: string // <-- Esperamos 'usuarioId' (camelCase)
}

class CarrinhoController {

    // 1. FUNÇÃO ADICIONAR ITEM (SEGURA)
    async adicionarItem(req: AutenticacaoRequest, res: Response) {
        const { produtoId, quantidade } = req.body

        // Verifica se o ID do token foi anexado
        if (!req.usuarioId)
            return res.status(401).json({ error: 'Usuário não autenticado' })
        const usuarioId = req.usuarioId

        try {
            const produto = await db.collection('produtos').findOne({ _id: ObjectId.createFromHexString(produtoId) })
            if (!produto)
                return res.status(404).json({ error: 'Produto não encontrado' })

            const precoUnitario = produto.preco
            const nome = produto.nome

            const carrinho = await db.collection<Carrinho>('carrinhos').findOne({ usuarioId: usuarioId })

            if (!carrinho) {
                const novoCarrinho: Carrinho = {
                    usuarioId: usuarioId,
                    itens: [{ produtoId, quantidade, precoUnitario, nome }],
                    dataAtualizacao: new Date(),
                    total: precoUnitario * quantidade
                }
                await db.collection('carrinhos').insertOne(novoCarrinho)
                return res.status(201).json(novoCarrinho) // 201 = Criado
            }

            const itemExistente = carrinho.itens.find(item => item.produtoId === produtoId)
            if (itemExistente) {
                itemExistente.quantidade += quantidade
            } else {
                carrinho.itens.push({ produtoId, quantidade, precoUnitario, nome })
            }

            const newTotal = carrinho.itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0)
            carrinho.total = newTotal
            carrinho.dataAtualizacao = new Date()

            await db.collection('carrinhos').updateOne(
                { usuarioId: usuarioId },
                { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
            )
            return res.status(200).json(carrinho) // 200 = OK

        } catch (error) {
            return res.status(400).json({ error: 'ID do produto inválido' })
        }
    }

    // 2. FUNÇÃO REMOVER ITEM (SEGURA) - TAREFA B1
    async removerItem(req: AutenticacaoRequest, res: Response) {
        const { produtoId } = req.body // Frontend envia o ID do produto

        if (!req.usuarioId)
            return res.status(401).json({ error: 'Usuário não autenticado' })
        const usuarioId = req.usuarioId

        const carrinho = await db.collection<Carrinho>('carrinhos').findOne({ usuarioId: usuarioId })
        if (!carrinho)
            return res.status(404).json({ error: 'Carrinho não encontrado' })

        const itemIndex = carrinho.itens.findIndex(item => item.produtoId === produtoId)
        if (itemIndex === -1)
            return res.status(404).json({ error: 'Item não encontrado no carrinho' })

        carrinho.itens.splice(itemIndex, 1) // Remove o item

        const total = carrinho.itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0)
        carrinho.dataAtualizacao = new Date()

        await db.collection('carrinhos').updateOne(
            { usuarioId: usuarioId },
            { $set: { itens: carrinho.itens, total: total, dataAtualizacao: carrinho.dataAtualizacao } }
        )
        return res.status(200).json(carrinho)
    }

    // 3. FUNÇÃO LISTAR CARRINHO (SEGURA)
    async listarCarrinho(req: AutenticacaoRequest, res: Response) {
        if (!req.usuarioId)
            return res.status(401).json({ error: 'Usuário não autenticado' })
        const usuarioId = req.usuarioId

        const carrinho = await db.collection<Carrinho>('carrinhos').findOne({ usuarioId: usuarioId })
        if (!carrinho)
            return res.status(404).json({ error: 'Carrinho não encontrado' })
        return res.status(200).json(carrinho)
    }

    async removerCarrinho(req: AutenticacaoRequest, res: Response) {
        if (!req.usuarioId)
            return res.status(401).json({ error: 'Usuário não autenticado' })
        const usuarioId = req.usuarioId

        const resultado = await db.collection('carrinhos').deleteOne({ usuarioId: usuarioId })
        if (resultado.deletedCount === 0)
            return res.status(404).json({ error: 'Carrinho não encontrado' })
        return res.status(200).json({ message: 'Carrinho removido com sucesso' })
    }
}

export default new CarrinhoController()