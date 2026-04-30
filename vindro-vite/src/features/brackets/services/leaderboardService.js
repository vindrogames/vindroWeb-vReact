import { apiRequest } from "../../../services/api";

const leaderboardServices = {
    getPoolLeaderboard: async (poolId) => {
        return await apiRequest(`/tournament/pools/${poolId}/leaderboard/`);
    },
};

export default leaderboardServices;
