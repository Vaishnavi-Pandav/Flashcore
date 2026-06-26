from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from contextlib import asynccontextmanager

from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import orders_router, cart_router, reviews_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # In production, use Alembic migrations instead of create_all
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="E-commerce API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(cart_router)
app.include_router(reviews_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Async FastAPI E-commerce API"}
