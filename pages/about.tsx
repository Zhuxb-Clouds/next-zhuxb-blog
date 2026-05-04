import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/about.module.css";

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About | Zhuxb</title>
      </Head>
      <div className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>朱仙变</h1>
          <p className={styles.lead}>
            我主要围绕故事、游戏与创作过程本身进行长期创作和记录，持续关注叙事在不同媒介中的表达方式。
          </p>
        </section>

        <section className={styles.section}>
          <p>
            我已发行视觉小说《大鹏》，也在推进新的叙事项目与相关写作。这里既放作品，也记录我在创作中的想法与变化。
          </p>
          <p>
            比起把自己定义成某一种固定身份，我更在意作品是否拥有自己的气质，是否真正传达了我想表达的东西。对我来说，创作不只是完成一个项目，也是不断确认自己关心什么、如何表达，以及怎样让作品与人发生联系的过程。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Projects</h2>
          <div className={styles.projectList}>
            <article className={styles.projectItem}>
              <h3>《大鹏》</h3>
              <p>已发行视觉小说作品。从故事设定到最终呈现，我在其中积累了对叙事节奏、体验设计与作品落地的持续思考。</p>
            </article>
            <article className={styles.projectItem}>
              <h3>《幽镜志怪》</h3>
              <p>正在推进中的新项目。它延续了我对中文叙事作品的兴趣，也让我继续探索人物、氛围与表达方式之间的关系。</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Notes</h2>
          <p>
            这个网站更像是我的在线档案，而不只是一个作品陈列页。除了项目本身，我也会在这里留下关于创作、阅读、叙事与作品判断的记录。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Current</h2>
          <p>
            目前我以个人创作和内容更新为主，暂不承接定制外包或接稿工作。如果是作品、发行或内容相关的交流合作，欢迎通过邮件联系我。
          </p>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
