import { apiRequest } from "../../../services/api";

const leaderboardServices = {

    getPublicLeaderboard: async (tournamentId) => {
        // Matches: path('<uuid:tournament_id>/leaderboard/public/', views.public_leaderboard)
        const response = await apiRequest(`/tournament/${tournamentId}/leaderboard/public/`);
        return response;
    },

    getPrivatePoolLeaderboard: async (tournamentId, poolId) => {
        // Matches: path('<uuid:tournament_id>/leaderboard/pool/<uuid:pool_id>/', views.private_pool_leaderboard)
        const response = await apiRequest(`/tournament/${tournamentId}/leaderboard/pool/${poolId}/`);
        return response;
    },
}

export default leaderboardServices;