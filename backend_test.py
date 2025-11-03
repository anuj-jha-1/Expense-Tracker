import requests
import sys
import json
from datetime import datetime

class ExpenseTrackerAPITester:
    def __init__(self, base_url="https://spendwise-803.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                if response.text:
                    try:
                        error_data = response.json()
                        details += f" - {error_data.get('detail', response.text)}"
                    except:
                        details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": test_email, "password": test_password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.test_email = test_email
            self.test_password = test_password
            return True
        return False

    def test_user_login(self):
        """Test user login with registered credentials"""
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No registered user to test login")
            return False
            
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": self.test_email, "password": self.test_password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            400,
            data={"email": "invalid@example.com", "password": "wrongpassword"}
        )
        return success

    def test_get_user_profile(self):
        """Test getting current user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_expense_transaction(self):
        """Test creating an expense transaction"""
        transaction_data = {
            "type": "expense",
            "date": "2024-01-15",
            "description": "Test grocery shopping",
            "category": "Food",
            "amount": 45.67
        }
        
        success, response = self.run_test(
            "Create Expense Transaction",
            "POST",
            "transactions",
            200,
            data=transaction_data
        )
        
        if success and 'id' in response:
            self.expense_transaction_id = response['id']
            return True
        return False

    def test_create_income_transaction(self):
        """Test creating an income transaction"""
        transaction_data = {
            "type": "income",
            "date": "2024-01-15",
            "description": "Test salary payment",
            "category": "Salary",
            "amount": 2500.00
        }
        
        success, response = self.run_test(
            "Create Income Transaction",
            "POST",
            "transactions",
            200,
            data=transaction_data
        )
        
        if success and 'id' in response:
            self.income_transaction_id = response['id']
            return True
        return False

    def test_get_all_transactions(self):
        """Test getting all transactions"""
        success, response = self.run_test(
            "Get All Transactions",
            "GET",
            "transactions",
            200
        )
        
        if success:
            self.all_transactions = response
            return len(response) >= 2  # Should have at least the 2 we created
        return False

    def test_filter_transactions_by_type(self):
        """Test filtering transactions by type"""
        # Test expense filter
        success_expense, response_expense = self.run_test(
            "Filter Transactions by Type (Expense)",
            "GET",
            "transactions?type=expense",
            200
        )
        
        # Test income filter
        success_income, response_income = self.run_test(
            "Filter Transactions by Type (Income)",
            "GET",
            "transactions?type=income",
            200
        )
        
        return success_expense and success_income

    def test_filter_transactions_by_category(self):
        """Test filtering transactions by category"""
        success, response = self.run_test(
            "Filter Transactions by Category",
            "GET",
            "transactions?category=Food",
            200
        )
        return success

    def test_update_transaction(self):
        """Test updating a transaction"""
        if not hasattr(self, 'expense_transaction_id'):
            self.log_test("Update Transaction", False, "No transaction ID to update")
            return False
            
        update_data = {
            "description": "Updated grocery shopping",
            "amount": 50.00
        }
        
        success, response = self.run_test(
            "Update Transaction",
            "PUT",
            f"transactions/{self.expense_transaction_id}",
            200,
            data=update_data
        )
        return success

    def test_get_summary(self):
        """Test getting transaction summary"""
        success, response = self.run_test(
            "Get Transaction Summary",
            "GET",
            "transactions/summary",
            200
        )
        
        if success:
            # Verify summary structure
            required_fields = ['total_income', 'total_expenses', 'net_income', 'transaction_count']
            has_all_fields = all(field in response for field in required_fields)
            
            if has_all_fields:
                self.summary_data = response
                return True
            else:
                self.log_test("Summary Structure", False, f"Missing fields in summary: {required_fields}")
        
        return False

    def test_get_stats(self):
        """Test getting transaction statistics"""
        success, response = self.run_test(
            "Get Transaction Stats",
            "GET",
            "transactions/stats",
            200
        )
        
        if success:
            # Verify stats structure
            required_fields = ['expense_by_category', 'income_by_category']
            has_all_fields = all(field in response for field in required_fields)
            
            if has_all_fields:
                self.stats_data = response
                return True
            else:
                self.log_test("Stats Structure", False, f"Missing fields in stats: {required_fields}")
        
        return False

    def test_delete_transaction(self):
        """Test deleting a transaction"""
        if not hasattr(self, 'income_transaction_id'):
            self.log_test("Delete Transaction", False, "No transaction ID to delete")
            return False
            
        success, response = self.run_test(
            "Delete Transaction",
            "DELETE",
            f"transactions/{self.income_transaction_id}",
            200
        )
        return success

    def test_category_validation(self):
        """Test that all required categories are supported"""
        expense_categories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare", "Education", "Other"]
        income_categories = ["Salary", "Freelance", "Business", "Investment", "Other"]
        
        # Test expense categories
        for category in expense_categories:
            transaction_data = {
                "type": "expense",
                "date": "2024-01-15",
                "description": f"Test {category}",
                "category": category,
                "amount": 10.00
            }
            
            success, response = self.run_test(
                f"Expense Category: {category}",
                "POST",
                "transactions",
                200,
                data=transaction_data
            )
            
            if not success:
                return False
        
        # Test income categories
        for category in income_categories:
            transaction_data = {
                "type": "income",
                "date": "2024-01-15",
                "description": f"Test {category}",
                "category": category,
                "amount": 100.00
            }
            
            success, response = self.run_test(
                f"Income Category: {category}",
                "POST",
                "transactions",
                200,
                data=transaction_data
            )
            
            if not success:
                return False
        
        return True

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Expense Tracker API Tests...")
        print(f"📍 Testing endpoint: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
            
        self.test_invalid_login()
        self.test_get_user_profile()
        
        # Transaction CRUD tests
        self.test_create_expense_transaction()
        self.test_create_income_transaction()
        self.test_get_all_transactions()
        self.test_filter_transactions_by_type()
        self.test_filter_transactions_by_category()
        self.test_update_transaction()
        
        # Summary and stats tests
        self.test_get_summary()
        self.test_get_stats()
        
        # Category validation
        self.test_category_validation()
        
        # Cleanup test
        self.test_delete_transaction()
        
        # Print results
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = ExpenseTrackerAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%"
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())