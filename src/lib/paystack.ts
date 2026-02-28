const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

interface PaystackInitializeParams {
    email: string;
    amount: number; // in pesewas
    currency?: string;
    metadata: {
        studentName: string;
        schoolName: string;
        package: string;
        houseYear: string;
        phoneNumber: string;
        orderId?: string;
    };
    mobile_money?: {
        phone: string;
        provider: string;
    };
    callback_url?: string;
}

export interface SubmitOTPParams {
    otp: string;
    reference: string;
}

interface PaystackResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url?: string;
        access_code?: string;
        reference: string;
        status?: string;
        display_text?: string;
    };
}

export async function initializePaystackTransaction(
    params: PaystackInitializeParams
): Promise<PaystackResponse> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            currency: params.currency || 'GHS',
            metadata: params.metadata,
            callback_url: params.callback_url,
        }),
    });

    return response.json();
}

export async function chargeWithMobileMoney(params: {
    email: string;
    amount: number;
    currency?: string;
    mobile_money: {
        phone: string;
        provider: string;
    };
    metadata: Record<string, string>;
}): Promise<PaystackResponse> {
    const response = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            currency: params.currency || 'GHS',
            mobile_money: params.mobile_money,
            metadata: params.metadata,
        }),
    });

    return response.json();
}

export async function submitOTP(params: SubmitOTPParams): Promise<PaystackResponse> {
    const response = await fetch('https://api.paystack.co/charge/submit_otp', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            otp: params.otp,
            reference: params.reference,
        }),
    });

    return response.json();
}

export function verifyPaystackSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(body)
        .digest('hex');
    return hash === signature;
}
