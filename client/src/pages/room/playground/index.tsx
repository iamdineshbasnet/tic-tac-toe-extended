import Board from '@/components/board';
import UserCard from '@/components/card';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useEffect } from 'react';
import { roomSelector } from '../redux/selector';
import { getRoomDetails } from '../redux/thunk';
import { useLocation } from 'react-router-dom';
const bot = [
	{
		_id: 1, 
		name: 'Player 1',
		win: 0,
		mark: 'x',
		image: 'https://i.imgur.com/A0vPzPd.jpg'
	},
	{
		_id: 2,
		name: "Bot",
		win: 0,
		mark: 'o',
		image: 'https://i.imgur.com/6QoGbID.png'
	}
]
const Playground: React.FC = () => {
	const dispatch = useAppDispatch()
	const { round, mode, roomDetails } = useAppSelector(roomSelector);
	const { pathname } = useLocation()
	const id = pathname.split('/playground/')[1]
	console.log(roomDetails, 'room details')

	
	useEffect(()=>{
		dispatch(getRoomDetails(id))
	}, [id])
	

	const pvp = [
		{
			id: 1,
			name: 'Player 1',
			win: 0,
			mark: 'x',
			image: 'https://i.imgur.com/A0vPzPd.jpg',
		},
		{
			id: 2,
			name: 'Player 2',
			win: 0,
			mark: 'o',
			image: 'https://i.imgur.com/A0vPzPd.jpg',
		},
	];

	const bot = [
		{
			id: 1, 
			name: 'Player 1',
			win: 0,
			mark: 'x',
			image: 'https://i.imgur.com/A0vPzPd.jpg'
		},
		{
			id: 2,
			name: "Bot",
			win: 0,
			mark: 'o',
			image: 'https://i.imgur.com/6QoGbID.png'
		}
	]
	const player = mode === 'pvp' ? pvp : bot

	return (
		<main className="mt-20 w-[900px] mx-auto">
			<section className="flex justify-between gap-12">
				<UserCard data={player[0]} />
				<div className="w-[80px] h-[80px] aspect-square border rounded-full flex items-center flex-col justify-center">
					<p className="text-center text-sm">
						{round}
						<sup>st</sup>
					</p>
					<h5 className="text-center text-sm">Round</h5>
				</div>
				<UserCard data={player[1]} />
			</section>
			<section className="flex items-center justify-center mt-24">
				{mode === 'pvp' ? (
				// <Board type="player" player={player} />
				'pvp'
			) : (
				// <Board type="bot" player={player} />
				'bot'
			)}
			</section>
		</main>
	);
};

export default Playground;
