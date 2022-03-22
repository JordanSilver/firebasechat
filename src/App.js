import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef } from 'react';
import { useState } from 'react';
import Avatar from 'avataaars';
import Moment from 'react-moment';

firebase.initializeApp({
  apiKey: 'AIzaSyAHr_X9VPd9CydMdvE58z15G86XW7iv6Mk',
  authDomain: 'firechat-e208d.firebaseapp.com',
  projectId: 'firechat-e208d',
  storageBucket: 'firechat-e208d.appspot.com',
  messagingSenderId: '463356726503',
  appId: '1:463356726503:web:70ef32c4f7f8115d52e642',
  measurementId: 'G-JZHBPYSYS7',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>⚛️🔥💬</h1>
        {user ? <SignOut /> : <SignIn />}
      </header>

      <section>{user && <ChatRoom />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>
        Log in with Google
      </button>
      <p className='footer'>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder='Send Message'
        />

        <button className='send-button' type='submit' disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const time = new Date(createdAt?.seconds * 1000);
  return (
    <>
      <div className={`${messageClass}`}>
        <span style={{ display: 'flex', flexFlow: 'column nowrap' }}>
          <img src={photoURL} />
          <small>
            {' '}
            <Moment interval={3000} fromNow>
              {time}
            </Moment>
          </small>
        </span>
        <p style={{ padding: '1rem' }}>{text}</p>
      </div>
    </>
  );
}
export default App;
