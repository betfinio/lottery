import logger from '@/src/config/logger';
import { LOTTERY_ADDRESS, MULTIBET_ADDRESS, PARTNER_ADDRESS, ROUND_REVEAL_AFTER_GENERATION_DELAY_GAP, TOKEN } from '@/src/globals.ts';
import { type GTicket, type ILine, type IRoundTicket, RoundStatus } from '@/src/lib/types.ts';
import { decodeLine, decodeLines, encodeLines, parseLine } from '@/src/lib/utils';
import { LotteryBetABI, LotteryRoundABI, MultiBetABI, TokenABI, ZeroAddress } from '@betfinio/abi';
import { LotteryABI } from '@betfinio/abi/dist/contracts/Lottery';
import { type Config, getTransactionReceipt, multicall, readContract, simulateContract, writeContract } from '@wagmi/core';
import { getBlockByTimestamp } from 'betfinio_context/lib/gql';
import { type Address, Log, encodeAbiParameters, parseAbiParameters } from 'viem';
import { getBlock, getContractEvents } from 'viem/actions';

/**
 *  Example of function that reads data from blockchain
 */

export const fetchTicketPrice = async (round: Address | undefined, config: Config): Promise<bigint> => {
	if (!round) return 0n;
	return await readContract(config, {
		address: round,
		abi: LotteryRoundABI,
		functionName: 'ticketPrice',
		args: [],
	});
};

export const fetchRoundStatus = async (round: Address, config: Config) => {
	if (round === ZeroAddress) return RoundStatus.NONE;
	logger.start('fetchRoundStatus:', round);
	const finish: bigint = await readContract(config, {
		address: round,
		abi: LotteryRoundABI,
		functionName: 'finish',
		args: [],
	});

	const status: RoundStatus = Number(
		await readContract(config, {
			address: round,
			abi: LotteryRoundABI,
			functionName: 'getStatus',
			args: [],
		}),
	);

	const balance = await readContract(config, {
		address: TOKEN,
		abi: TokenABI,
		functionName: 'balanceOf',
		args: [round],
	});

	if (balance === 0n && status === 5) {
		return RoundStatus.ENDED_WITHOUT_BETS;
	}

	if (status === 5 && finish + BigInt(60 * 60) < BigInt(Math.floor(Date.now() / 1000))) {
		return RoundStatus.READY_FOR_REFUND;
	}

	if (status === 6 && balance > 0n) {
		return RoundStatus.REFUNDING;
	}

	const isPassed = Number(finish) < Number(Math.floor(Date.now() / 1000));
	const isPassedAndWithinGenerationGap = isPassed && Number(finish) + 65 * 60 > Number(Math.floor(Date.now() / 1000));
	// if (isPassedAndWithinGenerationGap) {

	// 	const randomGeneratedBlockTimestamp = await fetchRoundFinishedTimeStamp(config, round)

	// 	if (randomGeneratedBlockTimestamp + ROUND_REVEAL_AFTER_GENERATION_DELAY_GAP > Number(Math.floor(Date.now() / 1000))) {

	// 		return status as RoundStatus;
	// 	}
	// }

	return status as RoundStatus;
};

export const fetchRoundFinishedTimeStamp = async (config: Config, round: Address) => {
	const finish: bigint = await readContract(config, {
		address: round,
		abi: LotteryRoundABI,
		functionName: 'finish',
		args: [],
	});

	if (finish > BigInt(Math.floor(Date.now() / 1000))) return 0;
	const fromBlock = await getBlockByTimestamp(Number(finish));
	const randomGeneratedTime = await getContractEvents(config.getClient(), {
		abi: LotteryRoundABI,
		address: round,
		eventName: 'RoundFinished',
		fromBlock: fromBlock,
		toBlock: fromBlock + 65n * 30n,
	});

	const block = await getBlock(config.getClient(), {
		blockNumber: randomGeneratedTime[0].blockNumber,
	});
	const randomGeneratedBlockTimestamp = block.timestamp;
	return Number(randomGeneratedBlockTimestamp);
};

export const fetchLinesCount = async (round: Address, config: Config) => {
	return await readContract(config, {
		address: round,
		abi: LotteryRoundABI,
		functionName: 'ticketsCount',
		args: [],
	});
};

