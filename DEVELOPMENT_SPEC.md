# iDeepX - Integração MetaApi MT5

## Especificação Técnica para Desenvolvimento

**Versão:** 1.0  
**Data:** Novembro 2025  
**Projeto:** Sistema de conexão multi-contas MT5 para iDeepX  

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo
Permitir que clientes do iDeepX conectem suas contas MT5 diretamente pelo dashboard, sem necessidade de instalar nada. O sistema coleta dados de trading automaticamente para cálculo de comissões MLM.

### 1.2 Fluxo Principal

```
Cliente no Dashboard → Preenche credenciais MT5 → Backend cria conta no MetaApi → MetaApi conecta no broker → Dados disponíveis via API
```

### 1.3 Stack Tecnológico
- **Backend:** Python 3.11+ / FastAPI
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **API Externa:** MetaApi Cloud (metaapi.cloud)
- **Frontend:** Integração com dashboard existente (Vue.js ou React)

---

## 2. Configuração MetaApi

### 2.1 Credenciais Necessárias

```env
# .env
METAAPI_TOKEN=seu_token_aqui
```

**Onde obter:** https://app.metaapi.cloud/token

### 2.2 Instalação SDK

```bash
pip install metaapi-cloud-sdk
```

---

## 3. Estrutura do Banco de Dados

### 3.1 Tabela: `mt5_connections`

```sql
CREATE TABLE mt5_connections (
    id SERIAL PRIMARY KEY,
    
    -- Relação com cliente iDeepX
    client_id INTEGER NOT NULL REFERENCES clients(id),
    
    -- Credenciais MT5 (criptografadas)
    mt5_login VARCHAR(50) NOT NULL,
    mt5_password_encrypted TEXT NOT NULL,  -- Criptografar com Fernet
    mt5_server VARCHAR(100) NOT NULL,
    
    -- MetaApi
    metaapi_account_id VARCHAR(100),  -- ID retornado pelo MetaApi
    metaapi_state VARCHAR(50),        -- DEPLOYING, DEPLOYED, UNDEPLOYED
    
    -- Dados em cache (atualizados periodicamente)
    balance DECIMAL(15,2) DEFAULT 0,
    equity DECIMAL(15,2) DEFAULT 0,
    margin DECIMAL(15,2) DEFAULT 0,
    margin_free DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    leverage INTEGER,
    broker_name VARCHAR(100),
    
    -- Status
    is_connected BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMP,
    connection_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mt5_client ON mt5_connections(client_id);
CREATE INDEX idx_mt5_metaapi ON mt5_connections(metaapi_account_id);
```

### 3.2 Tabela: `mt5_trades`

```sql
CREATE TABLE mt5_trades (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES mt5_connections(id),
    
    -- Identificação do trade
    deal_id BIGINT NOT NULL,          -- ID único do MetaTrader
    order_id BIGINT,
    position_id BIGINT,
    
    -- Dados do trade
    symbol VARCHAR(20) NOT NULL,
    trade_type VARCHAR(20) NOT NULL,  -- DEAL_TYPE_BUY, DEAL_TYPE_SELL
    volume DECIMAL(10,4) NOT NULL,
    price DECIMAL(15,5),
    profit DECIMAL(15,2),
    swap DECIMAL(15,2) DEFAULT 0,
    commission DECIMAL(15,2) DEFAULT 0,
    
    -- Timestamps MT5
    trade_time TIMESTAMP NOT NULL,
    
    -- Controle de comissões iDeepX
    commission_calculated BOOLEAN DEFAULT FALSE,
    commission_paid BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(connection_id, deal_id)
);

CREATE INDEX idx_trades_connection ON mt5_trades(connection_id);
CREATE INDEX idx_trades_time ON mt5_trades(trade_time);
CREATE INDEX idx_trades_commission ON mt5_trades(commission_calculated);
```

---

## 4. Módulos do Backend

### 4.1 Estrutura de Pastas

