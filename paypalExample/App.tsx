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
  const [error, setError] = useState('');
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

  const requestPayment = () =>
    requestOneTimePayment(token, {amount})
      .then(setSuccess)
      .then(()=> setError(''))
      .catch((err) => setError(err.message));

  const requestBilling = () =>
    requestBillingAgreement(token, {billingAgreementDescription})
      .then(setSuccess)
      .then(()=> setError(''))
      .catch((err) => setError(err.message));

  const requestData = () =>
    requestDeviceData(token)
      .then((({ deviceData }) => setDeviceData(deviceData)))
      .then(()=> setError(''))
      .catch((err) => setError(err.message));


  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.wrapper}>
          <Text style={styles.headerStyle}>React-Native-Paypal</Text>

          <Text style={styles.sectionTitle}>Token</Text>
          <TextInput
            onChangeText={setToken}
            value={token}
            style={styles.textInput}
          />

          <Text style={styles.sectionTitle}>Deposit Amount</Text>
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

          <TouchableOpacity onPress={requestData} style={styles.button}>
            <Text style={styles.buttonText}>Request Device Data</Text>
          </TouchableOpacity>

          {!!error && <Text style={styles.errorText}>Error: {error}</Text>}

          <Text style={styles.sectionTitle}>Response:</Text>
          <Text>Nonce: {success.nonce}</Text>
          <Text>Payer Id: {success.payerId}</Text>
          <Text>Email: {success.email}</Text>
          <Text>First Name: {success.firstName}</Text>
          <Text>Last Name: {success.lastName}</Text>
          <Text>Phone: {success.phone}</Text>
          <Text>deviceData: {deviceData}</Text>
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
    fontSize: 20,
    fontWeight: '600',
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
    backgroundColor: 'grey',
    fontSize: 18,
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
});

export default App;
