import io
import re

import docx2txt
from fastapi import HTTPException, UploadFile, status
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError


class ResumeParseError(Exception):
    pass


SUPPORTED_EXTENSIONS = {".pdf", ".docx"}


def clean_cv_text(text: str) -> str:
    """
    AI analizine gönderilecek CV metnini temizler.
    """

    if not text:
        return ""

    # Çoklu satır sonlarını temizle
    text = re.sub(r"\n+", "\n", text)

    # Fazla boşlukları temizle
    text = re.sub(r"[ \t]+", " ", text)

    # Satır başı ve sonu boşluklarını kaldır
    text = "\n".join(line.strip() for line in text.split("\n"))

    # Son temizlik
    text = text.strip()

    return text


def _get_extension(filename: str) -> str:
    if "." not in filename:
        return ""
    return "." + filename.rsplit(".", 1)[-1].lower()


def _extract_pdf_text(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except PdfReadError as exc:
        raise ResumeParseError(
            "The uploaded PDF file is corrupted or unreadable."
        ) from exc

    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception as exc:
            raise ResumeParseError(
                "The uploaded PDF file is password protected."
            ) from exc

    text_parts = []

    for page in reader.pages:
        text_parts.append(page.extract_text() or "")

    text = "\n".join(text_parts).strip()

    if not text:
        raise ResumeParseError(
            "No readable text could be extracted from the PDF. It may be a scanned image."
        )

    return clean_cv_text(text)


def _extract_docx_text(file_bytes: bytes) -> str:
    try:
        with io.BytesIO(file_bytes) as buffer:
            text = docx2txt.process(buffer)

    except Exception as exc:
        raise ResumeParseError(
            "The uploaded DOCX file is corrupted or unreadable."
        ) from exc

    text = (text or "").strip()

    if not text:
        raise ResumeParseError(
            "No readable text could be extracted from the DOCX file."
        )

    return clean_cv_text(text)


async def extract_resume_text(
    file: UploadFile,
    max_size_mb: int,
) -> str:

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file has no filename.",
        )

    extension = _get_extension(file.filename)

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported.",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    max_size_bytes = max_size_mb * 1024 * 1024

    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum file size is {max_size_mb} MB.",
        )

    try:
        if extension == ".pdf":
            return _extract_pdf_text(file_bytes)

        return _extract_docx_text(file_bytes)

    except ResumeParseError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc