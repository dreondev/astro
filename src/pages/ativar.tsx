import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import Head from "next/head";
import { parse } from "cookie";
import Router from "next/router";

const Chave: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");

  useEffect(() => {
    const cookies = parse(document.cookie || "");
    const token = cookies.token;

    if (token) {
      Router.push("/painel");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          key: key,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Chave ativada com sucesso!");
        router.push("/login");
      } else {
        console.error(data.erro);
      }
    } catch (error) {
      console.error("Erro ao ativar a chave:", error);
    }
  };

  return (
    <div className={styles["register-container"]}>
      <Head>
        <link
          rel="icon"
          href="https://cdn.discordapp.com/attachments/1064667062837981305/1156072013182550040/icon.png?ex=6513a376&is=651251f6&hm=fdf41fd0fdc3b372151c8a7a1bd5ef003e00626ffa6ccf5aeeda627cf6751d6b&"
          type="image/x-icon"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Astr0G3n</title>
      </Head>
      <h2>AstroGenerator</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles["form-group"]}>
          <label htmlFor="username" className={styles["label"]}>
            Usuário
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles["input"]}
            />
          </label>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="password" className={styles["label"]}>
            Chave de acesso
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={styles["input"]}
            />
          </label>
        </div>
        <button type="submit" className={styles["register-button"]}>
          Ativar
        </button>
      </form>
      <p>
        Não tem uma conta? <Link href="/register">Registre-se aqui</Link>.
      </p>
    </div>
  );
};

export default Chave;
