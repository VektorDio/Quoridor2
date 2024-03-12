import React, { ErrorInfo, ReactNode } from 'react';

import { toast, Bounce } from 'react-toastify';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('Error caught by ErrorBoundary:', error, errorInfo);
		this.setState({ hasError: true, error });
	}

	render() {
		if (this.state.hasError) {
			toast.error(this.state.error?.message, {
				position: 'bottom-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
				transition: Bounce
			});
			return this.props.children;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
