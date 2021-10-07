import React, {useState, createRef, useEffect} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
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
import {useFocusEffect} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

const ApplianceRegistration = ({navigation}) => {
  const [showmodal, setshowmodal] = useState(false);
  const [editmodal, seteditmodal] = useState(false);
  const [Device, setDevice] = useState('');
  const [asyncapp, setasyncapp] = useState([]);
  const [drop_app, setdrop_app] = useState(''); //to capture dropdown vals
  const [selectedapp, setselectedapp] = useState('');
  const [editedapp, seteditedapp] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      retrieveData();
    }, [retrieveData]),
  );

  const retrieveData = async () => {
    try {
      // const value = await AsyncStorage.getItem('user_config');
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Appliance_Reg', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setasyncapp(temp);
        });
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const handledeletePress = item => {
    console.log('chosen item to delete', item);

    function deleteappliance(userdata) {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM  Appliance_Reg where Appliance=?',
          [userdata],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              navigation.navigate('DummyScreen', {
                paramKey: 'ApplianceRegistration_delete',
              });
            }
          },
          (tx, error) => {
            console.log('error', error);
          },
        );
      });

      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM  Binding_Reg where appliance=?',
          [userdata],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              console.log('deleted from binding table');
            }
          },
          (tx, error) => {
            console.log('error', error);
          },
        );
      });
    }

    Alert.alert(
      'Are you sure you want  to delete',
      item,
      [
        {
          text: 'Ok',

          onPress: () => deleteappliance(item),
        },
        {
          text: 'cancel',

          onPress: () => console.log('cancel pressed'),
        },
      ],
      {cancelable: true},
    );
    setselectedapp('');
  };

  const handleSubmitPress = async () => {
    if (!Device) {
      alert('Please enter Device');
      return;
    }

    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Appliance_Reg (Appliance,binded_unbinded)
                 VALUES (?,?)`,
        [Device.toString().toUpperCase(), 'unbinded'],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'ApplianceRegistration',
            });
          }
        },
        (tx, error) => {
          navigation.navigate('DummyScreen', {
            paramKey: 'ApplianceRegistration_samedata',
          });
        },
      );
    });
  };

  function handleeditPress() {
    if (!editedapp) {
      alert('please fill all fields ');
      return;
    }
    console.log('old Appliance', selectedapp);
    console.log('new Appliance', editedapp.toUpperCase());
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE Appliance_Reg SET Appliance=? where Appliance=?;',
        [editedapp.toUpperCase(), selectedapp],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            updatebinding(editedapp.toUpperCase(), selectedapp);
            navigation.navigate('DummyScreen', {
              paramKey: 'ApplianceRegistration',
            });
          }
        },
        (tx, error) => {
          navigation.navigate('DummyScreen', {
            paramKey: 'ApplianceRegistration_samedata',
          });
        },
      );
    });
    setselectedapp('');
  }

  function updatebinding(editedapp, selectedapp) {
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE Binding_Reg SET appliance=? where appliance=?;',
        [editedapp, selectedapp],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('updated binding table');
          }
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
        <Button transparent onPress={() => handledeletePress(selectedapp)}>
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
            <Text style={styles.text_footer}>Enter Appliance</Text>
            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                placeholder=" Enter Device name eg:Fan,AC,Light...etc"
                onChangeText={Device => setDevice(Device)}
              />
            </View>
            <Button style={styles.button} onPress={() => handleSubmitPress()}>
              <Text>Save Appliance</Text>
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
            <Text style={styles.text_footer}>Edit Appliance</Text>
            <View style={styles.action}>
              <TextInput
                style={styles.textInput}
                placeholderTextColor="#05375a"
                defaultValue={selectedapp}
                onChangeText={Appliance => seteditedapp(Appliance)}
              />
            </View>
            <Button style={styles.button} onPress={() => handleeditPress()}>
              <Text>Save Appliance</Text>
            </Button>
          </View>
        </Modal>
        <View>
          <Text style={styles.text_footer}>{selectedapp}</Text>
        </View>
        <FlatList
          keyExtractor={(item, id) => id}
          data={asyncapp}
          renderItem={({item}) => (
            <View>
              {/* <Text
                adjustsFontSizeToFit
                numberOfLines={6}
                style={{
                  textAlignVertical: 'center',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0)',
                  color: 'black',
                  fontWeight: 'bold',
                }}>
                {item.Appliance}
              </Text> */}
              <Button
                style={{alignSelf: 'center'}}
                onPress={() => setselectedapp(item.Appliance)}>
                <Text>{item.Appliance}</Text>
              </Button>
              {/* <View
                style={{
                  flex: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Button
                  transparent
                  onPress={() => {
                    seteditmodal(!editmodal);
                    setselectedapp(item.Appliance);
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
              </View> */}
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
    height: '50%',
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
export default ApplianceRegistration;
