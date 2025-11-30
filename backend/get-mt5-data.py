#!/usr/bin/env python3
"""
🔌 GET MT5 DATA - Retorna JSON com dados MT5
Este script conecta ao MT5 e retorna JSON com todos os dados da conta.
NÃO atualiza banco de dados - apenas retorna dados.
"""

import MetaTrader5 as mt5
import json
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# Carregar .env
load_dotenv()

def connect_mt5():
    """Conecta ao MT5"""
    account = int(os.getenv('MT5_LOGIN'))
    password = os.getenv('MT5_PASSWORD')
    server = os.getenv('MT5_SERVER', 'GMI3-Real')

    # Inicializar
    if not mt5.initialize():
        return {"connected": False, "error": f"initialize() failed, error code = {mt5.last_error()}"}

    # Login
    if not mt5.login(account, password, server):
        mt5.shutdown()
        return {"connected": False, "error": f"login() failed, error code = {mt5.last_error()}"}

    return {"connected": True}

def get_account_info():
    """Busca informações da conta"""
    account_info = mt5.account_info()

    if account_info is None:
        return None

    return {
        "login": account_info.login,
        "server": account_info.server,
        "balance": float(account_info.balance),
        "equity": float(account_info.equity),
        "margin": float(account_info.margin),
        "free_margin": float(account_info.margin_free),
        "margin_level": float(account_info.margin_level) if account_info.margin_level else 0.0,
        "profit": float(account_info.profit),
        "credit": float(account_info.credit),
        "leverage": account_info.leverage,
        "currency": account_info.currency,
    }

def get_positions():
    """Busca posições abertas"""
    positions = mt5.positions_get()

    if positions is None:
        return []

    result = []
    for pos in positions:
        result.append({
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": "BUY" if pos.type == 0 else "SELL",
            "volume": float(pos.volume),
            "open_price": float(pos.price_open),
            "current_price": float(pos.price_current),
            "profit": float(pos.profit),
            "sl": float(pos.sl),
            "tp": float(pos.tp),
            "swap": float(pos.swap),
            "commission": float(pos.commission) if hasattr(pos, 'commission') else 0.0,
            "time": datetime.fromtimestamp(pos.time).isoformat(),
        })

    return result

def get_monthly_stats():
    """Calcula estatísticas do mês"""
    # Data início do mês
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)

    # Buscar histórico
    deals = mt5.history_deals_get(start_of_month, now)

    if deals is None or len(deals) == 0:
        return {
            "monthly_volume": 0.0,
            "total_trades": 0,
            "profit_trades": 0,
            "loss_trades": 0,
            "win_rate": 0.0,
            "gross_profit": 0.0,
            "gross_loss": 0.0,
            "net_profit": 0.0,
            "profit_factor": 0.0,
        }

    # Calcular estatísticas
    total_volume = 0.0
    total_trades = 0
    profit_trades = 0
    loss_trades = 0
    gross_profit = 0.0
    gross_loss = 0.0

    for deal in deals:
        # Apenas deals de saída (fechamento)
        if deal.entry == 1:  # DEAL_ENTRY_OUT
            total_trades += 1
            profit = float(deal.profit)

            if profit > 0:
                profit_trades += 1
                gross_profit += profit
            elif profit < 0:
                loss_trades += 1
                gross_loss += abs(profit)

            # Volume (lot size * preço)
            total_volume += float(deal.volume) * float(deal.price)

    # Calcular métricas
    win_rate = (profit_trades / total_trades * 100) if total_trades > 0 else 0.0
    net_profit = gross_profit - gross_loss
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else 0.0

    return {
        "monthly_volume": round(total_volume, 2),
        "total_trades": total_trades,
        "profit_trades": profit_trades,
        "loss_trades": loss_trades,
        "win_rate": round(win_rate, 2),
        "gross_profit": round(gross_profit, 2),
        "gross_loss": round(gross_loss, 2),
        "net_profit": round(net_profit, 2),
        "profit_factor": round(profit_factor, 2),
    }

def main():
    """Main function"""
    try:
        # Conectar
        connection = connect_mt5()

        if not connection["connected"]:
            print(json.dumps(connection))
            sys.exit(1)

        # Buscar dados
        account = get_account_info()
        positions = get_positions()
        stats = get_monthly_stats()

        # Desconectar
        mt5.shutdown()

        # Retornar JSON
        result = {
            "connected": True,
            "login": account["login"],
            "server": account["server"],
            "balance": account["balance"],
            "equity": account["equity"],
            "margin": account["margin"],
            "free_margin": account["free_margin"],
            "margin_level": account["margin_level"],
            "profit": account["profit"],
            "credit": account["credit"],
            "leverage": account["leverage"],
            "currency": account["currency"],
            "monthly_volume": stats["monthly_volume"],
            "total_trades": stats["total_trades"],
            "profit_trades": stats["profit_trades"],
            "loss_trades": stats["loss_trades"],
            "win_rate": stats["win_rate"],
            "gross_profit": stats["gross_profit"],
            "gross_loss": stats["gross_loss"],
            "net_profit": stats["net_profit"],
            "profit_factor": stats["profit_factor"],
            "positions": positions,
            "timestamp": datetime.now().isoformat(),
        }

        print(json.dumps(result))
        sys.exit(0)

    except Exception as e:
        error_result = {
            "connected": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
