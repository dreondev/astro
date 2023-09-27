import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import Router from "next/router";
import { parse } from "cookie";
import styles from "../styles/styles.module.css";
import Head from "next/head";

const Painel: React.FC = () => {
  const [userData, setUserData] = useState({
    username: "",
    expirationDate: "",
  });

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const timeDifference = date.getTime() - now.getTime();

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${days} dias, ${hours} horas, ${minutes} minutos`;
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    Router.push("/login");
  };

  useEffect(() => {
    try {
      const cookies = parse(document.cookie || "");
      const token = cookies.token;

      if (!token) {
        console.log("Nenhum token encontrado ou inválido.");
        Router.push("/login");
      } else {
        const fetchUserInfo = async (token: string) => {
          try {
            const response = await fetch(`/api/user-info?token=${token}`);
            const data = await response.json();

            if (response.ok) {
              setUserData({
                username: data.username,
                expirationDate: data.expirationDate,
              });

              const interval = setInterval(() => {
                const expirationDate = new Date(data.expirationDate);
                const currentDate = new Date();

                if (expirationDate < currentDate) {
                  console.log(
                    "A data de expiração já passou. Redirecionando para o login."
                  );
                  document.cookie =
                    "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  Router.push("/login");
                  clearInterval(interval);
                }
              }, 1000);
            } else {
              console.error(data.error);
            }
          } catch (error) {
            console.error("Erro ao obter informações do usuário:", error);
          }
        };

        fetchUserInfo(token);
      }
    } catch (error) {
      return console.error("Erro ao acessar os Cookies do usuário:", error);
    }
  }, []);

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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <label>AstroGenerator</label>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconButton} onClick={handleLogout}>
            <FontAwesomeIcon icon={faDoorOpen} />
          </button>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.cardRow}>
          <div className={styles.card}>
            <h3>Disney Plus</h3>
            <h4>Gere uma conta de DisneyPlus.</h4>
            <button onClick={() => Router.push('/gerar/disney')}>Gerar</button>
          </div>
          <div className={styles.card}>
            <h3>Netflix</h3>
            <h4>Gere uma conta de Netflix.</h4>
            <button onClick={() => Router.push('/gerar/netflix')}>Gerar</button>
          </div>
          <div className={styles.card}>
            <h3>Crunchyroll</h3>
            <h4>Gere uma conta de Crunchyroll.</h4>
            <button onClick={() => alert('Sem estoque no momento!')}>Gerar</button>
          </div>
          <div className={styles.card}>
            <h3>Funimation</h3>
            <h4>Gere uma conta de Funimation.</h4>
            <button onClick={() => Router.push('/gerar/funimation')}>Gerar</button>
          </div>
        </div>
        <div className={styles.cardRow}>
          <div className={styles.card}>
            <h3>HboMax</h3>
            <h4>Gere uma conta de HboMax.</h4>
            <button onClick={() => Router.push('/gerar/hbomax')}>Gerar</button>
          </div>
          <div className={styles.card}>
            <h3>Star Plus</h3>
            <h4>Gere uma conta de StarPlus.</h4>
            <button onClick={() => Router.push('/gerar/star')}>Gerar</button>
          </div>
          <div className={styles.card}>
            <h3>Valorant</h3>
            <h4>Gere uma conta de Valorant.</h4>
            <button onClick={() => Router.push('/gerar/valorant')}>Gerar</button>
          </div>
          <div className={styles.card}>
            <h3>Steam</h3>
            <h4>Gere uma conta de Steam.</h4>
            <button onClick={() => Router.push('/gerar/steam')}>Gerar</button>
          </div>
        </div>
      </div>

      <div className={styles.header2}>
        <p>Usuario: {userData.username}</p>
        <p>
          Seu acesso expira em: {formatExpirationDate(userData.expirationDate)}
        </p>
      </div>
    </div>
  );
};

export default Painel;
