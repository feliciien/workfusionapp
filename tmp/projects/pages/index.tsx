// Home page of the restaurant website
import type { NextPage } from 'next';
import Head from 'next/head';
import { Layout } from '../components/Layout';
import { MenuPreview } from '../components/MenuPreview';
import { ReservationForm } from '../components/ReservationForm';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>GourmetPlace - Home</title>
        <meta name='description' content='GourmetPlace, a perfect place for fine dining experience' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout>
        <MenuPreview />
        <ReservationForm />
      </Layout>
    </>
  );
};

export default Home;