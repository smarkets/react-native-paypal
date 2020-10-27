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

export interface PaypalResponse {
    nonce: string,
    payerId: string,
    email: string,
    firstName: string,
    lastName: string,
    phone: string
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
}: {
    amount: string,
    currency ? : paypalSupportedCurrencies,
    localeCode ? : paypalLocalCodes,
    shippingAddressRequired ? : boolean,
    userAction ? : 'commit' | 'continue',
    intent ? : 'sale' | 'authorize' | 'order',
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
