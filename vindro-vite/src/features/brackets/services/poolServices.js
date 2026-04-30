import { apiRequest } from '../../../services/api';

const poolServices = {
    // Fetch pools specific to a tournament and user
    getUserPools: async (tournamentId) => {

        const response =  await apiRequest(`/tournament/${tournamentId}/user-pool-submissions/`, {
            method: 'GET'
        });

        return response;
    },

    // Join logic
    joinPool: async (tournamentId, playIds, poolType, code = null) => {

        const response =  await apiRequest(`/tournament/${tournamentId}/pools/join/`, {

            method: 'POST',
            body: JSON.stringify({
                play_id: playIds, // Assuming backend handles the array here
                pool_type: poolType,
                code: code
            }),
        });

        return response;
    },

    getMyCreatedPools: async (tournamentId) => {
        return await apiRequest(`/tournament/${tournamentId}/pools/create/`, { method: 'GET' });
    },

    createPool: async (tournamentId, poolData) => {
        return await apiRequest(`/tournament/${tournamentId}/pools/create/`, {
            method: 'POST',
            body: JSON.stringify(poolData)
        });
    },

    getPoolDetail: async (poolId) => {
        return await apiRequest(`/tournament/pools/${poolId}/`, { method: 'GET' });
    },

    leavePool: async (poolId) => {
        return await apiRequest(`/tournament/pools/${poolId}/leave/`, { method: 'DELETE' });
    },

    removePlayFromPool: async (poolId, playId) => {
        return await apiRequest(`/tournament/pools/${poolId}/plays/${playId}/remove/`, { method: 'DELETE' });
    },
};

export default poolServices;