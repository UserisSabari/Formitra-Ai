import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Professional error logging service integration point
        console.error("UI Error Caught by Boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="card max-w-md w-full p-8 text-center space-y-6 animate-fade-in shadow-large border-red-100">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                            <p className="text-gray-500 text-sm">
                                We've encountered an unexpected error. Our team has been notified.
                            </p>
                        </div>

                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-xs text-left overflow-auto max-h-32 border border-red-100">
                            <code>{this.state.error?.toString() || 'Unknown Runtime Error'}</code>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => window.location.reload()} 
                                className="btn btn-primary flex-1"
                            >
                                <RefreshCw size={18} />
                                Reload Session
                            </button>
                            <button 
                                onClick={() => window.location.href = '/'} 
                                className="btn btn-secondary flex-1"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
