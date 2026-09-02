"""Service layer for payment management."""

from decimal import Decimal

from flask_jwt_extended import get_jwt_identity, get_jwt

from config.database import db
from models.bill import Bill
from models.member import Member
from models.payment import Payment
from models.pg import PG
from utils.response import error_response, success_response


VALID_PAYMENT_METHODS = {"Cash", "UPI", "Bank Transfer"}


def _get_owner_pg():
    """Return the PG for the logged-in owner."""
    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return None, error_response("PG not found", 404)

    return pg, None


def _build_payment_payload(payment):
    """Convert a payment record into a JSON-friendly payload."""
    member_name = "Unknown"
    member_id = None
    if payment.bill and payment.bill.member:
        member_name = payment.bill.member.member_name
        member_id = payment.bill.member.member_id

    api_method_map = {
        "cash": "Cash",
        "upi": "UPI",
        "bank_transfer": "Bank Transfer"
    }
    display_method = api_method_map.get(payment.payment_method, payment.payment_method)

    return {
        "payment_id": payment.payment_id,
        "bill_id": payment.bill_id,
        "member_id": member_id,
        "member_name": member_name,
        "amount": float(payment.amount),
        "payment_method": display_method,
        "payment_date": payment.payment_date.isoformat(),
        "transaction_id": payment.transaction_id,
        "remarks": payment.remarks,
        "verification_status": payment.verification_status,
    }


def _update_bill_status(bill):
    """Synchronize bill totals and status after payment changes."""
    if bill.balance_amount <= 0:
        bill.status = "paid"
    elif bill.paid_amount > 0:
        bill.status = "partial"
    else:
        bill.status = "pending"


def create_payment(data):
    """Create a payment entry and update the linked bill."""
    claims = get_jwt()
    role = claims.get("role", "owner")
    user_id = int(get_jwt_identity())

    if role == "member":
        member = Member.query.get(user_id)
        if not member:
            return error_response("Member not found", 404)
        pg = PG.query.get(member.pg_id)
    else:
        pg = PG.query.filter_by(owner_id=user_id).first()

    if not pg:
        return error_response("PG not found", 404)

    bill_id = data.get("bill_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method")
    transaction_reference = data.get("transaction_reference")
    remarks = data.get("remarks")

    if not bill_id:
        return error_response("Bill ID is required", 400)

    if amount is None and role != "member":
        return error_response("Amount is required", 400)

    if not payment_method:
        return error_response("Payment method is required", 400)

    if payment_method not in VALID_PAYMENT_METHODS:
        return error_response("Payment method must be one of Cash, UPI, Bank Transfer", 400)

    if amount is not None:
        try:
            amount_value = Decimal(str(amount))
        except Exception:
            return error_response("Invalid amount", 400)

        if amount_value <= 0:
            return error_response("Amount must be greater than 0", 400)

    if role == "member":
        bill = Bill.query.filter(Bill.bill_id == bill_id, Bill.member_id == user_id).first()
    else:
        bill = Bill.query.join(Member).filter(Bill.bill_id == bill_id, Member.pg_id == pg.pg_id).first()

    if not bill:
        return error_response("Bill not found", 404)

    actual_balance = Decimal(str(bill.balance_amount))
    if actual_balance <= 0:
        return error_response("Bill is already paid", 400)

    if role == "member" and payment_method == "UPI":
        if not transaction_reference or not str(transaction_reference).strip():
            return error_response("Transaction reference is required for UPI payments", 400)
        if len(str(transaction_reference).strip()) > 100:
            return error_response("Transaction reference is too long", 400)
        duplicate_payment = (
            Payment.query.join(Bill)
            .join(Member)
            .filter(
                Member.pg_id == pg.pg_id,
                Payment.transaction_id == str(transaction_reference).strip(),
            )
            .first()
        )
        if duplicate_payment:
            return error_response("This transaction reference has already been submitted", 409)

    if role == "member":
        amount_value = actual_balance
    elif amount_value > actual_balance:
        return error_response("Amount cannot exceed the bill balance", 400)

    db_method_map = {
        "Cash": "cash",
        "UPI": "upi",
        "Bank Transfer": "bank_transfer",
    }
    db_payment_method = db_method_map.get(payment_method, payment_method)
    db_transaction_reference = str(transaction_reference).strip() if transaction_reference else None

    new_payment = Payment(
        bill_id=bill.bill_id,
        amount=amount_value,
        payment_method=db_payment_method,
        transaction_id=db_transaction_reference,
        remarks=remarks,
    )

    db.session.add(new_payment)
    db.session.commit()

    return success_response(
        "Payment created successfully",
        data={
            "payment_id": new_payment.payment_id,
            "bill_id": new_payment.bill_id,
            "amount": float(new_payment.amount),
            "payment_method": payment_method,
            "transaction_id": new_payment.transaction_id,
            "remarks": new_payment.remarks,
            "verification_status": new_payment.verification_status,
        },
        status_code=201,
    )


