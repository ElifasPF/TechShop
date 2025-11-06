import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Interface para o que tem DENTRO do token
interface DecodedToken {
  usuario_id: string; // O token tem 'usuario_id'
  tipo: 'admin' | 'user';
}

// Interface para o que anexamos ao 'req'
interface AutenticacaoRequest extends Request {
  usuarioId?: string; // Vamos criar 'usuarioId' (camelCase)
  tipoUsuario?: 'admin' | 'user'; // Vamos criar 'tipoUsuario'
}

function Auth(req: AutenticacaoRequest, res: Response, next: NextFunction) {
  const authHeaders = req.headers.authorization;
  
  if (!authHeaders) {
    return res
      .status(401)
      .json({ mensagem: "O token não foi fornecido no Bearer" });
  }
  
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return res.status(401).json({ mensagem: "Token mal formatado" });
  }

  if (!process.env.JWT_SECRET) {
      console.error("ERRO GRAVE: JWT_SECRET não definido!");
      return res.status(500).json({ error: "Erro interno do servidor" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ mensagem: "Middleware: Token expirado ou inválido" });
    }
    
    const payload = decoded as DecodedToken;
    
    if (!payload || !payload.usuario_id || !payload.tipo) {
      return res.status(401).json({ mensagem: "Middleware: Token com formato incorreto" });
    }

    // =======================================================
    // A CORREÇÃO ESTÁ AQUI:
    // Nós lemos 'usuario_id' do token, mas salvamos como 'usuarioId'
    // =======================================================
    req.usuarioId = payload.usuario_id; 
    req.tipoUsuario = payload.tipo;

    next();
  });
}

export function verificarAdmin(req: AutenticacaoRequest, res: Response, next: NextFunction) {
    // =======================================================
    // CORREÇÃO AQUI: Agora verificamos 'tipoUsuario'
    // =======================================================
    if (req.tipoUsuario !== 'admin') {
      return res.status(403).json({ mensagem: "Acesso negado: Requer privilégios de administrador" });
    }
    next();
}

export default Auth;