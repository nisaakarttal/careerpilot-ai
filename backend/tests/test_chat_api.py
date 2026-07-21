import unittest
from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch
from uuid import uuid4

from fastapi import HTTPException

from app.api.endpoints.chat import complete_chat_session, send_chat_message
from app.models.chat import ChatMessage, ChatSession
from app.models.resume import Resume
from app.models.user import User
from app.schemas.chat import ChatMessageCreate


class ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class ListResult:
    def __init__(self, values):
        self.values = values

    def scalars(self):
        return self

    def all(self):
        return self.values


def make_user() -> User:
    return User(
        id=uuid4(),
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed",
        created_at=datetime.now(),
    )


def make_resume(user_id) -> Resume:
    return Resume(
        id=uuid4(),
        user_id=user_id,
        original_filename="cv.pdf",
        raw_text="Python ve FastAPI projeleri geliştirdim.",
    )


class ChatApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_completed_session_rejects_new_messages(self):
        user = make_user()
        chat_session = ChatSession(
            user_id=user.id,
            resume_id=uuid4(),
            status="completed",
        )
        db_session = AsyncMock()
        db_session.add = Mock()
        db_session.execute.return_value = ScalarResult(chat_session)

        with self.assertRaises(HTTPException) as raised:
            await send_chat_message(
                chat_session.id,
                ChatMessageCreate(content="Yeni cevap"),
                current_user=user,
                session=db_session,
            )

        self.assertEqual(raised.exception.status_code, 409)
        db_session.commit.assert_not_awaited()

    @patch("app.api.endpoints.chat._generate_completion", new_callable=AsyncMock)
    async def test_interview_session_completion_persists_result(self, generate_completion):
        user = make_user()
        resume = make_resume(user.id)
        chat_session = ChatSession(
            user_id=user.id,
            resume_id=resume.id,
            assistant_type="interview",
        )
        messages = [
            ChatMessage(
                session_id=chat_session.id,
                role="model",
                content="Bir projenizi anlatın.",
            ),
            ChatMessage(
                session_id=chat_session.id,
                role="user",
                content="FastAPI ile bir servis geliştirdim.",
            ),
        ]
        evaluation = {
            "overall_score": 80,
            "communication_score": 82,
            "technical_depth_score": 78,
            "evidence_score": 75,
            "strengths": ["Net anlatım"],
            "improvement_areas": ["Daha fazla ölçülebilir sonuç"],
            "recommended_answer_framework": "STAR",
            "evaluation_summary": "Başarılı bir görüşme.",
        }
        generate_completion.return_value = evaluation

        db_session = AsyncMock()
        db_session.add = Mock()
        db_session.execute.side_effect = [
            ScalarResult(chat_session),
            ScalarResult(resume),
            ListResult(messages),
        ]
        db_session.refresh = AsyncMock()

        result = await complete_chat_session(
            chat_session.id,
            current_user=user,
            session=db_session,
        )

        self.assertEqual(result.status, "completed")
        self.assertEqual(result.session_result, evaluation)
        self.assertIsInstance(result.completed_at, datetime)
        db_session.commit.assert_awaited_once()
        generate_completion.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
