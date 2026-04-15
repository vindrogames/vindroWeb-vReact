import { apiRequest } from "../../../services/api";

const tournamentServices = {

    getTournamentBySlug: async (tournamentSlug) => {

        const response = await apiRequest(`/tournament/${tournamentSlug}/`, {
            method: 'GET',
        });

        return response.data;
    },
}

export default tournamentServices;