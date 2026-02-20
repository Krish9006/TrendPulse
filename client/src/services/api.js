import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Make this configurable via env in future
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
