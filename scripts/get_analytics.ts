// Import required modules
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Replace with your Google Analytics property ID (numeric)
const propertyId = '10188042972';

// Authenticate with Google Analytics API using service account
async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'keys/analytics-service-account.json', // Update with the correct path to your key file
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  return auth;
}

// Fetch analytics data
async function getAnalyticsData() {
  try {
    const auth = await authenticate();

    const analyticsDataClient = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    const response = await analyticsDataClient.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }],
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      },
    });

    console.log('Analytics Data:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
}

getAnalyticsData();
