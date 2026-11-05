import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBookReader } from 'react-icons/fa';

const Login = ({ onLoginSuccess, setIsLoggedIn }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        fetch('https://localhost:7108/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Email və ya şifrə yanlışdır');
                }
                return response.json();
            })
            .then((data) => {
                toast.success('Uğurla daxil oldunuz!');
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userId', data.user.id);
                sessionStorage.setItem('role', data.user.role);

                if (onLoginSuccess) {
                    onLoginSuccess(data.user.role);
                } else if (setIsLoggedIn) {
                    setIsLoggedIn(true);
                }

                if (data.user.role === 'Admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/home');
                }
            })
            .catch((error) => {
                console.error('Xəta:', error);
                toast.error(error.message || 'Daxilolma zamanı xəta baş verdi!');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E232E 0%, #351C26 50%, #63233A 100%)',
            padding: '20px',
            position: 'relative'
        }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '44px 40px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Header / Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        marginBottom: '16px',
                        boxShadow: '0 4px 14px rgba(123, 45, 74, 0.15)'
                    }}>
                        <FaBookReader />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '8px' }}>
                        Xoş Gəlmisiniz
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Hesabınıza daxil olaraq kitabları kəşf edin
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '8px' }}>
                            Email Ünvanı
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FaEnvelope style={{
                                position: 'absolute',
                                left: '14px',
                                color: 'var(--text-muted)',
                                fontSize: '1rem'
                            }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="adiniz@example.com"
                                required
                                className="input-modern"
                                style={{ paddingLeft: '42px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '8px' }}>
                            Şifrə
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FaLock style={{
                                position: 'absolute',
                                left: '14px',
                                color: 'var(--text-muted)',
                                fontSize: '1rem'
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="input-modern"
                                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary-custom"
                        style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
                    >
                        {isSubmitting ? 'Daxil olunur...' : 'Daxil Ol'}
                    </button>
                </form>

                {/* Footer link to Register */}
                <div style={{
                    marginTop: '28px',
                    textAlign: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.92rem',
                    color: 'var(--text-body)'
                }}>
                    Hesabınız yoxdur?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        Qeydiyyatdan keçin
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
