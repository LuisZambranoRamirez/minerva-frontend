// js/api.js

const API_BASE_URL = 'http://localhost:8080/api';

async function apiFetch(endpoint, method = 'GET', body = null) {

    const token = localStorage.getItem('minerva_token');

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {

        const response =
            await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {

            let error = 'Error inesperado';

            try {
                const data = await response.json();
                error = data.detail || error;
            }
            catch {}

            throw new Error(error);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();

    } catch (error) {

        console.error(error);
        throw error;

    }
}

const api = {
    get: (endpoint) =>
        apiFetch(endpoint, 'GET'),

    post: (endpoint, body) =>
        apiFetch(endpoint, 'POST', body),

    put: (endpoint, body) =>
        apiFetch(endpoint, 'PUT', body),

    patch: (endpoint, body) =>
        apiFetch(endpoint, 'PATCH', body),

    delete: (endpoint) =>
        apiFetch(endpoint, 'DELETE')
};