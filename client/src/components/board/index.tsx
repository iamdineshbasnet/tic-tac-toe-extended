import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ClickSound from '@/assets/click.mp3';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/utils/hooks/appHooks';
import { PlayerProps } from '@/pages/room/redux/types';
import useLocalStorage from 'use-local-storage';
import { roomSelector } from '@/pages/room/redux/selector';
import { setRoomDetails } from '@/pages/room/redux/roomSlice';
import { socket } from '@/socket';
import { profileSelector } from '@/pages/profile/redux/selector';

interface BoardProps {
	type: 'bot' | 'player';
	choice?: 'x' | 'o';
	players: PlayerProps[];
	random?: boolean;
	isActive?: boolean;
	turn: string;
	isPlaying: boolean;
	board: string[];
	history: number[];
	disabledCell: number;
	round: number;
	playAgainMessage: string;
	playAgainRequests: string[] | any;
	setTurn: Dispatch<SetStateAction<string>>;
	setIsPlaying: Dispatch<SetStateAction<boolean>>;
	setBoard: Dispatch<SetStateAction<string[]>>;
	setHistory: Dispatch<SetStateAction<number[]>>;
	setDisabledCell: Dispatch<SetStateAction<number>>;
	setRound: Dispatch<SetStateAction<number>>;
	setPlayAgainMessage: Dispatch<SetStateAction<string>>;
	setPlayAgainRequests: Dispatch<SetStateAction<string[] | any>>;
}

