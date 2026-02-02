declare module 'lucide-react-native' {
    import { SvgProps } from 'react-native-svg';
    import { ComponentType } from 'react';

    export interface IconProps extends SvgProps {
        size?: number | string;
        absoluteStrokeWidth?: boolean;
    }

    export type Icon = ComponentType<IconProps>;

    export const Briefcase: Icon;
    export const Wrench: Icon;
    export const Zap: Icon;
    export const Droplet: Icon;
    export const Paintbrush: Icon;
    export const Truck: Icon;
    export const Home: Icon;
    export const User: Icon;
    export const Calendar: Icon;
    export const DollarSign: Icon;
    export const LogOut: Icon;
    export const MapPin: Icon;
    export const ArrowLeft: Icon;
    export const CheckCircle2: Icon;
    export const ArrowLeft: Icon;
    export const CheckCircle2: Icon;
    export const Star: Icon;
    export const ArrowRight: Icon;
    export const Edit2: Icon;
    export const Clock: Icon;
    export const DollarSign: Icon;
    export const Check: Icon;
    export const X: Icon;
    export const User: Icon;
    export const LogOut: Icon;
    export const Mail: Icon;
    export const Lock: Icon;
    export const Calendar: Icon;
    export const Briefcase: Icon;
    export const Navigation: Icon;
    export const Smartphone: Icon;
    export const Phone: Icon;
    export const RefreshCw: Icon;
    export const Award: Icon;
    export const Upload: Icon;
    export const AlertTriangle: Icon;
    export const CheckCircle: Icon;
    export const Settings: Icon;
    // Add other icons as needed
}
