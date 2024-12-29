// The Menu component displaying the restaurant's offerings
import styles from './Menu.module.css';

interface MenuProps {}

export const Menu: React.FC<MenuProps> = () => {
  // Mock data or fetched data could be used here
  return (
    <section className={styles.menu}>
      <h2>Our Menu</h2>
      {/* Menu items would be rendered here */}
    </section>
  );
};
