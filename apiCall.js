const axios = require('axios');
require("dotenv").config();
const { API_TOKEN } = process.env;



module.exports = async function APICall(category, ApiIndex) {

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${ApiIndex}&sort_by=popularity.desc&with_genres=${category}`;
  const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`
  };
  try {

    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}