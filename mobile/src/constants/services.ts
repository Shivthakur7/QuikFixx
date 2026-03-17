import { Droplet, Zap, Wrench, Paintbrush, Briefcase, Truck } from 'lucide-react-native';

export const SERVICES_LIST = [
    {
        id: 'plumber',
        name: 'Plumber',
        desc: 'Leak repairs, pipe fitting, and installation.',
        icon: Droplet,
        color: '#0984e3',
        subServices: [
            { id: 'leak', name: 'Leak Repair', price: 500 },
            { id: 'install', name: 'Tap/Fixture Installation', price: 300 },
            { id: 'pipe', name: 'Pipe Fitting', price: 800 },
            { id: 'drain', name: 'Drain Cleaning', price: 600 }
        ]
    },
    {
        id: 'electrician',
        name: 'Electrician',
        desc: 'Wiring, switch replacements, and troubleshooting.',
        icon: Zap,
        color: '#f1c40f',
        subServices: [
            { id: 'wiring', name: 'Wiring Check', price: 400 },
            { id: 'switch', name: 'Switch Replacement', price: 200 },
            { id: 'fan', name: 'Ceiling Fan Install', price: 350 },
            { id: 'fuse', name: 'Fuse Repair', price: 150 }
        ]
    },
    {
        id: 'carpenter',
        name: 'Carpenter',
        desc: 'Furniture repair, assembly, and custom work.',
        icon: Wrench,
        color: '#e67e22',
        subServices: [
            { id: 'repair', name: 'Furniture Repair', price: 600 },
            { id: 'assembly', name: 'Furniture Assembly', price: 500 },
            { id: 'custom', name: 'Custom Shelves', price: 1500 },
            { id: 'polish', name: 'Wood Polishing', price: 1000 }
        ]
    },
    {
        id: 'painter',
        name: 'Painter',
        desc: 'Interior and exterior wall painting.',
        icon: Paintbrush,
        color: '#e84393',
        subServices: [
            { id: 'touchup', name: 'Touch Up', price: 1000 },
            { id: 'room', name: 'Single Room', price: 4000 },
            { id: 'full', name: 'Full Apartment', price: 15000 },
            { id: 'texture', name: 'Texture Painting', price: 2500 }
        ]
    },
    {
        id: 'mason',
        name: 'Mason',
        desc: 'Brickwork, plastering, and structural repairs.',
        icon: Briefcase,
        color: '#7f8c8d',
        subServices: [
            { id: 'brickwork', name: 'Brickwork', price: 1000 },
            { id: 'plastering', name: 'Plastering', price: 800 },
            { id: 'tiling', name: 'Tiling', price: 1200 }
        ]
    },
    {
        id: 'gardener',
        name: 'Gardener',
        desc: 'Lawn care, planting, and garden maintenance.',
        icon: Briefcase,
        color: '#27ae60',
        subServices: [
            { id: 'lawn', name: 'Lawn Mowing', price: 400 },
            { id: 'planting', name: 'Planting', price: 600 },
            { id: 'trimming', name: 'Hedge Trimming', price: 700 }
        ]
    },
    {
        id: 'cook',
        name: 'Cook',
        desc: 'Daily meal preparation and catering services.',
        icon: Briefcase,
        color: '#e74c3c',
        subServices: [
            { id: 'daily', name: 'Daily Meals', price: 2000 },
            { id: 'party', name: 'Party Catering', price: 5000 },
            { id: 'special', name: 'Special Diet', price: 2500 }
        ]
    },
    {
        id: 'maid',
        name: 'Maid',
        desc: 'Housekeeping, cleaning, and domestic help.',
        icon: Briefcase,
        color: '#9b59b6',
        subServices: [
            { id: 'housekeeping', name: 'Housekeeping', price: 1500 },
            { id: 'deepclean', name: 'Deep Cleaning', price: 3000 },
            { id: 'laundry', name: 'Laundry & Ironing', price: 800 }
        ]
    },
    {
        id: 'tutor',
        name: 'Home Tutor',
        desc: 'Academic support and skill development.',
        icon: Briefcase,
        color: '#3498db',
        subServices: [
            { id: 'math', name: 'Math Tutor', price: 700 },
            { id: 'science', name: 'Science Tutor', price: 800 },
            { id: 'language', name: 'Language Tutor', price: 900 }
        ]
    },
    {
        id: 'mechanic',
        name: 'Mechanic',
        desc: 'Vehicle repair and maintenance services.',
        icon: Truck,
        color: '#f39c12',
        subServices: [
            { id: 'oilchange', name: 'Oil Change', price: 1000 },
            { id: 'tire', name: 'Tire Rotation', price: 500 },
            { id: 'brake', name: 'Brake Service', price: 1500 }
        ]
    }
];
