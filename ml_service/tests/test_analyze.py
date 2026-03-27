import unittest
from analysis import simple_analyze


class TestSimpleAnalyze(unittest.TestCase):
    def test_legitimate_text(self):
        res = simple_analyze('email', 'Hello, this is a normal message with no suspicious content.')
        self.assertIn(res['classification'], ['legitimate', 'unknown'])
        self.assertIsInstance(res['score'], int)

    def test_phishing_text(self):
        text = 'Please login to confirm your account: http://malicious.example.com'
        res = simple_analyze('email', text)
        self.assertEqual(res['classification'], 'phishing')
        self.assertGreaterEqual(res['score'], 80)

    def test_urls_count(self):
        text = 'Visit http://a.com and http://b.com'
        res = simple_analyze('url', text)
        self.assertEqual(res['classification'], 'phishing')
        self.assertEqual(res['explain']['urls_found'], 2)


if __name__ == '__main__':
    unittest.main()
