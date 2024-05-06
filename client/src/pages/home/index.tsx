import { Button } from '@/components/ui/button';
import { setMode, setRound } from '@/redux/slice';
import { useAppDispatch } from '@/utils/hooks/appHooks';
import { Bot, Globe, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateUser from './create';
import Modal from '@/components/modal';

const Homepage: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [showModal, setShowModal] = useState<boolean>(false);
	
	const handleMode = (mode: string) => {
		switch (mode) {
			case 'friends':
				break;
			case 'multiplayer':
				break;
			case 'pvp':
				dispatch(setMode('pvp'));
				break;
			case 'bot':
				dispatch(setMode('bot'));
				break;
			default:
				break;
		}
		dispatch(setRound(1));
		navigate('/playground');
	};

	const modalProps = {
		title: 'Who are you?',
		body: <CreateUser />,
		showModal: showModal,
	};
	return (
		<section className="text-center mt-12">
			<h5 className="capitalize mt-4 mb-4 font-semibold">
				<div className="inline-flex w-3 h-3 rounded-full me-2 bg-green-500"></div>
				online
			</h5>
			<ul>
				<li className="mb-4">
					<Modal {...modalProps}>
						<Button
							className="w-[200px] font-semibold text-md"
							onClick={() => setShowModal(true)}>
							<Users strokeWidth={2} size={20} className="me-2" />
							Friends
						</Button>
					</Modal>
				</li>
				<li className="mb-4">
					<Modal {...modalProps}>
						<Button className="w-[200px] font-semibold text-md" onClick={() => setShowModal(true)}>
							<Globe strokeWidth={2} size={20} className="me-2" />
							Multiplayer
						</Button>
					</Modal>
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
