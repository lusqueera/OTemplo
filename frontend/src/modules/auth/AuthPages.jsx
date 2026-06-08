import React, { useState } from 'react';
import { useAuthStore } from 'src/store/stores';
import { useToastStore } from 'src/store/toastStore';
import { Eye, EyeOff, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export function LoginPage({ onSwitch }) {
  const { login } = useAuthStore();
  const toast = useToastStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Preencha todos os campos'); toast.error('Preencha todos os campos'); return; }
    setLoading(true); setError('');
    const result = await login(form);
    setLoading(false);
    if (result.error) { setError(result.error); toast.error(result.error); }
    else { toast.success('Login realizado com sucesso!'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-container animate-in">
        <div className="auth-logo">
          <div className="logo-text" style={{ fontSize: 20 }}>O Templo</div>
        </div>
        <p className="auth-subtitle">Acesse seu sistema operacional pessoal</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input auth-input"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="operador@otemplo.io"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="auth-pw-wrapper">
              <input
                className="input auth-input"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Autenticando...' : <><LogIn size={16} /> Entrar</>}
          </button>
        </form>

        <div className="auth-footer">
          <span>Não tem uma conta?</span>
          <button className="auth-link" onClick={onSwitch}>
            Criar conta <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="auth-line auth-line-1" />
        <div className="auth-line auth-line-2" />
        <div className="auth-line auth-line-3" />
      </div>
    </div>
  );
}

export function RegisterPage({ onSwitch }) {
  const { register } = useAuthStore();
  const toast = useToastStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos'); toast.error('Preencha todos os campos'); return; }
    if (form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); toast.error('Senha deve ter pelo menos 6 caracteres'); return; }
    if (form.password !== form.confirmPassword) { setError('Senhas não coincidem'); toast.error('Senhas não coincidem'); return; }
    setLoading(true); setError('');
    const result = await register(form);
    setLoading(false);
    if (result.error) { setError(result.error); toast.error(result.error); }
    else { toast.success('Conta criada com sucesso!', 'Bem-vindo'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-container animate-in">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 48, height: 48, fontSize: 18 }}>T</div>
          <div className="logo-text" style={{ fontSize: 20 }}>O Templo</div>
        </div>
        <p className="auth-subtitle">Crie sua conta e inicie suas operações</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Nome</label>
            <input
              className="input auth-input"
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input auth-input"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="operador@coreos.io"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="auth-pw-wrapper">
              <input
                className="input auth-input"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 caracteres"
                autoComplete="new-password"
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirmar Senha</label>
            <input
              className="input auth-input"
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Criando conta...' : <><UserPlus size={16} /> Criar Conta</>}
          </button>
        </form>

        <div className="auth-footer">
          <span>Já tem uma conta?</span>
          <button className="auth-link" onClick={onSwitch}>
            Entrar <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="auth-line auth-line-1" />
        <div className="auth-line auth-line-2" />
        <div className="auth-line auth-line-3" />
      </div>
    </div>
  );
}