export const fetchRoundFinish = async (round: Address, config: Config) => {
	return Number(
		await readContract(config, {
			address: round,
			abi: LotteryRoundABI,
			functionName: 'finish',
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

export const fetchEditAllowance = async (address: Address | undefined, config: Config): Promise<bigint> => {
	logger.start('fetchAllowance:', address);
	if (!config || address === undefined || address === ZeroAddress) return 0n;
	const value = (await readContract(config, {
		abi: TokenABI,
		address: TOKEN,
		functionName: 'allowance',
		args: [address, LOTTERY_ADDRESS],
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
	await simulateContract(config, {
		abi: MultiBetABI,
		address: MULTIBET_ADDRESS,
		functionName: 'multiPlaceBet',
		args: [PARTNER_ADDRESS, games, amounts, datas],
	});
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
export const unlockEdit = async (config: Config) => {
	return writeContract(config, {
		abi: TokenABI,
		address: TOKEN,
		functionName: 'approve',
		args: [LOTTERY_ADDRESS, 1_000_000_000_000n * 10n ** 18n],
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
	if (round === ZeroAddress) return null;
	try {
		const line = await readContract(config, {
			abi: LotteryRoundABI,
			address: round,
			functionName: 'winTicket',
			args: [],
		});

		if (line[0] === 0 && line[1] === 0) return null;
		return decodeLine({ symbol: line[0], numbers: line[1] });
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const manualRefund = async (round: Address, config: Config) => {
	return writeContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'startRefund',
		args: [],
	});
};

export const manualDistributeRefund = async (round: Address, config: Config) => {
	const betsCount = await readContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'betsCount',
		args: [],
	});
	return writeContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'refund',
		args: [0n, betsCount],
	});
};

export const manualDistributeJackpot = async (round: Address, config: Config) => {
	return writeContract(config, {
		abi: LotteryRoundABI,
		address: round,
		functionName: 'processJackpot',
		args: [],
	});
};
export const fetchTicketStatus = async (ticket: Address, config: Config) => {
	return readContract(config, {
		abi: LotteryBetABI,
		address: ticket,
		functionName: 'getStatus',
		args: [],
	});
};

export const fetchTicketResult = async (ticket: Address, winLine: GTicket, config: Config) => {
	logger.start('fetchTicketResult:', ticket, winLine);
	return readContract(config, {
		abi: LotteryBetABI,
		address: ticket,
		functionName: 'calculateResult',
		args: [{ numbers: winLine.numbers, symbol: winLine.symbol }],
	});
};

export const fetchTicketRound = async (ticket: Address, config: Config) => {
	return readContract(config, {
		abi: LotteryBetABI,
		address: ticket,
		functionName: 'getRound',
		args: [],
	});
};

export const fetchTicketClaimed = async (ticket: Address, config: Config) => {
	return readContract(config, {
		abi: LotteryBetABI,
		address: ticket,
		functionName: 'getClaimed',
		args: [],
	});
};

export const claimTicket = async (ticket: Address, config: Config) => {
	const token: bigint = await readContract(config, {
		abi: LotteryBetABI,
		address: ticket,
		functionName: 'getTokenId',
		args: [],
	});
	await simulateContract(config, {
		abi: LotteryABI,
		address: LOTTERY_ADDRESS,
		functionName: 'claim',
		args: [token],
	});
	return writeContract(config, {
		abi: LotteryABI,
		address: LOTTERY_ADDRESS,
		functionName: 'claim',
		args: [token],
	});
};

export const fetchTicketWinAmount = async (ticket: Address, config: Config) => {
	return readContract(config, {
		abi: LotteryBetABI,
		address: ticket,
		functionName: 'getResult',
		args: [],
	});
};

export const fetchAdditionalJackpot = async (config: Config) => {
	return readContract(config, {
		abi: LotteryABI,
		address: LOTTERY_ADDRESS,
		functionName: 'additionalJackpot',
		args: [],
	});
};

export const fetchPotentialJackpot = async (round: Address, config: Config) => {
	// 4% of the balance of the round
	const balance = await readContract(config, {
		abi: TokenABI,
		address: TOKEN,
		functionName: 'balanceOf',
		args: [round],
	});
	return (balance * BigInt(4)) / BigInt(100);
};

export const fetchLinesAvailability = async (round: Address | undefined, lines: ILine[], config: Config): Promise<boolean[]> => {
	if (!round) return [];
	logger.start('fetchLinesAvailability:', round);
	const encodedLines = encodeLines(lines);
	const data = await multicall(config, {
		contracts: encodedLines.map(({ symbol, numbers }) => ({
			abi: LotteryRoundABI,
			address: round,
			functionName: 'isBitmapEmpty',
			args: [encodeAbiParameters(parseAbiParameters(['uint8 symbol', 'uint32 numbers']), [symbol, numbers])],
		})),
	});
	logger.success('fetchLinesAvailability:', data);
	return data.map(({ result }) => result === true);
};

export const fetchFinishedRoundTransactionByRoundAddress = async (config: Config, round: Address, fromTimeStamp?: number) => {
	if (!fromTimeStamp) return;
	const fromBlock = await getBlockByTimestamp(fromTimeStamp);
	const toBlock = await getBlockByTimestamp(fromTimeStamp + 60 * 60 * 1.5);
	const roundFinished = await getContractEvents(config.getClient(), {
		abi: LotteryRoundABI,
		address: round,
		eventName: 'RoundFinished',
		fromBlock,
		toBlock,
	});
	return roundFinished;
};

export const getMintedTokensByHash = async (hash: Address, config: Config): Promise<IRoundTicket[]> => {
	const receipt = await getTransactionReceipt(config, {
		hash,
	});
	// filter logs from LOTTERY_ADDRESS
	const logs = receipt.logs.filter((log) => log.address.toLowerCase() === LOTTERY_ADDRESS.toLowerCase());

	const ids = logs.map((log) => {
		const mintedToken = BigInt(log.topics[3] ?? '0x0');
		return mintedToken;
	});

	return await Promise.all(ids.map((id) => getTicketByTokenId(id, config)));
};

export const getTicketByTokenId = async (tokenId: bigint, config: Config): Promise<IRoundTicket> => {
	const bet = await readContract(config, {
		abi: LotteryABI,
		address: LOTTERY_ADDRESS,
		functionName: 'bets',
		args: [tokenId],
	});

	const betInfo = await readContract(config, {
		abi: LotteryBetABI,
		address: bet,
		functionName: 'getBetInfo',
	});

	const round = await readContract(config, {
		abi: LotteryBetABI,
		address: bet,
		functionName: 'getRound',
		args: [],
	});
	const lines = await readContract(config, {
		abi: LotteryBetABI,
		address: bet,
		functionName: 'getTickets',
	});
	const parsedLines = lines.map((line) => parseLine(line));
	return {
		token: Number(tokenId),
		round: round,
		player: betInfo[0],
		betAddress: bet,
		lines: parsedLines,
		isLocal: true,
	};
};
