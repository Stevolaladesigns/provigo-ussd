const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY!;
const SENDER_ID = process.env.ARKESEL_SENDER_ID || 'ProviGO';

interface SMSParams {
    to: string;
    message: string;
}

export async function sendSMS(params: SMSParams): Promise<{ success: boolean; message: string }> {
    try {
        const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${ARKESEL_API_KEY}&to=${encodeURIComponent(params.to)}&from=${encodeURIComponent(SENDER_ID)}&sms=${encodeURIComponent(params.message)}`;

        const response = await fetch(url);
        const data = await response.json();

        return {
            success: data.code === 'ok' || response.ok,
            message: data.message || 'SMS sent',
        };
    } catch (error) {
        console.error('Arkesel SMS Error:', error);
        return { success: false, message: 'Failed to send SMS' };
    }
}

export function buildPaymentConfirmationSMS(params: {
    studentName: string;
    orderId: string;
    schoolName: string;
}): string {
    return `Hello,\n\nYour ProviGO order (Order ID: ${params.orderId}) has been received successfully.\n\nWe are currently preparing your package for delivery to ${params.schoolName}.\n\nThank you for choosing ProviGO.\n\nSupport: 0247112620`;
}

export function buildDeliveryConfirmationSMS(params: {
    orderId: string;
    schoolName: string;
}): string {
    return `Your ProviGO package (Order ID: ${params.orderId}) has been delivered to ${params.schoolName}. Thank you for trusting us.`;
}
