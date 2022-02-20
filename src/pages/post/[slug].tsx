import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  return router.isFallback ? (
    <div className={styles.loading}>
      <h1>Carregando...</h1>
    </div>
  ) : (
    <>
      <Head>
        <title>Postagem</title>
      </Head>
      <Header></Header>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.banner.url} />
      </div>
      <main className={`${commonStyles.container}`}>
        <article className={styles.post}>
          <h1 className={styles.title}>{post?.data.title}</h1>

          <div className={commonStyles.infos}>
            <div>
              <FiCalendar />
              <time>{format(new Date(post?.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>
            </div>
            <div>
              <FiUser />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock />
              <p>4 min</p>
            </div>
          </div>

          <time className={styles.edited}>* {format(new Date(post?.first_publication_date), "'editado em 'dd MMM yyyy', às' HH mm", { locale: ptBR })}</time>
          <div className={styles.content}>
            {post.data.content.map(content => (
              <div key={content.heading} className={styles.groupContent}>
                <h2>{content.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response
    },
    redirect: 60 * 30
  }
};
