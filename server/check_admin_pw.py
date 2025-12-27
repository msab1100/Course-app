from auth import verify_password

stored_hash = "$2b$12$kBBe.Tcf8xTy1S8fBmaA9OW7qkHyNgOtDlShUXzQ8F0QWbJXGxTMi"
print("Password '000' matches:", verify_password('000', stored_hash))
