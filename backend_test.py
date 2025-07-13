#!/usr/bin/env python3
"""
Backend API Testing for German Letter AI Assistant
Tests all endpoints without MongoDB dependency, Google OAuth only
"""

import requests
import sys
import json
import tempfile
import os
from datetime import datetime
from typing import Dict, Any

class GermanLetterAPITester:
    def __init__(self, base_url="https://92be5079-dffc-4fe2-aa83-66514227cb87.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        
        print(f"🚀 Testing German Letter AI Assistant API")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict = None, files: Dict = None, headers: Dict = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            test_headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=test_headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   📄 Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   📄 Response: {response.text[:200]}...")
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   📄 Error: {json.dumps(error_data, indent=2)}")
                    return False, error_data
                except:
                    print(f"   📄 Error: {response.text}")
                    return False, {}

        except requests.exceptions.Timeout:
            print(f"   ❌ FAILED - Request timeout")
            return False, {}
        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_basic_health_checks(self):
        """Test basic health endpoints"""
        print("\n🏥 TESTING HEALTH ENDPOINTS")
        print("-" * 40)
        
        # Root health check
        self.run_test("Root Health Check", "GET", "/health", 200)
        
        # API health check
        self.run_test("API Health Check", "GET", "/api/health", 200)
        
        # LLM status check
        self.run_test("LLM Status Check", "GET", "/api/llm-status", 200)

    def test_google_oauth_mock(self):
        """Test Google OAuth endpoint with mock data"""
        print("\n🔐 TESTING GOOGLE OAUTH")
        print("-" * 40)
        
        # Mock Google OAuth data
        mock_user_info = {
            "sub": "123456789",
            "email": "test@example.com",
            "name": "Test User",
            "picture": "https://example.com/avatar.jpg"
        }
        
        mock_auth_request = {
            "credential": "mock.jwt.token",
            "user_info": mock_user_info
        }
        
        success, response = self.run_test(
            "Google OAuth Verification",
            "POST",
            "/api/auth/google/verify",
            200,
            data=mock_auth_request
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response.get('user', {})
            print(f"   🎫 Token obtained: {self.token[:20]}...")
            print(f"   👤 User: {self.user_data.get('name', 'Unknown')}")
            return True
        else:
            print(f"   ⚠️  OAuth failed, continuing without authentication")
            return False

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            print("\n⚠️  SKIPPING AUTHENTICATED TESTS - No token available")
            return
            
        print("\n🔒 TESTING AUTHENTICATED ENDPOINTS")
        print("-" * 40)
        
        auth_headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # Test profile endpoint
        self.run_test(
            "Get User Profile",
            "GET",
            "/api/profile",
            200,
            headers=auth_headers
        )
        
        # Test Gemini API key endpoint
        mock_api_key = {
            "gemini_api_key": "AIzaSyDummyKeyForTesting123456789"
        }
        
        # This might fail due to invalid API key, but we test the endpoint
        success, response = self.run_test(
            "Save Gemini API Key",
            "POST",
            "/api/gemini-api-key",
            200,  # Expecting success or 400 for invalid key
            data=mock_api_key,
            headers=auth_headers
        )
        
        if not success:
            print("   ℹ️  Expected failure due to invalid API key")

    def test_file_analysis_endpoints(self):
        """Test file analysis endpoints"""
        print("\n📄 TESTING FILE ANALYSIS ENDPOINTS")
        print("-" * 40)
        
        # Create a test file
        test_content = "Dies ist ein Test-Brief auf Deutsch.\nSehr geehrte Damen und Herren,\nvielen Dank für Ihr Schreiben."
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_content)
            temp_file_path = f.name
        
        try:
            # Test public file analysis (no auth required)
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test_letter.txt', f, 'text/plain')}
                data = {'language': 'en'}
                
                self.run_test(
                    "Public File Analysis",
                    "POST",
                    "/api/analyze-file",
                    200,
                    data=data,
                    files=files
                )
            
            # Test authenticated file analysis (if we have a token)
            if self.token:
                auth_headers = {'Authorization': f'Bearer {self.token}'}
                
                with open(temp_file_path, 'rb') as f:
                    files = {'file': ('test_letter.txt', f, 'text/plain')}
                    data = {'language': 'ru'}
                    
                    success, response = self.run_test(
                        "Authenticated File Analysis",
                        "POST",
                        "/api/analyze-file-with-user-keys",
                        200,  # Might fail if no Gemini API key configured
                        data=data,
                        files=files,
                        headers=auth_headers
                    )
                    
                    if not success:
                        print("   ℹ️  Expected failure - user may not have Gemini API key configured")
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    def test_error_handling(self):
        """Test error handling"""
        print("\n🚨 TESTING ERROR HANDLING")
        print("-" * 40)
        
        # Test invalid endpoint
        self.run_test(
            "Invalid Endpoint",
            "GET",
            "/api/nonexistent",
            404
        )
        
        # Test invalid auth token
        invalid_headers = {
            'Authorization': 'Bearer invalid.token.here',
            'Content-Type': 'application/json'
        }
        
        self.run_test(
            "Invalid Auth Token",
            "GET",
            "/api/profile",
            401,
            headers=invalid_headers
        )

    def run_all_tests(self):
        """Run all tests"""
        start_time = datetime.now()
        
        try:
            # Basic health checks
            self.test_basic_health_checks()
            
            # Google OAuth test
            oauth_success = self.test_google_oauth_mock()
            
            # Authenticated endpoints (if OAuth worked)
            self.test_authenticated_endpoints()
            
            # File analysis endpoints
            self.test_file_analysis_endpoints()
            
            # Error handling
            self.test_error_handling()
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Tests interrupted by user")
        except Exception as e:
            print(f"\n\n💥 Unexpected error during testing: {e}")
        
        # Print summary
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"⏱️  Duration: {duration:.2f} seconds")
        print(f"🧪 Tests run: {self.tests_run}")
        print(f"✅ Tests passed: {self.tests_passed}")
        print(f"❌ Tests failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED!")
            return 0
        else:
            print(f"\n⚠️  {self.tests_run - self.tests_passed} TESTS FAILED")
            return 1

def main():
    """Main test runner"""
    print("🧪 German Letter AI Assistant - Backend API Tests")
    print("=" * 60)
    
    tester = GermanLetterAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())