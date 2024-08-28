import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import React, { useEffect, useState } from 'react';
import { profileSelector } from '../redux/selector';
import Modal from '@/components/modal';
import { DialogClose } from '@/components/ui/dialog';
import { deletePlayer, updatePlayer } from '../redux/thunk';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const MyAccount: React.FC = () => {
	const dispatch = useAppDispatch();
	const { player, loadingUpdatePlayer, loadingDeletePlayer } = useAppSelector(profileSelector);
	const [displayName, setDisplayName] = useState<string>('');
	const [showModal, setShowModal] = useState<boolean>(false);
	const navigate = useNavigate();
	const handleDisplayName = (e: React.ChangeEvent) => {
		const target = e.target as HTMLInputElement;
		setDisplayName(target.value);
	};

	const { toast } = useToast();
	useEffect(() => {
		player && setDisplayName(player.name);
	}, [player]);

	const handleDeletePlayer = () => {
		dispatch(deletePlayer())
			.unwrap()
			.then(() => {
				navigate('/');
				toast({
					duration: 3000,
					title: 'Deleted Successfully',
					description: 'The player has been successfully deleted.',
				});
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
	const Body = () => {
		return (
			<footer className="flex justify-end gap-3 mt-10">
				<DialogClose asChild>
					<Button size="sm" variant="outline" onClick={() => setShowModal(false)}>
						Cancel
					</Button>
				</DialogClose>
				<Button
					size="sm"
					className="min-w-[120px]"
					variant="destructive"
					loading={loadingDeletePlayer}
					onClick={handleDeletePlayer}>
					Delete Account
				</Button>
			</footer>
		);
	};

	const modalProps = {
		title: 'Are you sure want to continue ?',
		showModal: showModal,
		setShowModal: setShowModal,
		body: <Body />,
	};

	const handleUpdatePlayer = () => {
		dispatch(updatePlayer({ name: displayName }))
			.unwrap()
			.then(() => {
				toast({
					duration: 3000,
					title: 'Updated Successfully',
					description: 'The player information has been updated.',
				});
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

	const handleBlur = () => {
		if (!displayName) {
			player && setDisplayName(player.name);
		}
	};
	return (
		<section className="text-center mt-12 px-4">
			<div className="max-w-[500px] mx-auto text-left">
				<h3 className="font-semibold text-xl">My Account</h3>
				<div className="grid items-center gap-1.5 mt-8">
					<Label htmlFor="displayName" className={`mb-2`}>
						Display Name *
					</Label>
					<Input
						type="text"
						id="displayName"
						onBlur={handleBlur}
						placeholder="Display Name"
						value={displayName}
						onChange={handleDisplayName}
					/>
					<p className="text-gray-500 mt-2 text-sm">This is your public display name.</p>
					<Button
						className="max-w-[100px] mt-3 text-base"
						onClick={handleUpdatePlayer}
						disabled={!displayName}
						loading={loadingUpdatePlayer}>
						Update
					</Button>

					<section className="mt-16">
						<h3 className="font-semibold text-xl">Delete Account</h3>
						<p className="text-gray-500 mt-2 text-wrap">
							Deleting an account permanently removes your account. This action cannot
							be undone.
						</p>
						<Modal {...modalProps}>
							<Button
								className="mt-3"
								variant="destructive"
								onClick={() => setShowModal(true)}>
								Delete account
							</Button>
						</Modal>
					</section>
				</div>
			</div>
		</section>
	);
};

export default MyAccount;
