import { Router } from "express"

import carrinhoController from "../carrinho/carrinho.controller.js"
import produtosController from "../produtos/produtos.controller.js"

const rotas = Router()
rotas.post('/produtos', produtosController.adicionarProtudo)
rotas.get('/produtos', produtosController.listarProdutos)

rotas.post('/adicionarItem', carrinhoController.adicionarItem)
rotas.post('/removerItem', carrinhoController.removerItem)
rotas.get('/carrinho/:usuario_id', carrinhoController.listarCarrinho)
rotas.delete('/carrinho/:usuario_id', carrinhoController.removerCarrinho)

export default rotas