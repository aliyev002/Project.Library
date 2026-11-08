import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBookReader } from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';
import { loginUser } from '../Api/authApi';

const Login = () => {
    const { login } = useAuth();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = await loginUser(formData);
            toast.success('Uğurla daxil oldunuz!');
            login(data.token, data.user);

            if (data.user?.role === 'Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Xəta:', error);
            const msg = error.response?.data?.message || 'Email və ya şifrə yanlışdır!';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
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
