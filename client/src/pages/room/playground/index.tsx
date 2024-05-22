import Board from '@/components/board';
import UserCard from '@/components/card';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useEffect, useState } from 'react';
import { roomSelector } from '../redux/selector';
import { useLocation } from 'react-router-dom';
import { socket } from '@/socket';
import { setRoomDetails } from '../redux/roomSlice';
import { profileSelector } from '@/pages/profile/redux/selector';

const Playground: React.FC = () => {
	const dispatch = useAppDispatch();
	const { roomDetails } = useAppSelector(roomSelector);
	const { player } = useAppSelector(profileSelector);

	
	const { pathname } = useLocation();
	const id = pathname.split('/playground/')[1];
	const [board, setBoard] = useState<string[]>(Array(9).fill(''));
	const [history, setHistory] = useState<number[]>([]);
	const [turn, setTurn] = useState<string>('x');
	// State to track disabled cells
	const [disabledCell, setDisabledCell] = useState<number>(-1);
	
	const creator = roomDetails?.participants?.find((c) => c?.username === roomDetails?.creator.username);
	const otherPlayer = roomDetails?.participants?.find((c) => c?.username !== roomDetails.creator.username);

	const filteredPlayer = roomDetails?.participants?.find((p) => p?.username === player?.username);
	const isActive = filteredPlayer?.mark === turn;

	useEffect(() => {
		socket.emit('getDetails', parseInt(id));
		socket.on('getDetails', (data) => {
			dispatch(setRoomDetails(data));
			if (data.turn) {
				setTurn(data.turn);
			}
			setBoard(data?.board);
			setHistory(data?.history)
		});

		// Clean up the socket event listener on unmount
		return () => {
			socket.off('getDetails');
		};
	}, [id, dispatch]);


	return (
		<main className="mt-20 w-[900px] mx-auto">
			<section className="flex justify-between gap-12">
				{creator && <UserCard data={creator} />}
				{/* <div className="w-[80px] h-[80px] aspect-square border rounded-full flex items-center flex-col justify-center">
					<p className="text-center text-sm">
						{round}
						<sup>st</sup>
					</p>
					<h5 className="text-center text-sm">Round</h5>
				</div> */}
				{otherPlayer && <UserCard data={otherPlayer} />}
			</section>
			<section className="flex items-center justify-center mt-24">
				{roomDetails && (
					<Board
						isActive={isActive}
						turn={turn}
						setTurn={setTurn}
						board={board}
						setBoard={setBoard}
						history={history}
						setHistory={setHistory}
						disabledCell={disabledCell}
						setDisabledCell={setDisabledCell}
						type="player"
						players={roomDetails?.participants}
					/>
				)}
				{/* {mode === 'pvp' ? (
				'pvp'
			) : (
				<Board type="bot" player={player} />
				'bot'
			)} */}
			</section>
		</main>
	);
};

export default Playground;
