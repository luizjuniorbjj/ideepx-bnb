/**
 * 📅 JOB SEMANAL - Distribuição de Performance
 *
 * Executa toda segunda-feira às 00:30
 * Responsável por:
 * - Buscar performance da semana via GMI API
 * - Calcular 35% de performance fee
 * - Depositar no smart contract
 * - Distribuir automaticamente para usuários qualificados
 * - Registrar prova IPFS
 */

import cron from 'node-cron';
import { ethers } from 'ethers';
import { contract } from '../config/web3.js';
import { db } from '../config/database.js';
import { GMIService } from '../services/gmi.service.js';
import { IPFSService } from '../services/ipfs.service.js';
import { logger } from '../utils/logger.js';

const gmiService = new GMIService();
const ipfsService = new IPFSService();

/**
 * Job principal de distribuição semanal
 */
async function weeklyDistributionJob() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('💰 [WEEKLY DISTRIBUTION] Iniciando distribuição semanal...');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();
    const distributionId = `dist_${Date.now()}`;

    try {
        // 1. BUSCAR PERFORMANCE DA SEMANA VIA GMI API
        logger.info('📊 Buscando performance da semana na GMI Edge...');

        const weeklyPerformance = await gmiService.getWeeklyPerformance();

        if (!weeklyPerformance || weeklyPerformance.totalPerformance <= 0) {
            logger.warn('⚠️ Sem performance esta semana. Pulando distribuição.');
            return;
        }

        logger.info(`💰 Performance total: $${weeklyPerformance.totalPerformance.toLocaleString()}`);
        logger.info(`📈 Performance %: ${weeklyPerformance.performancePercentage}%`);
        logger.info(`👥 Traders ativos: ${weeklyPerformance.activeTraders}`);

        // 2. CALCULAR 35% DE PERFORMANCE FEE
        const performanceFee = weeklyPerformance.totalPerformance * 0.35;

        logger.info(`💵 Performance Fee (35%): $${performanceFee.toLocaleString()}`);

        // 3. CALCULAR DISTRIBUIÇÃO
        const distribution = {
            liquidity: performanceFee * 0.05,       // 5% - $X
            infrastructure: performanceFee * 0.15,  // 15% - $X
            company: performanceFee * 0.35,         // 35% - $X
            mlmDistributed: performanceFee * 0.30,  // 30% - $X
            mlmLocked: performanceFee * 0.15,       // 15% - $X
            total: performanceFee
        };

        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('📊 DISTRIBUIÇÃO DETALHADA:');
        logger.info(`   - Liquidity Pool (5%):       $${distribution.liquidity.toFixed(2)}`);
        logger.info(`   - Infrastructure (15%):      $${distribution.infrastructure.toFixed(2)}`);
        logger.info(`   - Company (35%):             $${distribution.company.toFixed(2)}`);
        logger.info(`   - MLM Distributed (30%):     $${distribution.mlmDistributed.toFixed(2)}`);
        logger.info(`   - MLM Locked (15%):          $${distribution.mlmLocked.toFixed(2)}`);
        logger.info(`   - TOTAL (100%):              $${distribution.total.toFixed(2)}`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 4. CRIAR PROVA IPFS
        logger.info('📦 Criando prova de performance no IPFS...');

        const proof = {
            week: weeklyPerformance.week,
            startDate: weeklyPerformance.startDate,
            endDate: weeklyPerformance.endDate,
            performance: {
                total: weeklyPerformance.totalPerformance,
                percentage: weeklyPerformance.performancePercentage,
                traders: weeklyPerformance.activeTraders
            },
            distribution,
            timestamp: new Date().toISOString(),
            distributionId
        };

        const ipfsHash = await ipfsService.upload(proof);

        logger.info(`✅ Prova criada no IPFS: ${ipfsHash}`);
        logger.info(`   https://ipfs.io/ipfs/${ipfsHash}`);

        // 5. DEPOSITAR NO SMART CONTRACT
        logger.info('💎 Depositando no smart contract...');

        const amountInWei = ethers.parseUnits(performanceFee.toString(), 6);

        // Verificar se owner tem USDT suficiente
        const USDT = new ethers.Contract(
            process.env.USDT_ADDRESS,
            ['function balanceOf(address) view returns (uint256)'],
            contract.provider
        );

        const ownerAddress = await contract.owner();
        const ownerBalance = await USDT.balanceOf(ownerAddress);
        const ownerBalanceFormatted = ethers.formatUnits(ownerBalance, 6);

        logger.info(`   Saldo owner: $${ownerBalanceFormatted}`);

        if (ownerBalance < amountInWei) {
            throw new Error(`Saldo insuficiente! Necessário: $${performanceFee}, Disponível: $${ownerBalanceFormatted}`);
        }

        // Aprovar USDT
        logger.info('   Aprovando USDT...');
        const USDTWithSigner = USDT.connect(contract.signer);
        const approveTx = await USDTWithSigner.approve(contract.address, amountInWei);
        await approveTx.wait();
        logger.info('   ✅ USDT aprovado');

        // Depositar performance
        logger.info('   Depositando performance...');
        const depositTx = await contract.depositWeeklyPerformance(amountInWei, ipfsHash);

        logger.info(`   ⏳ Transação enviada: ${depositTx.hash}`);

        const receipt = await depositTx.wait();

        logger.info(`   ✅ Transação confirmada!`);
        logger.info(`   Gas usado: ${receipt.gasUsed.toString()}`);
        logger.info(`   Block: ${receipt.blockNumber}`);

        // 6. BUSCAR EVENTOS DA DISTRIBUIÇÃO
        logger.info('📊 Analisando eventos da distribuição...');

        const events = receipt.logs
            .map(log => {
                try {
                    return contract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .filter(e => e !== null);

        const performanceEvent = events.find(e => e.name === 'PerformanceDeposited');
        const mlmEvent = events.find(e => e.name === 'MLMDistributed');
        const commissionEvents = events.filter(e => e.name === 'CommissionCredited');

        logger.info(`   - Performance depositada: Semana ${performanceEvent?.args?.week}`);
        logger.info(`   - MLM distribuído: $${ethers.formatUnits(mlmEvent?.args?.amount || 0, 6)}`);
        logger.info(`   - Usuários recompensados: ${mlmEvent?.args?.usersRewarded || 0}`);
        logger.info(`   - Comissões individuais: ${commissionEvents.length}`);

        // 7. REGISTRAR NO BANCO DE DADOS
        logger.info('💾 Registrando distribuição no banco...');

        const weekNumber = await contract.currentWeek();

        await db.distribution.create({
            data: {
                distributionId,
                week: Number(weekNumber),
                performanceTotal: weeklyPerformance.totalPerformance,
                performanceFee: performanceFee,
                liquidityAmount: distribution.liquidity,
                infrastructureAmount: distribution.infrastructure,
                companyAmount: distribution.company,
                mlmDistributedAmount: distribution.mlmDistributed,
                mlmLockedAmount: distribution.mlmLocked,
                usersRewarded: Number(mlmEvent?.args?.usersRewarded || 0),
                ipfsProof: ipfsHash,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                status: 'completed',
                createdAt: new Date()
            }
        });

        logger.info('   ✅ Distribuição registrada no banco');

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // 8. RESUMO FINAL
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('🎉 [WEEKLY DISTRIBUTION] CONCLUÍDO COM SUCESSO!');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`📊 Resumo:`);
        logger.info(`   - Performance: $${weeklyPerformance.totalPerformance.toLocaleString()}`);
        logger.info(`   - Fee (35%): $${performanceFee.toFixed(2)}`);
        logger.info(`   - MLM Distribuído: $${distribution.mlmDistributed.toFixed(2)}`);
        logger.info(`   - Usuários: ${mlmEvent?.args?.usersRewarded || 0}`);
        logger.info(`   - Semana: ${weekNumber.toString()}`);
        logger.info(`   - TX: ${receipt.hash}`);
        logger.info(`   - IPFS: ${ipfsHash}`);
        logger.info(`   - Tempo: ${duration}s`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 9. NOTIFICAR ADMINS
        await notifyAdmins({
            type: 'weekly_distribution',
            status: 'success',
            week: Number(weekNumber),
            performance: weeklyPerformance.totalPerformance,
            fee: performanceFee,
            mlmDistributed: distribution.mlmDistributed,
            usersRewarded: Number(mlmEvent?.args?.usersRewarded || 0),
            txHash: receipt.hash,
            ipfsHash,
            duration
        });

        // 10. NOTIFICAR USUÁRIOS
        await notifyUsers({
            week: Number(weekNumber),
            mlmDistributed: distribution.mlmDistributed,
            usersRewarded: Number(mlmEvent?.args?.usersRewarded || 0)
        });

    } catch (error) {
        logger.error('❌ [WEEKLY DISTRIBUTION] ERRO FATAL:', error);

        // Registrar erro no banco
        await db.distribution.create({
            data: {
                distributionId,
                week: 0,
                status: 'failed',
                errorMessage: error.message,
                errorStack: error.stack,
                createdAt: new Date()
            }
        });

        // Notificar admins do erro
        await notifyAdmins({
            type: 'weekly_distribution',
            status: 'error',
            error: error.message,
            stack: error.stack
        });

        throw error;
    }
}

/**
 * Notifica administradores
 */
async function notifyAdmins(data) {
    logger.info('📢 Notificação enviada aos admins');
    // TODO: Implementar Telegram/Discord webhook
}

/**
 * Notifica usuários que receberam comissões
 */
async function notifyUsers(data) {
    logger.info(`📧 Notificando ${data.usersRewarded} usuários sobre comissões recebidas`);

    // Buscar usuários que receberam
    const users = await db.user.findMany({
        where: {
            hasActiveLAI: true,
            networkLevel: { gt: 0 }
        }
    });

    // Criar notificação in-app para cada um
    for (const user of users) {
        await db.notification.create({
            data: {
                userWallet: user.wallet,
                type: 'commission_received',
                title: '💰 Nova comissão recebida!',
                message: `Você recebeu comissões da semana ${data.week}. Total distribuído: $${data.mlmDistributed.toFixed(2)}`,
                urgency: 'info',
                read: false
            }
        });
    }

    logger.info('✅ Notificações criadas');
}

/**
 * Agendar job para toda segunda-feira às 00:30
 * Cron: '30 0 * * 1' = minuto 30, hora 0, qualquer dia, qualquer mês, segunda
 */
export function scheduleWeeklyDistributionJob() {
    cron.schedule('30 0 * * 1', async () => {
        try {
            await weeklyDistributionJob();
        } catch (error) {
            logger.error('❌ Job semanal de distribuição falhou:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    logger.info('✅ Job semanal de distribuição agendado: toda segunda às 00:30');
}

/**
 * Executar manualmente
 */
export async function runWeeklyDistributionJobNow() {
    logger.warn('⚠️ Executando job de distribuição MANUALMENTE...');
    logger.warn('⚠️ ATENÇÃO: Isso irá depositar performance REAL no contrato!');

    await weeklyDistributionJob();
}

export default {
    scheduleWeeklyDistributionJob,
    runWeeklyDistributionJobNow
};
