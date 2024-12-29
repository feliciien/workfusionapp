import React from 'react';

export const Menu = () => {
  // Here you would fetch and display the restaurant's menu
  // For example, you might use getStaticProps in a page component to fetch menu data
  return (
    <section className='p-4'>
      <h2 className='text-2xl font-semibold text-center mb-4'>Our Menu</h2>
      {/* Menu items listed here */}
      <p className='text-center'>Menu details coming soon...</p>
    </section>
  );
};
