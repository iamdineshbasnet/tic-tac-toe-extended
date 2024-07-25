import { profileSelector } from '@/pages/profile/redux/selector';
import { socket } from '@/socket';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setRoomCode, setRoomDetails } from '../redux/roomSlice';
import Loader from '@/components/loader';
import UserCard from '@/components/card';
import { roomSelector } from '../redux/selector';

const FindingRoom: React.FC = () => {
	const { player } = useAppSelector(profileSelector);
	const [opponentFound, setOpponentFound] = useState<boolean>(false);
	const { roomDetails } = useAppSelector(roomSelector);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	useEffect(() => {
		player &&
			socket.on('opponent_found', (data) => {
				if (data.message === 'success') {
					setOpponentFound(true);
				} else {
					setOpponentFound(false);
				}
				dispatch(setRoomDetails(data?.details));
				dispatch(setRoomCode(data?.details?.roomId));
				if (data) {
					setTimeout(() => {
						navigate(`/playground/${data?.details?.roomId}`);
					}, 3000);
				}
			});

		return () => {
			socket.off('opponent_found');
		};
	}, [player]);

	useEffect(() => {
		player && socket.emit('find_opponent', player?._id);
		dispatch(setRoomDetails(null));
	}, [player]);

	const creator = roomDetails?.participants?.find((c) => c.username === player?.username);
	const otherPlayer = roomDetails?.participants?.find((c) => c.username !== player?.username);

	const you = {
		_id: '',
		name: player ? player?.name : 'you',
		image: player ? player?.image : 'https://i.imgur.com/A0vPzPd.jpg',
		mark: 'x',
		win: 0,
		username: 'placeholder',
		isGuest: true,
	};

	const opponent = {
		_id: '',
		name: 'opponent',
		image: 'https://i.imgur.com/A0vPzPd.jpg',
		mark: 'o',
		win: 0,
		username: 'placeholder',
		isGuest: true,
	};
	return (
		<main className="mt-12 text-center">
			{opponentFound ? (
				<p className="mt-4">Opponent Found</p>
			) : (
				<>
					<Loader size="60" />
					<p className="mt-4">Finding Opponent...</p>
				</>
			)}

			<section className="flex justify-between gap-20 max-w-[600px] mx-auto mt-60">
				<div className="w-full">
					{creator ? (
						<UserCard showMark={false} data={creator} />
					) : (
						<UserCard showMark={false} data={you} />
					)}
				</div>
				<div className="w-full">
					{otherPlayer ? (
						<UserCard showMark={false} data={otherPlayer} />
					) : (
						<UserCard showMark={false} data={opponent} />
					)}
				</div>
			</section>
		</main>
	);
};

export default FindingRoom;
