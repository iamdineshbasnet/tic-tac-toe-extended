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
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { PlayerProps } from '@/pages/room/redux/types';
import { Switch } from '../ui/switch';
import useLocalStorage from 'use-local-storage';
import { Label } from '../ui/label';
import { roomSelector } from '@/pages/room/redux/selector';
import { setRoomDetails, setRound } from '@/pages/room/redux/roomSlice';
import { socket } from '@/socket';
import { profileSelector } from '@/pages/profile/redux/selector';

interface BoardProps {
	type: 'bot' | 'player';
	choice?: 'x' | 'o';
	players: PlayerProps[];
	random?: boolean;
	board: string[];
	isPlaying: boolean;
	setIsPlaying: Dispatch<SetStateAction<boolean>>;
	setBoard: Dispatch<SetStateAction<string[]>>;
	history: number[];
	setHistory: Dispatch<SetStateAction<number[]>>;
	turn: string;
	setTurn: Dispatch<SetStateAction<string>>;
	disabledCell: number;
	setDisabledCell: Dispatch<SetStateAction<number>>;
	isActive?: boolean;
}

const Board: React.FC<BoardProps> = ({
	type = 'player',
	players,
	random = false,
	board,
	isPlaying,
	setIsPlaying,
	setBoard,
	history,
	setHistory,
	turn,
	setTurn,
	isActive,
	disabledCell,
	setDisabledCell,
}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [randomTurn, setRandomTurn] = useLocalStorage('game', { random: random });
	const { roomDetails } = useAppSelector(roomSelector);
	const { player } = useAppSelector(profileSelector);
	// State to indicate if the game ended in a draw
	const [isDraw, setIsDraw] = useState<boolean>(false);

	// State to track winning combination
	const [winningCombination, setWinningCombination] = useState<number[]>([]);

	// State to open the dialog after a certain interval
	const [showDialog, setShowDialog] = useState(false);

	const [currentPlayer, setCurrentPlayer] = useState<string>('');
	const [playAgainMessage, setPlayAgainMessage] = useState<string>('');
	const { round } = useAppSelector(roomSelector);
	const { pathname } = useLocation();

	const id = pathname.split('/playground/')[1];

	useEffect(() => {
		if (!(turn && isPlaying)) return;
		const filterPlayer = roomDetails?.participants?.find(
			(p) => p.username === player?.username
		);

		filterPlayer?.mark === turn ? setCurrentPlayer('Your') : setCurrentPlayer('Opponent');
	}, [turn]);

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
		socket.emit('makemove', obj);
	};

	socket.on('makemove', (data) => {
		setBoard(data.board);
		setTurn(data.turn);
		setRoomDetails(data);
		setHistory(data.history);
		setDisabledCell(data.disabledCell);
	});

	// useEffect to handle game end conditions
	useEffect(() => {
		if (getWinnerMessage(checkWinner(board))) {
			const timer = setTimeout(() => {
				setShowDialog(true);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [board]);

	// Function to draw 'x' and 'o'
	const draw = (index: number) => {
		if (!isActive) return;
		const winner = checkWinner(board);

		if (board[index] === '' && winner === null && !isDraw) {
			const nextTurn = turn === 'x' ? 'o' : 'x';

			const newData = [...board];
			newData[index] = turn;

			const newHistory = [...history, index];
			setHistory(newHistory);

			setBoard(newData);
			playClickSound();
			const emptyCellCount = newData.filter((symbol) => symbol === '').length;
			if (emptyCellCount <= 3) {
				const newDisabledCell = newHistory[0];
				setDisabledCell(newDisabledCell);
				makemove(nextTurn, newData, newHistory, newDisabledCell);
			} else if (emptyCellCount === 2) {
				const firstDrawnIndex = newHistory.find((id) => board[id] !== '');
				if (firstDrawnIndex !== undefined) {
					newData[firstDrawnIndex] = '';
					setBoard(newData);

					const updatedHistory = newHistory.filter((id) => id !== firstDrawnIndex);
					setHistory(updatedHistory);
					const newDisabledCell = updatedHistory[0];
					setDisabledCell(newDisabledCell);
					makemove(nextTurn, newData, updatedHistory, newDisabledCell);
				}
			} else {
				setDisabledCell(-1);
			}

			makemove(nextTurn, newData, newHistory, disabledCell);
			const nextWinner = checkWinner(newData);

			if (nextWinner === null) {
				setTurn(nextTurn);
			}
			checkDraw(newData);
		}
	};

	// Check winner
	const checkWinner = (board: string[]) => {
		// Win conditions
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
			// If conditions fulfilled, then return either 'X' or 'O'
			if (board[x] && board[x] === board[y] && board[x] === board[z]) {
				// Update the state of winning cells
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
	// Listen for the gameWin event to update UI
	socket.on('gameWin', (data) => {
		// console.log(data, 'gameWin data');
	});

	// Check if the match is a draw
	const checkDraw = (board: string[]) => {
		const isBoardFull = board.every((symbol) => symbol !== '' && checkWinner(board) === null);
		if (isBoardFull && checkWinner(board) === null) {
			setIsDraw(true);
		}
	};

	// Function to reset the board
	const resetBoard = () => {
		setBoard(['', '', '', '', '', '', '', '', '']);
		setIsDraw(false);
		setHistory([]);
		setDisabledCell(-1);
		setWinningCombination([]);
		setShowDialog(false);
	};

	const playAgain = () => {
		socket.emit('playAgainRequest', {
			roomId: parseInt(id),
			username: player?.username,
			name: player?.name,
		});
	};

	useEffect(() => {
		socket.on('playAgainRequested', (data) => {
				console.log(data, 'data of play again requested');
				if (data.username !== player?.username) {
						setPlayAgainMessage(`${data.name} wants to play again`);
				} else {
						setPlayAgainMessage('');
				}
		});

		socket.on('playAgainRequestsUpdate', (data) => {
			console.log(data, 'play again reqquests updates')
				if (data.length >= 2) {
						resetBoard();
						socket.emit('playAgain', { roomId: parseInt(id), round: 2 });
				}
		});

		socket.on('playAgain', (data) => {
				console.log(data, 'play again data in client side');
		});

		return () => {
				socket.off('playAgainRequested');
				socket.off('playAgainRequestsUpdate');
				socket.off('playAgain');
		};
}, [player, id, resetBoard]);

	// Get messages after the match completes either draw or wins
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

	// Implementing bot logic
	useEffect(() => {
		if (type === 'bot' && turn === 'o') {
			setTimeout(() => {
				makeBotMove();
			}, 500);
		}
	}, [type, turn]);

	// Bot moves function
	const makeBotMove = () => {
		// Get the empty cell
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

	// Function to play click sound
	const playClickSound = () => {
		const audio = new Audio(ClickSound);
		audio.play();
	};

	// Leave the game
	const leaveGame = () => {
		navigate('/');
		dispatch(setRound(1));
	};

	useEffect(() => {
		setRandomTurn({ random: random });
	}, [random, setRandomTurn]);

	const handleSwitchChange = (value: boolean) => {
		setRandomTurn({ random: value });
	};

	return (
		<section className="flex flex-col gap-16">
			<section className="board_layout">
				{board?.map((item, index) => {
					const cellClass = `border-2 border-foreground min-w-[100px] min-h-[100px] w-full h-full aspect-square text-7xl cell ${
						item === 'x' ? 'text-red-600' : 'text-blue-600'
					} ${winningCombination.includes(index) ? 'winning' : ''} ${
						checkWinner(board) === 'x' ? 'animate_x' : 'animate_o'
					}`;
					return (
						<section key={index} onClick={() => draw(index)} className={cellClass}>
							<div className={`${disabledCell === index ? 'disabled_cell' : ''}`}>
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
								{/* 
								<div className="flex items-center space-x-2 my-6 justify-center">
									<Switch
										id="random-turn"
										onCheckedChange={handleSwitchChange}
										checked={randomTurn?.random || false}
									/>
									<Label htmlFor="random-turn">Random Turn</Label>
								</div>
							*/}
							</AlertDialogDescription>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={leaveGame} autoFocus={false}>
									Leave
								</AlertDialogCancel>
								<AlertDialogAction onClick={playAgain} autoFocus={true}>
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
