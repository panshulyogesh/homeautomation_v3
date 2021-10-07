import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
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
  Title,
  H1,
  Spinner,
  Fab,
} from 'native-base';
import {decode, encode} from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

import ModalDropdown from 'react-native-modal-dropdown';

import {useFocusEffect} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {RNCamera} from 'react-native-camera';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'UserDatabase.db'});

import CheckBox from '@react-native-community/checkbox';
const PendingView = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 30,
          color: 'red',
        }}>
        loading...
      </Text>
    </View>
  );
};
const LocationRegistration = ({navigation}) => {
  const [showmodal, setshowmodal] = useState(false);
  const [editmodal, seteditmodal] = useState(false);
  const [LocationName, setLocationName] = useState(''); //text input field loc
  const [asyncloc, setasyncloc] = useState([]); //to view dropodown values
  const [drop_loc, setdrop_loc] = useState(''); //to capture dropdown vals
  const [bind, setbind] = useState('');
  const [selectedloc, setselectedloc] = useState('');
  const [editedloc, seteditedloc] = useState('');
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [image, setimage] = useState(null);
  const [capture, setcapture] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      retrieveData();
    }, [retrieveData]),
  );

  const retrieveData = async () => {
    try {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM Location_Reg', [], (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          // console.log(temp);
          setasyncloc(temp);
        });
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const handledeletePress = item => {
    console.log('chosen item to delete', item);

    function deletelocation(userdata) {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM  Location_Reg where Location=?',
          [userdata],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              navigation.navigate('DummyScreen', {
                paramKey: 'LocationRegistration_delete',
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
          'DELETE FROM  Binding_Reg where location=?',
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

      // alert (//paired//notfound /no vacancy)
      //////////////////////////////////////////////////////////////////////
      // var inventory = [
      //   {name: 'owner_hall_light', id: 2},
      //   {name: 'owner_kitchen_ac', id: 0},
      //   {name: 'owner_bed_fan', id: 5},
      // ];
      // let find = 'lamp';
      // const result = inventory.find(x => x.name.includes(find));

      // console.log(result); //   {name: 'owner_kitchen_ac', id: 0}
      ///////////////////////////////////////////////////////////////////////////////////
    }

    Alert.alert(
      'Are you sure  you want  to delete ',
      item,
      [
        {
          text: 'Ok',

          onPress: () => deletelocation(item),
        },
        {
          text: 'cancel',

          onPress: () => console.log('cancel pressed'),
        },
      ],
      {cancelable: true},
    );
    setselectedloc('');
  };

  const handleSubmitPress = async () => {
    if (!LocationName) {
      alert('Please enter location');
      return;
    }

    db.transaction(function (tx) {
      tx.executeSql(
        `INSERT INTO Location_Reg (Location) VALUES (?)`,
        [LocationName.toString().toUpperCase()],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            navigation.navigate('DummyScreen', {
              paramKey: 'LocationRegistration',
            });
          }
        },
        (tx, error) => {
          navigation.navigate('DummyScreen', {
            paramKey: 'LocationRegistration_samedata',
          });
        },
      );
    });
  };

  function handleeditPress() {
    if (!editedloc) {
      alert('please fill all fields');
      return;
    }
    console.log('old loc', selectedloc);
    console.log('new loc', editedloc.toUpperCase());
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE Location_Reg SET Location=? where Location=?',
        [editedloc.toUpperCase(), selectedloc],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            updatebinding(editedloc.toUpperCase(), selectedloc);
            navigation.navigate('DummyScreen', {
              paramKey: 'LocationRegistration',
            });
          }
        },
        (tx, error) => {
          navigation.navigate('DummyScreen', {
            paramKey: 'LocationRegistration_samedata',
          });
        },
      );
    });
    setselectedloc('');
  }

  function updatebinding(editedloc, selectedloc) {
    db.transaction(function (tx) {
      tx.executeSql(
        'UPDATE Binding_Reg SET Location=? where Location=?',
        [editedloc, selectedloc],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('updated binding table');
          }
        },
      );
    });
  }
  const takePicture = async camera => {
    try {
      const options = {quality: 0.9, base64: false, doNotSave: false};
      const data = await camera.takePictureAsync(options);

      db.transaction(function (tx) {
        tx.executeSql(
          'UPDATE Location_Reg SET images=? where Location=?',
          [data.uri, selectedloc],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              navigation.navigate('DummyScreen', {
                paramKey: 'LocationRegistration',
              });
            }
          },
        );
      });
      // console.log(data.base64);

      // function getBase64Image(img) {
      //   var canvas = document.createElement('canvas');
      //   canvas.width = img.width;
      //   canvas.height = img.height;
      //   var ctx = canvas.getContext('2d');
      //   ctx.drawImage(img, 0, 0);
      //   var dataURL = canvas.toDataURL('image/png');
      //   return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
      // }

      // var base64 = await getBase64Image(base);
      // console.log(base64);
      // let blob = await dataURItoBlob(base);
      //  console.log('blob', blob);
      setimage(data.uri);
      setcapture(false);
    } catch (error) {
      console.log(error);
    }
  };

  function dataURItoBlob(dataURI) {
    console.log('SS', dataURI);
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], {type: mimeString});
    return blob;
  }

  return (
    <>
      {capture == true ? (
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
          flashMode={RNCamera.Constants.FlashMode.on}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          getCameraIds={true}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'longer text to view camera',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio',
            message: 'longer text to view audio',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }}>
          {({camera, status}) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  style={styles.capture}
                  onPress={() => takePicture(camera)}>
                  <Text>SNAP</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      ) : (
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
            <Button transparent onPress={() => setcapture(true)}>
              <Icon
                name="camera"
                type="Feather"
                style={{fontSize: 30, color: 'green'}}
              />
            </Button>
            <Button transparent onPress={() => handledeletePress(selectedloc)}>
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
                <Text style={styles.text_footer}>Enter Location</Text>
                <View style={styles.action}>
                  <TextInput
                    style={styles.textInput}
                    placeholderTextColor="#05375a"
                    placeholder=" Enter Location name eg: Hall,dining,Kitchen...etc"
                    onChangeText={LocationName => setLocationName(LocationName)}
                  />
                </View>
                <Button
                  style={styles.button}
                  onPress={() => handleSubmitPress()}>
                  <Text>Save location</Text>
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
                <Text style={styles.text_footer}>Edit Location</Text>
                <View style={styles.action}>
                  <TextInput
                    style={styles.textInput}
                    autoCapitalize="none"
                    placeholderTextColor="#05375a"
                    placeholder=" Enter Location name eg: Hall,dining,Kitchen...etc"
                    defaultValue={selectedloc}
                    onChangeText={Location => seteditedloc(Location)}
                  />
                </View>
                <Button style={styles.button} onPress={() => handleeditPress()}>
                  <Text>Edit location</Text>
                </Button>
              </View>
            </Modal>
            <View>
              <Text style={styles.text_footer}>{selectedloc}</Text>
            </View>
            <FlatList
              keyExtractor={(item, id) => id}
              data={asyncloc}
              renderItem={({item}) => (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Button
                    style={{alignSelf: 'center'}}
                    onPress={() => setselectedloc(item.Location)}>
                    <Text>{item.Location}</Text>
                  </Button>
                  <Image style={styles.clicked} source={{uri: item.images}} />
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
      )}
    </>
  );
};

export default LocationRegistration;

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
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#0A79DF',
  },
  preview: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: 'orange',
    padding: 20,
    alignSelf: 'center',
  },

  camtext: {
    backgroundColor: '#3498DB',
    color: '#ffffff',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 25,
  },

  clicked: {
    width: 90,
    height: 90,
    borderRadius: 150,
  },
});
