import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { initializePaystackTransaction } from '@/lib/paystack';
import { FieldValue } from 'firebase-admin/firestore';

const NALO_USER_ID = process.env.NALO_USER_ID || 'PR0VISSD';
const SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface USSDRequest {
    USERID: string;
    MSISDN: string;
    USERDATA: string;
    MSGTYPE: boolean;
}

interface SessionData {
    step: string;
    selectedPackage?: string;
    packagePrice?: number;
    schoolName?: string;
    studentName?: string;
    houseYear?: string;
    createdAt: FirebaseFirestore.Timestamp;
}

function respond(msisdn: string, userdata: string, msg: string, continueSession: boolean) {
    return NextResponse.json({
        USERID: NALO_USER_ID,
        MSISDN: msisdn,
        USERDATA: userdata,
        MSG: msg,
        MSGTYPE: continueSession,
    });
}

/* ✅ ADD THIS GET HANDLER — REQUIRED FOR NALO */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    const body: USSDRequest = {
        USERID: url.searchParams.get('USERID') || '',
        MSISDN: url.searchParams.get('MSISDN') || '',
        USERDATA: url.searchParams.get('USERDATA') || '',
        MSGTYPE: url.searchParams.get('MSGTYPE') === 'true',
    };

    return POST({
        json: async () => body,
    } as any);
}

