import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // biblioteca para usar o prisma
import { v4 as uuidv4 } from "uuidv4"; // biblioteca pra gerar chave
import requestIp from "request-ip";
import axios from "axios";

const prisma = new PrismaClient(); // inicia o prisma

const DISCORD_WEBHOOK_URL = process.env.KEY_GEN_HOOK;

async function logKeyGen(username: string, key: string, ip: string) {
  try {
    if (DISCORD_WEBHOOK_URL) {
      await axios.post(DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title: username + " gerou uma chave de acesso",
            color: 3066993,
            fields: [
              {
                name: "Ip",
                value: ip,
              },
              {
                name: "Chave gerada",
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
  const { duration, username } = req.body; // informações que vão ser passadas pelo request

  const ip = requestIp.getClientIp(req)

  // especifica que a duração precisa ser 1d, 7d ou 30d, ou seja, não é possível criar uma chave de X dias
  if (
    !duration &&
    (duration !== "1d" || duration !== "7d" || duration !== "30d")
  ) {
    return res.status(400).json({ erro: "Duração inválida." });
  }

  if (ip === null) {
    return res.status(500).json({ erro: "Não foi possível obter o endereço IP." });
  }

  // usa um bloco try pra usar o catch caso dê erro
  try {
    const key = uuidv4();

    await prisma.key.create({
      data: {
        key: key,
        duration: duration,
      },
    });

    await logKeyGen(username, key, ip);

    res.status(200).json({ resposta: "Chave criada com sucesso.", chave: key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar chave." });
  }
}