```
src/
├── __init__.py
├── main.py                    # FastAPI app
├── config.py                  # Configurações
├── database.py                # Conexão DB
│
├── metaapi/
│   ├── __init__.py
│   ├── client.py              # Cliente MetaApi wrapper
│   ├── account_manager.py     # Gerenciamento de contas
│   └── data_collector.py      # Coleta de dados
│
├── models/
│   ├── __init__.py
│   ├── mt5_connection.py
│   └── mt5_trade.py
│
├── schemas/
│   ├── __init__.py
│   ├── mt5_connection.py      # Pydantic schemas
│   └── mt5_trade.py
│
├── routers/
│   ├── __init__.py
│   └── mt5.py                 # Endpoints REST
│
├── services/
│   ├── __init__.py
│   ├── connection_service.py  # Lógica de negócio
│   └── commission_service.py  # Cálculo de comissões
│
└── tasks/
    ├── __init__.py
    └── sync_tasks.py          # Tasks assíncronas (Celery)
```

---

## 5. Implementação do Cliente MetaApi

### 5.1 Arquivo: `src/metaapi/client.py`

```python
"""
Cliente wrapper para MetaApi
Gerencia conexão e operações com a API
"""

from metaapi_cloud_sdk import MetaApi
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)


class MetaApiClient:
    """
    Wrapper para MetaApi SDK
    Simplifica operações comuns
    """
    
    def __init__(self, token: str):
        self.token = token
        self._api: Optional[MetaApi] = None
    
    async def get_api(self) -> MetaApi:
        """Retorna instância da API (lazy loading)"""
        if self._api is None:
            self._api = MetaApi(self.token)
        return self._api
    
    async def create_account(
        self,
        login: str,
        password: str,
        server: str,
        name: str = "iDeepX Account"
    ) -> Dict[str, Any]:
        """
        Cria nova conta MT5 no MetaApi
        
        Args:
            login: Login MT5 do cliente
            password: Senha MT5 (pode ser investor)
            server: Nome do servidor (ex: GMI-Live)
            name: Nome para identificação
            
        Returns:
            Dict com id, state e outros dados da conta
        """
        api = await self.get_api()
        
        try:
            account = await api.metatrader_account_api.create_account({
                'login': login,
                'password': password,
                'server': server,
                'platform': 'mt5',
                'name': name,
                'application': 'MetaApi',
                'magic': 0,  # 0 = todas as ordens
                'reliability': 'regular'
            })
            
            logger.info(f"Conta criada no MetaApi: {account.id}")
            
            return {
                'id': account.id,
                'state': account.state,
                'connection_status': account.connection_status
            }
            
        except Exception as e:
            logger.error(f"Erro ao criar conta: {e}")
            raise
    
    async def wait_deployed(self, account_id: str, timeout: int = 300) -> bool:
        """
        Aguarda conta ficar no estado DEPLOYED
        
        Args:
            account_id: ID da conta no MetaApi
            timeout: Tempo máximo em segundos
            
        Returns:
            True se deployou com sucesso
        """
        api = await self.get_api()
        account = await api.metatrader_account_api.get_account(account_id)
        
        try:
            await account.wait_deployed(timeout_in_seconds=timeout)
            return True
        except Exception as e:
            logger.error(f"Timeout aguardando deploy: {e}")
            return False
    
    async def get_account_info(self, account_id: str) -> Dict[str, Any]:
        """
        Obtém informações da conta (balance, equity, etc)
        
        Args:
            account_id: ID da conta no MetaApi
            
        Returns:
            Dict com balance, equity, margin, etc
        """
        api = await self.get_api()
        account = await api.metatrader_account_api.get_account(account_id)
        
        # Conecta se necessário
        connection = account.get_rpc_connection()
        await connection.connect()
        await connection.wait_synchronized()
        
        # Obtém dados
        info = await connection.get_account_information()
        
        return {
            'balance': info.get('balance', 0),
            'equity': info.get('equity', 0),
            'margin': info.get('margin', 0),
            'margin_free': info.get('freeMargin', 0),
            'currency': info.get('currency', 'USD'),
            'leverage': info.get('leverage', 0),
            'broker': info.get('broker', ''),
            'server': info.get('server', '')
        }
    
    async def get_positions(self, account_id: str) -> List[Dict]:
        """Obtém posições abertas"""
        api = await self.get_api()
        account = await api.metatrader_account_api.get_account(account_id)
        
        connection = account.get_rpc_connection()
        await connection.connect()
        await connection.wait_synchronized()
        
        positions = await connection.get_positions()
        return positions
    
    async def get_deals(
        self,
        account_id: str,
        start_time: datetime,
        end_time: datetime
    ) -> List[Dict]:
        """
        Obtém histórico de deals (trades fechados)
        
        Args:
            account_id: ID da conta no MetaApi
            start_time: Data/hora início
            end_time: Data/hora fim
            
        Returns:
            Lista de deals
        """
        api = await self.get_api()
        account = await api.metatrader_account_api.get_account(account_id)
        
        connection = account.get_rpc_connection()
        await connection.connect()
        await connection.wait_synchronized()
        
        deals = await connection.get_deals_by_time_range(start_time, end_time)
        return deals
    
    async def delete_account(self, account_id: str) -> bool:
        """Remove conta do MetaApi"""
        api = await self.get_api()
        
        try:
            account = await api.metatrader_account_api.get_account(account_id)
            await account.remove()
            logger.info(f"Conta removida: {account_id}")
            return True
        except Exception as e:
            logger.error(f"Erro ao remover conta: {e}")
            return False
    
    async def get_account_state(self, account_id: str) -> str:
        """Retorna estado atual da conta"""
        api = await self.get_api()
        account = await api.metatrader_account_api.get_account(account_id)
        return account.state
```

