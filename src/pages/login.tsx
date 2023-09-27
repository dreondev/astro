import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import Link from "next/link";
import { parse } from "cookie";
import Router from "next/router";
import Head from "next/head";

const Login = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cookies = parse(document.cookie || "");
    const token = cookies.token;

    if (token) {
      Router.push("/painel");
    }
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        document.cookie = `token=${data.token}; path=/`;
        Router.push("/painel");
      } else {
        setLoading(false);
        console.error(data.erro);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setLoading(false);
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
      {loading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <img
            src="https://usagif.com/wp-content/uploads/loading-5.gif"
            alt="Loading..."
          />
        </div>
      ) : null}
      <h2>AstroGenerator</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles["form-group"]}>
          <label htmlFor="username" className={styles["label"]}>
            Usuário
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={styles["input"]}
            />
          </label>
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="password" className={styles["label"]}>
            Senha
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles["input"]}
            />
          </label>
        </div>
        <button type="submit" className={styles["register-button"]}>
          Entrar
        </button>
      </form>
      <p>
        Não tem uma conta? <Link href="/register">Registre-se aqui</Link>.
      </p>
    </div>
  );
};

export default Login;
