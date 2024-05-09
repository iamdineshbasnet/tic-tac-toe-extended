import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateUser: React.FC = () => {

  const navigate = useNavigate()

	const handleSubmit = () =>{
		navigate('/waiting-room')
	}
	return (
		<section>
			<Input id="name" placeholder="Nickname" className="text-2xl text-center font-semibold my-6 py-6 tracking-wider" autoComplete='false' />
			<div className="text-right mt-8">
				<Button type="submit" className='px-6 font-semibold text-md' onClick={handleSubmit}>Continue</Button>
			</div>
		</section>
	);
};

export default CreateUser;
