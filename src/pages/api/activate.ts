import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // biblioteca para usar o prisma
import { isPast, addDays } from "date-fns"; // biblioteca para tratar datas
import argon2 from "argon2"; // biblioteca para criptografar a senha
import axios from "axios";
import requestIp from "request-ip";

const prisma = new PrismaClient(); // inicia o prisma

const DISCORD_WEBHOOK_URL = process.env.KEY_ACTIVATE_HOOK;

async function logKeyActivation(username: string, key: string, ip: string) {
  try {
    if (DISCORD_WEBHOOK_URL) {
      await axios.post(DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title: "Ativação de Chave",
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
              {
                name: "Chave Ativada",
                value: key,
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
  const { username, key } = req.body; // o usuario passa as informacoes aqui

  const ip = requestIp.getClientIp(req)

  // verifica se o usuario passou todos parametros
  if (!username) {
    return res.status(400).json({ erro: "Nome de usuário não fornecido." });
  }
  if (!key) {
    return res.status(400).json({ erro: "Chave de acesso não fornecida." });
  }

  // verificar que os parametros que o usuario passou realmente existem
  const usernameExiste = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!usernameExiste) {
    return res.status(400).json({ erro: "Nome de usuário não existe." });
  }

  const keyExiste = await prisma.key.findUnique({
    where: {
      key: key,
    },
  });

  if (!keyExiste) {
    return res.status(400).json({ erro: "Chave de acesso não existe." });
  }

  if (ip === null) {
    return res.status(500).json({ erro: "Não foi possível obter o endereço IP." });
  }

  if (keyExiste.used) {
    return res
      .status(400)
      .json({ erro: "Chave de acesso já foi utilizada." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    const accessKey = await prisma.key.findUnique({ where: { key: key } });

    if (user && accessKey) {
      let expirationDate = user.expirationDate;

      if (isPast(expirationDate)) {
        expirationDate = new Date();
      }

      expirationDate = addDays(expirationDate, parseInt(accessKey.duration));

      await prisma.user.update({
        where: { username: username },
        data: {
          expirationDate: expirationDate,
        },
      });

      await prisma.key.update({ where: { key: key }, data: { used: true } });

      await logKeyActivation(username, key, ip);

      res.status(200).json({ resposta: "Chave ativada com sucesso." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar usuário." });
  }
}