---

## 6. Endpoints REST API

### 6.1 Arquivo: `src/routers/mt5.py`

```python
"""
Endpoints para gerenciamento de contas MT5
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..schemas.mt5_connection import (
    MT5ConnectionCreate,
    MT5ConnectionResponse,
    MT5ConnectionStatus,
    MT5AccountInfo,
    MT5TradeResponse
)
from ..services.connection_service import MT5ConnectionService

router = APIRouter(prefix="/api/v1/mt5", tags=["MT5"])


@router.post("/connect", response_model=MT5ConnectionResponse)
async def connect_mt5_account(
    data: MT5ConnectionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Conecta uma nova conta MT5 ao iDeepX
    
    O cliente envia:
    - login: Número da conta MT5
    - password: Senha (pode ser investor para só leitura)
    - server: Nome do servidor do broker
    
    O sistema:
    1. Cria a conta no MetaApi
    2. Aguarda conexão ser estabelecida
    3. Retorna dados da conta
    """
    service = MT5ConnectionService(db)
    
    try:
        # Cria conexão
        connection = await service.create_connection(
            client_id=data.client_id,
            mt5_login=data.login,
            mt5_password=data.password,
            mt5_server=data.server
        )
        
        # Agenda sync inicial em background
        background_tasks.add_task(
            service.sync_account_data,
            connection.id
        )
        
        return connection
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao conectar conta: {str(e)}"
        )


@router.get("/connections/{client_id}", response_model=List[MT5ConnectionResponse])
async def get_client_connections(
    client_id: int,
    db: Session = Depends(get_db)
):
    """Lista todas as contas MT5 de um cliente"""
    service = MT5ConnectionService(db)
    return await service.get_client_connections(client_id)


@router.get("/connection/{connection_id}/status", response_model=MT5ConnectionStatus)
async def get_connection_status(
    connection_id: int,
    db: Session = Depends(get_db)
):
    """Retorna status atual da conexão"""
    service = MT5ConnectionService(db)
    return await service.get_connection_status(connection_id)


@router.get("/connection/{connection_id}/info", response_model=MT5AccountInfo)
async def get_account_info(
    connection_id: int,
    db: Session = Depends(get_db)
):
    """
    Retorna informações em tempo real da conta
    (balance, equity, margin, etc)
    """
    service = MT5ConnectionService(db)
    return await service.get_realtime_info(connection_id)


@router.get("/connection/{connection_id}/trades", response_model=List[MT5TradeResponse])
async def get_account_trades(
    connection_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Retorna histórico de trades
    
    Args:
        connection_id: ID da conexão
        days: Quantidade de dias para buscar (default: 30)
    """
    service = MT5ConnectionService(db)
    return await service.get_trades(connection_id, days)


@router.post("/connection/{connection_id}/sync")
async def sync_account(
    connection_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Força sincronização de dados da conta"""
    service = MT5ConnectionService(db)
    
    background_tasks.add_task(
        service.sync_account_data,
        connection_id
    )
    
    return {"status": "sync_started"}


@router.delete("/connection/{connection_id}")
async def disconnect_account(
    connection_id: int,
    db: Session = Depends(get_db)
):
    """
    Desconecta e remove conta MT5 do sistema
    (remove do MetaApi também)
    """
    service = MT5ConnectionService(db)
    await service.delete_connection(connection_id)
    return {"status": "deleted"}
```

