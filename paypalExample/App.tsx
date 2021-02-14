import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  requestOneTimePayment,
  requestBillingAgreement,
  requestDeviceData,
  PaypalResponse,
} from 'react-native-paypal';

const App = () => {
  // Set token here to not have to paste every time (make sure not to commit!)
  const [token, setToken] = useState('');
  const [error1, setError1] = useState('');
  const [error2a, setError2a] = useState('');
  const [error2b, setError2b] = useState('');
  const [error3, setError3] = useState('');
  const [success, setSuccess] = useState<PaypalResponse>({
    nonce: '',
    payerId: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [deviceData, setDeviceData] = useState('');
  const [amount, setAmount] = useState('10');
  const [
    billingAgreementDescription,
    setBillingAgreementDescription,
  ] = useState('Billing Description');

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchToken = () =>
    fetch('http://127.0.0.1:3000/token') // Edit this to point to your server token call
      .then((response) => response.json())
      .then((data) => setToken(data.clientToken)) // Edit this to use your server's token response
      .then(() => setError1(''))
      .catch((err) => setError1(err.message));

  const requestPayment = () =>
    requestOneTimePayment(token, {amount})
      .then(setSuccess)
      .then(() => setError2a(''))
      .catch((err) => setError2a(err.message));

  const requestBilling = () =>
    requestBillingAgreement(token, {billingAgreementDescription})
      .then(setSuccess)
      .then(() => setError2a(''))
      .catch((err) => setError2a(err.message));

  const requestData = () =>
    requestDeviceData(token)
      .then(({deviceData}) => setDeviceData(deviceData))
      .then(() => setError2b(''))
      .catch((err) => setError2b(err.message));

  const submitPayment = () =>
    fetch(
      'http://127.0.0.1:3000/pay', // Edit this to point to your server
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({nonce: success.nonce, amount, deviceData}), // Edit this to use your server's expected payload
      },
    )
      .then((response) => response.json())
      .then(({success, message}) => {
        setError3(message);
        setPaymentSuccess(success);
      }) // Edit this to use your server's token response
      .catch((err) => {
        setError3(err.message);
      });

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.wrapper}>
          <Text style={styles.headerStyle}>React-Native-Paypal</Text>

          <View style={styles.sectionBorder} />

          <Text style={styles.sectionTitle}>Step 1: Client Token</Text>
          <Text style={styles.description}>
            A client token is required for any paypal actions. It should be
            fetched via server but can be pasted here for testing purposes. The
            button here requires a running server. Current configurations point
            to this project's example server but you'll have to tweak the source
            code to point to your server/use your sent payload
          </Text>
          <TextInput
            onChangeText={setToken}
            value={token}
            style={styles.textInput}
            placeholder={'Token'}
          />
          <TouchableOpacity onPress={fetchToken} style={styles.button}>
            <Text style={styles.buttonText}>Fetch token (requires server)</Text>
          </TouchableOpacity>

          {!!error1 && <Text style={styles.errorText}>Error: {error1}</Text>}

          <View style={styles.sectionBorder} />

          <Text style={styles.sectionTitle}>Step 2a: Fetch nonce</Text>
          <Text style={styles.description}>
            This sends the user through the paypal payment flow (purpose of this
            library). `requestOneTimePayment` will request a one time payment
            while `requestBillingAgreement` will vault a user's payment so they
            don't have to log in each time they want to make a transaction
          </Text>
          <TextInput
            onChangeText={setAmount}
            value={amount}
            style={styles.textInput}
          />

          <TouchableOpacity onPress={requestPayment} style={styles.button}>
            <Text style={styles.buttonText}>Deposit one time payment</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Billing Description</Text>
          <TextInput
            onChangeText={setBillingAgreementDescription}
            value={billingAgreementDescription}
            style={styles.textInput}
          />
          <TouchableOpacity onPress={requestBilling} style={styles.button}>
            <Text style={styles.buttonText}>Request Billing</Text>
          </TouchableOpacity>

          <Text>Nonce: {success.nonce}</Text>
          <Text>Payer Id: {success.payerId}</Text>
          <Text>Email: {success.email}</Text>
          <Text>First Name: {success.firstName}</Text>
          <Text>Last Name: {success.lastName}</Text>
          <Text>Phone: {success.phone}</Text>

          {!!error2a && <Text style={styles.errorText}>Error: {error2a}</Text>}

          <View style={styles.sectionBorder} />

          <Text style={styles.sectionTitle}>
            Step 2b (optional): Fetch device data
          </Text>
          <Text style={styles.description}>
            Braintree suggests sending your device data in requests for
            detecting fraudulent actions
          </Text>

          <TouchableOpacity onPress={requestData} style={styles.button}>
            <Text style={styles.buttonText}>Request Device Data</Text>
          </TouchableOpacity>

          <Text>deviceData: {deviceData}</Text>

          {!!error2b && <Text style={styles.errorText}>Error: {error2b}</Text>}

          <View style={styles.sectionBorder} />

          <Text style={styles.sectionTitle}>Step 3: Make payment</Text>
          <Text style={styles.description}>
            For example app this is only hooked up for `requestOneTimePayment`.
            Send user's payment request to your server. You'll need to send the
            nonce and amount but you may want to also collect other response
            info. Current configurations point to this project's example server
            but you'll have to tweak the source code to point to your server/use
            your sent payload
          </Text>

          <TouchableOpacity onPress={submitPayment} style={styles.button}>
            <Text style={styles.buttonText}>
              Complete payment (requires server)
            </Text>
          </TouchableOpacity>

          {!!error3 && <Text style={styles.errorText}>Error: {error3}</Text>}
          {paymentSuccess && (
            <Text style={styles.description}>
              🎊🎊 Success! Look in you portal for transaction
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },
  sectionTitle: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  description: {
    paddingTop: 5,
    fontSize: 12,
    color: 'black',
  },
  wrapper: {
    padding: 10,
  },
  errorText: {
    color: 'red',
  },
  textInput: {
    padding: 5,
    marginTop: 5,
    backgroundColor: 'grey',
    fontSize: 16,
  },
  button: {
    margin: 10,
    padding: 10,
    backgroundColor: '#1E6738',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: 'white',
    alignSelf: 'center',
    fontWeight: '600',
  },
  sectionBorder: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
    marginVertical: 10,
  },
});

export default App;
