import os
import csv
import json
import logging
from io import BytesIO
from typing import Optional

# Optional imports for different file types
try:
    from docx import Document
except ImportError:
    Document = None

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None


def extract_text_from_file(file_path: str, mime_type: str = "") -> str:
    """
    Extracts text content from various file formats.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if ext in ['.txt', '.log']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
                
        elif ext == '.csv':
            text = []
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                reader = csv.reader(f)
                for row in reader:
                    text.append(" ".join(row))
            return "\n".join(text)
            
        elif ext == '.json':
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                data = json.load(f)
                return json.dumps(data, indent=2)
                
        elif ext in ['.docx', '.doc']:
            if Document:
                doc = Document(file_path)
                return "\n".join([paragraph.text for paragraph in doc.paragraphs])
            else:
                return "Python-docx not installed. Cannot read DOCX."
                
        elif ext == '.pdf':
            if PyPDF2:
                text = []
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text.append(extracted)
                return "\n".join(text)
            else:
                return "PyPDF2 not installed. Cannot read PDF."
                
        else:
            # Fallback to raw text extraction for unknown types
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
                
    except Exception as e:
        logging.error(f"Error reading file {file_path}: {e}")
        return f"Error extracting text: {e}"
