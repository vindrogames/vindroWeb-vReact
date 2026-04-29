import { apiRequest } from './api';

export const gamescoreService = {
    getMyGamescores: (gameName, limit = 100) =>
        apiRequest(`/highscores/me/?game_name=${encodeURIComponent(gameName)}&limit=${limit}`, {
            method: 'GET',
        }),

    createGamescore: (data) =>
        apiRequest('/highscores/create/', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
