import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { useAppDispatch } from '@/utils/hooks/appHooks';
import { createGuest } from '../auth/redux/thunk';

const CreateUser: React.FC = () => {
	const dispatch = useAppDispatch();
	const initialState = {
		name: '',
	};

	const navigate = useNavigate();

	const handleSubmit = (values: { name: string }) => {
		dispatch(createGuest(values))
			.unwrap()
			.then((res) => {
				res?.accessToken && navigate('/joining-room');
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
								<Button type="submit" className="px-6 font-semibold text-md">
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
