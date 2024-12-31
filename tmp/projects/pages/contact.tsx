// Contact page component
import React from 'react';
import { Layout } from '../components/Layout';

const Contact = () => {
  return (
    <Layout>
      <div className="container">
        <h1>Contact Us</h1>
        <p>Get in touch with us for reservations or inquiries.</p>
        <form>
          <div>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div>
            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
          </div>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </Layout>
  );
};

export default Contact;
