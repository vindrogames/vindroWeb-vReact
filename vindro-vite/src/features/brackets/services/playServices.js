import { apiRequest } from '../../../services/api';

const playServices = {

    getUserPlays: async (tournamentId) => {
        const response = await apiRequest(`/tournament/${tournamentId}/user-plays/`, {
            method: 'GET',
        });
        return response;
    },

    createPlay: async (tournamentId, playName) => {
        
        const response = await apiRequest(`/tournament/${tournamentId}/create/`, {
            method: 'POST',
            body: JSON.stringify({ name: playName }),
        });
        return response;
    },

    // NEW: Primary lookup using the UUID passed in location.state
    getPlayById: async (playId) => {
        const response = await apiRequest(`/tournament/plays/${playId}/`, {
            method: 'GET',
        });
        // Returning response to match your working createPlay/getUserPlays
        return response;
    },

    // URL: /api/tournament/plays/<uuid>/update-groups/
    updateGroupPredictions: async (playId, groupData) => {
        const response = await apiRequest(`/tournament/plays/${playId}/update-groups/`, {
            method: 'PATCH',
            body: JSON.stringify({ group_predictions: groupData }),
        });
        return response;
    },

    // URL: /api/tournament/plays/<uuid>/update-bracket/
    updateBracketPredictions: async (playId, bracketData) => {
        const response = await apiRequest(`/tournament/plays/${playId}/update-bracket/`, {
            method: 'PATCH',
            body: JSON.stringify({ bracket_predictions: bracketData }),
        });
        return response;
    }
};

export default playServices;