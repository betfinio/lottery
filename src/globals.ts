import type { Address } from 'viem';

export const LOTTERY = import.meta.env.PUBLIC_LOTTERY_ADDRESS as Address;
export const LOTTERY_STRATEGY = import.meta.env.PUBLIC_LOTTERY_STRATEGY_ADDRESS as Address;
export const PARTNER = import.meta.env.PUBLIC_PARTNER_ADDRESS as Address;
export const CORE = import.meta.env.PUBLIC_CORE_ADDRESS as Address;
export const ETHSCAN = import.meta.env.PUBLIC_ETHSCAN as string;
