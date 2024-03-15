import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.Fragment>
		<App />
		<ToastContainer />
	</React.Fragment>
);
