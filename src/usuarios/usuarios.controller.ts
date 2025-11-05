import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class UsuariosController {
  async cadastrarUsuario(req: Request, res: Response) {
    try {
      const { nome, idade, email, senha, tipo } = req.body;
      if (!nome || !email || !senha)
        return res
          .status(400)
          .json({ mensagem: "Todos os campos são obrigatórios" });
      if (senha.length < 6)
        return res
          .status(400)
          .json({ mensagem: "A senha deve ter no mínimo 6 caracteres" });
      if (!email.includes("@") || !email.includes("."))
        return res.status(400).json({ mensagem: "Email inválido" });

      const usuarioExistente = await db
        .collection("usuarios")
        .findOne({ email });
      if (usuarioExistente)
        return res.status(400).json({ mensagem: "Usuário já cadastrado" });
      const senhaCriptografada = bcrypt.hashSync(senha, 10);
      const tipoUsuario = tipo === "admin" ? "admin" : "usuario";
      const usuario = {
        nome,
        idade,
        email,
        senha: senhaCriptografada,
        tipo: tipoUsuario,
      };

      const resultado = await db.collection("usuarios").insertOne(usuario);
      res
        .status(201)
        .json({
          nome,
          idade,
          email,
          _id: resultado.insertedId,
          tipo: tipoUsuario,
        });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      res.status(500).json({ mensagem: "Erro interno ao cadastrar usuário" });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarios = await db.collection("usuarios").find().toArray();
      const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);
      res.status(200).json(usuariosSemSenha);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({ mensagem: "Erro interno ao listar usuários" });
    }
  }

  async loginUsuario(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha)
        return res
          .status(400)
          .json({ mensagem: "Email e senha são obrigatórios" });

      const usuario = await db.collection("usuarios").findOne({ email });
      if (!usuario)
        return res.status(404).json({ mensagem: "Usuário não encontrado" });
      const senhaValida = bcrypt.compareSync(senha, usuario.senha);
      if (!senhaValida)
        return res.status(401).json({ mensagem: "Senha inválida" });

      const token = jwt.sign(
        { usuario_id: usuario._id, tipo: usuario.tipo },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );
      res.status(200).json({ token });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      res.status(500).json({ mensagem: "Erro interno ao fazer login" });
    }
  }
}

export default new UsuariosController();
