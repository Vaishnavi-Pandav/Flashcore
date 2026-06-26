from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from database import engine, Base
from contextlib import asynccontextmanager
import os

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import orders_router, cart_router, reviews_router
from routes.payments import router as payments_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # In production, use Alembic migrations instead of create_all
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Redis for caching
    redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    yield
    await redis.close()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="E-commerce API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Required for Authlib OAuth
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "super-secret-key"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://flashcore.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(cart_router)
app.include_router(reviews_router)
app.include_router(payments_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Async FastAPI E-commerce API"}
