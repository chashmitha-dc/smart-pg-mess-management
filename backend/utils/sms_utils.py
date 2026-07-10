"""SMS utility for SmartPG — simulates/sends bill notification messages to members."""

import os

def send_bill_notification_sms(phone, member_name, amount, start_date, end_date):
    """
    Simulates sending an SMS notification to the member when their bill is generated.
    For a real production setup, this would utilize an SMS API provider like Twilio, MSG91, or Fast2SMS.
    """
    # format date range for message readability
    start_str = start_date.strftime('%d %b')
    end_str = end_date.strftime('%d %b')
    
    sms_message = (
        f"Dear {member_name}, your SmartPG bill of Rs. {amount:.2f} "
        f"for the period {start_str} to {end_str} has been generated. "
        f"Please log in to the portal to pay."
    )

    # 1. Console Simulation (For verification using dummy testing numbers)
    print("\n" + "[SMS] " + "="*50)
    print(f"[SMS SIMULATION] Target Number: {phone}")
    print(f"Text Message: {sms_message}")
    print("="*52 + "\n")

    # 2. Production Twilio Integration
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from_number = os.getenv("TWILIO_FROM_NUMBER")
    
    if twilio_sid and twilio_auth_token and twilio_from_number:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_auth_token)
            client.messages.create(
                body=sms_message,
                from_=twilio_from_number,
                to=phone if phone.startswith("+") else f"+91{phone}"  # assume Indian numbers as default prefix
            )
            print(f"[SMS SUCCESS] Real SMS sent to {phone} via Twilio.")
            return True
        except Exception as e:
            print(f"[SMS ERROR] Failed to send real SMS via Twilio: {e}")
    else:
        print("[SMS NOTICE] Real SMS was not dispatched because Twilio credentials are not configured in your .env file.")
            
    return True
