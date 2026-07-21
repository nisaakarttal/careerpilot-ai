import unittest
from uuid import uuid4

from pydantic import ValidationError

from app.models.chat import ChatSession
from app.schemas.chat import ChatMessageCreate, ChatSessionCreate, ChatSessionResponse


class ChatSchemaTests(unittest.TestCase):
    def test_session_defaults_to_interview(self):
        payload = ChatSessionCreate(resume_id=uuid4())

        self.assertEqual(payload.assistant_type, "interview")

    def test_session_accepts_career_coach(self):
        payload = ChatSessionCreate(
            resume_id=uuid4(),
            assistant_type="career_coach",
        )

        self.assertEqual(payload.assistant_type, "career_coach")

    def test_session_rejects_unknown_assistant_type(self):
        with self.assertRaises(ValidationError):
            ChatSessionCreate(
                resume_id=uuid4(),
                assistant_type="unknown",
            )

    def test_message_length_is_bounded(self):
        with self.assertRaises(ValidationError):
            ChatMessageCreate(content="x" * 4001)

    def test_message_is_trimmed_and_cannot_be_blank(self):
        payload = ChatMessageCreate(content="  Hedefim backend geliştirme.  ")
        self.assertEqual(payload.content, "Hedefim backend geliştirme.")

        with self.assertRaises(ValidationError):
            ChatMessageCreate(content="   ")

    def test_session_response_exposes_lifecycle_fields(self):
        session = ChatSession(user_id=uuid4(), resume_id=uuid4())

        response = ChatSessionResponse.model_validate(session)

        self.assertEqual(response.status, "active")
        self.assertEqual(response.session_result, {})
        self.assertIsNone(response.completed_at)


if __name__ == "__main__":
    unittest.main()
