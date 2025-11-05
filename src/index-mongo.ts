import express, { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import cors from 'cors'
import rotasAutenticadas from './rotas/rotas-autenticadas.js'
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use(rotasNaoAutenticadas)
app.use(rotasAutenticadas)

app.get('/', (req, res) => {
    res.status(200).json({ 
        mensagem: 'API TechShop is running!',
        status: 'OK'
    })
})

app.listen(8000, () => {
    console.log('Server is running on port 8000')
})