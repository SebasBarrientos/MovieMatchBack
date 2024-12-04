const axios = require('axios');
require("dotenv").config();
const { API_KEY } = process.env;



module.exports = async function APICall(category) {
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${category}`;
    const headers = {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    };
    try {
        const response = await axios.get(url, { headers });
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
}