---

## 7. Schemas Pydantic

### 7.1 Arquivo: `src/schemas/mt5_connection.py`

```python
"""
Schemas para validação de dados
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class MT5ConnectionCreate(BaseModel):
    """Schema para criar nova conexão"""
    client_id: int = Field(..., description="ID do cliente iDeepX")
    login: str = Field(..., description="Login MT5", example="12345678")
    password: str = Field(..., description="Senha MT5")
    server: str = Field(..., description="Servidor MT5", example="GMI-Live")


class MT5ConnectionResponse(BaseModel):
    """Schema de resposta para conexão"""
    id: int
    client_id: int
    mt5_login: str
    mt5_server: str
    metaapi_account_id: Optional[str]
    metaapi_state: Optional[str]
    is_connected: bool
    balance: Decimal
    equity: Decimal
    currency: str
    broker_name: Optional[str]
    last_sync_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class MT5ConnectionStatus(BaseModel):
    """Status da conexão"""
    connection_id: int
    is_connected: bool
    metaapi_state: str
    last_sync_at: Optional[datetime]
    connection_error: Optional[str]


class MT5AccountInfo(BaseModel):
    """Informações em tempo real da conta"""
    balance: Decimal
    equity: Decimal
    margin: Decimal
    margin_free: Decimal
    margin_level: Optional[Decimal]
    currency: str
    leverage: int
    open_positions: int


class MT5TradeResponse(BaseModel):
    """Trade individual"""
    id: int
    deal_id: int
    symbol: str
    trade_type: str
    volume: Decimal
    price: Decimal
    profit: Decimal
    swap: Decimal
    commission: Decimal
    trade_time: datetime
    
    class Config:
        from_attributes = True
```

---

## 8. Serviço de Conexão

### 8.1 Arquivo: `src/services/connection_service.py`

