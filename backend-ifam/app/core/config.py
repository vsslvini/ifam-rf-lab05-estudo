"""Configuracoes de ambiente da API (Pydantic Settings).

Referencia: docs/seq_06_mapa_backend.md - `app/core/config.py`.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Variaveis de ambiente da aplicacao, carregadas do arquivo `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Identificacao da aplicacao ---
    APP_NAME: str = "Portal de Servicos e Gestao IFAM"
    APP_VERSION: str = "2.0.0"
    INSTITUICAO: str = "IFAM - Instituto Federal do Amazonas"

    # --- Banco de dados ---
    DATABASE_URL: str = "postgresql+psycopg://ifam:ifam@localhost:5432/ifam"

    # Enquanto `true`, os repositorios em memoria sao usados e a engine do
    # SQLAlchemy nao e aberta. Ver app/repositories/.
    USE_IN_MEMORY_REPO: bool = True

    # --- Seguranca / JWT (RF-CORE01, Equipe 1) ---
    SECRET_KEY: str = "troque-esta-chave-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:19006"

    @property
    def cors_origins_list(self) -> list[str]:
        """Converte a string separada por virgulas em lista de origens."""
        return [origem.strip() for origem in self.CORS_ORIGINS.split(",") if origem.strip()]


@lru_cache
def get_settings() -> Settings:
    """Instancia unica das configuracoes (cacheada)."""
    return Settings()


settings = get_settings()