def get_payments():
    """Return all payments."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        payments = (
            Payment.query.join(Bill)
            .filter(Bill.member_id == member_id)
            .order_by(Payment.payment_date.desc())
            .all()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
                return success_response("Payments fetched successfully", data=[])
            return error
        payments = (
            Payment.query.join(Bill)
            .join(Member)
            .filter(Member.pg_id == pg.pg_id)
            .order_by(Payment.payment_date.desc())
            .all()
        )

    payment_data = [_build_payment_payload(payment) for payment in payments]

    return success_response("Payments fetched successfully", data=payment_data)


def get_payment(payment_id):
    """Return one payment."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        payment = (
            Payment.query.join(Bill)
            .filter(Payment.payment_id == payment_id, Bill.member_id == member_id)
            .first()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            return error
        payment = (
            Payment.query.join(Bill)
            .join(Member)
            .filter(Payment.payment_id == payment_id, Member.pg_id == pg.pg_id)
            .first()
        )

    if not payment:
        return error_response("Payment not found", 404)

    return success_response(
        "Payment fetched successfully",
        data=_build_payment_payload(payment),
    )


def update_payment(payment_id, data):
    """Update payment metadata without changing the original amount."""
    pg, error = _get_owner_pg()
    if error:
        return error

    payment = (
        Payment.query.join(Bill)
        .join(Member)
        .filter(Payment.payment_id == payment_id, Member.pg_id == pg.pg_id)
        .first()
    )

    if not payment:
        return error_response("Payment not found", 404)

    if "transaction_reference" in data:
        tx_ref = data["transaction_reference"]
        payment.transaction_id = tx_ref if tx_ref else None

    if "remarks" in data:
        payment.remarks = data["remarks"]

    if "payment_method" in data:
        payment_method = data["payment_method"]
        if payment_method not in VALID_PAYMENT_METHODS:
            return error_response("Payment method must be one of Cash, UPI, Bank Transfer", 400)
        
        db_method_map = {
            "Cash": "cash",
            "UPI": "upi",
            "Bank Transfer": "bank_transfer",
        }
        payment.payment_method = db_method_map.get(payment_method, payment_method)

    if "verification_status" in data:
        status = data["verification_status"]
        if status not in {"pending", "verified", "rejected"}:
            return error_response("Invalid verification status", 400)
        
        old_status = payment.verification_status
        if old_status != status:
            payment.verification_status = status
            bill = payment.bill
            paid_amount = Decimal(str(bill.paid_amount))
            payment_amount = Decimal(str(payment.amount))

            if status == "verified" and old_status != "verified":
                bill.paid_amount = paid_amount + payment_amount
            elif old_status == "verified" and status != "verified":
                bill.paid_amount = max(Decimal("0"), paid_amount - payment_amount)

            bill.balance_amount = Decimal(str(bill.final_amount)) - Decimal(str(bill.paid_amount))
            _update_bill_status(bill)

    db.session.commit()

    return success_response(
        "Payment updated successfully",
        data=_build_payment_payload(payment),
    )


def delete_payment(payment_id):
    """Delete a payment and rollback the linked bill totals."""
    pg, error = _get_owner_pg()
    if error:
        return error

    payment = (
        Payment.query.join(Bill)
        .join(Member)
        .filter(Payment.payment_id == payment_id, Member.pg_id == pg.pg_id)
        .first()
    )

    if not payment:
        return error_response("Payment not found", 404)

    bill = payment.bill

    if payment.verification_status == "verified":
        bill.paid_amount = max(
            Decimal("0"), Decimal(str(bill.paid_amount)) - Decimal(str(payment.amount))
        )
        bill.balance_amount = Decimal(str(bill.final_amount)) - Decimal(str(bill.paid_amount))
        _update_bill_status(bill)

    db.session.delete(payment)
    db.session.commit()

    return success_response("Payment deleted successfully")
