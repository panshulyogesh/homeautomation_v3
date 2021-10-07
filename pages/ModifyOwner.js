import React, {useState, createRef, useEffect} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
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

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Container,
  Header,
  Content,
  Left,
  Text,
  Button,
  Icon,
  Right,
  CheckBox,
  Title,
  H1,
  Spinner,
  Fab,
} from 'native-base';
import {MaskedTextInput} from 'react-native-mask-text';
import TcpSocket from 'react-native-tcp-socket';
import {NetworkInfo} from 'react-native-network-info';
import DeviceInfo from 'react-native-device-info';
import {getUniqueId, getManufacturer} from 'react-native-device-info';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

import {useFocusEffect} from '@react-navigation/native';
const ModifyOwner = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [OwnerName, setOwnerName] = useState('');
  const [password, setpassword] = useState('');
  const [MailId, setMailId] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [Property_name, setProperty_name] = useState('');
  const [Street, setStreet] = useState('');
  const [Area, setArea] = useState('');
  const [State, setState] = useState('');
  const [pincode, setpincode] = useState('');
  const [Door_Number, setDoor_Number] = useState('');
  const [owner, setowner] = useState('');
  const [deviceip, setdeviceip] = useState('');
  const [showmodal, setshowmodal] = useState(false);
  const [macid, setmacid] = useState('');
  let updateAllStates = (
    ownername,
    owner_password,
    MailId,
    PhoneNumber,
    Property_name,
    Area,
    State,
    pincode,
    Street,
    Door_Number,
  ) => {
    setOwnerName(ownername);
    setpassword(owner_password);
    setMailId(MailId);
    setPhoneNumber(PhoneNumber);
    setProperty_name(Property_name);
    setArea(Area);
    setState(State);
    setpincode(pincode);
    setStreet(Street);
    setDoor_Number(Door_Number);
  };
  useFocusEffect(
    React.useCallback(() => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Owner_Reg where Id=?',
          ['1'],
          (tx, results) => {
            var len = results.rows.length;
            if (len > 0) {
              let res = results.rows.item(0);
              updateAllStates(
                res.owner_name,
                res.owner_password,
                res.MailId,
                res.PhoneNumber.toString(),
                res.Property_name,
                res.Area,
                res.State,
                res.pincode,
                res.Street,
                res.Door_Number,
              );
            } else {
              alert('No user found');
              updateAllStates('');
            }
          },
        );
      });
      // DeviceInfo.getIpAddress().then(ip => {
      //console.log(ip);
      //   setdeviceip(ip);
      // });
    }, []),
  );

  const handleSubmitPress = async () => {
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
        `UPDATE  Owner_Reg SET 
              owner_name=?, owner_password=?,MailId=?,PhoneNumber=?,Property_name=? ,Area=?,State=?,pincode=?,Street=?,Door_Number=?
              where Id=?`,
        [
          OwnerName.toUpperCase(),
          password.toUpperCase(),
          MailId,
          PhoneNumber.toUpperCase(),
          Property_name.toUpperCase(),
          Area.toUpperCase(),
          State.toUpperCase(),
          pincode.toUpperCase(),
          Street.toUpperCase(),
          Door_Number.toUpperCase(),
          '1',
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
          }
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  };

  function ownerreg() {
    ///REGISTER/Owner_name;controller_Key;Device_name;Device_Model;Custom_SSID;Custom_pwd;DAQ_STACTIC_IP;DAQ_STACTIC_Port;Device_IP;Device_Port;

    //!     owner_name ====> sahique,.......
    //!     controller_key ==>  generated key on mobile side for encryption/decryption
    //!     Device_name
    //!     Device_Model
    //!     Custom_SSID ====> router ssid default value
    //!     Custom_pwd ===> router pwd default value
    //!     ssid for esp32 web-server
    //!    pwd for esp32 webserver
    //!     DAQ_STACTIC_IP= => raspberry pi ip address
    //!     DAQ_STACTIC_Port ==>  raspberry pi port  [DAQ ===> DATA ACCQUISITION]
    //!     Device_IP ========>  IP ADDRESS OF ESP
    //!     Device_PorT =====>  PORT OF ESP
    ///Owner_name;controller_Key;Device_name;Device_Model;Custom_SSID;Custom_Password;DAQ_STACTIC_IP;DAQ_STACTIC_Port;Device_IP;Device_Port;Device_SSID;Device_Password;
    let ownerpair =
      macid.toUpperCase() +
      '/' +
      'REGISTER' +
      '/' +
      OwnerName +
      // '_' +
      // Door_Number +
      // '_' +
      // Property_name +
      // '_' +
      // Street +
      // '_' +
      // Area +
      // '_' +
      // State +
      // '_' +
      // pincode +
      ';' +
      'ACSREACTNATIVE123KEY' +
      ';' +
      'devname' +
      ';' +
      'devmodel' +
      ';' +
      'Airtel_5Ghz' +
      ';' +
      'cuspass' +
      ';' +
      'daqip' +
      ';' +
      'daqport' +
      ';' +
      '192.168.4.1' +
      ';' +
      '80' +
      ';' +
      'devicessid' +
      ';' +
      'pass' +
      ';' +
      '#';

    console.log(ownerpair);
    //! TCP PROTOCOL OVER WIFI
    let client = TcpSocket.createConnection(
      //!   FACTORY DEFAULT
      {port: 80, host: '192.168.4.1'},
      () => {
        client.write(ownerpair.toString());
      },
    );
    client.on('connect', () => {
      console.log('Opened client on ' + JSON.stringify(client.address()));
    });
    client.on('data', data => {
      console.log('message was received from ESP32 ==>', data.toString());
      //ack:fail/success;macid#

      let ack = data
        .toString()
        .replace(':', ',')
        .replace(';', ',')
        .replace('#', '')
        .split(',');
      console.log(ack);
      if (ack[1] == 'success') {
        Alert.alert('success');
      }

      client.end();
    });
    client.on('error', error => {
      console.log('error', error);
      Alert.alert('please check your wifi connection');
      client.end();
    });
    client.on('close', () => {
      console.log('Connection closed!');
      client.end();
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#008080" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.text_header}>Configure Now!</Text>
      </View>
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={showmodal}
        onRequestClose={() => {
          console.log('Modal has been closed.');
        }}>
        <View style={styles.modal}>
          <Button
            transparent
            onPress={() => {
              setshowmodal(!showmodal);
            }}>
            <Icon name="close" style={{fontSize: 30, color: '#05375a'}} />
          </Button>
          <Text style={styles.text_footer}>Enter Mac Id</Text>
          <View style={styles.action}>
            <MaskedTextInput
              style={styles.textInput}
              placeholderTextColor="#05375a"
              autoCapitalize="words"
              placeholder="  Enter MAC ID  Ex:-B4:E6:2D:8D:73:C1 "
              mask="SS:SS:SS:SS:SS:SS"
              onChangeText={(text, rawText) => {
                setmacid(text);
                // console.log(rawText);
              }}
            />
          </View>
          <Button style={styles.button} onPress={() => ownerreg()}>
            <Text>Save </Text>
          </Button>
        </View>
      </Modal>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          <Text style={styles.text_footer}>Edit Your Name </Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Owner Name"
              defaultValue={OwnerName}
              onChangeText={OwnerName => setOwnerName(OwnerName)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your Password </Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Enter password"
              defaultValue={password}
              onChangeText={password => setpassword(password)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your Mail Id</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Mail Id"
              defaultValue={MailId}
              onChangeText={MailId => setMailId(MailId)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your Phone Number</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Phone Number"
              keyboardType="numeric"
              defaultValue={PhoneNumber}
              onChangeText={PhoneNumber => setPhoneNumber(PhoneNumber)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your Property Name</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Property Name"
              defaultValue={Property_name}
              onChangeText={Property_name => setProperty_name(Property_name)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your City/Town/Village</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="City/Town/Village"
              defaultValue={Area}
              onChangeText={Area => setArea(Area)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your State</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="State"
              defaultValue={State}
              onChangeText={State => setState(State)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your pin code</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="pincode"
              defaultValue={pincode}
              onChangeText={pincode => setpincode(pincode)}
            />
          </View>
          <Text style={styles.text_footer}>Edit Your Street</Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Street"
              defaultValue={Street}
              onChangeText={Street => setStreet(Street)}
            />
          </View>
          <Text style={styles.text_footer}>
            Edit Your Apartment Number/House Number
          </Text>
          <View style={styles.action}>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              placeholderTextColor="#05375a"
              placeholder="Apartment Number/House Number"
              defaultValue={Door_Number}
              onChangeText={Door_Number => setDoor_Number(Door_Number)}
            />
          </View>

          <View style={styles.centeredView}>
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
          <View style={styles.centeredView}>
            <Pressable
              style={styles.signIn}
              onPress={() => {
                setshowmodal(!showmodal);
              }}>
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
            </Pressable>
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
};

export default ModifyOwner;
const styles = StyleSheet.create({
  modal: {
    height: '50%',
    marginTop: 'auto',
    backgroundColor: 'white',
  },
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
});
