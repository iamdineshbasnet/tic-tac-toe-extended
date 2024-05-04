import React, { useEffect, useState } from 'react';
import ClickSound from '@/assets/click.mp3';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
interface BoardProps {
	type: 'bot' | 'player';
	choice?: 'x' | 'o';
}

const Board: React.FC<BoardProps> = ({ type = 'bot', choice = 'x' }) => {
	const navigate = useNavigate();
	// state to track the turn
	const [turn, setTurn] = useState<string>('x');

	// State to manage cell data
	const [data, setData] = useState<string[]>(['', '', '', '', '', '', '', '', '']);

	// State to indicate if the game ended in a draw
	const [isDraw, setIsDraw] = useState<boolean>(false);

	// State to manage game history
	const [history, setHistory] = useState<number[]>([]);

	// state to track disabled the cells
	const [disabledCell, setDisabledCell] = useState<number>();

	// state to track winning combination
	const [winningCombination, setWinningCombination] = useState<number[]>([]);

	// state to open the dialog after certain interval
	const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (getWinnerMessage(checkWinner(data))) {
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [data]);


	// function to draw
	const draw = (index: number) => {
		const winner = checkWinner(data);

		if (data[index] === '' && winner === null && !isDraw) {
			const nextTurn = turn === 'x' ? 'o' : 'x';
			const newData = [...data];
			newData[index] = turn;

			const newHistory = [...history, index];
			setHistory(newHistory);

			setData(newData);
			playClickSound();

			const emptyCellCount = newData.filter((symbol) => symbol === '').length;
			if (emptyCellCount <= 3) {
				setDisabledCell(newHistory[0]);
			}
			if (emptyCellCount === 2) {
				const firstDrawnIndex = newHistory.find((id) => data[id] !== '');
				if (firstDrawnIndex !== undefined) {
					newData[firstDrawnIndex] = '';
					setData(newData);

					const updatedHistory = newHistory.filter((id) => id !== firstDrawnIndex);
					setHistory(updatedHistory);
					setDisabledCell(updatedHistory[0]);
				}
			}

			setTurn(nextTurn);
			checkDraw(newData);
		}
	};

	// check winner
	const checkWinner = (data: string[]) => {
		// win conditions
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
			// if conditions fullfilled then return  either 'X' or 'O'
			if (data[x] && data[x] === data[y] && data[x] === data[z]) {
				// update the state of winning cells
				if (winningCombination.length === 0) {
					setWinningCombination([x, y, z]);
				}
				return data[x];
			}
		}
		return null;
	};

	// check if the match draw
	const checkDraw = (data: string[]) => {
		const isBoardFull = data.every((symbol) => symbol !== '' && checkWinner(data) === null);
		if (isBoardFull && checkWinner(data) === null) {
			setIsDraw(true);
		}
	};

	// function to reset the board
	const resetBoard = () => {
		setData(['', '', '', '', '', '', '', '', '']);
		setTurn('x');
		setIsDraw(false);
		setHistory([]);
		setDisabledCell(undefined);
		setWinningCombination([]);
		setShowDialog(false)
	};

	// get messages after the match complete either draw or wins
	const getWinnerMessage = (winner: string | null) => {
		if (winner === null && isDraw) {
			return 'Draw';
		} else if (winner !== null) {
			return `${winner} Won`;
		}
		return '';
	};

	// Implementing bot logic
	useEffect(() => {
		if (type === 'bot' && turn !== choice) {
			setTimeout(() => {
				makeBotMove();
			}, 500);
		}
	}, [type, turn]);

	// bot moves function
	const makeBotMove = () => {
		// get the empty cell
		const emptyCells = data.reduce((acc: number[], cell, index) => {
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

	// function to play click sound
	const playClickSound = () => {
		const audio = new Audio(ClickSound);
		audio.play();
	};

	const leaveGame = () => {
		navigate('/');
	};
	return (
		<section className='flex flex-col gap-16'>
			<section className="board_layout">
				{data?.map((item, index) => {
					const cellClass = `border-2 border-foreground min-w-[100px] min-h-[100px] w-full h-full aspect-square text-7xl cell ${
						item === 'x' ? 'text-red-600' : 'text-blue-600'
					} ${winningCombination.includes(index) ? 'winning' : ''} ${
						checkWinner(data) === 'x' ? 'animate_x' : 'animate_o'
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
                  {getWinnerMessage(checkWinner(data))}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={leaveGame}>Leave</AlertDialogCancel>
                <AlertDialogAction onClick={resetBoard}>Play Again</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
			</section>
			<p className="text-center text-lg">{turn}'s turn</p>
		</section>
	);
};

export default Board;
