import dynamic from 'next/dynamic';

import styles from '@/styles/app.module.css';
import { DocsCard, HelloNearCard, FilmGeneratorComponentCard } from '@/components/cards';
import { Components } from '@/config';

const Component = dynamic(() => import('@/components/vm-component'), {
  ssr: false,
  loading: () => <p>Loading Component...</p>,
});


export default function HelloComponents() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Using smart contract from: &nbsp;
            <code className={styles.code}>filmgen.testnet</code>
          </p>
        </div>
        <div className={styles.center}>
          <h1>
            <code>FilmGenerator</code> Fuel your Creativity
          </h1>
        </div>
        <div className="row">
            <FilmGeneratorComponentCard />
        </div>
        <hr />

        <div className={styles.grid}>
          <DocsCard />
          <HelloNearCard />
        </div>
      </main>
    </>
  );
}
