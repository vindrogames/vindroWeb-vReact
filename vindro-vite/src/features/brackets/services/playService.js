import { apiRequest } from '../../../services/api';

const playService = {

    createPlay: async (tournamentSlug, playName) => {
        // This MUST match the Django path: <slug:tournament_slug>/create/
        // If your apiRequest already adds "/api", use:
        const response = await apiRequest(`/tournament/${tournamentSlug}/create/`, {
            method: 'POST',
            body: JSON.stringify({ name: playName }),
        });
        return response.data;
    },

    getUserPlays: async (tournamentSlug) => {
        const response = await apiRequest(`/tournament/${tournamentSlug}/user-plays/`, {
            method: 'GET',
        });
        return response.data;
    },

    // NEW: Primary lookup using the UUID passed in location.state
    getPlayById: async (playId) => {
        const response = await apiRequest(`/tournament/plays/${playId}/`, {
            method: 'GET',
        });
        // Returning response.data to match your working createPlay/getUserPlays
        return response.data;
    },
};

export default playService;