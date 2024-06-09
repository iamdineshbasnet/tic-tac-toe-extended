import React from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { useAppSelector } from '@/utils/hooks/appHooks';
import { profileSelector } from '@/pages/profile/redux/selector';
import { useNavigate } from 'react-router-dom';
const ProfileDropdown: React.FC = () => {
	const { player } = useAppSelector(profileSelector);
	const navigate = useNavigate();

	const handleNavigation = (name: string) => {
		navigate(`/${name}`);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className='overflow-hidden'>
					{player?.image ? (
						<img src={player.image} className='rounded-sm' />
					) : (
						<User className="absolute h-[1.2rem] w-[1.2rem] transition-all" />
					)}
					<span className="sr-only">Player profile</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => handleNavigation('account')}>
					My Account
				</DropdownMenuItem>
				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => handleNavigation('avatars')}>
					Change Avatar
				</DropdownMenuItem>
				{player?.isGuest ? (
					<DropdownMenuItem className="cursor-pointer">Save Account</DropdownMenuItem>
				) : (
					<DropdownMenuItem className="cursor-pointer">Logout</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
