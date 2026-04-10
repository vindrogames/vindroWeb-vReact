// World Cup 2026 Group Stage Data
// Contains groups and all teams participating in the 2026 World Cup

export const WORLD_CUP_2026_GROUPS = {
    A: {
        name: 'Group A',
        teams: [
            { id: 'usa', name: 'United States', flag: '🇺🇸' },
            { id: 'mexico', name: 'Mexico', flag: '🇲🇽' },
            { id: 'canada', name: 'Canada', flag: '🇨🇦' },
            { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾' },
        ]
    },
    B: {
        name: 'Group B',
        teams: [
            { id: 'spain', name: 'Spain', flag: '🇪🇸' },
            { id: 'argentina', name: 'Argentina', flag: '🇦🇷' },
            { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱' },
            { id: 'morocco', name: 'Morocco', flag: '🇲🇦' },
        ]
    },
    C: {
        name: 'Group C',
        teams: [
            { id: 'germany', name: 'Germany', flag: '🇩🇪' },
            { id: 'france', name: 'France', flag: '🇫🇷' },
            { id: 'norway', name: 'Norway', flag: '🇳🇴' },
            { id: 'denmark', name: 'Denmark', flag: '🇩🇰' },
        ]
    },
    D: {
        name: 'Group D',
        teams: [
            { id: 'brazil', name: 'Brazil', flag: '🇧🇷' },
            { id: 'portugal', name: 'Portugal', flag: '🇵🇹' },
            { id: 'uruguay2', name: 'Uruguay', flag: '🇺🇾' },
            { id: 'colombia', name: 'Colombia', flag: '🇨🇴' },
        ]
    },
    E: {
        name: 'Group E',
        teams: [
            { id: 'england', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
            { id: 'belgium', name: 'Belgium', flag: '🇧🇪' },
            { id: 'wales', name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
            { id: 'serbia', name: 'Serbia', flag: '🇷🇸' },
        ]
    },
    F: {
        name: 'Group F',
        teams: [
            { id: 'italy', name: 'Italy', flag: '🇮🇹' },
            { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭' },
            { id: 'sweden', name: 'Sweden', flag: '🇸🇪' },
            { id: 'iceland', name: 'Iceland', flag: '🇮🇸' },
        ]
    },
    G: {
        name: 'Group G',
        teams: [
            { id: 'japan', name: 'Japan', flag: '🇯🇵' },
            { id: 'southkorea', name: 'South Korea', flag: '🇰🇷' },
            { id: 'australia', name: 'Australia', flag: '🇦🇺' },
            { id: 'thailand', name: 'Thailand', flag: '🇹🇭' },
        ]
    },
    H: {
        name: 'Group H',
        teams: [
            { id: 'egypt', name: 'Egypt', flag: '🇪🇬' },
            { id: 'southafrica', name: 'South Africa', flag: '🇿🇦' },
            { id: 'senegal', name: 'Senegal', flag: '🇸🇳' },
            { id: 'nigeria', name: 'Nigeria', flag: '🇳🇬' },
        ]
    },
};

export const GROUP_KEYS = Object.keys(WORLD_CUP_2026_GROUPS);
export const TOTAL_GROUPS = GROUP_KEYS.length;
