import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/utils/hooks/appHooks';
import React, { useEffect, useState } from 'react';
import { profileSelector } from '../redux/selector';
import Modal from '@/components/modal';
import { DialogClose } from '@/components/ui/dialog';

const MyAccount: React.FC = () => {
	const { player } = useAppSelector(profileSelector);
	const [displayName, setDisplayName] = useState<string>('');
	const [showModal, setShowModal] = useState<boolean>(false);

	const handleDisplayName = (e: React.ChangeEvent) => {
		const target = e.target as HTMLInputElement;
		setDisplayName(target.value);
	};

	useEffect(() => {
		player && setDisplayName(player.name);
	}, [player]);

	const Body = () => {
		return (
			<footer className="flex justify-end gap-3 mt-10">
        <DialogClose asChild>
				<Button size="sm" variant="outline" onClick={() => setShowModal(false)}>
					Cancel
				</Button>
        </DialogClose>
				<Button size="sm" variant="destructive">
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

	return (
		<section className="text-center mt-12">
			<div className="w-[500px] mx-auto text-left">
				<h3 className="font-semibold text-xl">My Account</h3>
				<div className="grid items-center gap-1.5 mt-8">
					<Label htmlFor="displayName" className="mb-2">
						Display Name *
					</Label>
					<Input
						type="text"
						id="displayName"
						placeholder="Display Name"
						value={displayName}
						onChange={handleDisplayName}
					/>
					<p className="text-gray-500 mt-2 text-sm">This is your public display name.</p>
					<Button className="max-w-[100px] mt-3 text-base">Update</Button>

					<section className="mt-16">
						<h3 className="font-semibold text-xl">Delete Account</h3>
						<p className="text-gray-500 mt-2">
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
