import { apiRequest } from "../../../services/api";

const tournamentServices = {

    getTournamentBySlug: async (tournamentSlug) => {
        const response = await apiRequest(`/tournament/${tournamentSlug}/`, {
            method: 'GET',
        });
        return response;
    },

    // We'll leave the results endpoint here too for later
    getTournamentResults: async (id) => {
        const response = await apiRequest(`/tournament/${id}/results/`);
        return response;
    },
}

export default tournamentServices;