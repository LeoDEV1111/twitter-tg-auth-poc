import logo from './logo.svg';
import './App.css';
import React from 'react';
import TwitterLogin from 'react-twitter-auth';
function App() {

  const onSuccess = (response) => {
    console.log("2222222")
    const token = response.headers.get('x-auth-token');
    console.log("1111111", token)
    response.json().then(user => {
      if (token) {
        this.setState({isAuthenticated: true, user: user, token: token});
      }
    });
  };

  const onFailed = (error) => {
    console.log("33333")
    alert(error);
  };

  return (
    <div className="App">
      <TwitterLogin 
        loginUrl="http://localhost:4000/api/v1/auth/twitter"
        onFailure={onFailed} 
        onSuccess={onSuccess}
        requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"
      />
    </div>
  );
}

export default App;
