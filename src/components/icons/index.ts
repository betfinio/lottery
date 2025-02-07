import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export type CustomIconProps = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

export * from './GoldStar';
export * from './Ticket';
export * from './BronzeStar';
export * from './SilverStar';
