import React, {useState, createRef, useEffect} from 'react';

import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Button,
  Alert,
  Modal,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';

import * as Animatable from 'react-native-animatable';

import LinearGradient from 'react-native-linear-gradient';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import Feather from 'react-native-vector-icons/Feather';
//! conf variable is declared and defined as false by default and is used for validating pwd status in registration screen
let conf = {
  pwd_status: false,
};

import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});
import AsyncStorage from '@react-native-async-storage/async-storage';
import {pwd_status} from './FirstPage';
import TcpSocket from 'react-native-tcp-socket';
const OwnerRegistration = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [OwnerName, setOwnerName] = useState('');
  const [password, setpassword] = useState('');
  // const [pw, setpw] = useState('');
  const [MailId, setMailId] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [Property_name, setProperty_name] = useState('');
  const [Street, setStreet] = useState('');
  const [Area, setArea] = useState('');
  const [State, setState] = useState('');
  const [pincode, setpincode] = useState('');
  const [Door_Number, setDoor_Number] = useState('');

  async function handleSubmitPress() {
    setModalVisible(!modalVisible);
    if (
      !OwnerName ||
      !password ||
      !MailId ||
      !PhoneNumber ||
      !Property_name ||
      !Area ||
      !State ||
      !pincode ||
      !Street ||
      !Door_Number
    ) {
      alert('Please fill all the fields');
      return;
    }

    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Owner_Reg ( 
              owner_name, owner_password,MailId,PhoneNumber,Property_name ,Area ,State ,pincode ,Street,Door_Number)
               VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          OwnerName.toString().toUpperCase(),
          password.toString().toUpperCase(),
          MailId.toString(),
          PhoneNumber.toString().toUpperCase(),
          Property_name.toString().toUpperCase(),
          Area.toString().toUpperCase(),
          State.toString().toUpperCase(),
          pincode.toString().toUpperCase(),
          Street.toString().toUpperCase(),
          Door_Number.toString().toUpperCase(),
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Success',
              'Data is updated',
              [
                {
                  text: 'Ok',
                  onPress: () => navigation.navigate('FirstPage'),
                },
              ],
              {cancelable: false},
            );

            AsyncStorage.setItem('pwdstatus', JSON.stringify(false));
          }
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  }

  // function ownerreg() {
  //   if (
  //     !OwnerName ||
  //     !MailId ||
  //     !PhoneNumber ||
  //     !Property_name ||
  //     !Area ||
  //     !State ||
  //     !pincode ||
  //     !Street ||
  //     !Door_Number
  //   ) {
  //     alert('Please fill all the fields');
  //     return;
  //   }

  //   //Owner_name;controller_Key;Device_name;Device_Model;Custom_SSID;DAQ_STACTIC_IP;DAQ_STACTIC_Port;Device_IP;Device_Port;
  //   let ownerpair =
  //     OwnerName +
  //     '_' +
  //     MailId +
  //     '_' +
  //     PhoneNumber +
  //     '_' +
  //     Property_name +
  //     '_' +
  //     Area +
  //     '_' +
  //     State +
  //     '_' +
  //     pincode +
  //     '_' +
  //     Street +
  //     '_' +
  //     Door_Number +
  //     ';' +
  //     'ACSREACTNATIVE123KEY' +
  //     ';';
  //   'devname' +
  //     ';' +
  //     'devmodel' +
  //     ';' +
  //     'Airtel_5Ghz' +
  //     ';' +
  //     'daqip' +
  //     ';' +
  //     'daqport' +
  //     ';';
  // }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#008080" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.text_header}>Register Now!</Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          <Text style={styles.text_footer}>Enter Your Name </Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Owner Name"
              onChangeText={OwnerName => setOwnerName(OwnerName)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your Mail Id</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Mail Id"
              onChangeText={MailId => setMailId(MailId)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your Phone Number</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Phone Number"
              keyboardType="numeric"
              onChangeText={PhoneNumber => setPhoneNumber(PhoneNumber)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your Property Name</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Property Name"
              onChangeText={Property_name => setProperty_name(Property_name)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your City/Town/Village</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="City/Town/Village"
              onChangeText={Area => setArea(Area)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your State</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="State"
              onChangeText={State => setState(State)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your Pin Code</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="pin code"
              onChangeText={pincode => setpincode(pincode)}
            />
          </View>
          <Text style={styles.text_footer}>Enter Your Street</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Street"
              onChangeText={Street => setStreet(Street)}
            />
          </View>
          <Text style={styles.text_footer}>
            Enter Your Apartment Number/House Number
          </Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Apartment Number/House Number"
              onChangeText={Door_Number => setDoor_Number(Door_Number)}
            />
          </View>

          <View style={styles.centeredView}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>ENTER NEW PASSWORD</Text>
                  <TextInput
                    style={{
                      borderWidth: 2,
                      padding: 10,
                      color: '#05375a',
                    }}
                    placeholderTextColor="#05375a"
                    placeholder="Enter password"
                    onChangeText={password => setpassword(password)}
                  />
                  <Pressable style={styles.signIn} onPress={handleSubmitPress}>
                    <LinearGradient
                      colors={[`#008080`, '#01ab9d']}
                      style={styles.signIn}>
                      <Text
                        style={[
                          styles.textSign,
                          {
                            color: '#fff',
                          },
                        ]}>
                        Submit
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Modal>
            <Pressable
              style={styles.signIn}
              onPress={() => setModalVisible(true)}>
              <LinearGradient
                colors={[`#008080`, '#01ab9d']}
                style={styles.signIn}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: '#fff',
                    },
                  ]}>
                  Submit
                </Text>
              </LinearGradient>
            </Pressable>
            {/* <Pressable
              style={styles.signIn}
              onPress={() => setModalVisible(true)}>
              <LinearGradient
                colors={[`#008080`, '#01ab9d']}
                style={styles.signIn}>
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: '#fff',
                    },
                  ]}>
                  reg owner
                </Text>
              </LinearGradient>
            </Pressable> */}
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
};

export default OwnerRegistration;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: `#008080`,
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: Platform.OS === 'ios' ? 3 : 5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    fontWeight: 'bold',
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    borderWidth: 1,
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  color_textPrivate: {
    color: 'grey',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
