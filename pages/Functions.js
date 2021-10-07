import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'UserDatabase.db'});
import {Alert} from 'react-native';

const read_store_async = async (event, userdata) => {
  let userdata_obj = JSON.parse(userdata);
 
  switch (event) {
    case 'owner_event':
      db.transaction(function (tx) {
        tx.executeSql(
          `INSERT INTO owner_reg ( 
              owner_name, owner_password,MailId,PhoneNumber,Property_name ,Area ,State ,country ,Street,Door_Number)
               VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [
            userdata_obj.owner.owner_name,
            userdata_obj.owner.owner_password,
            userdata_obj.owner.MailId,
            userdata_obj.owner.PhoneNumber,
            userdata_obj.owner.Property_name,
            userdata_obj.owner.Area,
            userdata_obj.owner.State,
            userdata_obj.owner.country,
            userdata_obj.owner.Street,
            userdata_obj.owner.Door_Number,
          ],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
          },
        );
      });
      return 'Data is updated';
      break;

    case 'location_event':
      db.transaction(function (tx) {
        tx.executeSql(
          `INSERT INTO location_reg ( location)
               VALUES (?)`,
          [userdata],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
            return 'Data is updated'
            } else return 'same data found';
          },
        );
      });

      break;

    case 'appliance_event':
      if (storedValue_obj.appliance.length <= 0) {
        storedValue_obj.appliance.push(userdata_obj);
        let string_data = JSON.stringify(storedValue_obj);
        await AsyncStorage.setItem('user_config', string_data);
        return 'data is updated';
      } else {
        let app_status = 0,
          app_len = storedValue_obj.appliance.length;
        for (let x = 0; x < app_len; x++) {
          if (userdata_obj == storedValue_obj.appliance[x]) {
            app_status = 1;
            break;
          }
        }

        if (app_status == 0) {
          storedValue_obj.appliance.push(userdata_obj);
          let string_data1 = JSON.stringify(storedValue_obj);
          await AsyncStorage.setItem('user_config', string_data1);
          return 'data is updated';
        } else {
          console.log('same data found ');
          app_status = 0;
          return 'same data found ';
        }
      }

      break;
    case 'binding_event':
      console.log('binding length', storedValue_obj.Binding.length);
      if (storedValue_obj.Binding.length <= 0) {
        storedValue_obj.Binding.push(userdata_obj);
        let string_data = JSON.stringify(storedValue_obj);
        await AsyncStorage.setItem('user_config', string_data);
        return 'data is updated';
      } else {
        let bind_status = 0,
          bind_len = storedValue_obj.Binding.length;
        for (let x = 0; x < bind_len; x++) {
          if (userdata_obj == storedValue_obj.Binding[x]) {
            bind_status = 1;
            break;
          }
        }

        if (bind_status == 0) {
          storedValue_obj.Binding.push(userdata_obj);
          let string_data1 = JSON.stringify(storedValue_obj);
          await AsyncStorage.setItem('user_config', string_data1);
          return 'data is updated';
        } else {
          console.log('same data found ');
          bind_status = 0;
          return 'same data found ';
        }
      }

      break;
  }
};

const check_password = async pass => {
  const async_data_owner = await AsyncStorage.getItem('user_config');
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM table_user', [], (tx, results) => {
      var temp = [];
      for (let i = 0; i < results.rows.length; ++i)
        temp.push(results.rows.item(i));
      let ss = JSON.stringify(temp);
      console.log('temp', typeof ss);
      setFlatListItems(temp);
    });
  });
  var result = '';
  if (async_data_owner) {
    let read = JSON.parse(async_data_owner);

    if (pass == read.owner.owner_password) {
      result = 'valid';
    } else {
      result = 'invalid';
    }

    return result;
  } else {
    result = 'valid';

    return result;
  }
};

const delete_registrations = async (event, userdata) => {
  const storedValue = await AsyncStorage.getItem('user_config');
  let storedValue_str = JSON.stringify(storedValue);
  let userdata_str = JSON.stringify(userdata);
  let userdata_obj = JSON.parse(userdata_str);
  let storedValue_obj = JSON.parse(storedValue);

  switch (event) {
    case 'location_event':
      for (var i = 0; i < storedValue_obj.location.length; i++) {
        if (storedValue_obj.location[i] == userdata) {
          storedValue_obj.location.splice(
            storedValue_obj.location.indexOf(userdata),
            1,
          );
          i--;
        }
      }
      if (storedValue_obj.Binding.length > 0) {
        console.log(storedValue_obj.Binding.length);
        const result = storedValue_obj.Binding.filter(
          s => !s.includes(userdata),
        );
        storedValue_obj.Binding = result.slice(0);
      }
      console.log('userdata', userdata);

      console.log('value after deleting location', storedValue_obj.location);
      console.log('value after deleting  binding', storedValue_obj.Binding);
      let string_data1 = JSON.stringify(storedValue_obj);
      await AsyncStorage.setItem('user_config', string_data1);
      return 'succesfully deleted';

      break;

    case 'appliance_event':
      for (var i = 0; i < storedValue_obj.appliance.length; i++) {
        if (storedValue_obj.appliance[i] == userdata) {
          storedValue_obj.appliance.splice(
            storedValue_obj.appliance.indexOf(userdata),
            1,
          );
          i--;
        }
      }
      if (storedValue_obj.Binding.length > 0) {
        const result = storedValue_obj.Binding.filter(
          s => !s.includes(userdata),
        );
        storedValue_obj.Binding = result.slice(0);
      }
      console.log('userdata', userdata);
      console.log('value after deleting Appliance', storedValue_obj.appliance);
      console.log('value after deleting  binding', storedValue_obj.Binding);
      string_data1 = JSON.stringify(storedValue_obj);
      await AsyncStorage.setItem('user_config', string_data1);
      return 'succesfully deleted';
      break;
    case 'binding_event':
      for (var i = 0; i < storedValue_obj.Binding.length; i++) {
        if (storedValue_obj.Binding[i] == userdata) {
          storedValue_obj.Binding.splice(
            storedValue_obj.Binding.indexOf(userdata),
            1,
          );
        }
      }
      console.log('value after deleting Binding', storedValue_obj.Binding);
      string_data1 = JSON.stringify(storedValue_obj);
      await AsyncStorage.setItem('user_config', string_data1);
      return 'succesfully deleted';
      break;
  }
};

export {check_password, read_store_async, delete_registrations};
