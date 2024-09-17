import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  addEventListener,
  connect,
  defaultConfig,
  fetchLightningLimits,
  getInfo,
  LiquidNetwork,
  PaymentMethod,
  prepareReceivePayment,
  prepareSendPayment,
  receivePayment,
  removeEventListener,
  SdkEvent,
  sendPayment,
} from '@breeztech/react-native-breez-sdk-liquid';
import QRCode from 'react-native-qrcode-svg';

const mnemonic =
  'gown divorce agent paddle nose duck pear cycle pizza message flame tragic';

const App = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [receiveFee, setReceiveFee] = useState(0);
  const [receiveInvoice, setReceiveInvoice] = useState('');
  const [sendInvoice, setSendInvoice] = useState('');
  const [sendFee, setSendFee] = useState(0);

  const init = async () => {
    const config = await defaultConfig(LiquidNetwork.MAINNET);

    try {
      await connect({mnemonic, config});
      await addEventListener(onEvent);
    } catch (error) {
      console.log('init', error);
    }
  };

  const updateBalance = async () => {
    try {
      const walletInfo = await getInfo();
      setBalance(walletInfo.balanceSat);
      console.log(walletInfo);
    } catch (error) {
      console.log('error getting info', error);
    }
  };

  const getLimits = async () => {
    try {
      const currentLimits = await fetchLightningLimits();
      console.log(currentLimits);
    } catch (error) {
      console.log('error getting limits', error);
    }
  };

  const getInvoice = async () => {
    try {
      const prepareResponse = await prepareReceivePayment({
        payerAmountSat: Number(amount),
        paymentMethod: PaymentMethod.LIGHTNING,
      });

      setReceiveFee(prepareResponse.feesSat);

      const optionalDescription = 'LiquidSDK Test';
      const res = await receivePayment({
        prepareResponse,
        description: optionalDescription,
      });

      setReceiveInvoice(res.destination);
    } catch (error) {
      console.log('error receiving payment', error);
    }
  };

  const decodeInvoice = async () => {
    try {
      const prepareResponse = await prepareSendPayment({
        destination: sendInvoice,
      });
      console.log(prepareResponse);
      setSendFee(prepareResponse.feesSat);
    } catch (error) {
      console.log('error decoding invoice', error);
    }
  };

  const payInvoice = async () => {
    try {
      const prepareResponse = await prepareSendPayment({
        destination: sendInvoice,
      });
      const sendResponse = await sendPayment({
        prepareResponse,
      });
      const payment = sendResponse.payment;
      console.log(payment);
    } catch (error) {
      console.log('error sending payment', error);
    }
  };

  const clearInvoice = () => setSendInvoice('');

  const onEvent = (e: SdkEvent) => {
    console.log(`Received event: ${e.type}`);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Balance</Text>
        <Text style={styles.text}>{balance} sats</Text>
        <Button title="Update" onPress={updateBalance} />
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Receive</Text>
        <Button title="Get Limits" onPress={getLimits} />
        <TextInput
          style={styles.amountInput}
          onChangeText={setAmount}
          value={amount}
          placeholder=""
          keyboardType="numeric"
        />
        <Button title="Get Invoice" onPress={getInvoice} disabled={!amount} />
        <Text style={styles.text}>Fees: {receiveFee} sats</Text>
        <Text style={styles.text}>Invoice</Text>
        {receiveInvoice && (
          <QRCode value={receiveInvoice} size={300} backgroundColor="white" />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Send</Text>
        <TextInput
          style={styles.invoiceInput}
          onChangeText={setSendInvoice}
          value={sendInvoice}
          placeholder=""
          numberOfLines={10}
          multiline
        />
        <Button title="Clear Invoice" onPress={clearInvoice} />
        <Button title="Decode Invoice" onPress={decodeInvoice} />
        <Text style={styles.text}>Fees: {sendFee} sats</Text>
        <Button title="Pay Invoice" onPress={payInvoice} />
      </View>
    </ScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: 20,
  },
  text: {
    fontSize: 21,
    fontWeight: 'bold',
  },
  content: {
    borderWidth: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 10,
  },
  amountInput: {
    borderBottomWidth: 1,
    fontSize: 21,
    fontWeight: 'bold',
    width: 100,
    height: 40,
    padding: 0,
  },
  invoiceInput: {
    borderWidth: 1,
    fontSize: 21,
    fontWeight: 'bold',
    width: '100%',
  },
});
