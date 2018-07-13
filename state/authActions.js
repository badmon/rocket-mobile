import { AsyncStorage } from 'react-native';
import { Facebook } from 'expo';
import * as types from '../constants/ActionTypes';
import axios from 'axios';
import firebase from '../firebase';

export const loginWithFacebook = () => {
  return async function(dispatch) {
    let token;
    try {
      token = await AsyncStorage.getItem('token');
    } catch (error) {
      console.log(error);
    }
    if (token) {
      // dispatch action saying login is was successful
      dispatch({ type: types.FACEBOOK_LOGIN_SUCCESS, payload: token });
    } else {
      //get user token and set it
      doFacebookLogin(dispatch);
    }
  };
};

const doFacebookLogin = async dispatch => {
  let { token, type } = await Facebook.logInWithReadPermissionsAsync('1857060311217598', {
    permissions: ['public_profile', 'email'],
  });
  console.log(token, type); //eslint-disable-line
  if (type === 'cancel') {
    dispatch({ type: types.FACEBOOK_LOGIN_FAIL });
    return;
  }
  dispatch({ type: types.FACEBOOK_LOGIN_SUCCESS, payload: token });
  const credential = firebase.auth.FacebookAuthProvider.credential(token);
  firebase
    .auth()
    .signInWithCredential(credential)
    .catch(error => {
      // Handle Errors here.
      console.log(error);
    });
};

//helper functions
async function getUserInfo(token) {
  let { data } = await axios.get(
    `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,gender,age_range,birthday`,
  );
  // console.log(data) //eslint-disable-line
  return data;
}
