import { useState } from 'react';
import playService from '../services/playService';

export const useGroupStage = (initialData, playId) => {
    const [groups, setGroups] = useState(initialData || {});

    const updateGroupOrder = async (groupName, newOrder) => {
        const updatedGroups = { ...groups, [groupName]: newOrder };
        setGroups(updatedGroups); // Optimistic UI update

        try {
            await playService.updateGroupPredictions(playId, updatedGroups);
        } catch (err) {
            console.error("Save failed", err);
            // Optional: add rollback logic here
        }
    };

    return { groups, updateGroupOrder };
};