import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export type CustomIconProps = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

export * from './BronzeStar';
export * from './GoldStar';
export * from './SilverStar';
export * from './Ticket';
