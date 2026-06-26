# Full-Stack E-Commerce Project

This is a full-stack e-commerce application using React + Vite on the frontend and FastAPI on the backend.

## Project Structure

- `/frontend`: React + Vite + Tailwind CSS + React Router v6
- `/backend`: Python FastAPI (routes, models, schemas, services, database)

## Running the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. Install requirements (create a `requirements.txt` with fastapi, uvicorn, sqlalchemy, python-dotenv):
   ```bash
   pip install fastapi uvicorn sqlalchemy python-dotenv
   ```

4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

## Running the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at the URL shown in your terminal (usually `http://localhost:5173`).
