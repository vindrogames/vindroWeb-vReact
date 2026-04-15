import { apiRequest } from "../../../services/api";

const poolServices = {

    joinPool: async (tournamentId, playIds, poolType, code = null) => {
        // Clean log to see what is actually being sent
        console.log("Submitting to API:", { tournamentId, playIds, poolType });

        console.log('pool Ids:');
        playIds.forEach(id => {
            console.log(id);
        });

        return await apiRequest(`/tournament/${tournamentId}/pools/join/`, {
            method: 'POST',
            body: JSON.stringify({
                play_id: playIds, // Sending the array [id1, id2]
                pool_type: poolType,
                code: code
            }),
        });
    },

}

export default poolServices;