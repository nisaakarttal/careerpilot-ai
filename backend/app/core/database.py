from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def init_db() -> None:
    from app.models import user  # noqa: F401
    from app.models import resume  # noqa: F401
    from app.models import job  # noqa: F401
    from app.models import chat  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        # Compatibility migration for databases created before Sprint 3.
        # This is idempotent and can be replaced by Alembic once a full
        # migration baseline is introduced.
        await conn.execute(
            text(
                "ALTER TABLE chatsessions ADD COLUMN IF NOT EXISTS "
                "assistant_type VARCHAR(32) NOT NULL DEFAULT 'interview'"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chatsessions_assistant_type "
                "ON chatsessions (assistant_type)"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE chatsessions ADD COLUMN IF NOT EXISTS "
                "status VARCHAR(16) NOT NULL DEFAULT 'active'"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE chatsessions ADD COLUMN IF NOT EXISTS "
                "session_result JSONB NOT NULL DEFAULT '{}'::jsonb"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE chatsessions ADD COLUMN IF NOT EXISTS "
                "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE chatsessions ADD COLUMN IF NOT EXISTS "
                "completed_at TIMESTAMP NULL"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chatsessions_status "
                "ON chatsessions (status)"
            )
        )


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
