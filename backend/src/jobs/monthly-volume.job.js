/**
 * 📅 JOB MENSAL - Reset e Atualização de Volumes
 *
 * Executa todo dia 1º de cada mês às 00:00
 * Responsável por:
 * - Resetar volumes mensais
 * - Buscar novos volumes via GMI API
 * - Atualizar qualificações L6-10
 * - Rebaixar usuários desqualificados
 */

import cron from 'node-cron';
import { contract } from '../config/web3.js';
import { db } from '../config/database.js';
import { GMIService } from '../services/gmi.service.js';
import { logger } from '../utils/logger.js';

const gmiService = new GMIService();

/**
 * Processa volume mensal de um usuário
 */
async function processUserVolume(user) {
    try {
        // Buscar volume mensal via GMI API
        const monthlyVolume = await gmiService.getMonthlyVolume(user.gmiAccountId);

        logger.info(`Volume mensal ${user.wallet}: $${monthlyVolume}`);

        // Atualizar no banco de dados
        await db.user.update({
            where: { id: user.id },
            data: {
                monthlyVolume,
                lastVolumeUpdate: new Date()
            }
        });

        // Atualizar volume no contrato
        const volumeInWei = ethers.parseUnits(monthlyVolume.toString(), 6);
        await contract.updateUserVolume(user.wallet, volumeInWei);

        logger.info(`✅ Volume atualizado: ${user.wallet}`);

        return { success: true, wallet: user.wallet, volume: monthlyVolume };

    } catch (error) {
        logger.error(`❌ Erro ao processar ${user.wallet}:`, error);
        return { success: false, wallet: user.wallet, error: error.message };
    }
}

/**
 * Job principal de volume mensal
 */
async function monthlyVolumeJob() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔄 [MONTHLY JOB] Iniciando reset de volumes mensais...');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();

    try {
        // 1. Reset volumes no banco de dados
        logger.info('📊 Resetando volumes no banco...');

        await db.user.updateMany({
            data: {
                monthlyVolume: 0,
                lastVolumeReset: new Date()
            }
        });

        logger.info('✅ Volumes resetados no banco');

        // 2. Buscar todos os usuários com LAI ativa
        logger.info('👥 Buscando usuários ativos...');

        const users = await db.user.findMany({
            where: {
                hasActiveLAI: true,
                gmiAccountId: { not: null }
            },
            select: {
                id: true,
                wallet: true,
                gmiAccountId: true,
                directsCount: true
            }
        });

        logger.info(`📊 Encontrados ${users.length} usuários para processar`);

        // 3. Processar em lotes de 10 (para não sobrecarregar API)
        const BATCH_SIZE = 10;
        const results = {
            processed: 0,
            qualified: 0,
            disqualified: 0,
            errors: 0
        };

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);

            logger.info(`⚙️ Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(users.length / BATCH_SIZE)}...`);

            const batchPromises = batch.map(user => processUserVolume(user));
            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    results.processed++;

                    const user = batch.find(u => u.wallet === result.value.wallet);

                    // Verificar qualificação L6-10
                    if (user.directsCount >= 5 && result.value.volume >= 5000) {
                        results.qualified++;
                    } else if (user.directsCount < 5 || result.value.volume < 5000) {
                        results.disqualified++;
                    }

                } else {
                    results.errors++;
                }
            });

            // Aguardar 2s entre lotes (rate limiting)
            if (i + BATCH_SIZE < users.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // 4. Resumo final
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('✅ [MONTHLY JOB] CONCLUÍDO COM SUCESSO!');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`📊 Estatísticas:`);
        logger.info(`   - Processados: ${results.processed}/${users.length}`);
        logger.info(`   - Qualificados L6-10: ${results.qualified}`);
        logger.info(`   - Desqualificados: ${results.disqualified}`);
        logger.info(`   - Erros: ${results.errors}`);
        logger.info(`   - Tempo total: ${duration}s`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 5. Notificar no Telegram/Discord (opcional)
        await notifyAdmins({
            type: 'monthly_volume_job',
            status: 'success',
            stats: results,
            duration
        });

    } catch (error) {
        logger.error('❌ [MONTHLY JOB] Erro fatal:', error);

        await notifyAdmins({
            type: 'monthly_volume_job',
            status: 'error',
            error: error.message
        });

        throw error;
    }
}

/**
 * Notifica administradores via Telegram/Discord
 */
async function notifyAdmins(data) {
    // TODO: Implementar notificação
    // Telegram: https://core.telegram.org/bots/api#sendmessage
    // Discord: https://discord.com/developers/docs/resources/webhook
    logger.info('📢 Notificação enviada aos admins:', JSON.stringify(data, null, 2));
}

/**
 * Agendar job para todo dia 1º às 00:00
 * Cron: '0 0 1 * *' = minuto 0, hora 0, dia 1, todo mês
 */
export function scheduleMonthlyVolumeJob() {
    cron.schedule('0 0 1 * *', async () => {
        try {
            await monthlyVolumeJob();
        } catch (error) {
            logger.error('❌ Job mensal falhou:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo' // Ajuste conforme necessário
    });

    logger.info('✅ Job mensal agendado: todo dia 1º às 00:00');
}

/**
 * Executar manualmente (para testes)
 */
export async function runMonthlyVolumeJobNow() {
    logger.info('⚠️ Executando job mensal MANUALMENTE...');
    await monthlyVolumeJob();
}

export default {
    scheduleMonthlyVolumeJob,
    runMonthlyVolumeJobNow
};
