import logger from '@/src/config/logger';
import { LOTTERY_ADDRESS, MULTIBET_ADDRESS, PARTNER_ADDRESS, TOKEN } from '@/src/globals.ts';
import type { ILine, IRoundTicket } from '@/src/lib/types.ts';
import { decodeLines, encodeLines } from '@/src/lib/utils';
import { LotteryRoundABI, MultiBetABI, TokenABI, ZeroAddress } from '@betfinio/abi';
import { LotteryABI } from '@betfinio/abi/dist/contracts/Lottery';
import { type Config, readContract, simulateContract, writeContract } from '@wagmi/core';
import { type Address, encodeAbiParameters, parseAbiParameters } from 'viem';

/**
 *  Example of function that reads data from blockchain
 */

export const fetchTicketPrice = async (round: Address, config: Config): Promise<bigint> => {
	return await readContract(config, {
		address: round,
		abi: LotteryRoundABI,
		functionName: 'ticketPrice',
		args: [],
	});
};

export const fetchRoundStatus = async (round: Address, config: Config) => {
	if (round === ZeroAddress) return 0;
	logger.start('fetchRoundStatus:', round);
	return Number(
		await readContract(config, {
			address: round,
			abi: LotteryRoundABI,
			functionName: 'getStatus',
			args: [],
		}),
	);
};

export const fetchRoundFinish = async (round: Address, config: Config) => {
	return Number(
		await readContract(config, {
			address: round,
			abi: LotteryRoundABI,
			functionName: 'getFinish',
			args: [],
		}),
	);
};

export const fetchMultiAllowance = async (address: Address | undefined, config: Config): Promise<bigint> => {
	logger.start('fetchAllowance:', address);
	if (!config || address === undefined || address === ZeroAddress) return 0n;
	const value = (await readContract(config, {
		abi: TokenABI,
		address: TOKEN,
		functionName: 'allowance',
		args: [address, MULTIBET_ADDRESS],
	})) as bigint;
	logger.success('fetchAllowance:', value);
	return value;
};

export const buyTicket = async (options: { lines: ILine[]; rounds: Address[]; recipient: Address }, config: Config) => {
	const { lines, rounds, recipient } = options;
	const datas: Address[] = [];
	const amounts: bigint[] = [];
	const games: Address[] = [];
	for (const round of rounds) {
		const price = await fetchTicketPrice(round, config);
		const totalAmount = price * BigInt(lines.length);
		const encodedLines = encodeLines(lines);
		const data = encodeAbiParameters(
			parseAbiParameters(['address _round, address _player, uint256 _count, Ticket[] memory _tickets', 'struct Ticket {uint8 symbol; uint32 numbers;}']),
			[round, recipient, BigInt(lines.length), encodedLines],
		);
		await simulateContract(config, {
			abi: MultiBetABI,
			address: MULTIBET_ADDRESS,
			functionName: 'placeBet',
			args: [PARTNER_ADDRESS, LOTTERY_ADDRESS, totalAmount, data],
		});
		datas.push(data);
		amounts.push(totalAmount);
		games.push(LOTTERY_ADDRESS);
	}
	if (games.length === 0) throw new Error('empty');
	return writeContract(config, {
		abi: MultiBetABI,
		address: MULTIBET_ADDRESS,
		functionName: 'multiPlaceBet',
		args: [PARTNER_ADDRESS, games, amounts, datas],
	});
};

export const unlockMultibet = async (config: Config) => {
	return writeContract(config, {
		abi: TokenABI,
		address: TOKEN,
		functionName: 'approve',
		args: [MULTIBET_ADDRESS, 1_000_000_000_000n * 10n ** 18n],
	});
};

export const manualRequest = async (round: Address, config: Config) => {
	await simulateContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'requestRandomness',
		args: [],
	});
	return writeContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'requestRandomness',
		args: [],
	});
};

export const updateTicket = async (ticket: IRoundTicket, config: Config) => {
	console.log(ticket);
	const encodedLines = encodeLines(ticket.lines);
	await simulateContract(config, {
		abi: LotteryABI,
		address: LOTTERY_ADDRESS,
		functionName: 'editTicket',
		args: [BigInt(ticket.token), encodedLines.map(({ symbol, numbers }) => ({ symbol, numbers }))],
	});
	return await writeContract(config, {
		abi: LotteryABI,
		address: LOTTERY_ADDRESS,
		functionName: 'editTicket',
		args: [BigInt(ticket.token), encodedLines.map(({ symbol, numbers }) => ({ symbol, numbers }))],
	});
};

export const fetchWinningLine = async (round: Address, config: Config): Promise<ILine | null> => {
	logger.start('fetchWinningLine:', round);
	const line = await readContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'winTicket',
		args: [],
	});
	if (line[0] === 0 && line[1] === 0) return null;
	return decodeLines([{ symbol: line[0], numbers: line[1] }])[0];
};