```python
"""
Serviço de gerenciamento de conexões MT5
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import logging
from cryptography.fernet import Fernet

from ..models.mt5_connection import MT5Connection
from ..models.mt5_trade import MT5Trade
from ..metaapi.client import MetaApiClient
from ..config import settings

logger = logging.getLogger(__name__)


class MT5ConnectionService:
    """Serviço para gerenciar conexões MT5"""
    
    def __init__(self, db: Session):
        self.db = db
        self.metaapi = MetaApiClient(settings.METAAPI_TOKEN)
        self.cipher = Fernet(settings.ENCRYPTION_KEY)
    
    async def create_connection(
        self,
        client_id: int,
        mt5_login: str,
        mt5_password: str,
        mt5_server: str
    ) -> MT5Connection:
        """
        Cria nova conexão MT5 para um cliente
        """
        # Verifica se já existe conexão com esse login
        existing = self.db.query(MT5Connection).filter(
            MT5Connection.client_id == client_id,
            MT5Connection.mt5_login == mt5_login
        ).first()
        
        if existing:
            raise ValueError("Esta conta MT5 já está conectada")
        
        # Cria conta no MetaApi
        metaapi_account = await self.metaapi.create_account(
            login=mt5_login,
            password=mt5_password,
            server=mt5_server,
            name=f"iDeepX-{client_id}-{mt5_login}"
        )
        
        # Aguarda deploy
        deployed = await self.metaapi.wait_deployed(
            metaapi_account['id'],
            timeout=120
        )
        
        if not deployed:
            raise Exception("Timeout ao conectar na conta MT5")
        
        # Obtém info inicial
        account_info = await self.metaapi.get_account_info(
            metaapi_account['id']
        )
        
        # Criptografa senha
        password_encrypted = self.cipher.encrypt(
            mt5_password.encode()
        ).decode()
        
        # Cria registro no banco
        connection = MT5Connection(
            client_id=client_id,
            mt5_login=mt5_login,
            mt5_password_encrypted=password_encrypted,
            mt5_server=mt5_server,
            metaapi_account_id=metaapi_account['id'],
            metaapi_state='DEPLOYED',
            balance=account_info['balance'],
            equity=account_info['equity'],
            margin=account_info['margin'],
            margin_free=account_info['margin_free'],
            currency=account_info['currency'],
            leverage=account_info['leverage'],
            broker_name=account_info['broker'],
            is_connected=True,
            last_sync_at=datetime.utcnow()
        )
        
        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)
        
        logger.info(f"Conexão criada: {connection.id} para cliente {client_id}")
        
        return connection
    
    async def get_client_connections(
        self,
        client_id: int
    ) -> List[MT5Connection]:
        """Lista conexões de um cliente"""
        return self.db.query(MT5Connection).filter(
            MT5Connection.client_id == client_id
        ).all()
    
    async def get_connection_status(
        self,
        connection_id: int
    ) -> dict:
        """Retorna status atual da conexão"""
        connection = self.db.query(MT5Connection).get(connection_id)
        
        if not connection:
            raise ValueError("Conexão não encontrada")
        
        # Verifica estado no MetaApi
        if connection.metaapi_account_id:
            state = await self.metaapi.get_account_state(
                connection.metaapi_account_id
            )
            connection.metaapi_state = state
            self.db.commit()
        
        return {
            'connection_id': connection.id,
            'is_connected': connection.is_connected,
            'metaapi_state': connection.metaapi_state,
            'last_sync_at': connection.last_sync_at,
            'connection_error': connection.connection_error
        }
    
    async def get_realtime_info(
        self,
        connection_id: int
    ) -> dict:
        """Obtém dados em tempo real da conta"""
        connection = self.db.query(MT5Connection).get(connection_id)
        
        if not connection or not connection.metaapi_account_id:
            raise ValueError("Conexão não encontrada")
        
        # Busca dados atualizados do MetaApi
        info = await self.metaapi.get_account_info(
            connection.metaapi_account_id
        )
        
        # Busca posições abertas
        positions = await self.metaapi.get_positions(
            connection.metaapi_account_id
        )
        
        # Atualiza cache no banco
        connection.balance = info['balance']
        connection.equity = info['equity']
        connection.margin = info['margin']
        connection.margin_free = info['margin_free']
        connection.last_sync_at = datetime.utcnow()
        self.db.commit()
        
        return {
            'balance': info['balance'],
            'equity': info['equity'],
            'margin': info['margin'],
            'margin_free': info['margin_free'],
            'margin_level': (info['equity'] / info['margin'] * 100) if info['margin'] > 0 else None,
            'currency': info['currency'],
            'leverage': info['leverage'],
            'open_positions': len(positions)
        }
    
    async def sync_account_data(self, connection_id: int):
        """
        Sincroniza dados da conta (trades, balance, etc)
        Chamado periodicamente ou manualmente
        """
        connection = self.db.query(MT5Connection).get(connection_id)
        
        if not connection or not connection.metaapi_account_id:
            return
        
        try:
            # Atualiza info da conta
            info = await self.metaapi.get_account_info(
                connection.metaapi_account_id
            )
            
            connection.balance = info['balance']
            connection.equity = info['equity']
            connection.margin = info['margin']
            connection.margin_free = info['margin_free']
            connection.is_connected = True
            connection.connection_error = None
            
            # Busca trades novos (últimos 7 dias)
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=7)
            
            deals = await self.metaapi.get_deals(
                connection.metaapi_account_id,
                start_time,
                end_time
            )
            
            # Salva trades novos
            for deal in deals:
                existing = self.db.query(MT5Trade).filter(
                    MT5Trade.connection_id == connection_id,
                    MT5Trade.deal_id == deal.get('id')
                ).first()
                
                if not existing and deal.get('entryType') == 'DEAL_ENTRY_OUT':
                    trade = MT5Trade(
                        connection_id=connection_id,
                        deal_id=deal.get('id'),
                        order_id=deal.get('orderId'),
                        position_id=deal.get('positionId'),
                        symbol=deal.get('symbol'),
                        trade_type=deal.get('type'),
                        volume=deal.get('volume', 0),
                        price=deal.get('price', 0),
                        profit=deal.get('profit', 0),
                        swap=deal.get('swap', 0),
                        commission=deal.get('commission', 0),
                        trade_time=datetime.fromisoformat(
                            deal.get('time', '').replace('Z', '+00:00')
                        )
                    )
                    self.db.add(trade)
            
            connection.last_sync_at = datetime.utcnow()
            self.db.commit()
            
            logger.info(f"Sync concluído: conexão {connection_id}")
            
        except Exception as e:
            logger.error(f"Erro no sync {connection_id}: {e}")
            connection.is_connected = False
            connection.connection_error = str(e)
            self.db.commit()
    
    async def get_trades(
        self,
        connection_id: int,
        days: int = 30
    ) -> List[MT5Trade]:
        """Retorna trades do banco de dados"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        return self.db.query(MT5Trade).filter(
            MT5Trade.connection_id == connection_id,
            MT5Trade.trade_time >= cutoff
        ).order_by(MT5Trade.trade_time.desc()).all()
    
    async def delete_connection(self, connection_id: int):
        """Remove conexão do sistema e do MetaApi"""
        connection = self.db.query(MT5Connection).get(connection_id)
        
        if not connection:
            raise ValueError("Conexão não encontrada")
        
        # Remove do MetaApi
        if connection.metaapi_account_id:
            await self.metaapi.delete_account(
                connection.metaapi_account_id
            )
        
        # Remove trades
        self.db.query(MT5Trade).filter(
            MT5Trade.connection_id == connection_id
        ).delete()
        
        # Remove conexão
        self.db.delete(connection)
        self.db.commit()
        
        logger.info(f"Conexão removida: {connection_id}")
```

