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
const Pairing = ({navigation}) => {
  const [asyncloc, setasyncloc] = useState([]);
  const [asyncapp, setasyncapp] = useState([]);
  const [asyncmodel, setasyncmodel] = useState([]);
  const [location, setlocation] = useState([]);
  const [owner, setowner] = useState([]);
  const [appliance, setappliance] = useState([]);
  const [asyncbind, setasyncbind] = useState([]);
  const [model, setmodel] = useState([]);
  const [ipaddress, setipaddress] = useState('');
  const [macid, setmacid] = useState('');
  const [portnumber, setportnumber] = useState('');
  const [showModal, setShowModal] = useState(false);

  const locations = selectedItems => {
    setlocation(selectedItems);
    console.log(selectedItems);
  };
  const appliances = selectedItems => {
    setappliance(selectedItems);
    console.log(selectedItems);
  };

  const models = selectedItems => {
    console.log(selectedItems);
    setmodel(selectedItems);
    console.log(selectedItems);
  };
  useFocusEffect(
    React.useCallback(() => {
      retrieveData();
    }, [retrieveData]),
  );

  const retrieveData = async () => {
    try {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Owner_Reg', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));

          let ownerdata_obj = temp;
          console.log(ownerdata_obj[0].owner_name);
          setowner(ownerdata_obj[0]);
        });
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Location_Reg', [], (tx, results) => {
          var temp = [];
          for (let j = 0; j < results.rows.length; ++j)
            temp.push(results.rows.item(j));
          setasyncloc(temp);
        });
      });
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Appliance_Reg where binded_unbinded =?',
          ['unbinded'],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            setasyncapp(temp);
          },
        );
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Binding_Reg', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setasyncbind(temp);
        });
      });
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM models_list', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            //   let modifiedmodels =
            //     results.rows.item(i).manufacturer +
            //     '-' +
            //     results.rows.item(i).Device_Type +
            //     '-' +
            //     results.rows.item(i).Model;

            //   temp.push({modifiedmodels});

            temp.push(results.rows.item(i));
          setasyncmodel(temp);
        });
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  function handlepairing(item) {
    console.log('----------------');
    console.log('data from user for pairing', item);
    if (item.paired_unpaired == 'paired') {
      let unpairingstring =
        item.macid +
        '/' +
        'UNPAIR' +
        '/' +
        owner.owner_name +
        '_' +
        owner.Door_Number +
        '_' +
        owner.Property_name +
        '_' +
        owner.Area +
        '_' +
        owner.Street +
        '_' +
        owner.State +
        '_' +
        owner.pincode +
        ';' +
        item.location +
        ';' +
        item.appliance +
        ';' +
        item.model +
        //';' +
        // item.properties +
        // ';' +
        // item.Control_type +
        // ';' +
        // item.Valid_States +
        // ';' +
        // item.output +
        // ';' +
        // item.ACS_controller_model +
        // ';' +
        // item.ESP_pin +
        ';' +
        '#';
      console.log(unpairingstring);

      let client = TcpSocket.createConnection(
        {port: item.portnumber, host: item.ipaddress},
        () => {
          client.write(unpairingstring.toString());
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
          unpairing(item, ack);
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
    } else {
      //! String property type ="HW" // or "SW
      //!     String property_name="speed";
      //!    String pin="Gpio0";// if software, function to which this property applies
      //!     String pintype = "do"; // di for digital input, ai for analog input, ao for analog output, similarly uart_tx, uart_rx,etc
      //!     String direction="output";
      //!     int period_ms=1000;
      //!     int on_width_ms=100
      //!     float level =1.0;
      //!     int period_counter=0;
      //!     int on_counter=0;

      //?  item.properties==>Speed;Swing
      var property = item.properties.toString().split(';');
      console.log('property===>', property);
      //!     property===>  ["Speed" , "Swing"]

      //?  item.Valid_States==> off,low,medium,high;on,off
      var validstate = item.Valid_States.toString().split(';');
      console.log('valid state===>', validstate);
      //!    valid state===>["off,low,medium,high"  ,  "on,off"]

      //?  item.output==>   0-0,600-150,600-250,600-350;0-1,0-0
      var output = item.output.toString().split(';');
      console.log('output===>', output);
      //!    output===>["0-0,600-150,600-250,600-350"  ,  "0-1,0-0"]

      //?  item.ESP_pin==>GPIO0;GPIO2
      var espin = item.ESP_pin.toString().split(';');
      console.log('espin===>', espin);
      //!    espin===>["GPIO0"  ,  "GPIO2"]

      //?  item.Control_type==>do;do
      var controlfunction = item.Control_function.toString().split(';');
      console.log('control function===>', controlfunction);
      //!   control type===>["do"  ,  "do"]

      let default_hw_pin = [];
      let default_hw = '';
      let default_output = '';
      let default_output_val = [];

      controlfunction.forEach(element => {
        let find = element.toLowerCase().includes('sw');

        if (find == false) {
          default_hw = 'HW';
        } else if (find == true) {
          default_hw = 'SW';
        }

        default_hw_pin.push(default_hw);
      });

      console.log(default_hw_pin);
      //!  default_hw_pin====> ["hw","hw"]

      let submapping = property.map((property, i) => ({
        default_hw_pin: default_hw_pin[i],
        property,
        esp_pin: espin[i],
        controlfunction: controlfunction[i],
        //  validstate: validstate[i],
        output: output[i],
      }));
      //! submapping====>[{"property":"Speed" , "default_hw_pin": "hw" ,"esp_pin":  "GPIO0","controltype" :"do","output":"0-0,600-150,600-250,600-350" } ,
      //!    {"property":"Swing" , "default_hw_pin": "hw" ,"esp_pin":  "GPIO2","controltype" :"do","output":"0-1,0-0"}]
      console.log('sub mapped data', submapping);

      submapping.forEach(res => {
        default_output = res.output.split(',');
        //! default_output  ["0-0","600-150","600-250","600-350"]
        // console.log(default_output);
        // console.log('default output vals', default_output[0]);
        default_output_val.push(default_output[0]);
        // default_output.forEach(element => {
        //   console.log('ele', element);
        // });
      });
      // console.log(default_output_val);
      let finalmap = property.map((property, i) => ({
        default_hw_pin: default_hw_pin[i],
        property,
        esp_pin: espin[i],
        controlfunction: controlfunction[i],
        default_output_val: default_output_val[i],
      }));

      console.log('final data map===>', finalmap);

      let subpair = '';

      finalmap.forEach(final => {
        console.log(final);
        subpair =
          subpair +
          final.default_hw_pin +
          ',' +
          final.property +
          ',' +
          final.esp_pin +
          ',' +
          final.controlfunction +
          ',' +
          final.default_output_val +
          ';';
      });
      console.log(subpair);

      let pairingstring =
        item.macid +
        '/' +
        'PAIR' +
        '/' +
        owner.owner_name +
        // '_' +
        // owner.Door_Number +
        // '_' +
        // owner.Property_name +
        // '_' +
        // owner.Street +
        // '_' +
        // owner.Area +
        // '_' +
        // owner.State +
        // '_' +
        // owner.pincode +
        ';' +
        item.location +
        ';' +
        item.appliance +
        ';' +
        item.model +
        '/' +
        subpair +
        '/' +
        item.ipaddress +
        ';' +
        item.portnumber +
        ';' +
        item.macid +
        ';' +
        '#';
      ///PAIR STRING:"PAIR/Sahqiue;hall;fan1;Havells_Ceilingfan_Fusion/HW,speed,Gpio0,do,800-100;HW,swing,Gpio2,do,0-0/192.168.1.1;70;24:62:AB:F2:8D:5C;#"

      console.log(pairingstring);

      let client = TcpSocket.createConnection(
        {port: 80, host: '192.168.4.1'},
        () => {
          client.write(pairingstring.toString());
        },
      );
      client.on('connect', () => {
        console.log('Opened client on ' + JSON.stringify(client.address()));
      });
      client.on('data', data => {
        console.log('message was received from ESP32 ==>', data.toString());
        //! ack:success;macid#
        //["ack","success","macid"]
        let ack = data
          .toString()
          .replace(':', ',')
          .replace(';', ',')
          .replace('#', '')
          .split(',');
        console.log(ack);
        if (ack[1] == 'success') {
          pairing(item, ack);
        }
        // 24:62:AB:F2:8D:5C/SET/PANSHUL;24:62:AB:F2:8D:5C/0-1;Gpio2
        // 24:62:AB:F2:8D:5C/SET/PANSHUL;24:62:AB:F2:8D:5C/0-1;GPIO2;#
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
  }

  function unpairing(item, ack) {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE  Binding_Reg set paired_unpaired=?, macid=?,color =? where
        (location=? and appliance =? and model =?);`,
        ['unpaired', null, 'grey', item.location, item.appliance, item.model],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'unpairing',
            });
          } else alert('Updation Failed');
        },
      );
    });
  }

  function pairing(item, ack) {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE  Binding_Reg set paired_unpaired=?, macid=?,color =? where
        (location=? and appliance =? and model =?);`,
        ['paired', ack[2], 'green', item.location, item.appliance, item.model],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'pairing',
            });
          } else alert('Updation Failed');
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
      <FlatList
        keyExtractor={(item, id) => id}
        data={asyncbind}
        renderItem={({item}) => (
          <View>
            <Text
              adjustsFontSizeToFit
              numberOfLines={6}
              style={{
                textAlignVertical: 'center',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0)',
                color: 'black',
                fontWeight: 'bold',
              }}>
              {item.location} - {item.appliance}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={6}
              style={{
                textAlignVertical: 'center',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0)',
                color: 'black',
                fontWeight: 'bold',
              }}>
              {item.macid} - {item.ipaddress} - {item.portnumber}
            </Text>

            <Button transparent onPress={() => handlepairing(item)}>
              <Icon name="wifi" style={{fontSize: 30, color: item.color}} />
            </Button>
          </View>
        )}
        ItemSeparatorComponent={() => {
          return <View style={styles.separatorLine}></View>;
        }}
      />
    </View>
  );
};

export default Pairing;

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
