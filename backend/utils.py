import os
import pandas as pd
import pdfplumber
from docx import Document
import logging

def extract_pdf_text(path):
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"PDF extraction error: {e}")
    return text

def extract_docx_text(path):
    try:
        doc = Document(path)
        text = "\n".join([p.text for p in doc.paragraphs])
        return text
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

def extract_csv_text(path):
    try:
        df = pd.read_csv(path)
        return df.to_string()
    except Exception as e:
        print(f"CSV extraction error: {e}")
        return ""

def extract_text_from_file(path):
    text = ""
    if path.endswith(".pdf"):
        text = extract_pdf_text(path)
    elif path.endswith(".docx"):
        text = extract_docx_text(path)
    elif path.endswith(".csv"):
        text = extract_csv_text(path)
    elif path.endswith(".txt"):
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        except Exception as e:
            print(f"TXT extraction error: {e}")
    
    # Debug output
    print(f"Extracted text length: {len(text)}")
    
    if len(text) < 20:
        return "ERROR: Document extraction failed. No readable text found or document too short."
        
    return text
