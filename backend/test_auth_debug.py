from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    hash = pwd_context.hash("test12345")
    print(f"Hash generated: {hash}")
    
    verify = pwd_context.verify("test12345", hash)
    print(f"Verification: {verify}")
    
    # Test long password
    long_pwd = "x" * 80
    try:
        pwd_context.hash(long_pwd)
        print("Long password hashed (passlib handled truncation/hashing)")
    except Exception as e:
        print(f"Long password hash error: {e}")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
