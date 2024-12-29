// The About component giving a brief introduction to the restaurant
import styles from './About.module.css';

interface AboutProps {}

export const About: React.FC<AboutProps> = () => {
  return (
    <section className={styles.about}>
      <h2>About Us</h2>
      <p>Welcome to GourmetSpots, the place where fine dining meets perfection. Come and enjoy our chef's exquisite creations.</p>
    </section>
  );
};
