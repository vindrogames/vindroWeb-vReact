import WorldCupEventDescription from './world-cup-2026/components/EventDescription';
import WorldCupGroupStage from './world-cup-2026/stages/WorldCupGroupStage';
import WorldCupBracketStage from './world-cup-2026/stages/WorldCupBracketStage';
import worldCupBracketSeed from './world-cup-2026/mockBracketSeed.json';

export const EVENT_MAP = {
    'world-cup-2026': {
        pageId: 'world-cup-2026',
        title: { before: 'world', highlight: 'Cup', after: '2026' },
        subtitle: 'Make your picks. Submit to a pool. See how you do!',
        EventDescription: WorldCupEventDescription,
        GroupStage: WorldCupGroupStage,
        BracketStage: WorldCupBracketStage,
        bracketSeed: worldCupBracketSeed,
        hasGroupStage: true,
    },
};
