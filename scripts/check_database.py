import argparse
import asyncio
import os
import time
from pathlib import Path

import asyncpg


DEFAULT_DATABASE_URL = (
    "postgresql+asyncpg://careerpilot:careerpilot@localhost:5432/careerpilot"
)


def load_database_url() -> str:
    env_path = Path(__file__).resolve().parents[1] / "backend" / ".env"
    database_url = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key.strip() == "DATABASE_URL":
                database_url = value.strip().strip('"').strip("'")
                break

    return database_url.replace("postgresql+asyncpg://", "postgresql://", 1)


async def try_connect(database_url: str) -> None:
    connection = await asyncpg.connect(database_url, timeout=3)
    try:
        await connection.execute("select 1")
    finally:
        await connection.close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wait", type=int, default=0)
    args = parser.parse_args()

    database_url = load_database_url()
    deadline = time.time() + max(args.wait, 0)
    last_error = None

    while True:
        try:
            asyncio.run(try_connect(database_url))
            print("[OK] PostgreSQL connection is ready.")
            return 0
        except Exception as exc:
            last_error = exc
            if time.time() >= deadline:
                break
            time.sleep(2)

    print("[WARN] PostgreSQL connection failed.")
    print(f"       {last_error}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
