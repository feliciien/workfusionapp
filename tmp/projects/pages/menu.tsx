// Menu page component
import React from 'react';
import { Layout } from '../components/Layout';

export const Menu = () => {
  return (
    <Layout>
      <div className="container">
        <h1>Our Menu</h1>
        <div className="menu-section">
          <h2>Appetizers</h2>
          <ul>
            <li>
              <h3>Bruschetta</h3>
              <p>Toasted bread with fresh tomatoes, garlic, and basil</p>
              <span>$8</span>
            </li>
            <li>
              <h3>Calamari</h3>
              <p>Crispy fried squid with marinara sauce</p>
              <span>$12</span>
            </li>
          </ul>
        </div>
        <div className="menu-section">
          <h2>Main Courses</h2>
          <ul>
            <li>
              <h3>Grilled Salmon</h3>
              <p>Fresh salmon with seasonal vegetables</p>
              <span>$26</span>
            </li>
            <li>
              <h3>Beef Tenderloin</h3>
              <p>Grass-fed beef with red wine reduction</p>
              <span>$34</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};
