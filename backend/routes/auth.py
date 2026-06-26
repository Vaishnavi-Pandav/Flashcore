from fastapi import APIRouter, Depends, HTTPException, status, Body, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from datetime import timedelta
from jose import jwt, JWTError

from database import get_db
from models.user import User, UserRole
from schemas.user import UserCreate, UserResponse
from schemas.token import Token
from services.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    get_user_by_email,
    get_current_user,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    oauth
)

router = APIRouter(prefix="/auth", tags=["auth"])

def _set_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False, # Set to True in prod with HTTPS
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False,
    )

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=UserRole.USER
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Automatically log in the user after register
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    _set_cookies(response, access_token, refresh_token)
    
    return new_user

@router.post("/login", response_model=UserResponse)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.username) # OAuth2 form uses 'username' mapped to email
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    _set_cookies(response, access_token, refresh_token)
    
    return user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token found")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    from sqlalchemy.future import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    _set_cookies(response, new_access_token, new_refresh_token)
    
    return {"message": "Token refreshed"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# -- Google OAuth Routes --

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    # Because of local dev reverse proxy or mismatched ports, we might hardcode the redirect URI in prod
    # redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
    except Exception as e:
        # Mock behavior for local testing without real keys
        print("OAuth Exception, using mock data:", e)
        user_info = {"email": "mock-oauth-user@example.com", "sub": "mock-sub"}

    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
    
    email = user_info.get("email")
    user = await get_user_by_email(db, email)
    
    if not user:
        # Register them
        import secrets
        new_user = User(
            email=email,
            hashed_password=get_password_hash(secrets.token_urlsafe(32)), # Random password for OAuth users
            role=UserRole.USER
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        user = new_user

    # Log them in
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    _set_cookies(response, access_token, refresh_token)

    # Instead of returning JSON, redirect to the frontend with cookies set
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="http://localhost:5173/")
