import { createHmac } from 'crypto';

const NALO_MERCHANT_ID = process.env.NALO_MERCHANT_ID!;
const NALO_BASIC_AUTH_TOKEN = process.env.NALO_BASIC_AUTH_TOKEN!;
const NALO_SECRET_KEY = process.env.NALO_SECRET_KEY!;
const NALO_BASE_URL = process.env.NALO_BASE_URL!;
const NALO_CALLBACK_URL = process.env.NALO_CALLBACK_URL!;

export type NaloNetwork = 'MTN' | 'AT' | 'TELECEL';

export interface NaloCollectionParams {
    accountNumber: string;
    accountName: string;
    amount: number;
    network: NaloNetwork;
    reference: string;
    description: string;
    extraData?: Record<string, string>;
}

export interface NaloResponse {
    success: boolean;
    code: string;
    data?: {
        order_id: string;
        status: string;
        amount: number;
        timestamp: string;
        otp_code?: string;
        token?: string;
    };
    message?: string;
    error?: any;
}

/**
 * Generates a payment token (JWT) from Nalo.
 */
export async function generateNaloToken(): Promise<string | null> {
    try {
        const response = await fetch(`${NALO_BASE_URL}/clientapi/generate-payment-token/`, {
            method: 'POST',
            headers: {
                'Authorization': NALO_BASIC_AUTH_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchant_id: NALO_MERCHANT_ID,
            }),
        });

        const data = await response.json();
        if (data.success && data.data?.token) {
            return data.data.token;
        }
        console.error('Nalo Token Generation Failed:', data);
        return null;
    } catch (error) {
        console.error('Nalo Token Generation Error:', error);
        return null;
    }
}

/**
 * Generates the trans_hash required by Nalo.
 * HMAC_SHA256(merchant_id + account_number + amount + reference, secret_key)
 */
function generateTransHash(params: {
    merchantId: string;
    accountNumber: string;
    amount: number;
    reference: string;
}): string {
    // Format amount to 2 decimal places if needed, but Nalo example shows "50" for 50 or "0.2" for 0.2.
    // The doc says "amount" without separators.
    const message = `${params.merchantId}${params.accountNumber}${params.amount}${params.reference}`;
    return createHmac('sha256', NALO_SECRET_KEY).update(message).digest('hex');
}

/**
 * Initiates a MoMo collection request via Nalo.
 */
export async function createNaloCollection(params: NaloCollectionParams): Promise<NaloResponse> {
    try {
        const token = await generateNaloToken();
        if (!token) {
            return { success: false, code: 'TOKEN_ERROR', message: 'Failed to generate Nalo token' };
        }

        const trans_hash = generateTransHash({
            merchantId: NALO_MERCHANT_ID,
            accountNumber: params.accountNumber,
            amount: params.amount,
            reference: params.reference,
        });

        const requestBody = {
            merchant_id: NALO_MERCHANT_ID,
            service_name: 'MOMO_TRANSACTION',
            trans_hash: trans_hash,
            account_number: params.accountNumber,
            account_name: params.accountName,
            network: params.network,
            amount: params.amount,
            reference: params.reference,
            callback: NALO_CALLBACK_URL,
            description: params.description,
            extra_data: params.extraData || {},
        };

        console.log('Nalo Collection Request:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${NALO_BASE_URL}/clientapi/collection/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('Nalo Collection Response:', JSON.stringify(data, null, 2));

        return data;
    } catch (error) {
        console.error('Nalo Collection Error:', error);
        return { success: false, code: 'EXCEPTION', error };
    }
}

/**
 * Checks the status of a collection.
 */
export async function checkNaloStatus(orderId: string): Promise<NaloResponse> {
    try {
        const response = await fetch(`${NALO_BASE_URL}/clientapi/collection-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchant_id: NALO_MERCHANT_ID,
                order_id: orderId,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Nalo Status Check Error:', error);
        return { success: false, code: 'EXCEPTION', error };
    }
}
