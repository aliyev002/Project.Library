import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import { registerUser } from '../Api/authApi';

const Auth = () => {
    const [formData, setFormData] = useState({
        fullName: '',
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
            await registerUser(formData);
            toast.success('Qeydiyyat uğurla tamamlandı! İndi daxil ola bilərsiniz.');
            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (error) {
            console.error('Xəta:', error);
            const msg = error.response?.data?.message || (Array.isArray(error.response?.data?.errors) ? error.response.data.errors[0]?.description : 'Qeydiyyat zamanı xəta baş verdi.');
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
                maxWidth: '460px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '44px 40px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Header */}
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
                        <FaUserPlus />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '8px' }}>
                        Yeni Hesab Yarat
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Kitabxanamıza qoşulun və dərhal oxumağa başlayın
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '8px' }}>
                            Ad və Soyad
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FaUser style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Məs: Əli Məmmədov"
                                required
                                className="input-modern"
                                style={{ paddingLeft: '42px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '8px' }}>
                            Email Ünvanı
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="adiniz@gmail.com"
                                required
                                className="input-modern"
                                style={{ paddingLeft: '42px' }}
                            />
                        </div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            Yalnız gmail.com, outlook.com və mail.ru qəbul edilir
                        </small>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '8px' }}>
                            Şifrə
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FaLock style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ən azı 6 simvol"
                                required
                                minLength={6}
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
                        {isSubmitting ? 'Qeydiyyat aparılır...' : 'Qeydiyyatdan Keç'}
                    </button>
                </form>

                {/* Footer link to Login */}
                <div style={{
                    marginTop: '28px',
                    textAlign: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.92rem',
                    color: 'var(--text-body)'
                }}>
                    Artıq hesabınız var?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        Daxil olun
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Auth;
