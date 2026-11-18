"""Ponto de entrada da API RESTful do Portal IFAM.

Referencia: docs/seq_06_mapa_backend.md - `app/main.py`.

Estado atual: apenas o router do RF-LAB05 (aprovacao de alocacoes de
laboratorio) esta incluido. Cada dupla acrescenta o `include_router` do seu
dominio aqui conforme entrega a sua feature.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.laboratorios import alocacoes as laboratorios_alocacoes
from app.seed import inicializar_banco


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Prepara o PostgreSQL (schema + seed) quando o banco real esta ligado."""
    if not settings.USE_IN_MEMORY_REPO:
        inicializar_banco()
    yield


app = FastAPI(
    lifespan=lifespan,
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "API RESTful institucional do IFAM - plataforma multi-modulos "
        "(Core/SSO, Emprestimo de Equipamentos e Alocacao de Laboratorios)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Core"], summary="Health check")
def health_check() -> dict[str, str]:
    """Contrato definido no seq_06, secao 1.1."""
    return {
        "status": "online",
        "versao": settings.APP_VERSION,
        "instituicao": settings.INSTITUICAO,
        "documentacao": "/docs",
    }


@app.get("/ping", tags=["Core"], summary="Teste de latencia")
def ping() -> dict[str, str]:
    """Contrato definido no seq_06, secao 1.2."""
    return {
        "ping": "pong",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


# --- Modulo 2: Alocacao e Gestao de Laboratorios de Informatica ---
app.include_router(laboratorios_alocacoes.router)  # RF-LAB05

# TODO(RF-LAB08, Equipe 19): `app/routers/laboratorios/dashboard.py` ja existe
# na develop, mas o endpoint `/kpis` ainda tem corpo `pass` - incluir o router
# aqui faria a rota falhar na validacao do response_model. Basta acrescentar
# `app.include_router(laboratorios_dashboard.router)` quando ele for implementado.

# TODO(demais duplas): incluir aqui os routers de auth, usuarios, notificacoes,
# do Modulo 1 (equipamentos) e os demais do Modulo 2 (labs, softwares, grades e
# operacoes de check-in/fechamento).
