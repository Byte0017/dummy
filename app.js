// App.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function App() {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState(null);

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/signup`, { email, password, role });
            alert('Signup successful! Please login.');
            setView('login');
        } catch (error) {
            alert(error.response?.data?.error || 'Signup failed');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            setTempToken(res.data.tempToken);
            alert('OTP sent to your email');
            setView('otp');
        } catch (error) {
            alert(error.response?.data?.error || 'Login failed');
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/verify-otp`, { otp, tempToken });
            localStorage.setItem('token', res.data.token);
            alert(`Login successful as ${res.data.role}`);
            // Redirect to dashboard or protected route
        } catch (error) {
            alert(error.response?.data?.error || 'OTP verification failed');
        }
    };

    return (
        <div>
            {view === 'signup' && (
                <form onSubmit={handleSignup}>
                    <h2>Signup</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit">Sign Up</button>
                    <p onClick={() => setView('login')}>Already have an account? Login</p>
                </form>
            )}

            {view === 'login' && (
                <form onSubmit={handleLogin}>
                    <h2>Login</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Send OTP</button>
                    <p onClick={() => setView('signup')}>Create new account</p>
                </form>
            )}

            {view === 'otp' && (
                <form onSubmit={verifyOtp}>
                    <h2>Enter OTP</h2>
                    <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    <button type="submit">Verify OTP</button>
                </form>
            )}
        </div>
    );
}

export default App;
