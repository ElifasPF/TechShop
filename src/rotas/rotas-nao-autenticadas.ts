import { Router } from 'express'

import ProdutosController from '../produtos/produtos.controller.js'
import UsuariosController from '../usuarios/usuarios.controller.js'

const rotas = Router()
rotas.post('/adicionarUsuario', UsuariosController.cadastrarUsuario)
rotas.post('/login', UsuariosController.loginUsuario)

export default rotas