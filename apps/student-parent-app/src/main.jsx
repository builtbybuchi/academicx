import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from 'shared/components/Toast.jsx';
import { AuthProvider } from 'shared/utils/auth.jsx';
import 'shared/components/LiquidGlass.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider defaultRole="student">
                <ToastProvider>
                    <App />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
