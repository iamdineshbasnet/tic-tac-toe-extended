import Board from '@/components/board';
import UserCard from '@/components/card';
import { useAppSelector } from '@/utils/hooks/appHooks';
import React from 'react';
import { roomSelector } from '../redux/selector';
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
	const { round, mode, roomDetails } = useAppSelector(roomSelector);
	console.log(roomDetails, 'room details')
	

	const pvp = roomDetails && roomDetails.participants
	const player = mode === 'pvp' ? pvp : pvp
	const xPlayer = player?.find((p)=> p.mark === 'x')
	const oPlayer = player?.find((p)=> p.mark === 'o')
	return (
		<main className="mt-20 w-[900px] mx-auto">
			<section className="flex justify-between gap-12">
				{/* @ts-ignore */}
				<UserCard data={xPlayer} />
				<div className="w-[80px] h-[80px] aspect-square border rounded-full flex items-center flex-col justify-center">
					<p className="text-center text-sm">
						{round}
						<sup>st</sup>
					</p>
					<h5 className="text-center text-sm">Round</h5>
				</div>
				{/* @ts-ignore */}
				<UserCard data={oPlayer} />
			</section>
			<section className="flex items-center justify-center mt-24">
				{mode === 'pvp' ? (
				<Board type="player"
				// @ts-ignore
				player={player} />
			) : (
				<Board type="player"
				// @ts-ignore				
				player={player} />
				)}
			</section>
		</main>
	);
};

export default Playground;
