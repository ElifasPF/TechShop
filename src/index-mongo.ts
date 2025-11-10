import express, { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import cors from 'cors'
import rotasAutenticadas from './rotas/rotas-autenticadas.js'
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ 
        mensagem: ['API TechShop funcionando!',
            'Para rodar a aplicação, vá para: https://tech-shop-frontend-ecru.vercel.app/'
        ],
        status: 'OK'
    })
})

app.use(rotasNaoAutenticadas) // São as rotas públicas (cadastro, login)
app.use(rotasAutenticadas) // São as rotas privadas (necessitam de autenticação (produtos, carrinho))

const port = process.env.PORT || 8000

app.listen(8000, () => {
    console.log(`Server is running on port ${port}`)
})