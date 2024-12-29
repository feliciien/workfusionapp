import type { NextPage } from 'next';
import Head from 'next/head';
import { Menu } from '../components/Menu';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Restaurant Website</title>
        <meta name='description' content='A modern restaurant website' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <h1 className='text-4xl font-bold text-center my-8'>Welcome to Our Restaurant</h1>
        <Menu />
      </main>
    </div>
  );
};

export default Home;
