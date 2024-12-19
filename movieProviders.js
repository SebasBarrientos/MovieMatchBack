const axios = require('axios');
require("dotenv").config();
const { API_TOKEN } = process.env;


module.exports = async function movieProviders(movieId) {
  const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`
  };
  const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`;

  try {
    const response = await axios.get(url, { headers });
    console.log("Data de la peli",response.data.results);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}