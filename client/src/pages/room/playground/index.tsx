import Board from '@/components/board';
import UserCard from '@/components/card';
import { useAppSelector } from '@/utils/hooks/appHooks';
import React from 'react';
import { roomSelector } from '../redux/selector';
const Playground: React.FC = () => {
	const { round, mode } = useAppSelector(roomSelector);


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
					<Board type="player" player={player} />
				) : (
					<Board type="bot" player={player} />
				)}
			</section>
		</main>
	);
};

export default Playground;
