import React from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useState, useRef } from "react";

firebase.initializeApp({
  apiKey: "AIzaSyC8EiM6X7A2LTXdq00rDQ9Jak8sfZtrSAg",
  authDomain: "chat-room-react-b256d.firebaseapp.com",
  projectId: "chat-room-react-b256d",
  storageBucket: "chat-room-react-b256d.appspot.com",
  messagingSenderId: "672174267004",
  appId: "1:672174267004:web:9515028e7c15cd7adac7f9",
  measurementId: "G-K3LL5ZGLLC",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

const SignIn = () => {
  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="sign-in-page">
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google Account
      </button>
    </div>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

const ChatRoom = () => {
  const [formValue, setFormValue] = useState("");

  //FIND FOR THE CORRECT COLLECTION
  const messagesRef = firestore.collection("bros");

  //make a query to the database, order by the time create, and limit the number to 25
  const query = messagesRef.orderBy("createdAt").limitToLast(25);

  //listen to the database and react to changes
  const [messages] = useCollectionData(query, { idField: "id" });
  const dummy = useRef();
  // console.log(messages);

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <main className="message-section">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          required
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button tupe="submit">Send</button>
      </form>
    </>
  );
};

const ChatMessage = (props) => {
  const { text, uid, photoURL, displayName } = props.message;
  //check if the message id is the same as the user id
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  const user = firebase.auth().currentUser;
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      {/* <div className="name">{displayName}</div> */}
      <p>
        {text}
        {/* {messageClass}
        {displayName} */}
      </p>
    </div>
  );
};
const App = () => {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="sign-out">
        <h1 className="icon">⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section className="main">{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
};
export default App;
