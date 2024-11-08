import React, { useEffect, useState } from 'react'
import './MoneroPaymentMethod.scss';
import { LoadingSpinner } from '@bigcommerce/checkout/ui';
import { Order } from '@bigcommerce/checkout-sdk';
import QRCode from 'react-qr-code';

enum PaymentState {
    unpaid,
    pending,
    paid,
    withdrawn,
    refunded,
    expired,
    deleted
}

interface MoneroApiUrlResponse {
    url: string;
}

interface CreatePaymentRequest {
    orderId: number;
}

interface CreatePaymentResponse {
    orderId: number;
    xmrAmount: number;
    address: string;
    paymentState: PaymentState;
}

interface MoneroPaymentMethodProps {
    order: Order;
}

export function MoneroPaymentMethod({ order }: MoneroPaymentMethodProps) {
    const [loading, setLoading] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState<CreatePaymentResponse | null>(null);
    const [paymentLink, setPaymentLink] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            await getPaymentDetails();
        })();
    }, []);

    useEffect(() => {
        const interval = setInterval(getPaymentDetails, 120000);
        return () => { clearInterval(interval); }
    }, [paymentResponse]);

    const getPaymentDetails = async () => {
        setLoading(true);
        setError("");
        setPaymentResponse(null);

        try {

            let moneroApiUrlResponse: MoneroApiUrlResponse;

            if (process.env.NODE_ENV === 'development'){
                const apiUrlResponse = await fetch("http://localhost:3000/stencil/00000000-0000-0000-0000-000000000001/dist/content/moneroapiurl.json");
                moneroApiUrlResponse = await apiUrlResponse.json() as MoneroApiUrlResponse;
            }
            else {
                const apiUrlResponse = await fetch(window.location.origin + "/content/moneroapiurl.json", {
                    method: "GET",
                    mode: "no-cors",
                    headers: {
                        "Accept": "application/json",
                    }
                });
                moneroApiUrlResponse = await apiUrlResponse.json() as MoneroApiUrlResponse;
            }

            const createPaymentRequest: CreatePaymentRequest = {
                orderId: order.orderId,
            }

            const response = await fetch(moneroApiUrlResponse.url + "/payments", {
                method: "POST",
                body: JSON.stringify(createPaymentRequest),
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                }
            });
    
            if (!response.ok) {
                setError(await response.json());
                return;
            }

            const createPaymentResponse: CreatePaymentResponse = await response.json();

            setPaymentResponse(createPaymentResponse);
            setPaymentLink(`monero:${createPaymentResponse.address}?tx_amount=${createPaymentResponse.xmrAmount ?? 0}`);
        }
        catch {
            setError("There was an error getting payment details.");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className='main'>
            <p className='monero-text'>Pay with Monero</p>
            <LoadingSpinner isLoading={loading}/>
            {
                paymentResponse && 
                <div>
                    <label htmlFor='address'>Address</label>
                    <textarea readOnly rows={2} name='address' id='address' className='form-input optimizedCheckout-form-input address' value={paymentResponse.address}/>
                    <label htmlFor='amount'>Amount</label>
                    <input readOnly name='amount' id='amount' className='form-input optimizedCheckout-form-input amount' value={paymentResponse.xmrAmount}/>
                    <label htmlFor='state'>Status</label>
                    <input readOnly name='state' id='state' className='form-input optimizedCheckout-form-input state' value={PaymentState[paymentResponse.paymentState]}/>
                
                    <QRCode className="QR" value={paymentLink}/>
                    <a className="openwallet" href={paymentLink}>Open Monero wallet</a>
                </div>
            }
            {
                error !== "" ? 
                <div>
                    <p>{error}</p>
                    <button type='button' onClick={getPaymentDetails} className='button'>Try again</button>
                </div> 
                : 
                <></>
            }
        </div>
    );

}