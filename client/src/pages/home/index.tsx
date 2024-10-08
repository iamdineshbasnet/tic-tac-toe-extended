import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { Bot, Globe, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateUser from './create';
import Modal from '@/components/modal';
import { profileSelector } from '../profile/redux/selector';
import { setMode, setRound } from '../room/redux/roomSlice';

const Homepage: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [isOnline, setIsOnline] = useState<boolean>(false);

	const { player } = useAppSelector(profileSelector);

	useEffect(() => {
		if (!window.navigator.onLine) {
			setIsOnline(false);
		} else {
			setIsOnline(true);
		}
	}, []);

	const handleMode = (mode: string) => {
		switch (mode) {
			case 'friends':
				dispatch(setMode('friends'));
				setShowModal(true);
				break;
			case 'multiplayer':
				dispatch(setMode('multiplayer'));
				setShowModal(true);
				break;
			case 'pvp':
				dispatch(setMode('pvp'));
				navigate('/offline/pvp');
				break;
			case 'bot':
				dispatch(setMode('bot'));
				navigate('/offline/bot');
				break;
			default:
				break;
		}
		dispatch(setRound(1));
		setShowModal(true);
	};

	const modalProps = {
		title: 'Who are you?',
		body: <CreateUser setModal={setShowModal} />,
		showModal: showModal,
	};
	return (
		<section className="text-center mt-12 px-4">
			<h5 className="capitalize mt-4 mb-4 font-semibold">
				<div className="inline-flex w-3 h-3 rounded-full me-2 bg-green-500"></div>
				online
			</h5>
			<ul>
				<li className="mb-4">
					{player ? (
						<Button
							disabled={!isOnline}
							className="w-[200px] font-semibold text-md"
							onClick={() => navigate('/joining-room')}>
							<Users strokeWidth={2} size={20} className="me-2" />
							Friends
						</Button>
					) : (
						<Modal {...modalProps}>
							<Button
								disabled={!isOnline}
								className="w-[200px] font-semibold text-md"
								onClick={() => handleMode('friends')}>
								<Users strokeWidth={2} size={20} className="me-2" />
								Friends
							</Button>
						</Modal>
					)}
				</li>
				<li className="mb-4">
					{player ? (
						<Button
							disabled={!isOnline}
							className="w-[200px] font-semibold text-md"
							onClick={() => navigate('/finding-room')}>
							<Globe strokeWidth={2} size={20} className="me-2" />
							Multiplayer
						</Button>
					) : (
						<Modal {...modalProps}>
							<Button
								disabled={!isOnline}
								className="w-[200px] font-semibold text-md"
								onClick={() => handleMode('multiplayer')}>
								<Globe strokeWidth={2} size={20} className="me-2" />
								Multiplayer
							</Button>
						</Modal>
					)}
				</li>
			</ul>
			<h5 className="capitalize mt-8 mb-4 font-semibold">
				<div className="inline-flex w-3 h-3 rounded-full me-2 bg-slate-500"></div>
				offline
			</h5>
			<ul>
				<li className="mb-4">
					<Button
						className="w-[200px] font-semibold text-md uppercase"
						onClick={() => handleMode('pvp')}>
						<User strokeWidth={2} size={22} className="me-2" />
						pvp
					</Button>
				</li>
				<li className="mb-4">
					<Button
						className="w-[200px] font-semibold text-md"
						onClick={() => handleMode('bot')}>
						<Bot strokeWidth={2} size={22} className="me-2" />
						Bot
					</Button>
				</li>
			</ul>
		</section>
	);
};

export default Homepage;
