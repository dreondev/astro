import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // biblioteca para usar o prisma
import jwt, { JwtPayload } from "jsonwebtoken"; // biblioteca para criar o token
import { parse } from "cookie";

const prisma = new PrismaClient(); // inicia o prisma

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // pega a chave secreta no .env

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token

  if (!token) {
    return res.status(400).json({ erro: "Token não fornecido." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY as string) as JwtPayload; // verifica se o token é valido

    const user = await prisma.user.findUnique({ where: { id: payload.id } }); // procura o usuario no banco de dados
    if (!user) {
      return res.status(400).json({ erro: "Usuário não encontrado." });
    }

    res
      .status(200)
      .json({
        token,
        data: {
          id: user.id,
          username: user.username,
          expirationDate: user.expirationDate,
        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao validar token." });
  }
}
