import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/home';
import Layout from './layout';
import Playground from './pages/room/playground';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './utils/store';
import { Provider } from 'react-redux';
import WaitingRoom from './pages/room/waitingRoom';
import JoiningRoom from './pages/room/joiningRoom';
import FindingRoom from './pages/room/finding';
function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Provider store={store}>
				<PersistGate persistor={persistor}>
					<Layout>
						<Router>
							<Routes>
								<Route path="/" element={<Homepage />} />
								<Route path="/playground/:id" element={<Playground />} />
								<Route path="/waiting-room/:id" element={<WaitingRoom />} />
								<Route path="/joining-room" element={<JoiningRoom />} />
								<Route path="/finding-room" element={<FindingRoom />} />
							</Routes>
						</Router>
					</Layout>
				</PersistGate>
			</Provider>
		</ThemeProvider>
	);
}

export default App;
