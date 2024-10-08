import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { useAppDispatch, useAppSelector } from '@/utils/hooks/appHooks';
import { createGuest } from '../auth/redux/thunk';
import { getPlayer } from '../profile/redux/thunk';
import { socket } from '@/socket';
import { authSelector } from '../auth/redux/selector';
import { roomSelector } from '../room/redux/selector';

interface CreateUserProps {
	setModal: Dispatch<SetStateAction<boolean>>;
}
const CreateUser: React.FC<CreateUserProps> = ({ setModal }) => {
	const dispatch = useAppDispatch();
	const { loadingGuestRegistration } = useAppSelector(authSelector);
	const { mode } = useAppSelector(roomSelector);
	const initialState = {
		name: '',
	};

	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { id } = useParams();
	const handleSubmit = (values: { name: string }) => {
		dispatch(createGuest(values))
			.unwrap()
			.then((res) => {
				console.log(mode, 'mode')
				if (mode === 'friends') {
					if (pathname.includes('/waiting-room/')) {
						socket.emit('join_room', {roomId:id, player: res.result});
						socket.on('room_joined', (details)=>{
							navigate(`/waiting-room/${details?.roomId}`);
						});
						
					} else {
						res?.accessToken && navigate('/joining-room');
					}
				} else if (mode === 'multiplayer') {
					navigate('/finding-room');
				}
				dispatch(getPlayer());
				setModal(false);
			})
			.catch((error) => {
				console.log(error, 'error');
			});
	};
	return (
		<section>
			<Formik initialValues={initialState} enableReinitialize={true} onSubmit={handleSubmit}>
				{(formik) => {
					const { values } = formik;
					return (
						<Form>
							<Input
								id="name"
								placeholder="Nickname"
								value={values.name}
								onChange={(e) => {
									const target = e.target as HTMLInputElement;
									formik.setFieldValue('name', target.value);
								}}
								className="text-2xl text-center font-semibold my-6 py-6 tracking-wider"
								autoComplete="false"
							/>
							<div className="text-right mt-8">
								<Button
									type="submit"
									loading={loadingGuestRegistration}
									disabled={!values.name}
									className="px-6 font-semibold text-md">
									Continue
								</Button>
							</div>
						</Form>
					);
				}}
			</Formik>
		</section>
	);
};

export default CreateUser;
