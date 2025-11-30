/**
 * 📅 JOB DIÁRIO - Notificações LAI
 *
 * Executa todo dia às 09:00
 * Responsável por:
 * - Notificar LAIs que vão expirar em 7 dias
 * - Notificar LAIs que vão expirar em 3 dias (urgente)
 * - Notificar LAIs que vão expirar em 1 dia (crítico)
 * - Notificar LAIs expiradas hoje
 */

import cron from 'node-cron';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from '../services/email.service.js';
import { sendTelegramNotification } from '../services/telegram.service.js';

/**
 * Calcula dias até expiração
 */
function daysUntilExpiry(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Envia notificação para usuário
 */
async function notifyUser(user, daysLeft) {
    try {
        const messages = {
            7: {
                title: '⚠️ Sua LAI expira em 7 dias',
                message: 'Sua Licença de Acesso Inteligente expira em 7 dias. Renove agora para não perder suas comissões!',
                urgency: 'warning'
            },
            3: {
                title: '🚨 Sua LAI expira em 3 dias!',
                message: 'ATENÇÃO: Sua LAI expira em 3 dias! Renove urgentemente para manter suas comissões ativas.',
                urgency: 'urgent'
            },
            1: {
                title: '🔴 Sua LAI expira AMANHÃ!',
                message: 'CRÍTICO: Sua LAI expira AMANHÃ! Renove AGORA ou perderá todas as comissões.',
                urgency: 'critical'
            },
            0: {
                title: '❌ Sua LAI EXPIROU!',
                message: 'Sua LAI expirou hoje. Você NÃO está recebendo comissões. Renove imediatamente!',
                urgency: 'expired'
            }
        };

        const notification = messages[daysLeft] || messages[7];

        logger.info(`📧 Notificando ${user.wallet}: ${notification.title}`);

        // 1. Email (se configurado)
        if (user.email) {
            await sendEmail({
                to: user.email,
                subject: notification.title,
                body: `
                    <h2>${notification.title}</h2>
                    <p>${notification.message}</p>
                    <p><strong>Carteira:</strong> ${user.wallet}</p>
                    <p><strong>Expira em:</strong> ${new Date(user.laiExpiresAt).toLocaleDateString('pt-BR')}</p>
                    <p><a href="${process.env.FRONTEND_URL}/dashboard">Renovar Agora</a></p>
                `
            });
        }

        // 2. Notificação in-app (banco de dados)
        await db.notification.create({
            data: {
                userWallet: user.wallet,
                type: 'lai_expiring',
                title: notification.title,
                message: notification.message,
                urgency: notification.urgency,
                daysLeft: daysLeft,
                read: false
            }
        });

        // 3. Telegram (se usuário vinculou)
        if (user.telegramId) {
            await sendTelegramNotification(user.telegramId, notification.message);
        }

        logger.info(`✅ Notificação enviada: ${user.wallet}`);

        return { success: true, wallet: user.wallet };

    } catch (error) {
        logger.error(`❌ Erro ao notificar ${user.wallet}:`, error);
        return { success: false, wallet: user.wallet, error: error.message };
    }
}

/**
 * Job principal de notificações
 */
async function dailyNotificationsJob() {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔔 [DAILY JOB] Iniciando notificações LAI...');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();

    try {
        const now = new Date();

        // Calcular datas de referência
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
        const today = new Date(now.getTime());

        // 1. LAIs expirando em 7 dias
        logger.info('⚠️ Buscando LAIs expirando em 7 dias...');

        const expiring7Days = await db.user.findMany({
            where: {
                hasActiveLAI: true,
                laiExpiresAt: {
                    gte: new Date(in7Days.setHours(0, 0, 0, 0)),
                    lte: new Date(in7Days.setHours(23, 59, 59, 999))
                }
            }
        });

        logger.info(`   Encontrados: ${expiring7Days.length}`);

        // 2. LAIs expirando em 3 dias (urgente)
        logger.info('🚨 Buscando LAIs expirando em 3 dias...');

        const expiring3Days = await db.user.findMany({
            where: {
                hasActiveLAI: true,
                laiExpiresAt: {
                    gte: new Date(in3Days.setHours(0, 0, 0, 0)),
                    lte: new Date(in3Days.setHours(23, 59, 59, 999))
                }
            }
        });

        logger.info(`   Encontrados: ${expiring3Days.length}`);

        // 3. LAIs expirando em 1 dia (crítico)
        logger.info('🔴 Buscando LAIs expirando em 1 dia...');

        const expiring1Day = await db.user.findMany({
            where: {
                hasActiveLAI: true,
                laiExpiresAt: {
                    gte: new Date(in1Day.setHours(0, 0, 0, 0)),
                    lte: new Date(in1Day.setHours(23, 59, 59, 999))
                }
            }
        });

        logger.info(`   Encontrados: ${expiring1Day.length}`);

        // 4. LAIs expiradas hoje
        logger.info('❌ Buscando LAIs expiradas hoje...');

        const expiredToday = await db.user.findMany({
            where: {
                hasActiveLAI: true,
                laiExpiresAt: {
                    lte: now
                }
            }
        });

        logger.info(`   Encontrados: ${expiredToday.length}`);

        // 5. Processar notificações
        const allNotifications = [
            ...expiring7Days.map(u => ({ user: u, daysLeft: 7 })),
            ...expiring3Days.map(u => ({ user: u, daysLeft: 3 })),
            ...expiring1Day.map(u => ({ user: u, daysLeft: 1 })),
            ...expiredToday.map(u => ({ user: u, daysLeft: 0 }))
        ];

        logger.info(`📤 Enviando ${allNotifications.length} notificações...`);

        const results = {
            sent: 0,
            failed: 0
        };

        for (const { user, daysLeft } of allNotifications) {
            const result = await notifyUser(user, daysLeft);

            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
            }

            // Aguardar 100ms entre notificações (rate limiting)
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 6. Atualizar LAIs expiradas no banco
        if (expiredToday.length > 0) {
            logger.info('🔄 Atualizando LAIs expiradas no banco...');

            await db.user.updateMany({
                where: {
                    wallet: {
                        in: expiredToday.map(u => u.wallet)
                    }
                },
                data: {
                    hasActiveLAI: false,
                    networkLevel: 0
                }
            });

            logger.info(`✅ ${expiredToday.length} LAIs marcadas como expiradas`);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // 7. Resumo final
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('✅ [DAILY JOB] CONCLUÍDO COM SUCESSO!');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info(`📊 Estatísticas:`);
        logger.info(`   - Expirando em 7 dias: ${expiring7Days.length}`);
        logger.info(`   - Expirando em 3 dias: ${expiring3Days.length}`);
        logger.info(`   - Expirando em 1 dia: ${expiring1Day.length}`);
        logger.info(`   - Expiradas hoje: ${expiredToday.length}`);
        logger.info(`   - Notificações enviadas: ${results.sent}`);
        logger.info(`   - Falhas: ${results.failed}`);
        logger.info(`   - Tempo total: ${duration}s`);
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        logger.error('❌ [DAILY JOB] Erro fatal:', error);
        throw error;
    }
}

/**
 * Agendar job para todo dia às 09:00
 * Cron: '0 9 * * *' = minuto 0, hora 9, todo dia
 */
export function scheduleDailyNotificationsJob() {
    cron.schedule('0 9 * * *', async () => {
        try {
            await dailyNotificationsJob();
        } catch (error) {
            logger.error('❌ Job diário de notificações falhou:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    logger.info('✅ Job diário de notificações agendado: todo dia às 09:00');
}

/**
 * Executar manualmente
 */
export async function runDailyNotificationsJobNow() {
    logger.info('⚠️ Executando job diário de notificações MANUALMENTE...');
    await dailyNotificationsJob();
}

export default {
    scheduleDailyNotificationsJob,
    runDailyNotificationsJobNow
};
