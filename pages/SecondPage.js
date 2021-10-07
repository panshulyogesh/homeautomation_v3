import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import DialogInput from 'react-native-dialog-input';
import {useFocusEffect} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

const SecondPage = ({navigation}) => {
  const [ownerpwd, setownerpwd] = useState('');
  const [isDialogVisible, setisDialogVisible] = useState(false);
  const [view, setview] = useState(false);
  const [view1, setview1] = useState(false);
  const [view2, setview2] = useState(false);
  const [view3, setview3] = useState(false);
  const [ownerlen, setownerlen] = useState('');
  const [loclen, setloclen] = useState('');
  const [applen, setapplen] = useState('');

  function close(isShow) {
    setisDialogVisible(isShow);

    navigation.navigate('FirstPage');
  }

  // const check_password = async pass => {
  //   // const async_data_owner = await AsyncStorage.getItem('user_config');

  //   db.transaction(tx => {
  //     tx.executeSql('SELECT * FROM Owner_Reg', [], (tx, results) => {
  //       var temp = [];
  //       for (let i = 0; i < results.rows.length; ++i)
  //         temp.push(results.rows.item(i));
  //       //let items = JSON.stringify(temp);
  //       let ownerdata_obj = temp;
  //       console.log('inside db', ownerdata_obj[0].owner_password);
  //       setownerpwd(ownerdata_obj[0].owner_password);
  //       // setowner(ownerdata_obj[0].owner_password);
  //     });
  //   });

  //   var result = '';
  //   if (ownerpwd) {
  //     if (pass == ownerpwd) {
  //       result = 'valid';
  //     } else {
  //       result = 'invalid';
  //     }
  //     return result;
  //   }
  // };
  const sendInput = async (inputText, close) => {
    console.log('password ' + inputText);

    // db.transaction(tx => {
    //   tx.executeSql('SELECT * FROM Owner_Reg', [], (tx, results) => {
    //     var temp = [];
    //     for (let i = 0; i < results.rows.length; ++i)
    //       temp.push(results.rows.item(i));
    //     let ownerdata_obj = temp;
    //     console.log('inside db', ownerdata_obj[0].owner_password);
    //     setownerpwd(ownerdata_obj[0].owner_password);
    //   });
    // });
    console.log('ownerpwd', ownerpwd.owner_password);
    if (ownerpwd.owner_password) {
      if (inputText == ownerpwd.owner_password) {
        AsyncStorage.setItem('pwdstatus', JSON.stringify(true));
        setisDialogVisible(close);
      } else {
        Alert.alert(
          'Incorrect Credentials',
          'Enter valid password',
          [
            {
              text: 'Ok',

              onPress: () => setisDialogVisible(true),
            },
          ],
          {cancelable: false},
        );
      }
    }
  };

  const retrieve = async () => {
    const read = await AsyncStorage.getItem('pwdstatus');

    if (read == 'false') {
      setisDialogVisible(true);
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Owner_Reg',
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          let items = JSON.stringify(temp);
          console.log(items);
          let ownerdata_obj = temp;
          setownerpwd(ownerdata_obj[0]);
          // console.log(items);
          console.log('owner length', items.length);
          // setownerlen(items.length);

          if (items.length == 2) {
            setview(true);
            //owner is n0t registered
          } else {
            setview(false);
            setview1(true);
            //owner is registered show location
          }
        },
        (tx, error) => {
          console.log(error);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM location_reg', [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i)
          temp.push(results.rows.item(i));
        let items = JSON.stringify(temp);
        console.log(items);
        console.log('loc length', items.length);
        //setloclen(items.length);
        if (items.length > 2) {
          setview(false);
          setview1(false);
          setview2(true);
          //location  exists
        }
      });
    });
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM appliance_reg', [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i)
          temp.push(results.rows.item(i));
        let items = JSON.stringify(temp);
        console.log(items);
        console.log('appliance len', items.length);

        if (items.length > 2) {
          setview(false);
          setview1(false);
          setview2(false);
          setview3(true);
          //appliance exists
        }
      });
    });
  };
  // function update() {
  //   console.log('lengths', ownerlen, loclen, applen);
  //   if (ownerlen == 2) {
  //     setview(true);
  //   } else {
  //     if (ownerlen > 2) {
  //       setview(false);
  //       setview1(true);
  //       if (loclen > 2) {
  //         setview2(true);
  //         setview1(false);
  //         setview(false);
  //         if (applen > 2) {
  //           setview3(true);
  //           setview2(false);
  //           setview1(false);
  //           setview(false);
  //         }
  //       }
  //     }
  //   }
  // }
  useFocusEffect(
    React.useCallback(() => {
      retrieve();
    }, []),
  );

  if (view) {
    return (
      <View style={styles.container}>
        <Text>register owner</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OwnerRegistration')}>
          <Text>Add Owner</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (view1) {
    return (
      <View style={styles.container}>
        <Text>Register Location</Text>
        <DialogInput
          isDialogVisible={isDialogVisible}
          title={'VERIFICATION'}
          message={'Enter Password'}
          submitInput={inputText => {
            sendInput(inputText, false);
          }}
          closeDialog={() => {
            close(false);
          }}></DialogInput>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ModifyOwner')}>
          <Text>Modify Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LocationRegistration')}>
          <Text>Location Registration</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (view2) {
    return (
      <View style={styles.container}>
        <Text>Register Appliance</Text>
        <DialogInput
          isDialogVisible={isDialogVisible}
          title={'VERIFICATION'}
          message={'Enter Password'}
          submitInput={inputText => {
            sendInput(inputText, false);
          }}
          closeDialog={() => {
            close(false);
          }}></DialogInput>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ModifyOwner')}>
          <Text>Modify Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LocationRegistration')}>
          <Text> Modify Location </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ApplianceRegistration')}>
          <Text>Appliance Registration</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (view3) {
    return (
      <View style={styles.container}>
        <Text>Register Binding</Text>
        <DialogInput
          isDialogVisible={isDialogVisible}
          title={'VERIFICATION'}
          message={'Enter Password'}
          submitInput={inputText => {
            sendInput(inputText, false);
          }}
          closeDialog={() => {
            close(false);
          }}></DialogInput>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ModifyOwner')}>
          <Text>Modify Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LocationRegistration')}>
          <Text>Modify Location </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ApplianceRegistration')}>
          <Text> Modify Appliance </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Binding')}>
          <Text>Binding</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Pairing')}>
          <Text>Pairing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('acqreg')}>
          <Text>Data-ACQ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DialogInput
        isDialogVisible={isDialogVisible}
        title={'VERIFICATION'}
        message={'Enter Password'}
        submitInput={inputText => {
          sendInput(inputText, false);
        }}
        closeDialog={() => {
          close(false);
        }}></DialogInput>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 300,
    marginTop: 16,
  },
});
export default SecondPage;
