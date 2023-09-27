import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accountType, token } = req.body;

  if (!accountType) {
    return res.status(400).json({
      success: false,
      message: "Forneça o tipo de conta a ser gerada.",
    });
  }

  try {
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token de sessão inválido." });
    }

    const accounts = await getAccount();

    const account = accounts.find((acc: { type: any; }) => acc.type === accountType);

    if (!account || account.estoque === "0") {
      console.error(`Não há estoque disponível para contas do tipo ${accountType}.`);
      return res.status(400).json({
        success: false,
        message: `Não há estoque disponível para contas do tipo ${accountType}.`,
      });
    }

    const generatedAccount = await genAccount(accountType);
    res.status(200).json({
      success: true,
      message: "Conta gerada com sucesso.",
      account: generatedAccount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Ocorreu um erro ao gerar a conta.",
    });
  }
}

const genAccount = async (accountType: string) => {
  try {
    const response = await axios.post(
      `https://betastorm.discloud.app/gerar?type=${accountType.toLowerCase()}&plan=3`
    );
    return response.data.account;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getAccount = async () => {
  try {
    const response = await axios.get(
      `https://betastorm.discloud.app/accounts?plan=3`
    );
    return response.data.api.message.accounts;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
