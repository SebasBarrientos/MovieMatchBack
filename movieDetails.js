const axios = require('axios');
require("dotenv").config();
const { API_TOKEN } = process.env;


module.exports = async function movieDetails(movieId) {
  const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`
  };
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


