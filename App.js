/*
 *    REACT NATIVE  HOME AUTOMATION
 *    ANDROID CLIENT
 *    WRITTEN BY SNEHAL SANTOSH VELANKAR
 *
 */

import React, {useEffect} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {createStackNavigator} from '@react-navigation/stack';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import FirstPage from './pages/FirstPage';

import SecondPage from './pages/SecondPage';

import datacq from './pages/datacq';

import OwnerRegistration from './pages/OwnerRegistration';

import ApplianceRegistration from './pages/ApplianceRegistration';

import LocationRegistration from './pages/LocationRegistration';

import Binding from './pages/Binding';

import Pairing from './pages/Pairing';

import acqreg from './pages/acqreg';

import ModifyOwner from './pages/ModifyOwner';

import DummyScreen from './pages/DummyScreen';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();
/////////////////////
//! REACT NATIVE SQLITE DATABASE CONNECTION
//! DATABASE NAME = UserDatabase.db
/////////////////////////
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});

function TabStack() {
  return (
    //!  DECLARING CONTROLLER SCREEN

    <Tab.Navigator
      initialRouteName="Controller"
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveTintColor: '#F8F8F8',
        style: {
          backgroundColor: `#008080`,
        },
        labelStyle: {
          textAlign: 'center',
        },
        indicatorStyle: {
          borderBottomColor: `#008080`,
          borderBottomWidth: 2,
        },
      }}>
      <Tab.Screen
        name="FirstPage"
        component={FirstPage}
        options={{
          tabBarLabel: 'Controller',
        }}
      />
      <Tab.Screen
        name="datacq"
        component={datacq}
        options={{
          tabBarLabel: 'Datacq',
        }}
      />
      <Tab.Screen
        name="SecondPage"
        component={SecondPage}
        options={{
          tabBarLabel: 'Registration',
        }}
      />
    </Tab.Navigator>
  );
}
const App = () => {
  //! As soon as application is installed useeffect is called to create database tables
  useEffect(() => {
    //!  owner ref table is for registering owner
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Owner_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Owner_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Owner_Reg(
              Id INTEGER PRIMARY KEY AUTOINCREMENT,
              owner_name TEXT,
              owner_password TEXT,
              MailId TEXT,
              PhoneNumber INT(15),
              Property_name TEXT, 
              Area TEXT,
              State TEXT,
              pincode TEXT,
              Street TEXT,
              Door_Number  TEXT)`,
              [],
            );
          }
        },
      );
    });
    //! location registration table for registering locations like hall , kitchen ,bedroom etc
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Location_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Location_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Location_Reg(Location TEXT PRIMARY KEY,images TEXT)`,
              [],
            );
          }
        },
        function (tx, res) {
          console.log(error);
        },
      );
    });
    //! Appliance reg table for registering appliance like tv,fan,ac, light etc....
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Appliance_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Appliance_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Appliance_Reg(Appliance TEXT PRIMARY KEY,binded_unbinded TEXT)`,
              [],
            );
          }
        },
      );
    });

    //column name = LOC, APPLIANCE,MODEL,PAIRED/UNPAIRED,>> IF PAIRED MACID,PROPERTIES,status
    //binding str=owner+loc+appli+model;

    //! Binding reg table is for binding each location , appliance with their specific models,properties,ip addresses etc
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Binding_Reg'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Binding_Reg', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Binding_Reg(location TEXT,
              appliance TEXT, model TEXT,paired_unpaired TEXT,
              ipaddress TEXT,macid TEXT,portnumber TEXT,wifi_ssid TEXT,wifi_pwd TEXT,
              properties TEXT,Control_function TEXT,pin_direction TEXT,Valid_States TEXT,output TEXT,
              ACS_controller_model TEXT,ESP_pin TEXT,status TEXT,color TEXT ,idle_Values TEXT,default_values TEXT)`,
              [],
            );
          }
        },
      );
    });

    //{"Model":"Havells_Ceilingfan_Fusion","Properties":"Speed;Swing;",
    // "Contol_type":"Digital output,","Valid States":"low,medium,high;on,off;","output":"800-100,800-200,800-300,800-400,800-600;0-1,0-0;",
    // "ACS_controller_model":"ACS_ESP01_M1","ESP_pin":"GPIO0;GPIO2","Driver_":"exefiles"}
    //!  models list table is to store appliance models properties which is a global reserve and is captured from a serveer
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='models_list'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS models_list', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS models_list(Model TEXT,Properties TEXT,Control_function TEXT,pin_direction TEXT,
              Valid_States TEXT,output TEXT,ACS_controller_model TEXT,ESP_pin TEXT , idle_Values TEXT , default_values TEXT)`,
              [],
            );
          }
        },
      );
    });

    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Data_Acquisition '",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Data_Acquisition', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Data_Acquisition(coordinates TEXT ,timestamp TEXT,bindingid TEXT,value TEXT)`,
              [],
            );
          }
        },
      );
    });
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Data_Acq_master'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Data_Acq_master', []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS Data_Acq_master(daqip TEXT ,daqport TEXT,wifi_ssid TEXT,wifi_pwd TEXT)`,
              [],
            );
          }
        },
      );
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Controller"
        screenOptions={{
          headerStyle: {backgroundColor: `#008080`},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name="TabStack"
          component={TabStack}
          options={{title: ' Home Automation'}}
        />

        <Stack.Screen
          name="OwnerRegistration"
          component={OwnerRegistration}
          options={{
            tabBarLabel: 'Owner Registration',
          }}
        />

        <Stack.Screen
          name="ModifyOwner"
          component={ModifyOwner}
          options={{
            tabBarLabel: ' Edit Owner Registration',
          }}
        />
        <Stack.Screen
          name="DummyScreen"
          component={DummyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ApplianceRegistration"
          component={ApplianceRegistration}
          options={{
            tabBarLabel: 'Appliance Registration',
          }}
        />

        <Stack.Screen
          name="LocationRegistration"
          component={LocationRegistration}
          options={{
            tabBarLabel: 'Location Registration',
          }}
        />

        <Stack.Screen
          name="Binding"
          component={Binding}
          options={{
            tabBarLabel: 'Binding',
          }}
        />
        <Stack.Screen
          name="Pairing"
          component={Pairing}
          options={{
            tabBarLabel: 'Pairing',
          }}
        />

        <Stack.Screen
          name="acqreg"
          component={acqreg}
          options={{
            tabBarLabel: 'acqreg',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
