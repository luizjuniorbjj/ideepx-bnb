/**
 * 📅 JOB SEMANAL - Atualização de Níveis
 *
 * Executa todo domingo às 23:00
 * Responsável por:
 * - Atualizar níveis de todos os usuários
 * - Verificar qualificações L6-10
 * - Sincronizar com smart contract
 * - Preparar para distribuição segunda-feira
 */

import cron from 'node-cron';
import { contract } from '../config/web3.js';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Atualiza nível de um usuário específico
 */
async function updateUserLevel(user) {
    try {
        const { wallet, directsCount, monthlyVolume, hasActiveLAI } = user;

        // Determinar nível esperado
        let expectedLevel = 0;

        if (hasActiveLAI) {
            expectedLevel = 5; // L1-5 automático com LAI

            // Se qualificado para L6-10
            if (directsCount >= 5 && monthlyVolume >= 5000) {
                expectedLevel = 10;
            }
        }

        logger.info(`👤 ${wallet}: LAI=${hasActiveLAI}, Directs=${directsCount}, Volume=$${monthlyVolume} → Nível ${expectedLevel}`);

        // Chamar contrato para atualizar
        const tx = await contract.updateUserLevel(wallet);
        const receipt = await tx.wait();

        logger.info(`✅ Nível atualizado no contrato: ${wallet}`);

        // Atualizar no banco de dados
        await db.user.update({
            where: { wallet },
            data: {
                networkLevel: expectedLevel,
                lastLevelUpdate: new Date()
            }
        });

        return {
            success: true,
            wallet,
            level: expectedLevel,
            txHash: receipt.hash
        };

    } catch (error) {
        logger.error(`❌ Erro ao atualizar ${user.wallet}:`, error);
        return {
            success: false,
            wallet: user.wallet,
            error: error.message
        };
    }
}

/**
 * Job principal de atualização de níveis
 */
async function weeklyLevelsJob() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔄 [WEEKLY JOB] Iniciando atualização de níveis...');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();

    try {
        // 1. Buscar todos os usuários registrados
        logger.info('👥 Buscando usuários...');

        const users = await db.user.findMany({
            select: {
                wallet: true,
                hasActiveLAI: true,
                laiExpiresAt: true,
                directsCount: true,
                monthlyVolume: true,
                networkLevel: true
            }
        });

        logger.info(`📊 Encontrados ${users.length} usuários`);

        // 2. Filtrar apenas usuários que precisam atualização
        const now = new Date();
        const usersToUpdate = users.filter(u => {
            // Atualizar se:
            // - Tem LAI ativa
            // - OU tinha LAI ativa mas expirou (rebaixar para 0)
            return u.hasActiveLAI || u.networkLevel > 0;
        });

        logger.info(`⚙️ ${usersToUpdate.length} usuários precisam atualização`);

        // 3. Processar em lotes de 5 (transações blockchain são lentas)
        const BATCH_SIZE = 5;
        const results = {
            processed: 0,
            level0: 0,   // Sem LAI
            level5: 0,   // L1-5
            level10: 0,  // L1-10
            errors: 0,
            gasUsed: 0
        };

        for (let i = 0; i < usersToUpdate.length; i += BATCH_SIZE) {
            const batch = usersToUpdate.slice(i, i + BATCH_SIZE);

            logger.info(`⚙️ Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(usersToUpdate.length / BATCH_SIZE)}...`);

            // Processar sequencialmente (transações blockchain)
            for (const user of batch) {
                const result = await updateUserLevel(user);

                if (result.success) {
                    results.processed++;

                    if (result.level === 0) results.level0++;
                    else if (result.level === 5) results.level5++;
                    else if (result.level === 10) results.level10++;

                } else {
                    results.errors++;
                }

                // Aguardar 1s entre transações
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // 4. Resumo final
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('✅ [WEEKLY JOB] CONCLUÍDO COM SUCESSO!');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`📊 Estatísticas:`);
        logger.info(`   - Processados: ${results.processed}/${usersToUpdate.length}`);
        logger.info(`   - Nível 0 (sem LAI): ${results.level0}`);
        logger.info(`   - Nível 5 (L1-5): ${results.level5}`);
        logger.info(`   - Nível 10 (L1-10): ${results.level10}`);
        logger.info(`   - Erros: ${results.errors}`);
        logger.info(`   - Tempo total: ${duration}s`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 5. Limpar usuários inativos do array (otimização)
        logger.info('🧹 Limpando usuários inativos do contrato...');

        try {
            const cleanTx = await contract.cleanInactiveUsers();
            await cleanTx.wait();
            logger.info('✅ Usuários inativos removidos');
        } catch (error) {
            logger.warn('⚠️ Erro ao limpar inativos (não crítico):', error.message);
        }

        // 6. Notificar admins
        await notifyAdmins({
            type: 'weekly_levels_job',
            status: 'success',
            stats: results,
            duration
        });

    } catch (error) {
        logger.error('❌ [WEEKLY JOB] Erro fatal:', error);

        await notifyAdmins({
            type: 'weekly_levels_job',
            status: 'error',
            error: error.message
        });

        throw error;
    }
}

/**
 * Notifica administradores
 */
async function notifyAdmins(data) {
    logger.info('📢 Notificação enviada aos admins:', JSON.stringify(data, null, 2));
    // TODO: Implementar Telegram/Discord webhook
}

/**
 * Agendar job para todo domingo às 23:00
 * Cron: '0 23 * * 0' = minuto 0, hora 23, qualquer dia, qualquer mês, domingo
 */
export function scheduleWeeklyLevelsJob() {
    cron.schedule('0 23 * * 0', async () => {
        try {
            await weeklyLevelsJob();
        } catch (error) {
            logger.error('❌ Job semanal de níveis falhou:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    logger.info('✅ Job semanal de níveis agendado: todo domingo às 23:00');
}

/**
 * Executar manualmente
 */
export async function runWeeklyLevelsJobNow() {
    logger.info('⚠️ Executando job semanal de níveis MANUALMENTE...');
    await weeklyLevelsJob();
}

export default {
    scheduleWeeklyLevelsJob,
    runWeeklyLevelsJobNow
};
