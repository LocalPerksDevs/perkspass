import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route }
	from 'react-router-dom';
import Home from './pages';
import AddVendor from './pages/add-vendor';
import SignIn from './pages/sign-in';
import Dashboard from './pages/dashboard';
import AddUser from './pages/add-user';
import VendorProfile from './pages/vendor-profile';
import Privacy from './pages/privacy';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/perkspass' exact element={<Home />} />
				<Route path='/perkspass/add-vendor' element={<AddVendor />} />
        		<Route path='/perkspass/sign-in' element={<SignIn />} />
				<Route path='/perkspass/dashboard' element={<Dashboard />} />
				<Route path='/perkspass/add-user' element={<AddUser />} />
				<Route path='/perkspass/vendor-profile/:id' element={<VendorProfile />} />
				<Route path='/perkspass/privacy' element={<Privacy />} />
			</Routes>
		</Router>
	);
}

export default App;