---

## 9. Tasks de Background (Celery)

### 9.1 Arquivo: `src/tasks/sync_tasks.py`

```python
"""
Tasks assíncronas para sincronização de dados
"""

from celery import Celery
from datetime import datetime, timedelta
import logging

from ..database import SessionLocal
from ..services.connection_service import MT5ConnectionService
from ..models.mt5_connection import MT5Connection
from ..config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    'ideepx_tasks',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.beat_schedule = {
    # Sincroniza todas as contas a cada 5 minutos
    'sync-all-accounts': {
        'task': 'src.tasks.sync_tasks.sync_all_accounts',
        'schedule': 300.0,  # 5 minutos
    },
    # Coleta trades novos a cada 15 minutos
    'collect-new-trades': {
        'task': 'src.tasks.sync_tasks.collect_new_trades',
        'schedule': 900.0,  # 15 minutos
    },
}


@celery_app.task
def sync_all_accounts():
    """Sincroniza dados de todas as contas ativas"""
    db = SessionLocal()
    
    try:
        connections = db.query(MT5Connection).filter(
            MT5Connection.is_connected == True,
            MT5Connection.metaapi_account_id.isnot(None)
        ).all()
        
        logger.info(f"Sincronizando {len(connections)} contas")
        
        service = MT5ConnectionService(db)
        
        for conn in connections:
            try:
                import asyncio
                asyncio.run(service.sync_account_data(conn.id))
            except Exception as e:
                logger.error(f"Erro sync conta {conn.id}: {e}")
                
    finally:
        db.close()


@celery_app.task
def collect_new_trades():
    """Coleta trades novos de todas as contas"""
    db = SessionLocal()
    
    try:
        connections = db.query(MT5Connection).filter(
            MT5Connection.is_connected == True
        ).all()
        
        service = MT5ConnectionService(db)
        
        for conn in connections:
            try:
                import asyncio
                asyncio.run(service.sync_account_data(conn.id))
            except Exception as e:
                logger.error(f"Erro coletando trades {conn.id}: {e}")
                
    finally:
        db.close()


@celery_app.task
def sync_single_account(connection_id: int):
    """Sincroniza uma conta específica"""
    db = SessionLocal()
    
    try:
        service = MT5ConnectionService(db)
        import asyncio
        asyncio.run(service.sync_account_data(connection_id))
    finally:
        db.close()
```

---

## 10. Configurações

### 10.1 Arquivo: `src/config.py`

```python
"""
Configurações do sistema
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/ideepx"
    
    # MetaApi
    METAAPI_TOKEN: str
    
    # Encryption
    ENCRYPTION_KEY: str  # Gerar com: Fernet.generate_key()
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # App
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
```

