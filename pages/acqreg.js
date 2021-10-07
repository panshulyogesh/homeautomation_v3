import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TextInput,
  useEffect,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

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
const filedata = require('./Master.json');
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from 'react-native-modal-dropdown';
import SearchableDropdown from 'react-native-searchable-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';
import MultiSelect from 'react-native-multiple-select';
import TcpSocket from 'react-native-tcp-socket';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

import {useFocusEffect} from '@react-navigation/native';
const acqreg = ({navigation}) => {
  const [port, setport] = useState('');
  const [ip, setip] = useState('');
  const [ssid, setssid] = useState('');
  const [pwd, setpwd] = useState('');

  function handlesubmitPress() {
    if (!ip) {
      alert('Please enter ipaddress');
      return;
    }
    if (!port) {
      alert('Please enter portnumber');
      return;
    }
    if (!ssid) {
      alert('Please enter ssid');
      return;
    }
    if (!pwd) {
      alert('Please enter pwd');
      return;
    }
    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Data_Acq_master (daqip ,daqport,wifi_ssid ,wifi_pwd )
               VALUES (?,?,?,?);  `,
        [ip, port, ssid, pwd],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'daq',
            });
          }
        },
        (tx, error) => {
          console.log(error);
          // navigation.navigate('DummyScreen', {
          //   paramKey: 'Binding_samedata',
          // });
        },
      );
    });
  }
  return (
    <View
      style={{
        flex: 10,
        marginTop: 10,
        marginBottom: 65,
        marginLeft: 10,
        marginRight: 10,
        margin: 10,
      }}>
      <Text style={styles.text_footer}>DAQ IP ADDRESS</Text>
      <View style={styles.action}>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholderTextColor="#05375a"
          placeholder="DAQ IP ADDRESS"
          onChangeText={ip => setip(ip)}
        />
      </View>
      <Text style={styles.text_footer}>DAQ PORT NUMBER</Text>
      <View style={styles.action}>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholderTextColor="#05375a"
          placeholder="DAQ PORT NUMBER"
          onChangeText={port => setport(port)}
        />
      </View>
      <Text style={styles.text_footer}>DAQ WIFI SSID</Text>
      <View style={styles.action}>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholderTextColor="#05375a"
          placeholder="DAQ WIFI SSID"
          onChangeText={ssid => setssid(ssid)}
        />
      </View>
      <Text style={styles.text_footer}>DAQ WIFI PWD</Text>
      <View style={styles.action}>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholderTextColor="#05375a"
          placeholder="DAQ WIFI PWD"
          onChangeText={pwd => setpwd(pwd)}
        />
      </View>
      <Button style={styles.button} onPress={() => handlesubmitPress()}>
        <Text>Submit</Text>
      </Button>
    </View>
  );
};

export default acqreg;

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modal: {
    height: '100%',
    marginTop: 'auto',
    backgroundColor: 'white',
  },
  actionButton: {
    marginLeft: 200,
  },
  text: {
    color: '#3f2949',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'green',
    justifyContent: 'center',
    width: 200,
    alignSelf: 'center',
  },

  separatorLine: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,.3)',
    margin: 3,
  },
});

// let bingo = [{
//   "Device": "fan",
//   "Manafacturer": "Havells"
// }, {
//   "Device": "Ceiling",
//   "Manafacturer": "bajaj"
// }]

// let obj = {
//   "Device": "Ceiling",
//   "Manafacturer": "bajaj"
// }
// const objString = JSON.stringify(obj);
// const val = bingo.find((item) => JSON.stringify(item) === objString);
// console.log(val)
////////////////////////

// let bingo = [{"Device": "fan", "Manafacturer": "Havells"}, {"Device": "Ceiling", "Manafacturer": "bajaj"}];

// let check1 ={"Device": "Ceiling", "Manafacturer": "bajaj"}
// //should return true or {"Device": "Ceiling", "Manafacturer": "bajaj"}

// let check2 ={"Device": "light", "Manafacturer": "bajaj"}
// //should return false or undefined

// function checkObjectExists(main, check) {
//   return JSON.stringify(main).indexOf(JSON.stringify(check)) >= 0;
// }

// console.log( checkObjectExists(bingo, check1) );   //true

// console.log( checkObjectExists(bingo, check2) );  //false

//////////////////
//pair:sahique;hall;fan;Havells_Ceilingfan_Fusion;#
//command:Havells_Ceilingfan_Fusion;speed;mid#
//command:Havells_Wallfan_Fusion;swing;on
