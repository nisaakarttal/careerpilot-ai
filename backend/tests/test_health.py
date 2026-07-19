import asyncio
import unittest

from app.main import health_check


class HealthEndpointTests(unittest.TestCase):
    def test_health_check_returns_service_status(self):
        payload = asyncio.run(health_check())

        self.assertEqual(payload["status"], "ok")
        self.assertTrue(payload["service"])


if __name__ == "__main__":
    unittest.main()
