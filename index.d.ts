// TODO: Remove and update declaration of PayPalSupportedCurrency
export type paypalSupportedCurrencies =
    'AUD' |
    'BRL' |
    'CAD' |
    'CNY' |
    'CZK' |
    'DKK' |
    'EUR' |
    'HKD' |
    'HUF' |
    'INR' |
    'ILS' |
    'JPY' |
    'MYR' |
    'MXN' |
    'TWD' |
    'NZD' |
    'NOK' |
    'PHP' |
    'PLN' |
    'GBP' |
    'RUB' |
    'SGD' |
    'SEK' |
    'CHF' |
    'THB' |
    'USD'

// TODO: Remove and update declaration of PayPayLocaleCode
export type paypalLocalCodes =
    'da_DK' |
    'de_DE' |
    'en_AU' |
    'en_GB' |
    'en_US' |
    'es_ES' |
    'es_XC' |
    'fr_CA' |
    'fr_FR' |
    'fr_XC' |
    'id_ID' |
    'it_IT' |
    'ja_JP' |
    'ko_KR' |
    'nl_NL' |
    'no_NO' |
    'pl_PL' |
    'pt_BR' |
    'pt_PT' |
    'ru_RU' |
    'sv_SE' |
    'th_TH' |
    'tr_TR' |
    'zh_CN' |
    'zh_HK' |
    'zh_TW' |
    'zh_XC'

export type PayPalSupportedCurrency = paypalSupportedCurrencies
export type PayPalLocaleCode = paypalLocalCodes

export interface PostalAddress {
    recipientName: string | null,
    streetAddress: string | null,
    extendedAddress: string | null,
    locality: string | null,
    countryCodeAlpha2: string | null,
    postalCode: string | null,
    region: string | null
}

export interface PaypalResponse {
    nonce: string,
    payerId: string,
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    billingAddress: PostalAddress,
    shippingAddress: PostalAddress
}

export interface DeviceDataResponse {
    deviceData: string
}

declare function requestOneTimePayment(token: string, {
    amount,
    currency,
    localeCode,
    shippingAddressRequired,
    userAction,
    intent,
    offerPayLater,
}: {
    amount: string,
    currency ? : paypalSupportedCurrencies,
    localeCode ? : paypalLocalCodes,
    shippingAddressRequired ? : boolean,
    userAction ? : 'commit' | 'continue',
    intent ? : 'sale' | 'authorize' | 'order',
    offerPayLater ? : boolean,
}): Promise <PaypalResponse> ;

declare function requestBillingAgreement(token: string, {
    billingAgreementDescription,
    currency,
    localeCode
}: {
    billingAgreementDescription: string,
    currency ? : paypalSupportedCurrencies,
    localeCode ? : paypalLocalCodes,
}): Promise <PaypalResponse> ;

declare function requestDeviceData(token: string): Promise <DeviceDataResponse> ;