const Board: React.FC<BoardProps> = ({
	type = 'player',
	players,
	random = false,
	isActive,
	turn,
	board,
	history,
	disabledCell,
	round,
	playAgainMessage,
	playAgainRequests,
	setIsPlaying,
	setBoard,
	setHistory,
	setTurn,
	setDisabledCell,
	setRound,
	setPlayAgainMessage,
	setPlayAgainRequests,
}) => {
	const navigate = useNavigate();
	const [_, setRandomTurn] = useLocalStorage('game', { random: random });
	const { roomDetails } = useAppSelector(roomSelector);
	const { player } = useAppSelector(profileSelector);
	const [isDraw, setIsDraw] = useState<boolean>(false);
	const [winningCombination, setWinningCombination] = useState<number[]>([]);
	const [showDialog, setShowDialog] = useState(false);
	const [currentPlayer, setCurrentPlayer] = useState<string>('');
	const [disablePlayAgainBtn, setDisablePlayAgainBtn] = useState<boolean>(false);

	const { pathname } = useLocation();

	const id = pathname.split('/playground/')[1];

	useEffect(() => {
		const filterPlayer = roomDetails?.participants?.find(
			(p) => p.username === player?.username
		);

		filterPlayer?.mark === turn ? setCurrentPlayer('Your') : setCurrentPlayer('Opponent');
	}, [turn, id]);

	const makemove = (turn: string, board: string[], history: number[], disabledCell?: number) => {
		const obj: any = {
			roomId: parseInt(id),
			board,
			turn,
			history,
			isPlaying: true,
		};

		if (disabledCell !== undefined) {
			obj.disabledCell = disabledCell;
		}
		socket.emit('makeMove', obj);
	};

	socket.on('makeMove', (data) => {
		setBoard(data.board);
		setTurn(data.turn);
		setRoomDetails(data);
		setHistory(data.history);
		setDisabledCell(data.disabledCell);
	});

	useEffect(() => {
		if (getWinnerMessage(checkWinner(board))) {
			const timer = setTimeout(() => {
				setShowDialog(true);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [board]);

	const draw = (index: number) => {
		if (!isActive || index === disabledCell) return;
		const winner = checkWinner(board);

		if (board[index] === '' && winner === null && !isDraw) {
			const nextTurn = turn === 'x' ? 'o' : 'x';
			const newData = [...board];
			newData[index] = turn;
			const newHistory = [...history, index];

			playClickSound();
			setBoard(newData);
			setHistory(newHistory);

			const emptyCellCount = newData.filter((symbol) => symbol === '').length;

			if (emptyCellCount <= 3) {
				if (emptyCellCount === 2) {
					const firstMoveIndex = newHistory.find((id) => newData[id] !== '');
					if (firstMoveIndex !== undefined) {
						newData[firstMoveIndex] = '';
						const updatedHistory = newHistory.filter((id) => id !== firstMoveIndex);
						setHistory(updatedHistory);
						const newDisabledCell = updatedHistory[0];
						setDisabledCell(newDisabledCell);
						makemove(nextTurn, newData, updatedHistory, newDisabledCell);
					}
				} else {
					const newDisabledCell = newHistory[0];
					setDisabledCell(newDisabledCell);
					makemove(nextTurn, newData, newHistory, newDisabledCell);
				}
			} else {
				setDisabledCell(-1);
				makemove(nextTurn, newData, newHistory, -1);
			}

			const nextWinner = checkWinner(newData);
			if (nextWinner === null) {
				setTurn(nextTurn);
			}
			checkDraw(newData);
		}
	};

	const checkWinner = (board: string[]) => {
		const conditions = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];

		for (let i = 0; i < conditions.length; i++) {
			const [x, y, z] = conditions[i];
			if (board[x] && board[x] === board[y] && board[x] === board[z]) {
				if (winningCombination.length === 0) {
					setWinningCombination([x, y, z]);
				}
				return board[x];
			}
		}
		return null;
	};

	const handlewinGame = (winner: PlayerProps, loser: PlayerProps) => {
		socket.emit('gameWin', {
			roomId: parseInt(id),
			winner: winner.username,
			loser: loser.username,
		});
	};

	socket.on('gameWin', (data) => {
		setIsPlaying(data.isPlaying);
	});

	const checkDraw = (board: string[]) => {
		const isBoardFull = board.every((symbol) => symbol !== '' && checkWinner(board) === null);
		if (isBoardFull && checkWinner(board) === null) {
			setIsDraw(true);
		}
	};

	const resetBoard = (data: any) => {
		setIsDraw(false);
		setWinningCombination([]);
		setShowDialog(false);
		setBoard(data.board);
		setTurn(data.turn);
		setRoomDetails(data);
		setHistory(data.history);
		setDisabledCell(data.disabledCell);
		setIsPlaying(data.isPlaying);
		setRound(data.round);
	};

	const playAgain = () => {
		if (!playAgainRequests.includes(player?.username)) {
			const updatedRequests = [...playAgainRequests, player?.username];
			setPlayAgainRequests(updatedRequests);
		}
		socket.emit('playAgainRequest', {
			roomId: parseInt(id),
			username: player?.username,
			name: player?.name,
		});
	};

	socket.on('playAgainRequested', (data) => {
		data.forEach((p: any) => {
			if (p.username !== player?.username) {
				setPlayAgainMessage(`${p.name} wants to play again`);
				if (!playAgainRequests.includes(p?.username)) {
					const updatedRequests = [...playAgainRequests, p?.username];
					setPlayAgainRequests(updatedRequests);
				}
			}
		});
	});

	useEffect(() => {
		if (playAgainRequests.length >= 2) {
			socket.emit('playAgain', { roomId: id, round: round + 1 });
		}
	}, [playAgainRequests]);

	socket.on('playAgain', (data) => {
		setTimeout(() => {
			resetBoard(data);
			setPlayAgainMessage('');
			setDisablePlayAgainBtn(false);
		}, 2000);
	});

	const getWinnerMessage = (winner: string | null) => {
		if (winner === null && isDraw) {
			return 'Draw';
		} else if (winner !== null) {
			const win_by = players?.find((p) => p.mark === winner);
			const lose_by = players?.find((p) => p.mark !== winner);
			win_by && lose_by && handlewinGame(win_by, lose_by);
			return `${win_by?.name} Won`;
		}

		return '';
	};

	useEffect(() => {
		if (type === 'bot' && turn === 'o') {
			setTimeout(() => {
				makeBotMove();
			}, 500);
		}
	}, [type, turn]);

	const makeBotMove = () => {
		const emptyCells = board.reduce((acc: number[], cell, index) => {
			if (cell === '') {
				acc.push(index);
			}
			return acc;
		}, []);

		if (emptyCells.length > 0) {
			const randomIndex = Math.floor(Math.random() * emptyCells.length);
			draw(emptyCells[randomIndex]);
		}
	};

	const playClickSound = () => {
		const audio = new Audio(ClickSound);
		audio.play();
	};

	const leaveGame = () => {
		socket.emit('leave', { roomId: id, playerId: player?._id });
		navigate('/')
	};

	socket.on('leaved', (data) => {
		if (player?._id !== data._id) {
			setDisablePlayAgainBtn(true);
			setPlayAgainMessage(`${data.name} leaved the game`);
		}
	});

	useEffect(() => {
		setRandomTurn({ random: random });
	}, [random, setRandomTurn]);

	return (
		<section className="flex flex-col gap-16">
			<section className="board_layout">
				{board?.map((item, index) => {
					const cellClass = `border-2 border-foreground min-w-[100px] min-h-[100px] w-full h-full aspect-square text-7xl cell ${
						item === 'x' ? 'text-red-600' : 'text-blue-600'
					} ${winningCombination.includes(index) ? 'winning' : ''} ${
						checkWinner(board) === 'x' ? 'animate_x' : 'animate_o'
					} ${disabledCell === index ? 'disabled_cell' : ''}`;
					return (
						<section key={index} onClick={() => draw(index)} className={cellClass}>
							<div>
								{item === 'x' && 'x'}
								{item === 'o' && 'o'}
							</div>
						</section>
					);
				})}
				{showDialog && (
					<AlertDialog open={true}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="text-2xl capitalize text-center">
									{getWinnerMessage(checkWinner(board))}
								</AlertDialogTitle>
							</AlertDialogHeader>
							<AlertDialogDescription className="text-center my-6 text-xl">
								{playAgainMessage !== '' && playAgainMessage}
							</AlertDialogDescription>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={leaveGame} autoFocus={false}>
									Leave
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={playAgain}
									autoFocus={true}
									disabled={disablePlayAgainBtn}>
									Play Again
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</section>
			<p className="text-center text-lg">{currentPlayer} Turn</p>
		</section>
	);
};

export default Board;
