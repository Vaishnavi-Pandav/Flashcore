from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
# from routes import ... # Import routes here

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce API")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-commerce API"}

# app.include_router(...) # Include your routers here
