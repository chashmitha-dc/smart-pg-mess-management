"""Placeholder module for validation helpers."""

# Validation helper functions will be implemented here.
# This file is intentionally left as a placeholder.
import re


def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email)


def is_valid_phone(phone):
    return phone.isdigit() and len(phone) == 10


def is_valid_password(password):
    return len(password) >= 8