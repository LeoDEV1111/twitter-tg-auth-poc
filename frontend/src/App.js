import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import FontAwesome from 'react-fontawesome';
import './App.css';
import { TLoginButton, TLoginButtonSize } from 'react-telegram-auth';

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL);

function App() {
  const [user, setUser] = useState({});
  const [tgUser, setTgUser] = useState({});
  const [disabled, setDisabled] = useState('');
  const [popup, setPopup] = useState(null);
  const [isTgUserInTargetGroup, setIsTgUserInTargetGroup] = useState("none");

  const popupRef = React.useRef(null)
  const targetTgGroupId = "@leotelegramapitest"
  const targetTgGroupLink = "https://t.me/leotelegramapitest"
  const botKey = process.env.REACT_APP_BOT_KEY;

  // useEffect(() => {
  //   setTgUser({
  //     auth_date: 1692939808,
  //     first_name: "Leo",
  //     hash: "677ffc33ce3c146dcb7d1915c9094eabc9682ae32831df11137a160c6ef9ac8b",
  //     id: 1871734582,
  //     username: "ModernLeoDEV"
  //   })
  // }, [])

  useEffect(() => {
    const checkTgUser = async () => {
      const res = await axios.get(`https://api.telegram.org/bot${botKey}/getChatMember?chat_id=${targetTgGroupId}&user_id=${tgUser.id}`);
      // const res = await axios.get(`https://api.telegram.org/bot${botKey}/getChatMember?chat_id=${targetTgGroupId}&user_id=5961079027`);
      console.log(res.data)
      console.log(res.data.result.status)
      if (res.data.ok && 
        (res.data.result.status === "member" || 
          res.data.result.status === "creator" || 
          res.data.result.status === "administrator")
      ) {
        setIsTgUserInTargetGroup("yes")
      } else {
        setIsTgUserInTargetGroup("no")
      }
    }

    console.log({tgUser})
    if (tgUser.id > 0) {
      checkTgUser()
    }
  }, [tgUser, botKey])

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

  const iframeRef = useRef(null);

  const handleClick = () => {
    if (iframeRef.current) {
      // Set the src of the iframe to the Telegram authentication URL
      // iframeRef.current.src = "https://oauth.telegram.org/auth?bot_id=6419040191&origin=https%3A%2F%2Fmain--celadon-dolphin-c51d55.netlify.app&embed=1&request_access=write&lang=en&return_to=https%3A%2F%2Fmain--celadon-dolphin-c51d55.netlify.app%2F"; // Replace with the actual URL
      iframeRef.current.src = "https://oauth.telegram.org/embed/letpariztest_bot?origin=https%3A%2F%2Fmain--celadon-dolphin-c51d55.netlify.app&return_to=https%3A%2F%2Fmain--celadon-dolphin-c51d55.netlify.app%2F&size=large&userpic=false&request_access=write&radius=20&lang=en"
    }
  };


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
          setTgUser(user);
        }}
        requestAccess={'write'}
        additionalClasses={'css-class-for-wrapper'}
      />

      <button 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={handleClick}
      >
        Login with Scalar
      </button>

      {isTgUserInTargetGroup === "yes" ? (
        <div> You are in a {targetTgGroupId} group</div>
        ) : (
          isTgUserInTargetGroup === "no" ? (
            <div>
              <div> You are not in a {targetTgGroupId} group </div>
              <div> Please join: <a href={targetTgGroupLink} target="_blank" rel="noreferrer">here</a></div>
            </div>
            ) : (
              <div></div>
          )
        )
      }
    </div>
  );
}

export default App;
