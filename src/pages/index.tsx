import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link';
import Header from '../components/Header';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'


import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { RichText } from 'prismic-dom';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  async function handleShowMore(link: string) {
    const response = await fetch(link);
    const data: PostPagination = await response.json();

    setPosts([...postsPagination.results, ...data.results])
    setNextPage(data.next_page);
  }

  return (
    <>
      <Head>
        <title>spacetraveling | Home</title>
      </Head>
      <Header></Header>
      <main className={`${commonStyles.container} ${styles.container}`}>
        {posts.map(post => (
          <Link href={`post/${post.uid}`} key={post.uid}>
            <a className={styles.post}>
              <h2 className={styles.title}>{post.data.title}</h2>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <footer className={commonStyles.infos}>
                <div>
                  <FiCalendar />
                  <time>{format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>
                </div>
                <div>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
              </footer>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button
            className={styles.showMore}
            onClick={() => { handleShowMore(nextPage) }}
          >
            Carregar mais posts
          </button>
        )}
        <button className={styles.exitPreview}>
          Sair do modo Preview
        </button>
      </main>

    </>
  )

}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content', 'post.author', 'post.subtitle'],
    pageSize: 2,

  })

  return {
    props: {
      postsPagination: postsResponse
    }
  }
  //   // TODO
};