export async function POST(req: NextRequest) {
    try {
        const body: USSDRequest = await req.json();
        const { MSISDN, USERDATA, USERID } = body;

        // Validate USERID
        if (USERID !== NALO_USER_ID) {
            return respond(MSISDN, USERDATA, 'Invalid session. Please try again.', false);
        }

        const sessionRef = adminDb.collection('ussd_sessions').doc(MSISDN);
        const sessionDoc = await sessionRef.get();

        let session: SessionData | null = null;

        if (sessionDoc.exists) {
            session = sessionDoc.data() as SessionData;

            // Check session expiry
            const createdAt = session.createdAt?.toDate?.();
            if (createdAt && Date.now() - createdAt.getTime() > SESSION_EXPIRY_MS) {
                await sessionRef.delete();
                session = null;
            }
        }

        // No session = new interaction → show main menu
        if (!session) {
            await sessionRef.set({
                step: 'MAIN_MENU',
                createdAt: FieldValue.serverTimestamp(),
            });

            return respond(
                MSISDN,
                USERDATA,
                'Welcome to ProviGO \nComfort for Parents & Care for Students\n\n1. Buy Provision\n2. See Packages\n3. Track Order\n4. Contact Us',
                true
            );
        }

        const input = USERDATA.trim();

        // ─── MAIN MENU ────────────────────────────
        if (session.step === 'MAIN_MENU') {
            switch (input) {
                case '1':
                    await sessionRef.update({ step: 'SELECT_PACKAGE' });
                    return respond(
                        MSISDN,
                        USERDATA,
                        'Pick your pack:\n\n1. Starter - GH₵350\n2. Ready Box - GH₵580\n3. Dadabee - GH₵780\n4. Back',
                        true
                    );

                case '2':
                    await sessionRef.update({ step: 'SEE_PACKAGES' });
                    return respond(
                        MSISDN,
                        USERDATA,
                        '📦 ProviGO Packages:\n\n1. Starter (GH₵350): Milo, Nido, Gari, Sugar, Shito, Biscuits & Toiletries.\n\n2. Ready Box (GH₵580): Starter + Milk, Drinks, Snacks, Notebooks & more Toiletries.\n\n3. Dadabee (GH₵780): Full box: Double Milo/Nido, Cornflakes, plenty Snacks, 15 Books & huge Soap pack.\n\n4. Back',
                        true
                    );

                case '3':
                    await sessionRef.update({ step: 'TRACK_ORDER' });
                    return respond(
                        MSISDN,
                        USERDATA,
                        'Enter Order ID or Student Name:',
                        true
                    );

                case '4':
                    await sessionRef.delete();
                    return respond(
                        MSISDN,
                        USERDATA,
                        '📞 Contact ProviGO:\n\nCall/WhatsApp: 0247112620\nEmail: provigogh@gmail.com\n\nThank you!',
                        false
                    );

                default:
                    return respond(
                        MSISDN,
                        USERDATA,
                        'Invalid option. Please select:\n\n1. Buy Provision\n2. See Packages\n3. Track Order\n4. Contact Us',
                        true
                    );
            }
        }

        // ─── SEE PACKAGES ─────────────────────────
        if (session.step === 'SEE_PACKAGES') {
            if (input === '4') {
                await sessionRef.update({ step: 'MAIN_MENU' });
                return respond(
                    MSISDN,
                    USERDATA,
                    'Welcome to ProviGO 🎒\nComfort for Parents & Care for Students\n\n1. Buy Provision\n2. See Packages\n3. Track Order\n4. Contact Us',
                    true
                );
            }
            return respond(
                MSISDN,
                USERDATA,
                '📦 ProviGO Packages:\n\n1. Starter (GH₵350): Milo, Nido, Gari, Sugar, Shito, Biscuits & Toiletries.\n\n2. Ready Box (GH₵580): Starter + Milk, Drinks, Snacks, Notebooks & more Toiletries.\n\n3. Dadabee (GH₵780): Full box: Double Milo/Nido, Cornflakes, plenty Snacks, 15 Books & huge Soap pack.\n\n4. Back',
                true
            );
        }

        // ─── SELECT PACKAGE ───────────────────────
        if (session.step === 'SELECT_PACKAGE') {
            const packages: Record<string, { name: string; price: number }> = {
                '1': { name: 'Starter', price: 350 },
                '2': { name: 'Ready Box', price: 580 },
                '3': { name: 'Dadabee', price: 780 },
            };

            if (input === '4') {
                await sessionRef.update({ step: 'MAIN_MENU' });
                return respond(
                    MSISDN,
                    USERDATA,
                    'Welcome to ProviGO 🎒\nComfort for Parents & Care for Students\n\n1. Buy Provision\n2. See Packages\n3. Track Order\n4. Contact Us',
                    true
                );
            }

            const pkg = packages[input];
            if (!pkg) {
                return respond(
                    MSISDN,
                    USERDATA,
                    'Invalid selection. Pick your pack:\n\n1. Starter - GH₵350\n2. Ready Box - GH₵580\n3. Dadabee - GH₵780\n4. Back',
                    true
                );
            }

            await sessionRef.update({
                step: 'ENTER_SCHOOL',
                selectedPackage: pkg.name,
                packagePrice: pkg.price,
            });

            return respond(MSISDN, USERDATA, 'Enter School Name:', true);
        }

        // ─── ENTER SCHOOL ─────────────────────────
        if (session.step === 'ENTER_SCHOOL') {
            if (!input || input.length < 2) {
                return respond(MSISDN, USERDATA, 'Please enter a valid school name:', true);
            }
            await sessionRef.update({ step: 'ENTER_STUDENT', schoolName: input });
            return respond(MSISDN, USERDATA, 'Enter Student Name:', true);
        }

        // ─── ENTER STUDENT ────────────────────────
        if (session.step === 'ENTER_STUDENT') {
            if (!input || input.length < 2) {
                return respond(MSISDN, USERDATA, 'Please enter a valid student name:', true);
            }
            await sessionRef.update({ step: 'ENTER_HOUSE', studentName: input });
            return respond(MSISDN, USERDATA, 'Enter House & Year (e.g. Akufo Hall, Year 2):', true);
        }

        // ─── ENTER HOUSE & YEAR ───────────────────
        if (session.step === 'ENTER_HOUSE') {
            if (!input || input.length < 2) {
                return respond(MSISDN, USERDATA, 'Please enter a valid house & year:', true);
            }
            await sessionRef.update({ step: 'CONFIRMATION', houseYear: input });

            // Refresh session data
            const updatedDoc = await sessionRef.get();
            const s = updatedDoc.data() as SessionData;

            return respond(
                MSISDN,
                USERDATA,
                `Send ${s.selectedPackage} to ${s.studentName} at ${s.schoolName}?\nHouse/Year: ${s.houseYear}\nTotal: GH₵${s.packagePrice}\n\n1. Pay with Momo\n2. Cancel`,
                true
            );
        }

        // ─── CONFIRMATION ─────────────────────────
        if (session.step === 'CONFIRMATION') {
            if (input === '2') {
                await sessionRef.delete();
                return respond(MSISDN, USERDATA, 'Order cancelled. Thank you for using ProviGO!', false);
            }

            if (input === '1') {
                // Refresh session
                const freshDoc = await sessionRef.get();
                const s = freshDoc.data() as SessionData;

                // Create order in Firestore
                const orderRef = adminDb.collection('orders').doc();
                const orderData = {
                    orderId: '', // Will be set after payment
                    studentName: s.studentName,
                    schoolName: s.schoolName,
                    houseYear: s.houseYear,
                    package: s.selectedPackage,
                    price: s.packagePrice,
                    phoneNumber: MSISDN,
                    paymentStatus: 'pending',
                    orderStatus: 'Processing',
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                    firestoreDocId: orderRef.id,
                };

                await orderRef.set(orderData);

                // Initialize Paystack transaction
                const email = `${MSISDN.replace('+', '')}@provigo.app`;
                const amountInPesewas = (s.packagePrice || 0) * 100;

                try {
                    const paystackResponse = await initializePaystackTransaction({
                        email,
                        amount: amountInPesewas,
                        metadata: {
                            studentName: s.studentName || '',
                            schoolName: s.schoolName || '',
                            package: s.selectedPackage || '',
                            houseYear: s.houseYear || '',
                            phoneNumber: MSISDN,
                            orderId: orderRef.id,
                        },
                    });

                    // Update order with Paystack reference
                    if (paystackResponse.status) {
                        await orderRef.update({
                            paystackReference: paystackResponse.data.reference,
                        });
                    }
                } catch (error) {
                    console.error('Paystack error:', error);
                }

                // Clean up session
                await sessionRef.delete();

                return respond(
                    MSISDN,
                    USERDATA,
                    'Payment request sent to your phone.\nPlease complete the Mobile Money payment to confirm your order.\n\nThank you for choosing ProviGO! 🎒',
                    false
                );
            }

            return respond(
                MSISDN,
                USERDATA,
                'Invalid option.\n\n1. Pay with Momo\n2. Cancel',
                true
            );
        }

        // ─── TRACK ORDER ──────────────────────────
        if (session.step === 'TRACK_ORDER') {
            if (!input || input.length < 2) {
                return respond(MSISDN, USERDATA, 'Please enter a valid Order ID or Student Name:', true);
            }

            // Search by Order ID
            let orderSnap = await adminDb
                .collection('orders')
                .where('orderId', '==', input.toUpperCase())
                .limit(1)
                .get();

            // If not found, search by student name
            if (orderSnap.empty) {
                orderSnap = await adminDb
                    .collection('orders')
                    .where('studentName', '==', input)
                    .limit(1)
                    .get();
            }

            await sessionRef.delete();

            if (orderSnap.empty) {
                return respond(
                    MSISDN,
                    USERDATA,
                    'Order not found. Please check and try again.',
                    false
                );
            }

            const order = orderSnap.docs[0].data();
            return respond(
                MSISDN,
                USERDATA,
                `Order Found:\n\nOrder ID: ${order.orderId || 'Pending'}\nPackage: ${order.package}\nPayment: ${order.paymentStatus === 'paid' ? 'Paid ✅' : 'Pending ⏳'}\nStatus: ${order.orderStatus}\n\nThank you for using ProviGO!`,
                false
            );
        }

        // Fallback — reset session
        await sessionRef.delete();
        return respond(
            MSISDN,
            USERDATA,
            'Session expired. Please dial *920*332# again.',
            false
        );
    } catch (error) {
        console.error('USSD Error:', error);
        return NextResponse.json(
            {
                USERID: NALO_USER_ID,
                MSISDN: '',
                USERDATA: '',
                MSG: 'An error occurred. Please try again.',
                MSGTYPE: false,
            },
            { status: 200 }
        );
    }
}
