import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import FontAwesome from 'react-fontawesome';
import Footer from './Footer';
import './App.css';
import { TLoginButton, TLoginButtonSize } from 'react-telegram-auth';

const API_URL = 'http://127.0.0.1:8080';
const socket = io(API_URL);

function App() {
  const [user, setUser] = useState({});
  const [disabled, setDisabled] = useState('');
  const [popup, setPopup] = useState(null);

  const popupRef = React.useRef(null)

  useEffect(() => {
    popupRef.current = popup;
  }, [popup])

  useEffect(() => {
    socket.on('user', (user) => {
      popupRef.current.close();
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const check = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(check);
        setDisabled('');
      }
    }, 1000);

    return () => {
      clearInterval(check);
    };
  }, [popup]);

  const openPopup = () => {
    const width = 600,
      height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const url = `${API_URL}/twitter?socketId=${socket.id}`;
    const newPopup = window.open(
      url,
      '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no,
      scrollbars=no, resizable=no, copyhistory=no, width=${width},
      height=${height}, top=${top}, left=${left}`
    );
    setPopup(newPopup);
  };

  const startAuth = () => {
    if (!disabled) {
      openPopup();
      setDisabled('disabled');
    }
  };

  const closeCard = () => {
    setUser({});
  };

  const { name, photo } = user;

  return (
    <div className={'container'}>
      {/* If there is a user, show the user */}
      {/* Otherwise show the login button */}
      {name ? (
        <div className={'card'}>
          <img src={photo} alt={name} />
          <FontAwesome
            name={'times-circle'}
            className={'close'}
            onClick={closeCard}
          />
          <h4>{`@${name}`}</h4>
        </div>
      ) : (
        <div className={'button'}>
          <button
            onClick={startAuth}
            className={`twitter ${disabled}`}
          >
            <FontAwesome name={'twitter'} />
          </button>
        </div>
      )}
      {/* <Footer /> */}
      <TLoginButton
        botName="letpariztest_bot"
        buttonSize={TLoginButtonSize.Large}
        lang="en"
        usePic={false}
        cornerRadius={20}
        onAuthCallback={(user) => {
          console.log('Hello, user!', user);
        }}
        requestAccess={'write'}
        additionalClasses={'css-class-for-wrapper'}
      />
    </div>
  );
}

export default App;
