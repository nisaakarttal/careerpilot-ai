import io
import unittest
from unittest.mock import patch

from fastapi import HTTPException, UploadFile
from PyPDF2 import PdfWriter

from app.services.parser import clean_cv_text, extract_resume_text


def make_upload(filename: str, content: bytes) -> UploadFile:
    return UploadFile(filename=filename, file=io.BytesIO(content))


class ResumeParserTests(unittest.IsolatedAsyncioTestCase):
    def test_clean_cv_text_normalizes_whitespace(self):
        cleaned = clean_cv_text("  Python   FastAPI \n\n  PostgreSQL\tDocker  ")

        self.assertEqual(cleaned, "Python FastAPI\nPostgreSQL Docker")

    async def test_rejects_file_without_filename(self):
        upload = UploadFile(filename=None, file=io.BytesIO(b"content"))

        with self.assertRaises(HTTPException) as raised:
            await extract_resume_text(upload, max_size_mb=1)

        self.assertEqual(raised.exception.status_code, 400)

    async def test_rejects_unsupported_extension_case_insensitively(self):
        upload = make_upload("resume.txt", b"plain text")

        with self.assertRaises(HTTPException) as raised:
            await extract_resume_text(upload, max_size_mb=1)

        self.assertEqual(raised.exception.status_code, 400)
        self.assertIn("PDF and DOCX", raised.exception.detail)

    async def test_rejects_empty_file(self):
        upload = make_upload("resume.pdf", b"")

        with self.assertRaises(HTTPException) as raised:
            await extract_resume_text(upload, max_size_mb=1)

        self.assertEqual(raised.exception.status_code, 400)

    async def test_rejects_file_over_size_limit(self):
        upload = make_upload("resume.docx", b"x" * 2048)

        with self.assertRaises(HTTPException) as raised:
            await extract_resume_text(upload, max_size_mb=0.001)

        self.assertEqual(raised.exception.status_code, 400)
        self.assertIn("Maximum file size", raised.exception.detail)

    async def test_maps_corrupt_docx_to_unprocessable_entity(self):
        upload = make_upload("resume.docx", b"not-a-docx")

        with self.assertRaises(HTTPException) as raised:
            await extract_resume_text(upload, max_size_mb=1)

        self.assertEqual(raised.exception.status_code, 422)
        self.assertIn("corrupted or unreadable", raised.exception.detail)

    async def test_accepts_uppercase_docx_extension(self):
        upload = make_upload("RESUME.DOCX", b"placeholder")

        with patch(
            "app.services.parser._extract_docx_text",
            return_value="Python ve FastAPI deneyimi",
        ):
            result = await extract_resume_text(upload, max_size_mb=1)

        self.assertEqual(result, "Python ve FastAPI deneyimi")

    async def test_rejects_password_protected_pdf(self):
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        writer.encrypt("secret")
        buffer = io.BytesIO()
        writer.write(buffer)
        upload = make_upload("protected.pdf", buffer.getvalue())

        with self.assertRaises(HTTPException) as raised:
            await extract_resume_text(upload, max_size_mb=1)

        self.assertEqual(raised.exception.status_code, 422)
        self.assertIn("password protected", raised.exception.detail)


if __name__ == "__main__":
    unittest.main()
