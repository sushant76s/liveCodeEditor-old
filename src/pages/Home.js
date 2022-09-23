import React, {useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Created a new room")
  };

  const joinRoom = () => {
    if(!roomId || !username) {
      toast.error('Room id and username is required');
      return;
    }
    //rediret
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });

  };

  const handleInputEnter = (e) => {
    // console.log('event', e.code);yarn startb
    if(e.code === 'Enter') {
      joinRoom();
    }
  }

  return (
    <div className='homePageWrapper'>
      <div className='formWrapper'>
          <img className='homePageLogo' src='/code-image.png' alt='logo'/>
          <h4 className='mainLabel'>Paste Invitation Room ID</h4>
          <div className='inputGroup'>
            <input
              type='text'
              className='inputBox'
              placeholder='Room Id'
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
            <input
              type='text'
              className='inputBox'
              placeholder='UserName'
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
            <button className='btn joinBtn' onClick={joinRoom}>Join</button>
            <span className='createInfo'>
              If you don't have invite then create &nbsp;
              <a onClick={createNewRoom} href="" className='createNewBtn'>new room</a>
            </span>
          </div>
      </div>

      <footer>
        <h4>Developed by Sushant</h4>
      </footer>

    </div>
  )
}

export default Home