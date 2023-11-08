import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { fireEvent, render } from '@testing-library/react';
import { Formik } from 'formik';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { getCheckout as getCheckoutMock, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { FormContext } from '@bigcommerce/checkout/ui';

import { getPaypalCommerceRatePayMethodMock } from './mocks/paypalCommerceRatePayMocks';
import PaypalCommerceRatePayPaymentMethod from './PaypalCommerceRatePayPaymentMethod';
import {EventEmitter} from "events";

describe('PaypalCommerceRatePayPaymentMethod', () => {
    let eventEmitter: EventEmitter;
    let PaypalCommerceRatePayPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let localeContext: LocaleContextType;
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getPaypalCommerceRatePayMethodMock(),
        checkoutService,
        checkoutState,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        paymentForm: {
            setSubmitted: jest.fn(),
            setValidationSchema: jest.fn(),
            setFieldValue: jest.fn(),
        } as unknown as PaymentFormService,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckoutMock());
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        localeContext = createLocaleContext(getStoreConfig());
        eventEmitter = new EventEmitter();

        const submit = jest.fn();

        PaypalCommerceRatePayPaymentMethodTest = (props: PaymentMethodProps) => (
            <LocaleContext.Provider value={localeContext}>
                <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                    <Formik initialValues={{}} onSubmit={submit}>
                        {({ handleSubmit }) => (
                            <form aria-label="form" onSubmit={handleSubmit}>
                                <PaypalCommerceRatePayPaymentMethod {...props} />
                            </form>
                        )}
                    </Formik>
                </FormContext.Provider>
            </LocaleContext.Provider>
        );
    });

    it('successfully initializes payment with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            paypalcommerceratepay: {
                onPaymentSubmission: expect.any(Function),
                container: '#checkout-payment-continue',
                legalTextContainer: 'legal-text-container',
                getFieldsValues: expect.any(Function),
                onError: expect.any(Function),
            },
        });
    });

    it('renders component with required fields', async () => {
        const view = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        expect(view).toMatchSnapshot();
    });

    it('submits form', async () => {
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        const submitForm = jest.fn();
        const form = document.querySelectorAll('form')[0];

        form.onsubmit = submitForm;

        fireEvent.submit(form);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submitForm).toHaveBeenCalled();
    });

    it('deinitializes PaypalCommerceRatePayPaymentMethod', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const component = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        component.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('catches error during PaypalCommerceRatePayPaymentMethod initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during PaypalCommerceRatePayPaymentMethod deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const component = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('calls ratepay digital error', async () => {
        const onUnhandledErrorMock = jest.fn();
        const disableSubmitMock = jest.fn();
        const setSubmittedMock = jest.fn();
        const setValidationSchema = jest.fn();
        const digitalErrorMock = {
            status: 'error',
            three_ds_result: {
                acs_url: null,
                payer_auth_request: null,
                merchant_data: null,
                callback_url: null,
            },
            errors: [
                {
                    code: 'invalid_request_error',
                    message: 'We are experiencing difficulty processing your transaction'
                },
                {
                    code: 'transaction_declined',
                    message: 'Your transaction was declined. Please try again',
                    provider_error: {
                        code: 'ITEM_CATEGORY_NOT_SUPPORTED_BY_PAYMENT_SOURCE'
                    }
                },
            ],
        };

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onError', () => {
                if (options.paypalcommerceratepay?.onError) {
                    options.paypalcommerceratepay.onError(digitalErrorMock);
                }
            });

            return Promise.resolve(checkoutState);
        });
        const newProps = {
            ...props,
            paymentForm: {
                disableSubmit: disableSubmitMock,
                setSubmitted: setSubmittedMock,
                setValidationSchema: setValidationSchema,
            } as unknown as PaymentFormService,
            onUnhandledError: onUnhandledErrorMock,
        };

        render(<PaypalCommerceRatePayPaymentMethodTest {...newProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onError');

        expect(onUnhandledErrorMock).toHaveBeenCalledWith(new Error(props.language.translate('payment.ratepay.errors.itemCategoryNotSupportedByPaymentSource')));
    });
});
