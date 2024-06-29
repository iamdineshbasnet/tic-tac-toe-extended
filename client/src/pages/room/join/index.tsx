import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useState } from 'react';
import { createRoom, joinRoom } from '../redux/thunk';
import { useNavigate } from 'react-router-dom';
import { socket } from '@/socket';
import { roomSelector } from '../redux/selector';
import { useToast } from '@/components/ui/use-toast';

const JoiningRoom: React.FC = () => {
	const { toast } = useToast();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState<string>('');

	const { loadingCreateRoom, loadingJoinRoom } = useAppSelector(roomSelector);

	const handleJoinRoom = () => {
		roomId &&
			dispatch(joinRoom(roomId))
				.unwrap()
				.then((res) => {
					if (res?.result?.roomId) {
						socket.emit('join', res?.result?.roomId);
						navigate(`/waiting-room/${res?.result?.roomId}`);
					}
				})
				.catch(() => {
					toast({
						duration: 3000,
						variant: 'destructive',
						title: 'Uh oh! Something went wrong.',
						description: 'There was a problem with your request.',
					});
				});
	};

	const generateRoom = () => {
		dispatch(createRoom())
			.unwrap()
			.then((res) => {
				if (res?.result?.roomId) {
					socket.emit('join', res?.result?.roomId);
					navigate(`/waiting-room/${res?.result?.roomId}`);
				}
			})
			.catch(() => {
				toast({
					duration: 3000,
					variant: 'destructive',
					title: 'Uh oh! Something went wrong.',
					description: 'There was a problem with your request.',
				});
			});
	};

	return (
		<main className="mt-12">
			<Card className="max-w-[500px] mx-auto">
				<CardHeader className="text-center font-semibold text-2xl">Enter Code</CardHeader>
				<CardContent>
					<Input
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
						placeholder="Enter 6 digits code"
						className="text-2xl text-center font-semibold my-6 py-6 tracking-wider"
					/>

					<Button
						className="w-full font-semibold my-4"
						onClick={handleJoinRoom}
						disabled={roomId.length < 6 ? true : false}
						loading={loadingJoinRoom}>
						Join Room
					</Button>

					<p className="text-center font-semibold">OR</p>

					<Button
						className="w-full font-semibold mt-4"
						variant="outline"
						onClick={generateRoom}
						loading={loadingCreateRoom}>
						Generate Code
					</Button>
				</CardContent>
			</Card>
		</main>
	);
};

export default JoiningRoom;
