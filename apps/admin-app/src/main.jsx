import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from '../../../shared/components/Toast.jsx';
import { AuthProvider } from '../../../shared/utils/auth.jsx';
import { RxDBProvider } from './utils/rxdb-hooks.jsx';
import '../../../shared/components/LiquidGlass.css';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider defaultRole="admin">
                <RxDBProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </RxDBProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
