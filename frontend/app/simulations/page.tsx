'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface Simulation {
  id: string;
  timestamp: string;
  totalClients: number;
  totalCapital: string;
  poolMlm: string;
  topId: number;
  topName: string;
  topWallet: string | null;
  topLevel: number;
  topDirect: number;
  topNetwork: number;
  topDepth: number;
  topCommission: string;
  topLai: string;
  topProfit: string;
  topRoi: string;
  topStatus: string;
  totalCommissions: string;
  maxNetwork: number;
  perfectDistribution: boolean;
  registeredBackend: number;
  files: any;
  distribution: any;
  createdAt: string;
}

interface SimulationStats {
  totalSimulations: number;
  avgClients: number;
  avgRoi: string;
  maxRoi: {
    value: string;
    simulationId: string;
    timestamp: string;
  };
  totalCapitalSimulated: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [latestSim, setLatestSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'latest' | 'all' | 'stats'>('latest');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch latest, all simulations, and stats in parallel
      const [latestRes, allRes, statsRes] = await Promise.all([
        fetch('http://localhost:5001/api/simulations/latest'),
        fetch('http://localhost:5001/api/simulations?limit=10'),
        fetch('http://localhost:5001/api/simulations/stats'),
      ]);

      if (!latestRes.ok || !allRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch simulations');
      }

      const latestData = await latestRes.json();
      const allData = await allRes.json();
      const statsData = await statsRes.json();

      if (latestData.success && latestData.data) {
        // Parse JSON fields
        const parsedLatest = {
          ...latestData.data,
          files: typeof latestData.data.files === 'string'
            ? JSON.parse(latestData.data.files)
            : latestData.data.files,
          distribution: typeof latestData.data.distribution === 'string'
            ? JSON.parse(latestData.data.distribution)
            : latestData.data.distribution,
        };
        setLatestSim(parsedLatest);
      }

      if (allData.success && allData.data?.simulations) {
        const parsedSims = allData.data.simulations.map((sim: any) => ({
          ...sim,
          files: typeof sim.files === 'string' ? JSON.parse(sim.files) : sim.files,
          distribution: typeof sim.distribution === 'string'
            ? JSON.parse(sim.distribution)
            : sim.distribution,
        }));
        setSimulations(parsedSims);
      }

      if (statsData.success && statsData.data) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Error fetching simulations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load simulations');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lucrativo':
        return 'text-green-400';
      case 'equilibrio':
        return 'text-yellow-400';
      case 'prejuizo':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Carregando simulações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">Erro ao Carregar</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Certifique-se que o backend está rodando na porta 5001
          </p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Simulações MLM
          </h1>
          <p className="text-gray-400">
            Visualize os resultados das simulações de rede multinível
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Total de Simulações</div>
              <div className="text-3xl font-bold text-white">
                {stats.totalSimulations}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Média de Clientes</div>
              <div className="text-3xl font-bold text-white">
                {stats.avgClients.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">ROI Médio</div>
              <div className="text-3xl font-bold text-purple-400">
                {parseFloat(stats.avgRoi).toFixed(1)}x
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Capital Simulado</div>
              <div className="text-3xl font-bold text-green-400">
                {formatCurrency(stats.totalCapitalSimulated)}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('latest')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'latest'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📌 Última Simulação
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📋 Todas
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'stats'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📈 Estatísticas
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* LATEST TAB */}
          {activeTab === 'latest' && latestSim && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Simulação Mais Recente
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {formatDate(latestSim.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">ID</div>
                  <div className="text-xs text-purple-400 font-mono">
                    {latestSim.id.substring(0, 8)}...
                  </div>
                </div>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total de Clientes</div>
                  <div className="text-2xl font-bold text-white">
                    {latestSim.totalClients.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Capital Total</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(latestSim.totalCapital)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Pool MLM Mensal</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(latestSim.poolMlm)}
                  </div>
                </div>
              </div>

              {/* TOP Performer */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🏆</span>
                  TOP Performer (ROOT)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Nome</div>
                    <div className="text-white font-semibold">{latestSim.topName}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Wallet</div>
                    <div className="text-purple-400 font-mono text-sm">
                      {latestSim.topWallet
                        ? `${latestSim.topWallet.substring(0, 6)}...${latestSim.topWallet.substring(38)}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Diretos</div>
                    <div className="text-white font-semibold">{latestSim.topDirect}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Rede Total</div>
                    <div className="text-white font-semibold">
                      {latestSim.topNetwork.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Profundidade</div>
                    <div className="text-white font-semibold">
                      {latestSim.topDepth} níveis
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Comissão</div>
                    <div className="text-green-400 font-bold">
                      {formatCurrency(latestSim.topCommission)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">LAI Mensal</div>
                    <div className="text-white font-semibold">
                      ${latestSim.topLai}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Lucro Líquido</div>
                    <div className="text-green-400 font-bold">
                      {formatCurrency(latestSim.topProfit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">ROI</div>
                    <div className="text-purple-400 font-bold text-xl">
                      {parseFloat(latestSim.topRoi).toFixed(1)}x
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-gray-400 text-sm">Status</div>
                  <div className={`font-bold ${getStatusColor(latestSim.topStatus)}`}>
                    {latestSim.topStatus}
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  📊 Distribuição por Nível
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(latestSim.distribution || {})
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([level, count]: [string, any]) => {
                      const percentage = ((count / latestSim.totalClients) * 100).toFixed(1);
                      return (
                        <div key={level} className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-gray-400 text-xs mb-1">Nível {level}</div>
                          <div className="text-white font-bold">{count}</div>
                          <div className="text-purple-400 text-xs">{percentage}%</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ALL TAB */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {simulations.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-12 text-center">
                  <p className="text-gray-400 text-lg">Nenhuma simulação encontrada</p>
                </div>
              ) : (
                simulations.map((sim, index) => (
                  <motion.div
                    key={sim.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">
                            {sim.totalClients.toLocaleString('pt-BR')} clientes
                          </h3>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400 text-sm">
                            {formatDate(sim.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <div className="text-gray-400 text-xs">Capital</div>
                            <div className="text-green-400 font-semibold">
                              {formatCurrency(sim.totalCapital)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Pool MLM</div>
                            <div className="text-purple-400 font-semibold">
                              {formatCurrency(sim.poolMlm)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">TOP ROI</div>
                            <div className="text-white font-semibold">
                              {parseFloat(sim.topRoi).toFixed(1)}x
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Status</div>
                            <div className={`font-semibold ${getStatusColor(sim.topStatus)}`}>
                              {sim.topStatus}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-mono">
                        {sim.id.substring(0, 8)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && stats && stats.maxRoi && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                📈 Estatísticas Consolidadas
              </h2>

              <div className="space-y-6">
                {/* Best ROI */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>🥇</span>
                    Maior ROI Registrado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">Valor</div>
                      <div className="text-3xl font-bold text-yellow-400">
                        {parseFloat(stats.maxRoi.value).toFixed(1)}x
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Simulação ID</div>
                      <div className="text-purple-400 font-mono text-sm">
                        {stats.maxRoi.simulationId.substring(0, 8)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Data</div>
                      <div className="text-white font-semibold">
                        {formatDate(stats.maxRoi.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-gray-400 text-sm mb-2">Média de Clientes</h4>
                    <div className="text-3xl font-bold text-white">
                      {stats.avgClients.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      por simulação
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-gray-400 text-sm mb-2">ROI Médio</h4>
                    <div className="text-3xl font-bold text-purple-400">
                      {parseFloat(stats.avgRoi).toFixed(1)}x
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      nas simulações
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
