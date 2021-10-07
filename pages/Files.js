import React, {Component} from 'react';

var action = 'none',
  location = 'none',
  appliance = 'none',
  property = 'none',
  control = 'none',
  control_units = 'none',
  assistant_name = 'none';

var prev_action = 'none',
  prev_property = 'none',
  prev_appliance = 'none',
  prev_location = 'none',
  prev_control = 'none',
  prev_control_units = 'none';

var retarry = {
  count: 0,
  action: 'none',
  property: 'none',
  appliance: 'none',
  location: 'none',
};
var twowrd = [];
var threewrd = [];
var fourwrd = [];
var fivewrd = [];
var res = [];
var count = 0;
var RNFS = require('react-native-fs');

function readfile() {
  var path = RNFS.ExternalDirectoryPath + '/Config.json';
  return RNFS.readFile(path);
  //console.log('READ FILE RESULT : ===> ',result);
}

function compareString(e, data) {
  console.log('-------------------------------------------');
  const filedata = data;

  const stopwords = filedata?.stopwords;
  /*actions = filedata?.action,
  appliances = filedata?.appliance,
  assistantName = filedata?.assistant_name,
  locations = filedata?.location,
  properties = filedata?.property,
  propertyUnits = filedata?.property_units,
  propertyValues = filedata?.property_value;*/

  var ret = [];
  retarry.count = 0;
  var foundsw = 0;
  e.value.forEach(com_str => {
    var i = 0;
    count = 0;
    var j = 0;
    com_str = com_str.toLowerCase();
    ret = com_str.split(' ');
    for (i = 0; i < ret.length; i++) {
      foundsw = 0;
      for (k = 1; k < stopwords.length; k++) {
        if (new RegExp('\\b' + stopwords[k] + '\\b').test(ret[i])) foundsw = 1;
      }
      if (foundsw != 1) {
        res[j] = ret[i];
        j++;
      }
    } //if (stopwords.includes(ret[i])!=true){res[j]=ret[i];j++;}

    console.log('com_str=', com_str);
    console.log('resvalue=', res);
    for (i = 1; i < res.length; i++) {
      twowrd[i - 1] = res[i - 1].concat(res[i]);
    }
    for (i = 2; i < res.length; i++) {
      threewrd[i] = res[i - 2].concat(res[i - 1]);
      threewrd[i] = threewrd[i].concat(res[i]);
    } //console.log(threewrd);
    for (i = 3; i < res.length; i++) {
      fourwrd[i] = res[i - 3]
        .concat(res[i - 2])
        .concat(res[i - 1])
        .concat(res[i]);
    } //console.log(fourwrd);
    for (i = 4; i < res.length; i++) {
      fivewrd[i] = res[i - 4]
        .concat(res[i - 3])
        .concat(res[i - 2])
        .concat(res[i - 1])
        .concat(res[i]);
    } //console.log(fivewrd);

    assistant_name = match(filedata.assistant_name);
    // if(assistant_name =='!') {

    location = match(filedata.location); //console.log(location)
    action = match(filedata.action); // console.log(action);
    property = match(filedata.property); // console.log(property);
    control = match(filedata.control); // console.log(property_value);
    appliance = match(filedata.appliance); //console.log(appliance)
    control_units = match(filedata.control_units); // console.log(property_units);

    if (action == 'again' || action == 'repeat') {
      // if action is again or repeat then loc= prevloc action = prevaction...etc //else  //prevloc=loc;prevaction=action;....
      action = prev_action;
      property = prev_property;
      appliance = prev_appliance;
      location = prev_location;
      property_value = prev_control;
      property_units = prev_control_units;
    } else {
      //if propval  =on then action =start

      //if propval =off then action =stopss
      prev_action = action;
      prev_location = location;
      prev_appliance = appliance;
      prev_control = control;
      prev_control_units = control_units;
    }

    console.log('oldcount=', retarry.count, 'count=', count);
    if (retarry.count <= count) {
      retarry.action = action;
      retarry.property = property;
      retarry.appliance = appliance;
      retarry.location = location;
      retarry.control = control;
      retarry.control_units = control_units;
      retarry.count = count;
    }
    // }
  });
  //console.log('location=',retarry.location,'action=',retarry.action,'property=',retarry.propert,'property_value=',retarry.property_value);
  //console.log('appliance=',retarry.appliance,'property_units=',retarry.property_units,'count=',retarry.count);
  // console.log('final action=', retarry.action);
  // console.log('final location=', retarry.location);
  // console.log('final appliance=', retarry.appliance);
  // console.log('final property=', retarry.property);
  // console.log('final property_value=', retarry.property_value);
  // console.log('final property_units=', retarry.property_units);
  // console.log('final count=', retarry.count);
  let result = {
    action: retarry.action,
    location: retarry.location,
    appliance: retarry.appliance,
    property: retarry.property,
    control: retarry.control,
    control_units: retarry.control_units,
  };

  return result;
}

const match = checklist => {
  var found = 0;
  var wrd = '!';
  for (i = 0; i < fivewrd.length; i++) {
    if (found != 0) break;
    if (checklist.includes(fivewrd[i]) == true) {
      found = 1;
      wrd = fivewrd[i];
      fivewrd[i] = '-';
      count += 1;
    }
  }
  if (found == 0) {
    for (i = 0; i < fourwrd.length; i++) {
      if (found != 0) break;
      if (checklist.includes(fourwrd[i]) == true) {
        found = 1;
        wrd = fourwrd[i];
        fourwrd[i] = '-';
        count += 1;
      }
    }
  }
  if (found == 0) {
    for (i = 0; i < threewrd.length; i++) {
      if (found != 0) break;
      if (checklist.includes(threewrd[i]) == true) {
        found = 1;
        wrd = threewrd[i];
        threewrd[i] = '-';
        count += 1;
      }
    }
  }
  if (found == 0) {
    for (i = 0; i < twowrd.length; i++) {
      if (found != 0) break;
      if (checklist.includes(twowrd[i]) == true) {
        found = 1;
        wrd = twowrd[i];
        twowrd[i] = '-';
        count += 1;
      }
    }
  }
  if (found == 0) {
    for (i = 0; i < res.length; i++) {
      if (found != 0) break;
      if (checklist.includes(res[i]) == true) {
        wrd = res[i];
        res[i] = '-';
        count += 1;
      }
    }
  }
  return wrd;
};

export {readfile, compareString};
