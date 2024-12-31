// Reservation page component
import React from 'react';
import { Layout } from '../components/Layout';

export const Reservation = () => {
  return (
    <Layout>
      <div className="container">
        <h1>Make a Reservation</h1>
        <p>Book your table at Gourmet Place</p>
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
            <label htmlFor="date">Date:</label>
            <input type="date" id="date" name="date" required />
          </div>
          <div>
            <label htmlFor="time">Time:</label>
            <input type="time" id="time" name="time" required />
          </div>
          <div>
            <label htmlFor="guests">Number of Guests:</label>
            <input type="number" id="guests" name="guests" min="1" max="10" required />
          </div>
          <div>
            <label htmlFor="notes">Special Notes:</label>
            <textarea id="notes" name="notes"></textarea>
          </div>
          <button type="submit">Make Reservation</button>
        </form>
      </div>
    </Layout>
  );
};
