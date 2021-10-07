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
const Binding = ({navigation}) => {
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
  const [showmodal, setshowmodal] = useState(false);
  const [editmodal, seteditmodal] = useState(false);
  const [selectedloc, setselectedloc] = useState('');
  const [selectedappliance, setselectedappliance] = useState('');
  const [selectedmodel, setselectedmodel] = useState('');
  const [asyncapp1, setasyncapp1] = useState([]);
  const [ssid, setssid] = useState('');
  const [pwd, setpwd] = useState('');

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
        tx.executeSql('SELECT * FROM Appliance_Reg ', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setasyncapp1(temp);
        });
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

  const handledeletePress = () => {
    console.log(
      'chosen item to delete',
      selectedloc,
      selectedappliance,
      selectedmodel,
    );

    function deletebinding(selectedloc, selectedappliance, selectedmodel) {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM  Binding_Reg where location=? and appliance =? and model =?',
          [selectedloc, selectedappliance, selectedmodel],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              navigation.navigate('DummyScreen', {
                paramKey: 'Binding_delete',
              });
            }
          },
          (tx, error) => {
            console.log('error', error);
          },
        );
      });
      db.transaction(function (tx) {
        console.log('----------------');
        tx.executeSql(
          `UPDATE Appliance_Reg SET binded_unbinded=? where Appliance=?;`,
          ['unbinded', selectedappliance],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              console.log('updated');
            }
          },
          (tx, error) => {
            console.log(error);
          },
        );
      });
    }
    Alert.alert(
      'Are you sure ',
      ' you want  to delete',
      [
        {
          text: 'Ok',
          onPress: () =>
            deletebinding(selectedloc, selectedappliance, selectedmodel),
        },
        {
          text: 'cancel',
          onPress: () => console.log('cancel pressed'),
        },
      ],
      {cancelable: true},
    );
  };

  const handleSubmitPress = async () => {
    let selectedmodel = '';
    if (location.length == 0) {
      alert('Please enter location');
      return;
    }
    if (appliance.length == 0) {
      alert('Please enter appliance');
      return;
    }
    if (model.length == 0) {
      alert('Please enter model');
      return;
    }
    if (!ipaddress) {
      alert('Please enter ipaddress');
      return;
    }
    if (!portnumber) {
      alert('Please enter portnumber');
      return;
    }
    if (!macid) {
      alert('Please enter macid');
      return;
    }

    // let binding = owner.toString() + '_' + location + '_' + appliance;
    // console.log('binding', binding.toString());
    console.log(location.toString(), appliance.toString(), model.toString());
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM models_list where Model =?`,
        [model.toString()],
        (tx, results) => {
          var len = results.rows.length;
          if (len > 0) {
            let res = results.rows.item(0);
            selectedmodel = res;
          }
          // console.log('len', len);
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Binding_Reg where
        (location=? and appliance =? and model =?)`,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString(),
        ],
        (tx, results) => {
          var len = results.rows.length;

          if (len == 0) {
            storebinding(
              selectedmodel,
              location.toString().toUpperCase(),
              appliance.toString().toUpperCase(),
              model.toString(),
              ipaddress,
              portnumber,
              macid.toUpperCase(),
            );
          } else {
            let res = results.rows.item(0);
            // console.log(res);
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding_samedata',
            });
          }
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  };

  function storebinding(
    selectedmodel,
    location,
    appliance,
    model,
    ipaddress,
    portnumber,
    macid,
  ) {
    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Binding_Reg (location,appliance,model,paired_unpaired,
        color,properties ,Control_function, pin_direction,Valid_States,output,ACS_controller_model,ESP_pin,ipaddress,portnumber,macid)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);  `,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString(),
          'unpaired',
          'grey',
          selectedmodel.Properties,
          selectedmodel.Control_function,
          selectedmodel.pin_direction,
          selectedmodel.Valid_States,
          selectedmodel.output,
          selectedmodel.ACS_controller_model,
          selectedmodel.ESP_pin,
          ipaddress,
          portnumber,
          macid,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding',
            });
          }
        },
        (tx, error) => {
          console.log(error);
          navigation.navigate('DummyScreen', {
            paramKey: 'Binding_samedata',
          });
        },
      );
    });

    db.transaction(function (tx) {
      console.log('----------------');
      tx.executeSql(
        `UPDATE Appliance_Reg SET binded_unbinded=? where Appliance=?;`,
        ['binded', appliance.toString().toUpperCase()],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            // navigation.navigate('DummyScreen', {
            //   paramKey: 'Binding',
            // });
            console.log('updated');
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

  function handlepairing(item) {
    console.log('----------------');
    console.log('data from user for pairing', item);
    if (item.paired_unpaired == 'paired') {
      let unpairingstring =
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
      var controltype = item.Control_type.toString().split(';');
      console.log('control type===>', controltype);
      //!   control type===>["do"  ,  "do"]

      let default_hw_pin = [];
      let default_hw = '';
      let default_output = '';
      let default_output_val = [];

      controltype.forEach(element => {
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
        controltype: controltype[i],
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
        controltype: controltype[i],
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
          final.controltype +
          ',' +
          final.default_output_val +
          ';';
      });
      console.log(subpair);

      let pairingstring =
        'PAIR' +
        '/' +
        owner.owner_name +
        '_' +
        owner.Door_Number +
        '_' +
        owner.Property_name +
        '_' +
        owner.Street +
        '_' +
        owner.Area +
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
          // pairing(item, ack);
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
  async function handlerefresh() {
    let url = 'http://homeautomation.sowcare.net/data';
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('response from webservice ===>', data);
        db.transaction(function (tx) {
          tx.executeSql(
            `DELETE FROM models_list;`,
            [],
            (tx, results) => {
              console.log('Results', results.rowsAffected);

              if (results.rowsAffected > 0) {
                console.log('successfully Deleted ');
              }
            },
            (tx, error) => {
              console.log('error while Deleting models', error);
            },
          );
        });
        data.forEach(function (a, index) {
          //  console.log('a', a['Device Type']);
          //console.log(asyncbind.length);
          // let temp = [];
          // temp.push(a);
          //console.log(temp);
          storemodels(a);
        });
      })
      .catch(error => {
        console.error('error in webservice====>', error);
      });
  }
  function storemodels(info) {
    console.log('-----------------------');
    // console.log('info', info.Model);
    // console.log('info', info.Properties);
    // console.log('info', info.Contol_type);
    // console.log('info', info['Valid States']);
    // console.log('info', info.output);
    // console.log('info', info.ACS_controller_model);
    // console.log('info', info.ESP_pin);
    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO  models_list (
        Model ,Properties ,Control_function ,pin_direction,
              Valid_States ,output ,ACS_controller_model ,ESP_pin, idle_values, default_values) VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [
          info.Model,
          info.Properties,
          info.Contol_function,
          info.pin_direction,
          info.Valid_States,
          info.output,
          info.ACS_controller_model,
          info.ESP_pin,
          info.ideal_Values,
          info.default_values,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding',
            });
          }
        },
        (tx, error) => {
          console.log('error while storing models', error);
        },
      );
    });
  }

  function handleeditPress() {
    let selectedmodel = '';
    console.log(
      location.length,
      appliance.length,
      model.length,
      ipaddress.length,
      portnumber.length,
      macid.length,
    );
    if (location.length == 0) {
      alert('Please enter location');
      return;
    }
    if (appliance.length == 0) {
      alert('Please enter appliance');
      return;
    }
    if (model.length == 0) {
      alert('Please enter model');
      return;
    }
    if (ipaddress.length < 13) {
      alert('Please enter ipaddress');
      return;
    }
    if (portnumber.length < 2) {
      alert('Please enter portnumber');
      return;
    }
    if (macid.length < 17) {
      alert('Please enter macid');
      return;
    }
    if (ssid.length == 0) {
      alert('Please enter ssid');
      return;
    }
    if (pwd.length == 0) {
      alert('Please enter pwd');
      return;
    }

    //console.log(location, appliance, model, ipaddress, portnumber, macid);

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM models_list where Model =?`,
        [model.toString()],
        (tx, results) => {
          var len = results.rows.length;
          if (len > 0) {
            let res = results.rows.item(0);
            selectedmodel = res;
          }
          // console.log('len', len);
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Binding_Reg where
        (location=? and appliance =? and model =?)`,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString().toUpperCase(),
        ],
        (tx, results) => {
          var len = results.rows.length;

          if (len == 0) {
            storebindings(
              selectedmodel,
              location.toString().toUpperCase(),
              appliance.toString().toUpperCase(),
              model.toString().toUpperCase(),
              ipaddress,
              portnumber,
              ssid,
              pwd,
              macid.toUpperCase(),
            );
          } else {
            let res = results.rows.item(0);
            // console.log(res);
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding_samedata',
            });
          }
        },
        (tx, error) => {
          console.log('error', error);
        },
      );
    });
  }

  function storebindings(
    selectedmodel,
    location,
    appliance,
    model,
    ipaddress,
    portnumber,
    ssid,
    pwd,
    macid,
  ) {
    db.transaction(function (tx) {
      tx.executeSql(
        `UPDATE Binding_Reg SET location=?,appliance=?,model=?,
        properties=?,Control_function=?,pin_direction=?,Valid_States=?,output=?,ACS_controller_model=?,ESP_pin=?,ipaddress=?,portnumber=?,
        wifi_ssid=?,wifi_pwd =?,   macid=? ,idle_Values =? , default_values =?
        where  (location=? and appliance =? and model =?);`,
        [
          location.toString().toUpperCase(),
          appliance.toString().toUpperCase(),
          model.toString().toUpperCase(),
          selectedmodel.Properties,
          selectedmodel.Control_function,
          selectedmodel.pin_direction,
          selectedmodel.Valid_States,
          selectedmodel.output,
          selectedmodel.ACS_controller_model,
          selectedmodel.ESP_pin,
          ipaddress,
          portnumber,
          ssid,
          pwd,
          macid,
          selectedmodel.idle_Values,
          selectedmodel.default_values,
          selectedloc,
          selectedappliance,
          selectedmodel,
        ],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'Binding',
            });
          }
        },
        (tx, error) => {
          console.log(error);
          navigation.navigate('DummyScreen', {
            paramKey: 'Binding_samedata',
          });
        },
      );
    });

    db.transaction(function (tx) {
      console.log('----------------');
      tx.executeSql(
        `UPDATE Appliance_Reg SET binded_unbinded=? where Appliance=?;`,
        ['binded', appliance.toString().toUpperCase()],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            // navigation.navigate('DummyScreen', {
            //   paramKey: 'Binding',
            // });
            console.log('updated');
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
    <>
      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'orange',
        }}>
        <Button
          transparent
          onPress={() => {
            seteditmodal(!editmodal);
          }}>
          <Icon
            name="edit"
            type="Feather"
            style={{fontSize: 30, color: 'blue'}}
          />
        </Button>
        <Button
          transparent
          // onPress={() => {
          //   seteditmodal(!editmodal);
          //   setselectedloc(item.Location);
          // }}
        >
          <Icon
            name="camera"
            type="Feather"
            style={{fontSize: 30, color: 'green'}}
          />
        </Button>
        <Button transparent onPress={() => handledeletePress()}>
          <Icon name="trash" style={{fontSize: 30, color: 'red'}} />
        </Button>
      </View>
      <View
        style={{
          flex: 10,
          marginTop: 10,
          marginBottom: 65,
          marginLeft: 10,
          marginRight: 10,
          margin: 10,
        }}>
        <TouchableOpacity style={styles.button} onPress={() => handlerefresh()}>
          <Text
            style={[
              styles.textSign,
              {
                color: '#fff',
              },
            ]}>
            Set
          </Text>
        </TouchableOpacity>
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
            <Text style={styles.text_footer}>Enter Your Location </Text>
            <View>
              <MultiSelect
                items={asyncloc}
                uniqueKey="Location"
                onSelectedItemsChange={locations}
                selectedItems={location}
                single={true}
                selectText="Pick Locations"
                searchInputPlaceholderText="Search Locations..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Location"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            <Text style={styles.text_footer}>Enter Your Appliance </Text>
            <View>
              <MultiSelect
                items={asyncapp}
                uniqueKey="Appliance"
                onSelectedItemsChange={appliances}
                selectedItems={appliance}
                single={true}
                selectText="Pick Appliances"
                searchInputPlaceholderText="Search Appliances..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Appliance"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            <Text style={styles.text_footer}>Enter Your Model </Text>
            <View>
              <MultiSelect
                items={asyncmodel}
                uniqueKey="Model"
                onSelectedItemsChange={models}
                selectedItems={model}
                single={true}
                selectText="Pick Models"
                searchInputPlaceholderText="Search Models..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Model"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            {/*
             *MASK 9==> NUMERIC ,S==>ALPHANUMERIC ,A===>ALPHABET
             */}

            <Text style={styles.text_footer}> MAC Id </Text>
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
            <Text style={styles.text_footer}> IP Address </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                keyboardType="numeric"
                placeholder=" Enter IP Address Ex:-129.144.5.5"
                mask="999.999.9.9"
                onChangeText={(text, rawText) => {
                  setipaddress(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> Port Number </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                keyboardType="numeric"
                placeholder=" Enter Port Number Ex: 60"
                mask="99"
                onChangeText={(text, rawText) => {
                  setportnumber(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> SSID </Text>
            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter SSID"
                onChangeText={ssid => setssid(ssid)}
              />
            </View>
            <Text style={styles.text_footer}> PASSWORD</Text>
            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter PASSWORD"
                onChangeText={pwd => setpwd(pwd)}
              />
            </View>
            <Button style={styles.button} onPress={() => handleSubmitPress()}>
              <Text>Save Binding</Text>
            </Button>
          </View>
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={editmodal}
          onRequestClose={() => {
            console.log('Modal has been closed.');
          }}>
          <View style={styles.modal}>
            <Button
              transparent
              onPress={() => {
                seteditmodal(!editmodal);
              }}>
              <Icon name="close" style={{fontSize: 30, color: '#05375a'}} />
            </Button>

            <Text style={styles.text_footer}>{selectedloc}</Text>

            <Text style={styles.text_footer}>{selectedappliance} </Text>

            <Text style={styles.text_footer}>{selectedmodel} </Text>
            <Text style={styles.text_footer}> Location </Text>
            <View>
              <MultiSelect
                items={asyncloc}
                uniqueKey="Location"
                onSelectedItemsChange={locations}
                selectedItems={location}
                single={true}
                selectText="Pick Locations"
                searchInputPlaceholderText="Search Locations..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Location"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            <Text style={styles.text_footer}> Appliance </Text>
            <View>
              <MultiSelect
                items={asyncapp}
                uniqueKey="Appliance"
                onSelectedItemsChange={appliances}
                selectedItems={appliance}
                single={true}
                selectText="Pick Appliances"
                searchInputPlaceholderText="Search Appliances..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Appliance"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            <Text style={styles.text_footer}> Model </Text>
            <View>
              <MultiSelect
                items={asyncmodel}
                uniqueKey="Model"
                onSelectedItemsChange={models}
                selectedItems={model}
                single={true}
                selectText="Pick Models"
                searchInputPlaceholderText="Search Models..."
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="Model"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#48d22b"
                submitButtonText="Submit"
              />
            </View>
            {/*
             *MASK 9==> NUMERIC ,S==>ALPHANUMERIC ,A===>ALPHABET
             */}

            <Text style={styles.text_footer}> MAC Id </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                autoCapitalize="words"
                placeholder="  Enter MAC ID  Ex:-B4:E6:2D:8D:73:C1 "
                mask="SS:SS:SS:SS:SS:SS"
                defaultValue={macid}
                onChangeText={(text, rawText) => {
                  setmacid(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> IP Address </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter IP Address Ex:-129.144.50.56 "
                mask="999.999.99.99"
                defaultValue={ipaddress}
                onChangeText={(text, rawText) => {
                  setipaddress(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Text style={styles.text_footer}> Port Number </Text>
            <View style={styles.action}>
              <MaskedTextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter Port Number Ex: 60"
                mask="99"
                defaultValue={portnumber}
                onChangeText={(text, rawText) => {
                  setportnumber(text);
                  // console.log(rawText);
                }}
              />
            </View>
            <Button style={styles.button} onPress={() => handleeditPress()}>
              <Text>Edit Binding</Text>
            </Button>
          </View>
        </Modal>
        {/* <Button style={styles.button} onPress={() => handlerefresh()}>
          <Text>Register App</Text>
        </Button> */}
        <View>
          <Text style={styles.text_footer}>{selectedloc}</Text>
          <Text style={styles.text_footer}>{selectedappliance}</Text>
          <Text style={styles.text_footer}>{selectedmodel}</Text>
        </View>

        <FlatList
          keyExtractor={(item, id) => id}
          data={asyncbind}
          renderItem={({item}) => (
            <View>
              <Button
                style={{alignSelf: 'center'}}
                onPress={() => {
                  setselectedloc(item.location);
                  setselectedappliance(item.appliance);
                  setselectedmodel(item.model);
                  setmacid(item.macid);
                  setportnumber(item.portnumber);
                  setipaddress(item.ipaddress);
                }}>
                <Text>
                  {item.location} -- {item.appliance}
                  {'\n'}
                  {item.model}
                </Text>
              </Button>
            </View>
          )}
          ItemSeparatorComponent={() => {
            return <View style={styles.separatorLine}></View>;
          }}
        />
      </View>
      <View>
        <Fab
          style={{backgroundColor: '#05375a'}}
          position="bottomRight"
          onPress={() => {
            setshowmodal(!showmodal);
          }}>
          <Icon name="add-outline" />
        </Fab>
      </View>
    </>
  );
};

export default Binding;

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
/////_eventHandlers

// <View
//   style={{
//     flex: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   }}>
{
  /* <Button
                  onPress={() => handlepairing(item)}
                  style={{
                    backgroundColor: item.color,
                    width: '18%',
                    height: 45,
                  }}>
                  <Icon name="wifi" active />
                </Button> */
}

{
  /* <Button
                  transparent
                  onPress={() => {
                    seteditmodal(!editmodal);
                    setselectedloc(item.location);
                    setselectedappliance(item.appliance);
                    setselectedmodel(item.model);
                    setmacid(item.macid);
                    setportnumber(item.portnumber);
                    setipaddress(item.ipaddress);
                  }}>
                  <Icon
                    name="edit"
                    type="Feather"
                    style={{fontSize: 30, color: 'blue'}}
                  />
                </Button>
                <Button transparent onPress={() => handledeletePress(item)}>
                  <Icon name="trash" style={{fontSize: 30, color: 'red'}} />
                </Button>
              </View> */
}

/////
