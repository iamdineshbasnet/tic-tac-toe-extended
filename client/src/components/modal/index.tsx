import React, { Dispatch, SetStateAction } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

interface ModalProps {
	title: string;
	description?: string;
	body?: React.ReactNode;
	children: React.ReactNode;
	showModal: boolean;
	setShowModal?: Dispatch<SetStateAction<boolean>>;
}

const Modal: React.FC<ModalProps> = ({ title, description, children, body, showModal }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			{showModal && (
				<DialogOverlay>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription>{description}</DialogDescription>
						</DialogHeader>
						{/* body */}
						{body}
					</DialogContent>
				</DialogOverlay>
			)}
		</Dialog>
	);
};

export default Modal;
