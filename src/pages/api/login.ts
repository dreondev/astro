import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import axios from "axios";
import requestIp from "request-ip";

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const DISCORD_WEBHOOK_URL = process.env.LOGIN_HOOK;

async function logLogin(username: string, ip: string) {
  try {
    if (DISCORD_WEBHOOK_URL) {
      await axios.post(DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title: "Login realizado com sucesso",
            color: 3066993,
            fields: [
              {
                name: "Usuário",
                value: username,
              },
              {
                name: "Ip",
                value: ip,
              },
            ],
          },
        ],
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, password } = req.body;

  const ip = requestIp.getClientIp(req);

  if (!username) {
    return res.status(400).json({ erro: "Nome de usuário não fornecido." });
  }
  if (!password) {
    return res.status(400).json({ erro: "Senha não fornecida." });
  }

  if (ip === null) {
    return res.status(500).json({ erro: "Não foi possível obter o endereço IP." });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(500).json({ erro: "Usuário não encontrado." });
  }

  try {
    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return res.status(500).json({ erro: "Senha incorreta." });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY as string, {
      expiresIn: "1d",
    });

    await logLogin(username, ip);

    res.setHeader("Set-Cookie", serialize("token", token, { maxAge: 3600 }));
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao entrar." });
  }
}
