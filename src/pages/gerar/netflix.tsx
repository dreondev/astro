import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/styles.module.css";
import axios from "axios";
import { parse } from "cookie";
import Head from "next/head";

const DisneyPage: React.FC = () => {
  const router = useRouter();
  const [generated, setGenerated] = useState(false);
  const [account, setAccount] = useState({ email: "", senha: "" });

  const cookies = parse(document.cookie || "");
  const token = cookies.token;

  const handleGenerateClick = async () => {
    const response = await axios.post("http://localhost:3000/api/gen-account", {
      accountType: "netflix2",
      token: token,
    });

    const account = response.data.account.info;

    const [email, senha] = account.split(":");

    setAccount({ email, senha });

    setGenerated(true);
  };

  const handleBackClick = () => {
    router.push("/painel");
  };

  return (
    <div>
      <Head>
        <link
          rel="icon"
          href="https://cdn.discordapp.com/attachments/1064667062837981305/1156072013182550040/icon.png?ex=6513a376&is=651251f6&hm=fdf41fd0fdc3b372151c8a7a1bd5ef003e00626ffa6ccf5aeeda627cf6751d6b&"
          type="image/x-icon"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Astr0G3n</title>
      </Head>
      <h1 className={styles.whiteText}>Gerar Netflix</h1>

      <button className={styles.generateButton} onClick={handleGenerateClick}>
        Gerar
      </button>
      <br />

      {generated && (
        <div className={styles.accountCard}>
          <h2>Informações da Conta</h2>
          <p>
            <strong>Usuário:</strong> {account.email}
          </p>
          <p>
            <strong>Senha:</strong> {account.senha}
          </p>
        </div>
      )}

      <br />
      <button className={styles.backButton} onClick={handleBackClick}>
        Voltar
      </button>
    </div>
  );
};

export default DisneyPage;
