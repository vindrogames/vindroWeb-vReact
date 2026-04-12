import { apiRequest } from '../../../services/auth_api';

const playService = {
    createPlay: async (tournamentSlug, playName) => {
        const response = await apiRequest(`/tournament/${tournamentSlug}/plays/`, {
            method: 'POST',
            body: JSON.stringify({ name: playName }),
        });
        return response.data; 
    },

    getUserPlays: async (tournamentSlug) => {
        const response = await apiRequest(`/tournament/${tournamentSlug}/plays/`, {
            method: 'GET',
        });
        return response.data;
    },

    getPlayById: async (playId) => {
        const response = await apiRequest(`/tournament/plays/${playId}/`, {
            method: 'GET',
        });
        return response.data;
    }
};

export default playService;