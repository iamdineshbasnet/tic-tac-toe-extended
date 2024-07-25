import UserCard from '@/components/card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { Check, Copy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roomSelector } from '../redux/selector';
import { getRoomDetails } from '../redux/thunk';
import { profileSelector } from '@/pages/profile/redux/selector';
import { socket } from '@/socket';
import { setRoomDetails } from '../redux/roomSlice';
import Modal from '@/components/modal';
import CreateUser from '@/pages/home/create';

const WaitingRoom: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { roomDetails } = useAppSelector(roomSelector);
	const { player } = useAppSelector(profileSelector);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loadingStart, setLoadingStart] = useState<boolean>(false);
	const [isHost, setIsHost] = useState<boolean>(false)
	const [copied, setCopied] = useState({
		id: false,
		link: false,
	});
	const { id } = useParams()

	useEffect(() => {
		id && dispatch(getRoomDetails(id));
	}, [id]);

	const creator = roomDetails?.participants?.find((c) => c.username === player?.username);
	const otherPlayer = roomDetails?.participants?.find((c) => c.username !== player?.username);

	
	useEffect(() => {
		if (!roomDetails) return;

		setIsHost(roomDetails?.creator?.username === player?.username)

	}, [roomDetails]);

	useEffect(() => {
		socket.on('join', (data) => {
			dispatch(setRoomDetails(data));
		});

		// Clean up the socket listener on unmount
		return () => {
			socket.off('join');
		};
	}, []);
	
	socket.on('room_joined', (details)=>{
		dispatch(setRoomDetails(details))
	})

	const startGame = () => {
		const obj = {
			roomId: id && parseInt(id),
			isPlaying: true,
		};
		socket.emit('start_game', obj);
		setLoadingStart(true);
		setTimeout(() => {
			navigate(`/playground/${id}`);
			setLoadingStart(false);
		}, 2000);
	};

	socket.on('game_start', (data) => {
		dispatch(setRoomDetails(data));
		setTimeout(() => {
			navigate(`/playground/${data.roomId}`);
			setLoadingStart(false);
		}, 2000);
	});

	const copyToClipboard = (type: string, value: string) => {
		navigator.clipboard.writeText(value);

		setCopied({ ...copied, [type]: true });

		// Reset the copied state after 2 seconds
		setTimeout(() => {
			setCopied({ ...copied, [type]: false });
		}, 2000);
	};

	const modalProps = {
		title: 'Whor are you?',
		body: <CreateUser setModal={setShowModal} />,
		showModal: showModal,
	};
	const iconTransition = 'transition-all duration-300';

	const userPlaceholder = {
		_id: '100',
		name: '???',
		image: 'https://i.imgur.com/A0vPzPd.jpg',
		mark: creator?.mark === 'x' ? 'o' : 'x',
		win: 0,
		username: 'placeholder',
		isGuest: true,
	};
	return (
		<main className="mt-12 max-w-[500px] mx-auto">
			{player ? (
				<>
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
								<Button
									variant="outline"
									size="icon"
									className="p-6 relative"
									onClick={() => id && copyToClipboard('id', id)}>
									<Copy
										className={`absolute h-[1.2rem] w-[1.2rem] ${iconTransition} ${
											copied.id
												? 'opacity-0 -rotate-90 scale-0'
												: 'opacity-1 rotate-0 scale-100'
										}`}
									/>
									<Check
										className={`absolute h-[1.4rem] w-[1.4rem] ${iconTransition} ${
											copied.id
												? 'opacity-1 rotate-0 scale-100 '
												: 'opacity-0 rotate-90 scale-0'
										}`}
									/>
									<span className="sr-only">Copy Code</span>
								</Button>
							</section>
							<p className="text-center font-semibold">OR</p>
							<section className="flex items-center gap-4">
								<Input
									value={`Share this Link to your friend`}
									readOnly
									className="text-base text-center font-normal my-6 py-6"
								/>
								<Button
									variant="outline"
									size="icon"
									className="p-6"
									onClick={() =>
										copyToClipboard(
											'link',
											`http://localhost:5173/waiting-room/${id}`
										)
									}>
									<Copy
										className={`absolute h-[1.2rem] w-[1.2rem] ${iconTransition} ${
											copied.link
												? 'opacity-0 -rotate-90 scale-0'
												: 'opacity-1 rotate-0 scale-100'
										}`}
									/>
									<Check
										className={`absolute h-[1.4rem] w-[1.4rem] ${iconTransition} ${
											copied.link
												? 'opacity-1 rotate-0 scale-100 '
												: 'opacity-0 rotate-90 scale-0'
										}`}
									/>
									<span className="sr-only">Copy Code</span>
								</Button>
							</section>
						</CardContent>
					</Card>

					<section className="flex justify-between gap-20 max-w-[600px] mx-auto mt-20">
						<div className="w-full">{creator && <UserCard data={creator} />}</div>
						<div className="w-full">
							{otherPlayer ? (
								<UserCard data={otherPlayer} />
							) : (
								<UserCard data={userPlaceholder} />
							)}
						</div>
					</section>
					{isHost && roomDetails?.participants && (
						<Button
							className="w-full font-semibold text-lg mt-20"
							onClick={startGame}
							loading={loadingStart}
							disabled={roomDetails?.participants?.length < 2 || loadingStart}>
							Start
						</Button>
					)}
				</>
			) : (
				<Modal {...modalProps}>
					<Button
						className="w-full font-semibold text-lg mt-20"
						onClick={() => setShowModal(true)}>
						Login
					</Button>
				</Modal>
			)}
		</main>
	);
};

export default WaitingRoom;
