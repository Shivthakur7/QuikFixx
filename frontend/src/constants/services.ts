export const SERVICES_LIST = [
    {
        id: 'electrician', name: 'Electrician', desc: 'Wiring, repairs, and installations.',
        subServices: [
            { id: 'fan-install', name: 'Ceiling Fan Installation', price: 249, time: '30 mins' },
            { id: 'switch-replace', name: 'Switch/Socket Replacement', price: 99, time: '15 mins' },
            { id: 'mcb-change', name: 'MCB Change', price: 399, time: '45 mins' },
            { id: 'wiring-check', name: 'Full House Wiring Check', price: 699, time: '2 hrs' },
        ]
    },
    {
        id: 'plumber', name: 'Plumber', desc: 'Pipe fixes, leaks, and fittings.',
        subServices: [
            { id: 'tap-fix', name: 'Tap Repair/Replacement', price: 149, time: '30 mins' },
            { id: 'pipe-leak', name: 'Leakage Fix', price: 399, time: '1 hr' },
            { id: 'basin-install', name: 'Wash Basin Installation', price: 599, time: '1.5 hrs' },
            { id: 'blockage', name: 'Drainage Blockage Removal', price: 449, time: '1 hr' },
        ]
    },
    {
        id: 'carpenter', name: 'Carpenter', desc: 'Furniture repair and custom woodworks.',
        subServices: [
            { id: 'lock-repair', name: 'Door Lock Repair', price: 299, time: '45 mins' },
            { id: 'furniture-assemble', name: 'Furniture Assembly', price: 499, time: '1.5 hrs' },
            { id: 'hinge-fix', name: 'Hinge Replacement', price: 199, time: '30 mins' },
        ]
    },
    {
        id: 'painter', name: 'Painter', desc: 'Wall painting, textures, and finishes.',
        subServices: [
            { id: 'wall-touchup', name: 'Single Wall Touchup', price: 799, time: '2 hrs' },
            { id: 'room-paint', name: 'Full Room Painting', price: 2999, time: '6 hrs' },
        ]
    },
    {
        id: 'mason', name: 'Mason', desc: 'Construction, tiling, and concrete work.',
        subServices: [
            { id: 'tile-fix', name: 'Tile Replacement (per sqft)', price: 49, time: '1 hr' },
            { id: 'plaster-patch', name: 'Wall Plaster Patch', price: 599, time: '2 hrs' },
        ]
    },
    {
        id: 'gardener', name: 'Gardener', desc: 'Lawn care, planting, and maintenance.',
        subServices: [
            { id: 'lawn-mow', name: 'Lawn Mowing', price: 399, time: '1 hr' },
            { id: 'plant-prune', name: 'Plant Pruning', price: 249, time: '45 mins' },
        ]
    },
    { id: 'cook', name: 'Cook', desc: 'Home-cooked meals and culinary services.', subServices: [] },
    { id: 'maid', name: 'Maid', desc: 'House cleaning and organizing.', subServices: [] },
    { id: 'tutor', name: 'Home Tutor', desc: 'Private lessons for K-12 and more.', subServices: [] },
    { id: 'mechanic', name: 'Mechanic', desc: 'Car and bike repairs at your doorstep.', subServices: [] },
];
