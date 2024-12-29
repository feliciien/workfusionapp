import type { NextPage } from 'next';
import Head from 'next/head';
import { Menu } from '../components/Menu';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Gourmet Place</title>
        <meta name='description' content='Gourmet Place - Exquisite dining experience' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <h1>Welcome to Gourmet Place</h1>
        <Menu />
      </main>

      <footer>
        <p>&copy; 2023 Gourmet Place</p>
      </footer>
    </div>
  );
};

export default Home;
