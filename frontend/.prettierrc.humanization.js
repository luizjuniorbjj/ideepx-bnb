/**
 * Prettier Configuration with Humanization Support
 * Based on PROJECT_RULES_V3.md Section 0.1
 *
 * Configuração flexível que permite "micro-inconsistências"
 * em arquivos humanizados, mas mantém formatação em código crítico
 */

module.exports = {
  // Configuração base (padrão Next.js)
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,

  // Permite alguma flexibilidade
  printWidth: 100, // mais generoso que 80
  arrowParens: 'avoid', // menos verboso

  // Configurações para React/TypeScript
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // Ignora arquivos onde humanização é permitida
  overrides: [
    {
      // Código crítico - formatação rigorosa
      files: [
        'lib/siwe.ts',
        'lib/contracts.ts',
        'hooks/useContract.ts',
        'hooks/useProofs.ts',
        'app/withdraw/**/*.{ts,tsx}',
      ],
      options: {
        printWidth: 80, // mais restrito
        trailingComma: 'all', // sempre vírgula final
        semi: true,
        singleQuote: true,
      }
    },
    {
      // Código humanizado - formatação flexível
      files: [
        'app/page.tsx',
        'components/Logo.tsx',
        'components/ConnectButton.tsx',
        'app/simulations/**/*.{ts,tsx}',
      ],
      options: {
        // Permite que desenvolvedor escolha estilo
        // Prettier não vai reformatar agressivamente
        requirePragma: false, // mas não exige @prettier
        insertPragma: false,
      }
    }
  ]
};
