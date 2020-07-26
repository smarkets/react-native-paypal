
import { NativeModules } from 'react-native';

const { RNPaypal } = NativeModules;

export default RNPaypal;
export const {
  requestOneTimePayment,
} = RNPaypal;