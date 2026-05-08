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

    // OPTION 2: fetch by pool name (shareable URL, auth optional)
    getPoolDetailByName: async (poolName) => {
        return await apiRequest(`/tournament/pools/name/${encodeURIComponent(poolName)}/`, { method: 'GET' });
    },

    // [UUID detail — kept for reference, superseded by getPoolDetailByName]
    // getPoolDetail: async (poolId) => {
    //     return await apiRequest(`/tournament/pools/${poolId}/`, { method: 'GET' });
    // },

    leavePool: async (poolId) => {
        return await apiRequest(`/tournament/pools/${poolId}/leave/`, { method: 'DELETE' });
    },

    removePlayFromPool: async (poolId, playId) => {
        return await apiRequest(`/tournament/pools/${poolId}/plays/${playId}/remove/`, { method: 'DELETE' });
    },

    togglePaid: async (poolId, playId) => {
        return await apiRequest(`/tournament/pools/${poolId}/plays/${playId}/paid/`, { method: 'PATCH' });
    },

    updatePayoutConfig: async (poolId, payoutConfig) => {
        return await apiRequest(`/tournament/pools/${poolId}/payout/`, {
            method: 'PATCH',
            body: JSON.stringify({ payout_config: payoutConfig }),
        });
    },
};

export default poolServices;