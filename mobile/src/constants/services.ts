import { Briefcase, Wrench, Zap, Droplet, Paintbrush, Truck, Home } from 'lucide-react-native';

export const SERVICES_LIST = [
    {
        id: 'plumbing',
        name: 'Plumbing',
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
        id: 'electrical',
        name: 'Electrical',
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
        id: 'cleaning',
        name: 'Home Cleaning',
        desc: 'Deep cleaning for homes and offices.',
        icon: Home,
        color: '#00b894',
        subServices: [
            { id: 'kitchen', name: 'Kitchen Deep Clean', price: 1200 },
            { id: 'bathroom', name: 'Bathroom Cleaning', price: 800 },
            { id: 'full', name: 'Full Home Clean', price: 3000 },
            { id: 'sofa', name: 'Sofa Shampooing', price: 900 }
        ]
    },
    {
        id: 'carpentry',
        name: 'Carpentry',
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
        id: 'painting',
        name: 'Painting',
        desc: 'Interior and exterior wall painting.',
        icon: Paintbrush,
        color: '#e84393',
        subServices: [
            { id: 'touchup', name: 'Touch Up', price: 1000 },
            { id: 'room', name: 'Single Room', price: 4000 },
            { id: 'full', name: 'Full Apartment', price: 15000 },
            { id: 'texture', name: 'Texture Painting', price: '25/sqft' }
        ]
    },
    {
        id: 'moving',
        name: 'Packers & Movers',
        desc: 'Safe and secure relocation services.',
        icon: Truck,
        color: '#636e72',
        subServices: [
            { id: 'local', name: 'Local Shifting', price: 5000 },
            { id: 'intercity', name: 'Inter-city Move', price: 15000 },
            { id: 'vehicle', name: 'Vehicle Transport', price: 8000 },
            { id: 'packing', name: 'Packing Only', price: 2000 }
        ]
    }
];
