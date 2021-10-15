var CryptoJS = require('crypto-js');
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
import Slider from '@react-native-community/slider';
import Voice from '@react-native-voice/voice';

import {readfile, compareString} from './Files';
import MultiSelect from 'react-native-multiple-select';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});
import TcpSocket from 'react-native-tcp-socket';
const FirstPage = ({navigation}) => {
  const [selectedloc, setselectedloc] = useState([]);
  const [selectloc, setselectloc] = useState([]);
  const [selectedappliance, setselectedappliance] = useState([]);
  const [selectappliance, setselectappliance] = useState([]);
  const [selectedproperty, setselectedproperty] = useState([]);
  const [selectproperty, setselectproperty] = useState([]);
  const [selectedvaildstate, setselectedvaildstate] = useState([]);
  const [selectvaildstate, setselectvaildstate] = useState([]);
  const [mapped_data, setmappeddata] = useState([]);
  const [owner, setowner] = useState([]);
  const [get, setget] = useState('');
  const [tempo, settempo] = useState('');
  const [arrlen, setarrlen] = useState(null);
  const [minval, setminval] = useState(null);
  const [maxval, setmaxval] = useState(null);

  const [preffered, setpreffered] = useState([]);

  const [pitch, setPitch] = useState('');
  const [error, setError] = useState('');
  const [end, setEnd] = useState('');
  const [started, setStarted] = useState('');
  const [results, setResults] = useState([]);
  const [partialResults, setPartialResults] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      retrieve();

      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechPartialResults = onSpeechPartialResults;
      //  Voice.display_output = display_output;
      Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }, []),
  );

  const onSpeechStart = e => {
    //Invoked when .start() is called without error
    //console.log('onSpeechStart: ', e);
    setStarted('√');
  };

  const onSpeechEnd = e => {
    //Invoked when SpeechRecognizer stops recognition
    //console.log('onSpeechEnd: ', e);
    setEnd('√');
  };

  const onSpeechError = e => {
    //Invoked when an error occurs.
    setError(JSON.stringify(e.error));
  };

  const onSpeechResults = async e => {
    //Invoked when SpeechRecognizer is finished recognizing

    AsyncStorage.setItem('tempo', JSON.stringify([]));
    let read = await AsyncStorage.getItem('tempo');

    console.log('onSpeechResults: ', e.value);
    setResults(e.value);
    const customdata = require('./config.json');
    const data = await compareString(e, customdata);
    console.log('result', data);
    // let arr = [];
    // arr.push(data.location.toUpperCase());
    // console.log(arr);
    if (data.location != '!') {
      console.log(data.location);
      setselectloc([data.location.toUpperCase()]);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT appliance FROM Binding_Reg where location=? and paired_unpaired=? ',
          [data.location.toUpperCase(), 'paired'],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            console.log('appliance', temp);
            setselectappliance(temp);
          },
        );
      });

      if (data.appliance != '!') {
        console.log('entered');
        setselectedappliance([data.appliance.toUpperCase()]);

        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM Binding_Reg where (location =? and appliance=?); ',
            [data.location.toUpperCase(), data.appliance.toUpperCase()],
            (tx, results) => {
              var temp = [];
              var res = results.rows.item(0);
              console.log('database data', res);
              var property = res.properties.toString().split(';');
              console.log('property===>', property);
              var validstate = res.Valid_States.toString().split(';');
              console.log('valid state===>', validstate);
              var output = res.output.toString().split(';');
              console.log('output===>', output);
              var espin = res.ESP_pin.toString().split(';');
              console.log('espin===>', espin);
              var productid = res.ACS_controller_model.toString().split('#');
              console.log('productid====>', productid);
              var macid = res.macid.toString().split('#');
              console.log('macid====>', macid);
              var ipaddress = res.ipaddress.toString().split('#');
              console.log('ipaddress====>', ipaddress);
              var portnumber = res.portnumber.toString().split('#');
              console.log('portnumber====>', portnumber);

              var id = range(1, property.length);
              console.log('id====>', id);

              let result = property.map((property, i) => ({
                property,
                validstate: validstate[i],
                output: output[i],
                esp_pin: espin[i],
                productid: productid[0],
                macid: macid[0],
                ipaddress: ipaddress[0],
                portnumber: portnumber[0],
                id: id[i],
                x: validstate[i].split(','),
              }));
              console.log('mapped data', result);

              setmappeddata(result);
              setselectproperty(validstate);

              setselectedvaildstate(JSON.parse(read));
            },
            (tx, error) => {
              console.log(error);
            },
          );
        });

        if (data.property != '!') {
          setselectedvaildstate([
            {property: data.property, validstate: data.control},
          ]);
        }
      }
    }

    // ["HALL"] ["FAN"] [{"property": "Speed", "validstate": "medium"}]
  };

  const onSpeechPartialResults = e => {
    //Invoked when any results are computed
    // console.log('onSpeechPartialResults: ', e);
    setPartialResults(e.value);
  };

  const onSpeechVolumeChanged = e => {
    //Invoked when pitch that is recognized changed
    // console.log('onSpeechVolumeChanged: ', e);
    setPitch(e.value);
  };

  const startRecognizing = async () => {
    //Starts listening for speech for a specific locale
    try {
      await Voice.start('en-US');
      setPitch('');
      setError('');
      setStarted('');
      setResults([]);
      setPartialResults([]);
      setEnd('');
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    //Stops listening for speech
    try {
      await Voice.stop();
    } catch (e) {
      //eslint-disable-next-line
      console.error(e);
    }
  };

  const cancelRecognizing = async () => {
    //Cancels the speech recognition
    try {
      await Voice.cancel();
    } catch (e) {
      //eslint-disable-next-line
      console.error(e);
    }
  };

  const destroyRecognizer = async () => {
    //Destroys the current SpeechRecognizer instance
    try {
      await Voice.destroy();
      setPitch('');
      setError('');
      setStarted('');
      setResults([]);
      setPartialResults([]);
      setEnd('');
    } catch (e) {
      console.error(e);
    }
  };
  //after location is chosen
  const selectedlocation = selectedItems => {
    console.log(selectedItems);
    setselectloc(selectedItems);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT appliance FROM Binding_Reg where location=? and paired_unpaired=? ',
        [selectedItems.toString(), 'paired'],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          console.log('appliance', temp);
          setselectappliance(temp);
          // setasyncapp(temp);
        },
      );
    });
  };
  //after appliance is chosen
  const appliance = async selectedItems => {
    AsyncStorage.setItem('tempo', JSON.stringify([]));
    let read = await AsyncStorage.getItem('tempo');
    console.log(selectedItems.toString());
    setselectedappliance(selectedItems);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Binding_Reg where (location =? and appliance=?); ',
        [selectloc.toString(), selectedItems.toString()],
        (tx, results) => {
          var temp = [];
          var res = results.rows.item(0);
          console.log('database data', res);
          var property = res.properties.toString().split(';');
          console.log('property===>', property);
          var validstate = res.Valid_States.toString().split(';');
          console.log('valid state===>', validstate);
          var output = res.output.toString().split(';');
          console.log('output===>', output);
          var espin = res.ESP_pin.toString().split(';');
          console.log('espin===>', espin);
          var productid = res.ACS_controller_model.toString().split('#');
          console.log('productid====>', productid);
          var macid = res.macid.toString().split('#');
          console.log('macid====>', macid);
          var ipaddress = res.ipaddress.toString().split('#');
          console.log('ipaddress====>', ipaddress);
          var portnumber = res.portnumber.toString().split('#');
          console.log('portnumber====>', portnumber);

          var id = range(1, property.length);
          console.log('id====>', id);

          let result = property.map((property, i) => ({
            property,
            validstate: validstate[i],
            output: output[i],
            esp_pin: espin[i],
            productid: productid[0],
            macid: macid[0],
            ipaddress: ipaddress[0],
            portnumber: portnumber[0],
            id: id[i],
            x: validstate[i].split(','),
          }));
          console.log('mapped data', result);

          setmappeddata(result);
          setselectproperty(validstate);

          setselectedvaildstate(JSON.parse(read));
        },
        (tx, error) => {
          console.log(error);
        },
      );
    });
  };

  //after property is chosen
  const property = selectedItems => {
    setselectedproperty(selectedItems);

    const findvalidstate = mapped_data.find(x =>
      x.property.includes(selectedItems.toString()),
    );

    console.log('findvalidstate====>', findvalidstate.validstate);

    let valid = findvalidstate.validstate.toString();
    let valid_state = valid.split(',');
    console.log(valid_state);
    // settempo(valid_state);
    // setarrlen(valid_state.length);
    // setminval(valid_state[0]);
    // setmaxval(valid_state[valid_state.length - 1]);
    var temp = [];
    valid_state.forEach(valid_state => {
      temp.push({valid_state});
    });
    console.log(temp);
    setselectvaildstate(temp);
  };

  const validstates = selectedItems => {
    console.log(selectedItems);
    setselectedvaildstate(selectedItems);
  };

  async function retrieve() {
    AsyncStorage.setItem('tempo', JSON.stringify([]));
    const read = await AsyncStorage.getItem('pwdstatus');
    //  console.log('read', read);
    if (read != null) {
      await AsyncStorage.setItem('pwdstatus', JSON.stringify(false));
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT DISTINCT location FROM Binding_Reg',
        [],
        (tx, results) => {
          var temp = [];
          for (let j = 0; j < results.rows.length; ++j)
            temp.push(results.rows.item(j));
          setselectedloc(temp);
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql('SELECT * FROM Owner_Reg', [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i)
          temp.push(results.rows.item(i));
        let ownerdata_obj = temp;
        // console.log(ownerdata_obj[0]);
        setowner(ownerdata_obj[0]);
      });
    });
  }

  function handlesubmit() {
    if (selectloc.length == 0) {
      alert('Please enter location');
      return;
    }
    if (selectedappliance.length == 0) {
      alert('Please enter appliance');
      return;
    }

    if (selectedvaildstate.length == 0) {
      alert('Please enter vaild state');
      return;
    }
    console.log(selectloc, selectedappliance, selectedvaildstate);
    let sub;
    var s = '';
    var findobj;

    selectedvaildstate.forEach(element => {
      //  console.log('ele', element);
      console.log('===');
      findobj = mapped_data.find(x => x.property.includes(element.property));
      console.log('findobj', findobj);
      var validstate = findobj.validstate.toString().split(',');
      console.log('valid state===>', validstate);
      var output = findobj.output.toString().split(',');
      console.log('output===>', output);
      let index = validstate.indexOf(element.validstate);
      console.log('index', index);
      var findoutput = output[index];
      console.log('findoutput', findoutput);

      sub = findoutput + ';' + findobj.esp_pin + ';' + '!';

      s += sub;
    });

    // const findobj = mapped_data.find(x =>
    //   x.property.includes(selectedproperty.toString()),
    // );
    // console.log('findobj', findobj);
    // var validstate = findobj.validstate.toString().split(',');
    // console.log('valid state===>', validstate);
    // var output = findobj.output.toString().split(',');
    // console.log('output===>', output);
    // let result = validstate.map((validstate, i) => ({
    //   validstate,
    //   output: output[i],
    // }));
    // console.log('submapping==>', result);
    // const findoutput = result.find(x =>
    //   x.validstate.includes(selectedvaildstate.toString()),
    // );
    // console.log('output found===>', findoutput);
    // console.log('ip adresss found===>', findobj.ipaddress);
    // console.log('port  found===>', findobj.portnumber);
    /// SET/PANSHUL;24:62:AB:F2:8D:5C/0-0;GPIO0;

    let setstring = findobj.macid + '/' + 'SET' + '/' + s + '#';
    console.log('set string===>', setstring);

    let client = TcpSocket.createConnection(
      {port: findobj.portnumber, host: findobj.ipaddress},
      () => {
        client.write(setstring.toString());
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

    // OUTPUT
    // console.log(encode()); // 'NzUzMjI1NDE='
    // console.log(decode()); // '75322541'
    // function encode() {
    //   // INIT
    //   const myString =
    //     'Owner_name;controller_Key;Device_name;Device_Model;Custom_SSID;Custom_Password;DAQ_STACTIC_IP;DAQ_STACTIC_Port;Device_IP;Device_Port;Device_SSID;Device_Password;'; // Utf8-encoded string
    //   // PROCESS
    //   const encodedWord = CryptoJS.enc.Utf8.parse(myString); // encodedWord Array object
    //   const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
    //   return encoded;
    // }
    // function decode() {
    //   // INIT
    //   const encoded =
    //     'T3duZXJfbmFtZTtjb250cm9sbGVyX0tleTtEZXZpY2VfbmFtZTtEZXZpY2VfTW9kZWw7Q3VzdG9tX1NTSUQ7Q3VzdG9tX1Bhc3N3b3JkO0RBUV9TVEFDVElDX0lQO0RBUV9TVEFDVElDX1BvcnQ7RGV2aWNlX0lQO0RldmljZV9Qb3J0O0RldmljZV9TU0lEO0RldmljZV9QYXNzd29yZDs='; // Base64 encoded string
    //   // PROCESS
    //   const encodedWord = CryptoJS.enc.Base64.parse(encoded); // encodedWord via Base64.parse()
    //   const decoded = CryptoJS.enc.Utf8.stringify(encodedWord); // decode encodedWord via Utf8.stringify()
    //   return decoded;
    // }

    // var key = 'abcdefghijklmnop'.split('').reverse('').join('');
    // let setstring = 'Hello am Sahique';
    // var ciph = 'e5d4b746b127a03a90bbdd67c75e90ef'
    //   .split('')
    //   .reverse('')
    //   .join('');
    // console.log(key);
    // console.log(ciph);
    // // var ciphertext = CryptoJS.AES.encrypt(setstring, key).toString();
    // // console.log('cipher text==>', ciphertext);
    // // Decrypt
    // var bytes = CryptoJS.AES.decrypt(ciph, key);
    // // console.log(bytes);
    // var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // console.log('deciphered original text====>', originalText);
    // e5d4b746b127a03a90bbdd67c75e90ef
    // "abcdefghijklmnop"
    // Hello am Sahique
  }

  function handlecheck() {
    if (selectloc.length == 0) {
      alert('Please enter location');
      return;
    }
    if (selectedappliance.length == 0) {
      alert('Please enter appliance');
      return;
    }
    if (selectedproperty.length == 0) {
      alert('Please enter property');
      return;
    }
    const findobj = mapped_data.find(x =>
      x.property.includes(selectedproperty.toString()),
    );
    console.log('findobj', findobj);
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
      if (data.toString()) {
        updatebinding(data.toString());
      }
      //HW,Swing,GPIO2,do,OUTPUT,0,0,0.00;
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

  function updatebinding(data) {
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE Binding_Reg SET status=? where (location=? AND  appliance=?);',
        [data, selectloc, selectedappliance],
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

  function micpress() {
    console.log('mic');
  }

  function range(start, end) {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  }

  sliderValueChange = async (value, items) => {
    //console.log('arrlen', arrlen);
    // console.log('tempo', tempo);
    // var result = range(1, arrlen);
    // //console.log('result', result);

    // const output = result.reduce((prev, curr) =>
    //   Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
    // );
    // //console.log(output);
    // var finalop = tempo[output - 1];
    // console.log('finalop', finalop);
    // setselectedvaildstate(finalop);
    console.log('-----------------------');
    var findobj = mapped_data.find(x => x.property.includes(items));

    console.log('findobj', findobj);

    var findvalidstate = findobj.validstate.split(',');

    console.log('value', value);
    console.log('items', items);
    let index = value * (findvalidstate.length - 1);
    console.log('index', index);

    console.log('findvalidstate', findvalidstate);
    var finalop = findvalidstate[index];
    console.log('finalop', finalop);
    let obj = {},
      cart = [],
      pref = [];

    obj.property = items;
    obj.validstate = finalop;

    // pref.push(obj);
    // console.log('pref', pref);
    // setpreffered(pref);

    let val = await AsyncStorage.getItem('tempo');

    console.log(val);

    let val_obj = JSON.parse(val);

    if (val_obj.length > 0) {
      var filtered = val_obj.filter(function (obj) {
        return obj.property !== items;
      });

      console.log('filter', filtered);

      filtered.push(obj);

      AsyncStorage.setItem('tempo', JSON.stringify(filtered));
    } else {
      console.log('obj', obj);
      val_obj.push(obj);
      // console.log('len', val_obj.length);
      AsyncStorage.setItem('tempo', JSON.stringify(val_obj));
    }

    let finalval = await AsyncStorage.getItem('tempo');

    console.log('final val', finalval);
    let finalval_obj = JSON.parse(finalval);
    setselectedvaildstate(finalval_obj);
  };

  // function handledefault(items) {
  //   console.log('----defaul-----');
  //   console.log(items);
  //   console.log(selectloc);
  //   console.log(selectedappliance);

  //   let sub;
  //   var s = '';
  //   var findobj;
  //   selectedvaildstate.forEach(element => {
  //     //  console.log('ele', element);
  //     console.log('===');
  //     findobj = mapped_data.find(x => x.property.includes(element.property));
  //     console.log('findobj', findobj);
  //     var validstate = findobj.validstate.toString().split(',');
  //     console.log('valid state===>', validstate);
  //     var output = findobj.output.toString().split(',');
  //     console.log('output===>', output);
  //     let index = validstate.indexOf(element.validstate);
  //     console.log('index', index);
  //     var findoutput = output[index];
  //     console.log('findoutput', findoutput);

  //     sub = findoutput + ';' + findobj.esp_pin + ';';

  //     s += sub;
  //   });

  //   console.log('s', s);
  //   // db.transaction(tx => {
  //   //   tx.executeSql(
  //   //     `UPDATE  Binding_Reg set default_values = ? where
  //   //     (location=? and appliance =? );`,
  //   //     [],
  //   //     (tx, results) => {
  //   //       console.log('Results', results.rowsAffected);
  //   //       if (results.rowsAffected > 0) {
  //   //         Alert.alert('preferred value set successfully');
  //   //       } else alert('Updation Failed');
  //   //     },
  //   //   );
  //   // });
  // }

  function handlerun(params) {
    if (selectloc.length == 0) {
      alert('Please enter location');
      return;
    }
    if (selectedappliance.length == 0) {
      alert('Please enter appliance');
      return;
    }
    var pins = '';
    mapped_data.forEach(element => {
      //console.log(element.esp_pin);
      pins += element.esp_pin + '!';
    });

    let runstr = mapped_data[0].macid + '/' + 'RUN' + '/' + pins;

    console.log('run string===>', runstr);

    let client = TcpSocket.createConnection(
      {port: mapped_data[0].portnumber, host: mapped_data[0].ipaddress},
      () => {
        client.write(runstr.toString());
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

  function handlestop() {
    if (selectloc.length == 0) {
      alert('Please enter location');
      return;
    }
    if (selectedappliance.length == 0) {
      alert('Please enter appliance');
      return;
    }
    var pins = '';
    mapped_data.forEach(element => {
      //console.log(element.esp_pin);
      pins += element.esp_pin + '!';
    });

    let stopstr = mapped_data[0].macid + '/' + 'STOP' + '/' + pins;

    console.log('stop string===>', stopstr);
    console.log(mapped_data[0].portnumber, mapped_data[0].ipaddress);
    let client = TcpSocket.createConnection(
      {port: mapped_data[0].portnumber, host: mapped_data[0].ipaddress},
      () => {
        client.write(stopstr.toString());
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
      <View style={styles.header}>
        <Text style={styles.text_header}>Control Now!</Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'orange',
          }}>
          <Button transparent onPress={() => handlesubmit()}>
            <Text style={{fontSize: 20, color: 'green'}}>SET</Text>
          </Button>
          <Button transparent onPress={() => handlerun()}>
            <Text style={{fontSize: 20, color: 'green'}}> RUN</Text>
          </Button>
          <Button transparent onPress={() => handlestop()}>
            <Text style={{fontSize: 20, color: 'red'}}>STOP</Text>
          </Button>
          <Button transparent onPress={() => handlecheck()}>
            <Text style={{fontSize: 20, color: 'white'}}>GET</Text>
            <Icon />
          </Button>
        </View>
        <Text style={styles.text_footer}>Enter Your Location </Text>
        <View>
          <MultiSelect
            items={selectedloc}
            single={true}
            uniqueKey="location"
            onSelectedItemsChange={selectedlocation}
            selectedItems={selectloc}
            selectText="Pick location"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={text => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="location"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#48d22b"
            submitButtonText="Submit"
          />
        </View>
        <Text style={styles.text_footer}>Enter Your Appliance </Text>
        <View>
          <MultiSelect
            items={selectappliance}
            single={true}
            uniqueKey="appliance"
            onSelectedItemsChange={appliance}
            selectedItems={selectedappliance}
            selectText="Pick Appliance"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={text => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="appliance"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#48d22b"
            submitButtonText="Submit"
          />
        </View>

        {/* <View>
          <MultiSelect
            items={selectproperty}
            single={true}
            uniqueKey="property"
            onSelectedItemsChange={property}
            selectedItems={selectedproperty}
            selectText="Pick Control"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={text => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="property"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#48d22b"
            submitButtonText="Submit"
          />
        </View> */}

        <ScrollView>
          {mapped_data.length > 0 ? (
            <>
              {mapped_data.map(items => {
                return (
                  <ScrollView key={items.id}>
                    <Text style={{fontWeight: 'bold'}}>{items.property}</Text>
                    <Slider
                      key={items.id}
                      style={{width: '100%', height: 40}}
                      step={1 / (items.validstate.split(',').length - 1)}
                      minimumValue={0}
                      maximumValue={1}
                      //arrlen = len of array of states for this control
                      //min val = o ,max val =1 ,step = (max-min)/(arrlen-1)
                      //index = (slidervalue * (arrlen-1)) === round to integer
                      onValueChange={value => {
                        sliderValueChange(value, items.property);
                      }}
                      thumbTintColor="rgb(252, 228, 149)"
                      maximumTrackTintColor="#d3d3d3"
                      minimumTrackTintColor="rgb(252, 228, 149)"
                    />
                    {/* <Button
                      transparent
                      onPress={() => handledefault(selectedvaildstate)}>
                      <Icon
                        name="settings"
                        type="Feather"
                        style={{fontSize: 30, color: 'blue'}}
                      />
                    </Button> */}
                    <View style={styles.textCon}>
                      {items.x.map(shop => {
                        return (
                          <Text key={shop} style={styles.colorGrey}>
                            {shop}
                          </Text>
                        );
                      })}
                    </View>
                  </ScrollView>
                );
              })}
            </>
          ) : (
            <></>
          )}
          {/* <Slider
            style={{width: '100%', height: 40}}
            step={1 / (arrlen - 1)}
            minimumValue={0}
            maximumValue={1}
            //arrlen = len of array of states for this control
            //min val = o ,max val =1 ,step = (max-min)/(arrlen-1)
            //index = (slidervalue * (arrlen-1)) === round to integer
            onValueChange={value => {
              sliderValueChange(value);
            }}
            thumbTintColor="rgb(252, 228, 149)"
            maximumTrackTintColor="#d3d3d3"
            minimumTrackTintColor="rgb(252, 228, 149)"
          /> */}
          {selectedvaildstate.length > 0 ? (
            <>
              {selectedvaildstate.map(items => {
                return (
                  <View key={items.property} style={styles.textCon}>
                    <Text key={items.property} style={styles.colorGrey}>
                      property {items.property}
                    </Text>
                    <Text style={styles.colorGrey}>
                      setting {items.validstate}
                    </Text>
                  </View>
                );
              })}
            </>
          ) : (
            <></>
          )}

          {/* {tempo.length > 0 ? (
              <>
                {tempo.map(shop => {
                  return (
                    <Text key={shop} style={styles.colorGrey}>
                      {shop}
                    </Text>
                  );
                })}
              </>
            ) : (
              <></>
            )} */}
          {/* <Text>{minval}</Text>
            <Text style={styles.colorYellow}>{selectedvaildstate}</Text>
            <Text style={styles.colorGrey}>{maxval} </Text> */}

          {/* <MultiSelect
            items={selectvaildstate}
            single={true}
            uniqueKey="valid_state"
            onSelectedItemsChange={validstates}
            selectedItems={selectedvaildstate}
            selectText="Pick Setting"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={text => console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="valid_state"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#48d22b"
            submitButtonText="Submit"
          /> */}
        </ScrollView>
        <View style={styles.action}>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            placeholderTextColor="#05375a"
            placeholder="your current value"
            defaultValue={get}
          />
        </View>
      </Animatable.View>
      <Fab
        style={{backgroundColor: '#05375a'}}
        position="topRight"
        onPress={() => startRecognizing()}>
        <Icon name="mic" />
      </Fab>
    </View>
  );
};

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
  textCon: {
    width: 320,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorGrey: {
    color: 'black',
  },
  colorYellow: {
    color: 'rgb(252, 228, 149)',
  },
});
export default FirstPage;

//increase = move slide up by 1 unit within limit
//decrease = move slide down by 1 unit within limit
//set = set in UI
//reset = set to default values of all parameter of that device
//make ,turn, move =====>   set in UI
//start = set active to 1
//stop == set active to  0
//open = set prop val to ON
//close = set prop val to off

//in  prop val

//up,right means increase slider value by 1
//down,left = decrease slider value by 1

///action

// if device is out directly set

//  if device is input whatever config we give set the parameter

//  instead of set run
