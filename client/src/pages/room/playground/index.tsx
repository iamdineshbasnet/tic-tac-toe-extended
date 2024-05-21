import Board from '@/components/board';
import UserCard from '@/components/card';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useCallback, useEffect, useState } from 'react';
import { roomSelector } from '../redux/selector';
import { useLocation } from 'react-router-dom';
import { socket } from '@/socket';
import { setRoomDetails } from '../redux/roomSlice';

const Playground: React.FC = () => {
	const dispatch = useAppDispatch();
	const { roomDetails } = useAppSelector(roomSelector);
	const { pathname } = useLocation();
	const id = pathname.split('/playground/')[1];
	const [board, setBoard] = useState<string[]>(Array(9).fill(''));
	const [turn, setTurn] = useState<string>('x');

	const creator = roomDetails?.participants?.find((c) => c?._id === roomDetails?.creator._id);
	const otherPlayer = roomDetails?.participants?.find((c) => c?._id !== roomDetails.creator._id);

	const creatorData = creator ? { ...creator, mark: 'x' } : null;
	const otherPlayerData = otherPlayer ? { ...otherPlayer, mark: 'o' } : null;



	useEffect(() => {
		socket.emit('getDetails', parseInt(id));
		socket.on('getDetails', (data) => {
			dispatch(setRoomDetails(data));
			if (data.turn) {
				setTurn(data.turn);
			}
			setBoard(data?.board);
		});

		// Clean up the socket event listener on unmount
		return () => {
			socket.off('getDetails');
		};
	}, [id, dispatch]);

	useEffect(()=>{
		const obj = {
			roomId: parseInt(id),
			board: board,
			turn: turn,
			isGameStart: true,
			creator: creatorData,
			participants: [creatorData, otherPlayerData],
		};
		creatorData && otherPlayerData && socket.emit('makemove', obj);

		return () =>{
			socket.off("makemove")
		}
	}, [board, turn, id])

	
	return (
		<main className="mt-20 w-[900px] mx-auto">
			<section className="flex justify-between gap-12">
				{creatorData && <UserCard data={creatorData} />}
				{/* <div className="w-[80px] h-[80px] aspect-square border rounded-full flex items-center flex-col justify-center">
					<p className="text-center text-sm">
						{round}
						<sup>st</sup>
					</p>
					<h5 className="text-center text-sm">Round</h5>
				</div> */}
				{otherPlayerData && <UserCard data={otherPlayerData} />}
			</section>
			<section className="flex items-center justify-center mt-24">
				{roomDetails && creatorData && otherPlayerData && (
					<Board
						turn={turn}
						setTurn={setTurn}
						board={board}
						setBoard={setBoard}
						type="player"
						player={[creatorData, otherPlayerData]}
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