### 10.2 Arquivo: `.env.example`

```env
# Database
DATABASE_URL=postgresql://ideepx:password@localhost:5432/ideepx

# MetaApi (obter em https://app.metaapi.cloud/token)
METAAPI_TOKEN=seu_token_aqui

# Encryption Key (gerar com: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=sua_chave_aqui

# Redis/Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Debug
DEBUG=true
```

---

## 11. Comandos para Desenvolvimento

### 11.1 Setup Inicial

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependências
pip install fastapi uvicorn sqlalchemy asyncpg
pip install metaapi-cloud-sdk
pip install celery redis
pip install cryptography
pip install pydantic-settings
pip install python-dotenv

# Criar banco de dados
createdb ideepx

# Rodar migrations (usar Alembic)
alembic upgrade head
```

### 11.2 Rodar Aplicação

```bash
# API
uvicorn src.main:app --reload --port 8000

# Celery Worker
celery -A src.tasks.sync_tasks worker --loglevel=info

# Celery Beat (scheduler)
celery -A src.tasks.sync_tasks beat --loglevel=info
```

### 11.3 Testar Endpoints

```bash
# Conectar conta MT5
curl -X POST http://localhost:8000/api/v1/mt5/connect \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "login": "12345678",
    "password": "minhasenha",
    "server": "GMI-Live"
  }'

# Ver conexões do cliente
curl http://localhost:8000/api/v1/mt5/connections/1

# Ver info em tempo real
curl http://localhost:8000/api/v1/mt5/connection/1/info

# Ver trades
curl http://localhost:8000/api/v1/mt5/connection/1/trades?days=30
```

---

## 12. Integração com Frontend

### 12.1 Exemplo de Componente Vue.js

```vue
<template>
  <div class="mt5-connect">
    <h3>Conectar Conta MT5</h3>
    
    <form @submit.prevent="connectAccount">
      <div class="form-group">
        <label>Login MT5</label>
        <input v-model="form.login" type="text" required />
      </div>
      
      <div class="form-group">
        <label>Senha</label>
        <input v-model="form.password" type="password" required />
        <small>Pode usar senha investor para acesso somente leitura</small>
      </div>
      
      <div class="form-group">
        <label>Servidor</label>
        <input v-model="form.server" type="text" placeholder="GMI-Live" required />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Conectando...' : 'Conectar Conta' }}
      </button>
    </form>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="connection" class="success">
      <p>✅ Conta conectada com sucesso!</p>
      <p>Balance: {{ connection.balance }} {{ connection.currency }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        login: '',
        password: '',
        server: ''
      },
      loading: false,
      error: null,
      connection: null
    }
  },
  methods: {
    async connectAccount() {
      this.loading = true
      this.error = null
      
      try {
        const response = await this.$api.post('/api/v1/mt5/connect', {
          client_id: this.$store.state.user.id,
          ...this.form
        })
        
        this.connection = response.data
        this.$emit('connected', this.connection)
        
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao conectar'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

---

## 13. Considerações de Segurança

1. **Senhas MT5**: Sempre criptografar com Fernet antes de salvar no banco
2. **Token MetaApi**: Nunca expor no frontend, manter apenas no backend
3. **Rate Limiting**: Implementar rate limit nos endpoints
4. **Validação**: Validar todos os inputs do usuário
5. **HTTPS**: Sempre usar HTTPS em produção

---

## 14. Custos Estimados MetaApi

| Quantidade de Contas | Custo Mensal Estimado |
|---------------------|----------------------|
| 1 conta | Grátis |
| 10 contas | ~$50-100 |
| 50 contas | ~$250-500 |
| 100 contas | ~$500-1000 |
| 500 contas | Negociar com MetaApi |

---

## 15. Próximos Passos

1. [ ] Configurar ambiente de desenvolvimento
2. [ ] Criar banco de dados e tabelas
3. [ ] Implementar cliente MetaApi
4. [ ] Criar endpoints da API
5. [ ] Implementar serviço de conexão
6. [ ] Configurar tasks Celery
7. [ ] Integrar com frontend existente
8. [ ] Testes com conta demo
9. [ ] Deploy em produção

---

**Documento criado para desenvolvimento com Claude Code no VS Code**
