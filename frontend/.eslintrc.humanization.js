/**
 * ESLint Configuration with Humanization Rules
 * Based on PROJECT_RULES_V3.md Section 0.1
 *
 * Aplica regras diferentes conforme criticidade do código:
 * - 🔴 Código Crítico: Regras rigorosas, ZERO tolerância
 * - 🟡 Código Importante: Regras moderadas
 * - 🟢 Código Normal: Permite humanização
 */

module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'eslint:recommended'],

  // Configuração padrão (moderada)
  rules: {
    'eqeqeq': 'warn',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },

  overrides: [
    // ═══════════════════════════════════════════════════════════════
    // 🔴 NÍVEL CRÍTICO - ZERO HUMANIZAÇÃO
    // ═══════════════════════════════════════════════════════════════
    {
      files: [
        // Interação com Blockchain
        'lib/siwe.ts',
        'lib/contracts.ts',
        'lib/web3.ts',

        // Hooks Críticos
        'hooks/useContract.ts',
        'hooks/useProofs.ts',
        'hooks/useAuth.ts',

        // Páginas com Fundos
        'app/withdraw/**/*.{ts,tsx}',
        'app/admin/**/*.{ts,tsx}',

        // Componentes Críticos
        'components/WithdrawForm.tsx',
        'components/ProofSubmission.tsx',
      ],
      rules: {
        // Rigoroso - ZERO tolerância
        'eqeqeq': ['error', 'always'], // força ===
        'no-console': 'error', // sem console.log
        'no-unused-vars': 'error', // sem código morto
        'no-warning-comments': ['error', {
          terms: ['TODO', 'FIXME', 'HACK'],
          location: 'anywhere'
        }], // bloqueia TODOs
        'prefer-const': 'error',
        'no-var': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',

        // TypeScript rigoroso
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-unused-vars': 'error',
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🟡 NÍVEL IMPORTANTE - HUMANIZAÇÃO MÍNIMA
    // ═══════════════════════════════════════════════════════════════
    {
      files: [
        'app/dashboard/**/*.{ts,tsx}',
        'app/mt5/dashboard/**/*.{ts,tsx}',
        'app/transparency/**/*.{ts,tsx}',
        'components/MT5SummaryCard.tsx',
        'components/DashboardStats.tsx',
      ],
      rules: {
        'eqeqeq': 'warn', // prefere ===, mas tolera ==
        'no-console': 'warn', // avisa sobre console.log
        'no-unused-vars': 'warn',
        'no-warning-comments': ['warn', {
          terms: ['FIXME', 'HACK'], // permite TODO, bloqueia HACK
          location: 'anywhere'
        }],
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🟢 NÍVEL NORMAL - HUMANIZAÇÃO PERMITIDA
    // ═══════════════════════════════════════════════════════════════
    {
      files: [
        // Landing page e UI pura
        'app/page.tsx',
        'app/layout.tsx',
        'app/register/page.tsx',

        // Componentes UI não-críticos
        'components/Logo.tsx',
        'components/ConnectButton.tsx',
        'components/Footer.tsx',
        'components/Header.tsx',
        'components/LandingHero.tsx',

        // Simulações (não usa dados reais)
        'app/simulations/**/*.{ts,tsx}',
      ],
      rules: {
        // Relaxado - humanização permitida
        'eqeqeq': 'off', // permite == e ===
        'no-console': 'off', // permite console.log (será removido em build)
        'no-unused-vars': 'warn', // apenas avisa
        'no-warning-comments': 'off', // permite TODOs

        // TypeScript flexível
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // 🧪 TESTES - Regras específicas
    // ═══════════════════════════════════════════════════════════════
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '__tests__/**/*.{ts,tsx}',
      ],
      rules: {
        'no-console': 'off', // permite console em testes
        '@typescript-eslint/no-explicit-any': 'off', // permite any em mocks
      }
    },
  ],

  // Configurações TypeScript
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },

  env: {
    browser: true,
    es2021: true,
    node: true
  }
};
