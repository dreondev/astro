import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import Router from "next/router";
import Link from "next/link";
import { parse } from "cookie";
import Head from "next/head";

const Register = () => {
  useEffect(() => {
    const cookies = parse(document.cookie || "");
    const token = cookies.token;

    if (token) {
      Router.push("/painel");
    }
  }, []);

  const [formData, setFormData] = useState({
    username: "", // Corrigido para 'username'
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Corrigido para 'name'
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        Router.push("/login");
      } else {
        console.error(data.erro);
      }
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
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
            {" "}
            {}
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
          Registrar
        </button>
      </form>
      <p>
        Já tem uma conta? <Link href="/login">Entre aqui</Link>.
      </p>
    </div>
  );
};

export default Register;
