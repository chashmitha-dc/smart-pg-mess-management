"""Email utility for SmartPG — sends OTP reset and leave notification emails via Flask-Mail."""

from flask_mail import Mail, Message

mail = Mail()


def init_mail(app):
    """Initialize Flask-Mail with the app."""
    mail.init_app(app)


def send_reset_email(to_email, reset_code, user_name="User"):
    """Send a password reset OTP email."""
    try:
        msg = Message(
            subject="SmartPG - Password Reset OTP",
            recipients=[to_email],
            html=f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;
                        border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #1a237e; margin: 0;">SmartPG Mess Portal</h2>
                    <p style="color: #666; font-size: 14px;">Password Reset Request</p>
                </div>
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>You requested to reset your password. Use the OTP below:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px;
                                 color: #1976d2; background: #e3f2fd; padding: 12px 24px;
                                 border-radius: 8px; display: inline-block;">
                        {reset_code}
                    </span>
                </div>
                <p style="color: #d32f2f; font-size: 13px;">
                    This OTP is valid for <strong>15 minutes</strong> only.
                </p>
                <p>If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                <p style="color: #aaa; font-size: 12px; text-align: center;">
                    SmartPG Mess Management System &bull; Automated Email
                </p>
            </div>
            """,
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send reset email: {e}")
        return False


def send_reset_sms_fallback(phone, reset_code):
    """Fallback: print reset code to console when email is not configured."""
    print(f"[SMS FALLBACK] Reset code for {phone}: {reset_code}")
    return True


def send_leave_request_email(owner_email, owner_name, member_name, member_room,
                              from_date, to_date, days, reason, pg_name):
    """Send leave request notification email to the PG owner."""
    reason_text = reason if reason else "No reason provided"
    room_text = f"Room {member_room}" if member_room else "N/A"

    try:
        msg = Message(
            subject=f"SmartPG -- New Leave Request from {member_name}",
            recipients=[owner_email],
            html=f"""
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;
                        border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">

                <div style="background: linear-gradient(135deg, #1a237e, #1976d2);
                            padding: 28px 30px; text-align: center;">
                    <h2 style="color: white; margin: 0; font-size: 22px;">SmartPG Mess Portal</h2>
                    <p style="color: #bbdefb; margin: 6px 0 0; font-size: 14px;">{pg_name}</p>
                </div>

                <div style="padding: 28px 30px; background: #ffffff;">
                    <p style="font-size: 16px; color: #333; margin-top: 0;">
                        Hello <strong>{owner_name}</strong>,
                    </p>
                    <p style="color: #555;">
                        A member has submitted a <strong>leave request</strong> that requires your attention.
                    </p>

                    <div style="background: #f5f9ff; border-left: 4px solid #1976d2;
                                border-radius: 6px; padding: 18px 20px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr>
                                <td style="padding: 6px 0; color: #777; width: 40%;">Member</td>
                                <td style="padding: 6px 0; color: #222;"><strong>{member_name}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #777;">Room</td>
                                <td style="padding: 6px 0; color: #222;">{room_text}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #777;">From</td>
                                <td style="padding: 6px 0; color: #222;">{from_date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #777;">To</td>
                                <td style="padding: 6px 0; color: #222;">{to_date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #777;">Total Days</td>
                                <td style="padding: 6px 0; color: #1976d2;">
                                    <strong>{days} day(s)</strong>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #777; vertical-align: top;">Reason</td>
                                <td style="padding: 6px 0; color: #222;">{reason_text}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #555; font-size: 14px;">
                        Please log in to <strong>approve</strong> or <strong>reject</strong>
                        this request from the Leave Requests section.
                    </p>

                    <div style="text-align: center; margin: 28px 0 10px;">
                        <a href="http://localhost:5173/leaves"
                           style="background: #1976d2; color: white; padding: 13px 32px;
                                  border-radius: 8px; text-decoration: none; font-weight: bold;
                                  font-size: 15px; display: inline-block;">
                            View Leave Request
                        </a>
                    </div>
                </div>

                <div style="background: #f5f5f5; padding: 16px 30px; text-align: center;
                            border-top: 1px solid #eee;">
                    <p style="color: #aaa; font-size: 12px; margin: 0;">
                        SmartPG Mess Management System &bull; Automated Notification
                    </p>
                </div>
            </div>
            """,
        )
        mail.send(msg)
        print(f"[EMAIL] Leave request email sent to owner: {owner_email}")
        return True
    except Exception as e:
        # Never crash the app if email fails — just log it
        print(f"[EMAIL ERROR] Failed to send leave request email: {e}")
        return False


def send_bill_reminder_email(to_email, member_name, amount, start_date, end_date, pg_name="SmartPG"):
    """Send bill invoice reminder email to the member."""
    start_str = start_date.strftime('%d %b %Y')
    end_str = end_date.strftime('%d %b %Y')
    
    try:
        msg = Message(
            subject=f"SmartPG - New Bill Generated (Rs. {amount:.2f})",
            recipients=[to_email],
            html=f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;
                        border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #1a237e; margin: 0;">SmartPG Mess Portal</h2>
                    <p style="color: #666; font-size: 14px;">{pg_name}</p>
                </div>
                <p>Hello <strong>{member_name}</strong>,</p>
                <p>Your mess bill for the billing cycle has been generated. Details below:</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <table style="width: 100%; font-size: 14px;">
                        <tr>
                            <td style="color: #666; padding: 4px 0;">Billing Period:</td>
                            <td style="font-weight: bold; text-align: right; color: #333;">{start_str} to {end_str}</td>
                        </tr>
                        <tr>
                            <td style="color: #666; padding: 4px 0;">Amount Due:</td>
                            <td style="font-weight: bold; text-align: right; color: #b45309; font-size: 16px;">Rs. {amount:.2f}</td>
                        </tr>
                    </table>
                </div>
                <p>Please log in to the portal to view your statement and make the payment.</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="http://localhost:5173/bills" 
                       style="background: #1a237e; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        View Bill & Pay
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                <p style="color: #aaa; font-size: 12px; text-align: center;">
                    SmartPG Mess Management System &bull; Automated Email
                </p>
            </div>
            """,
        )
        mail.send(msg)
        print(f"[EMAIL] Bill reminder email sent to member: {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send bill reminder email to {to_email}: {e}")
        return False
