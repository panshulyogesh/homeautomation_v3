import React, {useState, createRef} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  StatusBar,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';

import {Icon, Fab, Button} from 'native-base';
import * as Animatable from 'react-native-animatable';

import LinearGradient from 'react-native-linear-gradient';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import Feather from 'react-native-vector-icons/Feather';

import MultiSelect from 'react-native-multiple-select';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});
import TcpSocket from 'react-native-tcp-socket';

const datacq = ({navigation}) => {
  function handlesubmit() {
    let Snapshot = '24:62:AB:F2:8D:5C' + '/' + 'ACQUIRE' + '#';
    console.log(Snapshot);
    let client = TcpSocket.createConnection(
      {port: 80, host: '192.168.4.1'},
      () => {
        client.write(Snapshot);
      },
    );
    // client.on('connect', () => {
    //   console.log('Opened client on ' + JSON.stringify(client.address()));
    // });
    client.on('data', data => {
      console.log('message was received from ESP32 ==>', data.toString());
      storedata(data.toString());
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

  function storedata(data) {
    var today = new Date();
    var date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    var date1 = today.getFullYear() + (today.getMonth() + 1) + today.getDate();
    var time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var dateTime = date + ' ' + time;

    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Data_Acquisition ( coordinates ,timestamp ,bindingid ,value )
          VALUES (?,?,?,?);`,
        [null, dateTime, null, data],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'check',
            });
            setget(data);
          }
        },
        (tx, error) => {
          console.log(error);
        },
      );
    });
  }

  function handlecheck() {
    let getstring =
      findobj.macid +
      '/' +
      'GET' +
      '/' +
      owner.owner_name +
      ';' +
      // findobj.productid +
      // '_' +
      findobj.macid +
      ';' +
      findobj.esp_pin +
      ';' +
      '#';
    console.log('check string===>', getstring);
    let client = TcpSocket.createConnection(
      {port: findobj.portnumber, host: findobj.ipaddress},
      () => {
        client.write(getstring.toString());
      },
    );
    client.on('connect', () => {
      console.log('Opened client on ' + JSON.stringify(client.address()));
    });
    client.on('data', data => {
      console.log('message was received from ESP32 ==>', data.toString());

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
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'orange',
          }}>
          <Button transparent onPress={() => handlesubmit()}>
            <Icon
              name="camera"
              type="Feather"
              style={{fontSize: 30, color: 'green'}}
            />
          </Button>
          <Button transparent onPress={() => handlecheck()}>
            <Icon name="videocam" style={{fontSize: 30, color: 'red'}} />
          </Button>
        </View>
      </Animatable.View>
    </View>
  );
};

export default datacq;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: `#008080`,
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
    justifyContent: 'center',
    alignItems: 'center',
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
