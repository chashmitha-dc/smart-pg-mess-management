"""Placeholder module for standardized API response helpers."""

# Helper methods for standardized API responses will be implemented here.
# This file is intentionally left as a placeholder.
from flask import jsonify


def success_response(message, data=None, status_code=200):
    response = {
        "success": True,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    return jsonify(response), status_code


def error_response(message, status_code=400):
    return jsonify({
        "success": False,
        "message": message
    }), status_code