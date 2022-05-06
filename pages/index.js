import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Aaaaaa Aaaa Aaa</title>
        <meta name="description" content="Aaaaaaaaa aa aaaaaa aaaa aaa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Aaaaaaa aa <a href="https://nextjs.org">Aaaa.aa!</a>
        </h1>

        <p className={styles.description}>
          Aaa aaaaaaa aa aaaaaaaa{" "}
          <code className={styles.code}>aaaaa/aaaaa.aa</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Aaaaaaaaaaaaa &rarr;</h2>
            <p>Aaaa aa aaaaa aaaaaaaaaaa aaaaa Aaaa.aa aaaaaaaa aaa AAA.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Aaaaa &rarr;</h2>
            <p>Aaaaa aaaaa Aaaa.aa aa aa aaaaaaaaaaa aaaaaa aaaa aaaaaaa!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Aaaaaaaa &rarr;</h2>
            <p>Aaaaaaaa aaa aaaaaa aaaaaaaaaaa aaaaaaa Aaaa.aa aaaaaaaa.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Aaaaaa &rarr;</h2>
            <p>
              Aaaaaaaaa aaaaaa aaaa Aaaa.aa aaaa aa a aaaaaa AAA aaaa Aaaaaa.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aaaaaaa aa{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
