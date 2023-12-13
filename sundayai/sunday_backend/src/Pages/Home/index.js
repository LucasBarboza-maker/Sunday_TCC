import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import './home.css';
import '../../index.css';
import { useSpeechSynthesis } from "react-speech-kit";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useSpeechToText from 'react-hook-speech-to-text';
import { env } from '../../helpers/envconfig';
import { useNavigate } from 'react-router-dom';

import { faMicrophoneSlash, faMicrophone, faVolumeMute, faVolumeHigh, faMessage, faSun, faArrowRight, faDoorOpen, faBook, faGamepad } from '@fortawesome/free-solid-svg-icons'

import { FaHouseUser, FaRocketchat, FaPlus, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth:'30%'
  },
};

export default function Home() {
  const bottomRef = React.useRef()
  const { speak, voices, speaking } = useSpeechSynthesis();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [message, setMessage] = useState("");
  const [voice, setVoice] = useState(false);
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const [mute, setMute] = useState(true);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }


  function closeModal() {
    setIsOpen(false);
  }

  async function submitMessage(message) {

    if (message == "")
      return;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: message })
    };
    const response = await fetch(`${env.APIURL}/v0/speech/${user._id}`, requestOptions);
    response.json().then((e) => {
      if (e.status == 'success') {
        let aiMessage = e.data.result.answer ? e.data.result.answer : "Não entendi!";

        if (voice) {
          speak({ text: aiMessage, voice: voices[1] })
        }

        setMessages((e) => {
          const updated = [...e, { user: 'you', message: message, hour: returnCurrentHour() }, { user: 'AI', message: aiMessage, hour: returnCurrentHour() }];
          console.log(updated);
          return updated;
        });
        bottomRef.current.scrollIntoView({behavior: 'smooth'});
        setMessage("")
        setMute(false);
      }
    }).finally(() => {
      setMessage("");
      setMute(false);
    })

  }

  function returnCurrentHour() {
    let date = new Date();
    let hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

    return `${hour}:${minutes}`;
  }

  function onChangeFile(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  async function onReaderLoad(event) {

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.target.result
    };
    const response = await fetch(`${env.APIURL}/v0/train/loadSubject/${user._id}`, requestOptions);
    response.json().then((e) => {
      if (e.status == "success") {
        alert('Conteudo carregado com sucesso!');
      }
    });
  }

  useEffect(() => {

    results.map((e) => {
      setMessage(e.transcript)
    })
  }, [results])

  useEffect(() => {
    if (!inputIsFocused) {
      stopSpeechToText();
      submitMessage(message);
    }
  }, [message])

  useEffect(() => {
    if (!isRecording && !speaking && !mute) startSpeechToText();
  }, [isRecording, speaking])

  useEffect(() => {
    openModal();
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Schedule Event Modal"
      >
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
          <span style={{color:'#3662A8', fontSize:'24px', fontWeight:'bold'}}>Como adicionar dialogos manualmente?</span>
          <FaTimes color='red' size={22} style={{ cursor: 'pointer' }} onClick={closeModal}/>
        </div>
        <div>
          <p>Clique no icone de mais (+) no lado esquerdo na navbar </p>
          <p>Faça o upload de um arquivo no formato .json</p>
        </div>
      </Modal>
      <Helmet>
        <style>{"body { width:auto; padding:0; margin:0; overflow:hidden }"}</style>
      </Helmet>
      <section className='homeBackground'>
        <div style={{ height: 50, width: '100%', position: 'absolute', top: 0, backgroundColor: 'green', zIndex: -1 }}></div>
        <nav className='leftNavBar'>
          <div className='leftMenuContainer'>
            <FontAwesomeIcon color='white' icon={faMessage} onClick={() => {navigate('/home')}} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} />
            <FontAwesomeIcon color='white' icon={faBook} onClick={() => {navigate('/schedule')}} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} />
            <FontAwesomeIcon color='white' icon={faGamepad}  onClick={() => {navigate('/game')}} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} />
            <label >
              <FaPlus color='white' size={44} style={{ cursor: 'pointer', marginTop: 30 }} />
              <input type={"file"} id={"file"} style={{ display: "none" }} onChange={(e) => onChangeFile(e)} />
            </label >
          </div>
          <div className='logoutContainer'>
            <FontAwesomeIcon color='white' icon={faDoorOpen} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} onClick={() => { localStorage.clear(); navigate('/') }} />
          </div>
        </nav>
      </section>
      <section className='chatContainer'>
        <div className='chatHeader'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className='SundayPhoto'>
              <FontAwesomeIcon color='#F9835E' icon={faSun} style={{ height: 40 }} />
            </div>
            <div className='AiNameContainer'>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Assistente Sunday</span>
              <span style={{ color: 'white', fontSize: 20 }}>Rio de Janeiro, Brasil</span>
            </div>
          </div>
          <div className='audioInputsContainer'>
            <div className='soundIcon' onClick={() => setVoice(!voice)}>
              <FontAwesomeIcon color='white' icon={!voice ? faVolumeMute : faVolumeHigh} style={{ height: 40, width: 40, cursor: 'pointer' }} />
            </div>
            <div className='microphoneInput' onClick={() => { isRecording ? stopSpeechToText() : startSpeechToText(); setMute(!mute) }}>
              <FontAwesomeIcon color='white' icon={isRecording ? faMicrophone : faMicrophoneSlash} style={{ height: 40, width: 40, cursor: 'pointer' }} />
            </div>
          </div>
        </div>
        <div className='chatBackground'>
          <ul className='chatMessagesContainer'>

            {
              messages.map((e, index) => {
                if (e.user == "you") {
                  return (
                    <li key={index} className='chatSingleRightMessageContainer'>
                      <div className='chatUserMessage'>
                        <span className='chatUserName'>Você</span>
                        <span className='chatMessage'>{e.message}</span>
                        <span style={{ alignSelf: 'end', width: 40, fontSize: 14 }}>{e.hour}</span>
                      </div>
                    </li>
                  )
                } else {
                  return (
                    <li key={index} className='chatSingleLeftMessageContainer'>
                      <div className='chatAiMessage'>
                        <span className='chatUserName'>Assistente Sunday</span>
                        <span className='chatMessage'>{e.message}</span>
                        <span style={{ width: 40, fontSize: 14, alignSelf: 'end' }}>{returnCurrentHour()}</span>
                      </div>
                    </li>
                  )
                }
              })
            }

            <div ref={bottomRef} />

          </ul>
          <form onSubmit={(e) => { e.preventDefault(); submitMessage(message) }} className='inputButtonContainer'>
            <input className='messageInput' onFocus={() => setInputIsFocused(true)} onBlur={() => setInputIsFocused(false)} onChange={(e) => setMessage(e.target.value)} value={message} placeholder='Fale algo com Sunday...' type={'text'} ></input>
            <div className='messageButtonInput'>
              <FontAwesomeIcon color='white' icon={faArrowRight} style={{ height: 30 }} />
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}