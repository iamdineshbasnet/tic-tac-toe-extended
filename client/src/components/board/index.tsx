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
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { PlayerProps } from '@/pages/room/redux/types';
import { Switch } from '../ui/switch';
import useLocalStorage from 'use-local-storage';
import { Label } from '../ui/label';
import { roomSelector } from '@/pages/room/redux/selector';
import { setRound } from '@/pages/room/redux/roomSlice';

interface BoardProps {
  type: 'bot' | 'player';
  choice?: 'x' | 'o';
  player: PlayerProps[];
  random?: boolean;
  board: string[];
  setBoard: Dispatch<SetStateAction<string[]>>
  turn: string;
  setTurn: Dispatch<SetStateAction<string>>
}

const Board: React.FC<BoardProps> = ({ type = 'player', player, random = false, board, setBoard, turn, setTurn }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [randomTurn, setRandomTurn] = useLocalStorage('game', { random: random });


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

  // State to track current player
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProps>(player[0]);

  const { round } = useAppSelector(roomSelector);


  // useEffect to handle game end conditions
  useEffect(() => {
    if (getWinnerMessage(checkWinner(board))) {
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [board]);

  // function to draw
  const draw = (index: number) => {
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
        setDisabledCell(newHistory[0]);
      }
      if (emptyCellCount === 2) {
        const firstDrawnIndex = newHistory.find((id) => board[id] !== '');
        if (firstDrawnIndex !== undefined) {
          newData[firstDrawnIndex] = '';
          setBoard(newData);

          const updatedHistory = newHistory.filter((id) => id !== firstDrawnIndex);
          setHistory(updatedHistory);
          setDisabledCell(updatedHistory[0]);
        }
      }

      const nextWinner = checkWinner(newData);

      if (nextWinner === null) {
        setTurn(nextTurn);
        setCurrentPlayer(player.find((p) => p.mark === nextTurn) || player[0]);
      }
      checkDraw(newData);

    }
  };

  // check winner
  const checkWinner = (board: string[]) => {
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
      if (board[x] && board[x] === board[y] && board[x] === board[z]) {
        // update the state of winning cells
        if (winningCombination.length === 0) {
          setWinningCombination([x, y, z]);
        }
        return board[x];
      }
    }
    return null;
  };

  // check if the match draw
  const checkDraw = (board: string[]) => {
    const isBoardFull = board.every((symbol) => symbol !== '' && checkWinner(board) === null);
    if (isBoardFull && checkWinner(board) === null) {
      setIsDraw(true);
    }
  };

  // function to reset the board
  const resetBoard = () => {
    setBoard(['', '', '', '', '', '', '', '', '']);
    setIsDraw(false);
    setHistory([]);
    setDisabledCell(undefined);
    setWinningCombination([]);
    setShowDialog(false);
  };

  const playAgain = () => {
    resetBoard();
    let nextTurn = turn === 'x' ? 'o' : 'x';

    if (randomTurn) {
      nextTurn = Math.random() < 0.5 ? 'x' : 'o';
      setTurn(nextTurn);
    } else {
      setTurn(nextTurn);
    }
    dispatch(setRound(round + 1));
  };

  // get messages after the match complete either draw or wins
  const getWinnerMessage = (winner: string | null) => {
    if (winner === null && isDraw) {
      return 'Draw';
    } else if (winner !== null) {
      const win_by = player.find((p) => p.mark === winner);
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

  // bot moves function
  const makeBotMove = () => {
    // get the empty cell
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

  // function to play click sound
  const playClickSound = () => {
    const audio = new Audio(ClickSound);
    audio.play();
  };

  // leave the game
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
              <AlertDialogDescription>
                <div className="flex items-center space-x-2 my-6 justify-center">
                  <Switch
                    id="random-turn"
                    onCheckedChange={handleSwitchChange}
                    checked={randomTurn?.random || false}
                  />
                  <Label htmlFor="random-turn">Random Turn</Label>
                </div>
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={leaveGame} autoFocus={false}>Leave</AlertDialogCancel>
								<AlertDialogAction onClick={playAgain} autoFocus={true}>
									Play Again
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</section>
			<p className="text-center text-lg">{currentPlayer.name} Turn</p>
		</section>
	);
};

export default Board;
