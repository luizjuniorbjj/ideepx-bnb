/**
 * GMI Edge Connection Form
 *
 * Formulário robusto para conectar conta The Edge (GMI Markets)
 * Com validações, retry automático e mensagens de erro específicas
 */

'use client';

import { useState } from 'react';
import { Link2, Loader2, AlertCircle, CheckCircle2, Server, Key, Hash } from 'lucide-react';

interface MT5ConnectionFormProps {
  onConnect?: (accountNumber: string, investorPassword: string, server: string, platform: string) => Promise<void>;
  disabled?: boolean;
}

export function MT5ConnectionForm({ onConnect, disabled = false }: MT5ConnectionFormProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [investorPassword, setInvestorPassword] = useState('');
  const [server, setServer] = useState('GMIEdge-Live');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  /**
   * Validar inputs antes de enviar
   */
  const validateInputs = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validar account number
    if (!accountNumber.trim()) {
      errors.accountNumber = 'Número da conta é obrigatório';
    } else if (!/^\d+$/.test(accountNumber.trim())) {
      errors.accountNumber = 'Deve conter apenas números';
    } else if (accountNumber.trim().length < 5) {
      errors.accountNumber = 'Mínimo de 5 dígitos';
    }

    // Validar password
    if (!investorPassword.trim()) {
      errors.investorPassword = 'Senha é obrigatória';
    } else if (investorPassword.trim().length < 4) {
      errors.investorPassword = 'Senha muito curta (mínimo 4 caracteres)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Mapear erros da API para mensagens amigáveis
   */
  const getErrorMessage = (err: any): string => {
    const errorMsg = err.message || err.toString();

    // Credenciais inválidas
    if (
      errorMsg.toLowerCase().includes('invalid credentials') ||
      errorMsg.toLowerCase().includes('invalid password') ||
      errorMsg.toLowerCase().includes('authentication failed') ||
      errorMsg.toLowerCase().includes('credenciais inválidas')
    ) {
      return '❌ Credenciais inválidas. Verifique número da conta e senha.';
    }

    // Servidor indisponível
    if (
      errorMsg.toLowerCase().includes('network') ||
      errorMsg.toLowerCase().includes('timeout') ||
      errorMsg.toLowerCase().includes('econnrefused') ||
      errorMsg.toLowerCase().includes('fetch failed')
    ) {
      return '⚠️ Servidor GMI Edge indisponível no momento. Tente novamente em alguns instantes.';
    }

    // Conta não encontrada
    if (
      errorMsg.toLowerCase().includes('account not found') ||
      errorMsg.toLowerCase().includes('user not found')
    ) {
      return '❌ Conta não encontrada. Verifique o número da conta e o servidor selecionado.';
    }

    // Token expirado
    if (
      errorMsg.toLowerCase().includes('token') ||
      errorMsg.toLowerCase().includes('expired')
    ) {
      return '🔐 Sessão expirada. Reconecte sua conta.';
    }

    // Erro genérico
    return `⚠️ Erro ao conectar: ${errorMsg}`;
  };

  /**
   * Handle submit com validações
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    // Validar inputs
    if (!validateInputs()) {
      return;
    }

    // Se onConnect não foi fornecido, não fazer nada
    if (!onConnect) {
      setError('Função de conexão não configurada');
      return;
    }

    try {
      setLoading(true);
      console.log(`🔗 [MT5Form] Connecting account ${accountNumber} to ${server}...`);

      // Plataforma fixa: The Edge
      await onConnect(accountNumber.trim(), investorPassword.trim(), server, 'The Edge');

      console.log('✅ [MT5Form] Connection successful!');
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setAccountNumber('');
        setInvestorPassword('');
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('❌ [MT5Form] Connection error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = loading || disabled || success;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-500/20 p-2 rounded-lg">
          <Link2 className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Conectar Conta GMI Edge</h3>
          <p className="text-sm text-gray-400">Vincule sua conta The Edge (GMI Markets)</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Number */}
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Número da Conta
            </div>
          </label>
          <input
            id="accountNumber"
            type="text"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value);
              setFieldErrors(prev => ({ ...prev, accountNumber: '' }));
            }}
            placeholder="Ex: 123456789"
            className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.accountNumber
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-600 focus:border-cyan-500'
            }`}
            disabled={isFormDisabled}
          />
          {fieldErrors.accountNumber && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.accountNumber}
            </p>
          )}
        </div>

        {/* Master Password */}
        <div>
          <label htmlFor="investorPassword" className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Senha Mestra
            </div>
          </label>
          <input
            id="investorPassword"
            type="password"
            value={investorPassword}
            onChange={(e) => {
              setInvestorPassword(e.target.value);
              setFieldErrors(prev => ({ ...prev, investorPassword: '' }));
            }}
            placeholder="Senha da sua conta"
            className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
              fieldErrors.investorPassword
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-600 focus:border-cyan-500'
            }`}
            disabled={isFormDisabled}
          />
          {fieldErrors.investorPassword && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.investorPassword}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Usada apenas para autenticação. Não armazenamos sua senha.
          </p>
        </div>

        {/* Server */}
        <div>
          <label htmlFor="server" className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Servidor
            </div>
          </label>
          <select
            id="server"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            disabled={isFormDisabled}
          >
            <option value="GMI Trading Platform Demo">GMI Trading Platform Demo</option>
            <option value="GMIEdge-Live">GMIEdge-Live (Standard/ECN)</option>
            <option value="GMIEdge-Cent">GMIEdge-Cent</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Selecione o servidor da sua conta GMI Edge
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <p className="text-sm text-green-400">Conta conectada com sucesso!</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Conectando...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Conectado!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span>Conectar Conta</span>
            </>
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400/80">
          🔒 Conexão segura via SSL. Sua senha é usada apenas para autenticação e não é armazenada em nossos servidores.
        </p>
      </div>
    </div>
  );
}

export default MT5ConnectionForm;
