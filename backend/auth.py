from datetime import datetime, timedelta
from typing import Optional, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt

from pydantic import BaseModel

from activity_store import _record_activity


# Secret key (in production use env variable)
SECRET_KEY = "vigil-ai-secret-key-change-me-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300


# -----------------------------
# Models
# -----------------------------

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "user"
    disabled: Optional[bool] = None


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    role: str = "user"


class LoginRequest(BaseModel):
    username: str
    password: str


# -----------------------------
# Router
# -----------------------------

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# -----------------------------
# In-memory database
# -----------------------------

fake_users_db: Dict[str, Dict] = {}


# -----------------------------
# Password hashing
# -----------------------------

def get_password_hash(password: str) -> str:

    pwd_bytes = password.encode("utf-8")

    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]

    salt = bcrypt.gensalt()

    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:

    if not plain_password or not hashed_password:
        return False

    try:

        pwd_bytes = plain_password.encode("utf-8")

        if len(pwd_bytes) > 72:
            pwd_bytes = pwd_bytes[:72]

        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))

    except Exception as e:
        print(f"PASSWORD VERIFY EXCEPTION: {type(e).__name__} - {str(e)}")
        return False


# -----------------------------
# Initialize sample users
# -----------------------------

fake_users_db["admin"] = {
    "username": "Sarah_Mitchell",
    "email": "admin@vigil.ai",
    "full_name": "Sarah Mitchell",
    "role": "admin",
    "hashed_password": get_password_hash("admin123"),
    "disabled": False,
}

fake_users_db["user"] = {
    "username": "user",
    "email": "user@vigil.ai",
    "full_name": "Standard User",
    "role": "user",
    "hashed_password": get_password_hash("user123"),
    "disabled": False,
}


# -----------------------------
# Utility functions
# -----------------------------

def get_user(db, username: str):

    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

    return None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


# -----------------------------
# Current user dependency
# -----------------------------

async def get_current_user(token: str = Depends(oauth2_scheme)):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("sub")
        role: str = payload.get("role")

        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username, role=role)

    except JWTError:
        raise credentials_exception

    user = get_user(fake_users_db, username=token_data.username)

    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):

    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user


# -----------------------------
# Login endpoints
# -----------------------------

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):

    user = get_user(fake_users_db, form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
    }


@router.post("/login", response_model=Token)
async def login_json(creds: LoginRequest):

    user = get_user(fake_users_db, creds.username)

    print(f"DEBUG LOGIN: username={creds.username} len={len(creds.password)}")

    if not user or not verify_password(creds.password, user.hashed_password):

        _record_activity(
            kind="login_failed",
            title=f"Failed login attempt for '{creds.username}'",
            details={"username": creds.username},
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires,
    )

    _record_activity(
        kind="login",
        title=f"{'Admin' if user.role == 'admin' else 'User'} logged in",
        details={"username": user.username, "role": user.role},
        username=user.username,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
    }


# -----------------------------
# Register
# -----------------------------

@router.post("/register", response_model=User)
async def register_user(user: UserCreate):

    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username already registered")

    if len(user.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long (max 72 bytes)")

    hashed_password = get_password_hash(user.password)

    user_obj = UserInDB(
        username=user.username,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password,
        disabled=False,
    )

    fake_users_db[user.username] = user_obj.dict()

    _record_activity(
        kind="register",
        title=f"New account registered: {user.username}",
        details={"username": user.username, "email": user.email, "role": user.role},
        username=user.username,
        role=user.role,
    )

    return user_obj


# -----------------------------
# Current user info
# -----------------------------

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):

    return current_user