export const LotteryStrategyABI = [
	{
		type: 'function',
		name: 'ticketPrice',
		inputs: [],
		outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'coefficients',
		inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
		outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'roundBank',
		inputs: [{ name: 'roundId', type: 'uint256', internalType: 'uint256' }],
		outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getBetsCount',
		inputs: [{ name: 'roundId', type: 'uint256', internalType: 'uint256' }],
		outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getRoundBet',
		inputs: [
			{ name: 'roundId', type: 'uint256', internalType: 'uint256' },
			{ name: 'index', type: 'uint256', internalType: 'uint256' },
		],
		outputs: [{ name: '', type: 'address', internalType: 'address' }],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'getRoundResult',
		inputs: [{ name: 'roundId', type: 'uint256', internalType: 'uint256' }],
		outputs: [
			{
				name: 'winningTicket',
				type: 'tuple',
				internalType: 'struct LotteryLib.Ticket',
				components: [
					{ name: 'symbol', type: 'uint8', internalType: 'uint8' },
					{ name: 'numbers', type: 'uint32', internalType: 'uint32' },
				],
			},
			{ name: 'settled', type: 'bool', internalType: 'bool' },
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'claimed',
		inputs: [{ name: 'bet', type: 'address', internalType: 'address' }],
		outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
		stateMutability: 'view',
	},
] as const;
