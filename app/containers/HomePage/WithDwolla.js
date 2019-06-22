import React,{ useEffect, memo } from 'react'
import PropTypes from 'prop-types';
import Dwolla from 'react-dwolla-iav'
import axios from 'axios';

import { createStructuredSelector } from 'reselect';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';
 
const onSuccess = (data) => { console.log("success", data);/* do stuff with data */ }
const onError = (err) => {  console.log("err", err);/* handle err */ }

const dwollaConfig = {
  backButton: false,
  customerToken: '',
  environment: 'sandbox',
  fallbackToMicroDeposits: false,
  microDeposits: false,
  stylesheets: [
    'https://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext',
    'https://myapp.com/iav/someStylesheet.css'
  ],
  subscriber: (e) => {console.log("dwolla here", e)},
}



const key = 'home';
export function WithDwolla({
    username,
    loading,
    error,
    repos,
    onSubmitForm,
    onChangeUsername,
  }) {
    useInjectReducer({ key, reducer });
    useInjectSaga({ key, saga });
  
    useEffect(() => {
        getIav();
      // When initial state username is not null, submit the form to load repos
      if (username && username.trim().length > 0) onSubmitForm();
      
    }, []);

    function getIav() {
        console.log("getting Iav");
        axios.get('http://localhost:3000/iav').then(res => {
          console.log(res,"res should be iav", );
          console.log(res.data.iav);
         dwollaConfig.customerToken = res.data.iav;
        }).catch(err => {
          console.log("iav err", err);
        })
      }
  
    const reposListProps = {
      loading,
      error,
      repos,
    };
  
   
    return (
      <div>
        
    <Dwolla
      onSuccess={onSuccess}
      onError={onError}
      dwollaConfig={dwollaConfig}
    />
      </div>
    );
  }
  
  WithDwolla.propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
    onSubmitForm: PropTypes.func,
    username: PropTypes.string,
    onChangeUsername: PropTypes.func,
  };
  
  const mapStateToProps = createStructuredSelector({
    repos: makeSelectRepos(),
    username: makeSelectUsername(),
    loading: makeSelectLoading(),
    error: makeSelectError(),
  });
  
  export function mapDispatchToProps(dispatch) {
    return {
      onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
      onSubmitForm: evt => {
        if (evt !== undefined && evt.preventDefault) evt.preventDefault();
        dispatch(loadRepos());
      },
    };
  }
  
  const withConnect = connect(
    mapStateToProps,
    mapDispatchToProps,
  );
  
  export default compose(
    withConnect,
    memo,
  )(WithDwolla);