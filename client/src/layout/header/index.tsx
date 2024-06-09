import { ModeToggle } from '@/components/mode-toggle';
import React, { useEffect } from 'react';
import ProfileDropdown from './dropdown/profile';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { getPlayer } from '@/pages/profile/redux/thunk';
import getCookie from '@/utils/cookies/getCookie';
import { LogIn } from 'lucide-react';
import { profileSelector } from '@/pages/profile/redux/selector';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate()
	const isAuthenticated = getCookie('accessToken');
	const { player } = useAppSelector(profileSelector);
	useEffect(() => {
		isAuthenticated && dispatch(getPlayer());
	}, [isAuthenticated]);
	return (
		<header className="flex justify-between items-center border-b border-neutral-500 h-[60px] px-4">
			<h3 className='font-semibold cursor-pointer' onClick={()=> navigate('/')}>TIC TAC TOE</h3>

			{/* <div className='flex items-center gap-4'>
        <Button className='font-semibold capitalize'>classic</Button>
        <Button className='font-semibold capitalize' variant="outline">ultimate</Button>
      </div> */}

			<div className="flex items-center gap-4">
				<ModeToggle />
				{player ? (
					<ProfileDropdown />
				) : (
					<Button size="icon" variant="outline">
						<LogIn className='absolute h-[1.2rem] w-[1.2rem] transition-all' />
					</Button>
				)}
			</div>
		</header>
	);
};

export default Header;
