import UserCard from '@/components/card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { Check, Copy } from 'lucide-react';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { roomSelector } from '../redux/selector';
import { getRoomDetails } from '../redux/thunk';
import { profileSelector } from '@/pages/profile/redux/selector';
import { socket } from '@/socket';
import { setRoomDetails } from '../redux/roomSlice';

const WaitingRoom: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { roomDetails } = useAppSelector(roomSelector);
	const { player } = useAppSelector(profileSelector);

	const { pathname } = useLocation();
	const id = pathname.split('/waiting-room/')[1];

	useEffect(() => {
		id && dispatch(getRoomDetails(id));
	}, [id]);

	const creator = roomDetails?.participants?.find((c) => c._id === roomDetails?.creator._id);
	const otherPlayer = roomDetails?.participants?.find((c) => c._id !== roomDetails.creator._id);

	const creatorData = creator ? { ...creator, mark: 'x' } : null;
	const otherPlayerData = otherPlayer ? { ...otherPlayer, mark: 'o' } : null;
	useEffect(() => {
		socket.on('join', (data) => {
			dispatch(setRoomDetails(data));
		});

		// Clean up the socket listener on unmount
		return () => {
			socket.off('join');
		};
	}, []);

	const startGame = () => {
		const obj = {
			roomId: parseInt(id),
			board: Array(9).fill(''),
			turn: 'x',
			participants: [creatorData, otherPlayerData],
		};
		socket.emit('startGame', obj);
		socket.on('gameStarted', (data) => {
			console.log(data, 'datad after game started');
		});
		navigate(`/playground/${id}`);
	};
	return (
		<main className="mt-12 max-w-[500px] mx-auto">
			<Card>
				<CardHeader className="text-center font-semibold text-2xl">
					Generated Code
				</CardHeader>
				<CardContent>
					<section className="flex items-center gap-4">
						<Input
							value={id}
							readOnly
							className="text-2xl text-center font-semibold my-6 py-6 tracking-wider"
						/>
						<Button variant="outline" size="icon" className="p-6">
							<Copy className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

							<Check className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<span className="sr-only">Copy Code</span>
						</Button>
					</section>
					<p className="text-center font-semibold">OR</p>
					<section className="flex items-center gap-4">
						<Input
							value={`http://localhost:5173/waiting-room/${id}`}
							readOnly
							className="text-base text-center font-normal my-6 py-6"
						/>
						<Button variant="outline" size="icon" className="p-6">
							<Copy className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

							<Check className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<span className="sr-only">Copy Code</span>
						</Button>
					</section>
				</CardContent>
			</Card>

			<section className="flex justify-between gap-20 max-w-[600px] mx-auto mt-20">
				<div className="w-full">{creatorData && <UserCard data={creatorData} />}</div>
				<div className="w-full">
					{otherPlayerData && <UserCard data={otherPlayerData} />}
				</div>
			</section>
			{creatorData?.username === player?.username && roomDetails?.participants && (
				<Button
					className="w-full font-semibold text-lg mt-20"
					onClick={startGame}
					disabled={roomDetails?.participants?.length < 2}>
					Start
				</Button>
			)}
		</main>
	);
};

export default WaitingRoom;
