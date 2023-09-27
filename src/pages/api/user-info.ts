import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.query;

  if (typeof token === "string") {
    const payload = jwt.verify(token, JWT_SECRET_KEY as string) as JwtPayload;

    if (!token) {
      return res.status(400).json({ error: "TOKEN do usuário não fornecido" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: Number(payload.id),
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao consultar o banco de dados:", error);
      res.status(500).json({ error: "Erro ao consultar o banco de dados" });
    }
  } else {
    return res.status(400).json({ error: "Token inválido" });
  }
}
