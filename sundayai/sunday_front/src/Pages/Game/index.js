import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import './game.css';
import '../../index.css';
import { useSpeechSynthesis } from "react-speech-kit";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useSpeechToText from 'react-hook-speech-to-text';
import { env } from '../../helpers/envconfig';
import { useNavigate } from 'react-router-dom';

import { faMicrophoneSlash, faMicrophone, faVolumeMute, faVolumeHigh, faMessage, faSun, faArrowRight, faDoorOpen, faBook, faGamepad } from '@fortawesome/free-solid-svg-icons'

import { FaHouseUser, FaRocketchat, FaPlus, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

export default function Home() {
  const bottomRef = React.useRef()
  const { speak, voices, speaking } = useSpeechSynthesis();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [message, setMessage] = useState("");
  const [voice, setVoice] = useState(false);
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const [messages, setMessages] = useState([]);
  const [jogoDaVelha, setJogoDaVelha] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const [vencedor, setVencedor] = useState(null)
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
  
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  const [modalIsOpen, setIsOpen] = React.useState(false);

  const notify = (message, type) => toast(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    type: type
  });

  function openModal() {
    setIsOpen(true);
  }


  function closeModal() {
    setIsOpen(false);
  }

  async function submitMessage(message) {

    verificarVencedor(jogoDaVelha, 'X')
    verificarVencedor(jogoDaVelha, 'O')

    
    if (message == "")
      return;

    if (message.includes("iniciar") && message.includes("jogo")) {
      setVencedor(null);
      setJogoDaVelha([1,2,3,4,5,6,7,8,9]);

      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetch(`${env.APIURL}/v0/game/init/${user._id}`, requestOptions)

      response.json().then((e) => {
        speak({ text: "O jogo foi iniciado", voice: voices[1] })
        notify('O jogo foi iniciado', 'success');


      }).finally(() => {
        setMute(false);
        setMessage("");
      })
    }

    if (message.includes("Casa") || message.includes("casa")) {

      if(vencedor != null){
        if(vencedor == "Empate"){
          alert("EMPATE");
          return;
        }
        alert("O vencedor é "+ vencedor)
        return;
      }

      const numbers = findNumbersInText(message);

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cell: numbers[0]-1 })
      };
      const response = await fetch(`${env.APIURL}/v0/game/tictactoePlayer/${user._id}`, requestOptions)

      response.json().then((e) => {
        e.data.result.map((f, i) => {
          if (f == -1) {
            jogoDaVelha[i] = "X";
          } else if (f == 1) {
            jogoDaVelha[i] = "O";
          }

          setJogoDaVelha(jogoDaVelha);
          verificarVencedor(jogoDaVelha, 'O')

        });
      }).then(async (e) => {
        const numbers = findNumbersInText(message);

        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cell: numbers[0] })
        };
        const response = await fetch(`${env.APIURL}/v0/game/tictactoe/${user._id}`, requestOptions)

        response.json().then((e) => {
          e.data.result.map((f, i ) => {
            if (f == -1) {
              jogoDaVelha[i] = "X";
            } else if (f == 1) {
              jogoDaVelha[i] = "O";
            }

            setJogoDaVelha(jogoDaVelha);
            verificarVencedor(jogoDaVelha, 'X')

          });
        }).finally(() => {
          setMute(false);
          setMessage("");
        })

      })
    }
  }

  useEffect(() => {
    if(vencedor != null){
      if(vencedor == "Empate"){
        alert("EMPATE");
        return;
      }
      alert("O vencedor é "+ vencedor)
      return;
    }
  }, [vencedor])

  function verificarVencedor(tabuleiro, valorXouO) {

    if(tabuleiro[0] == valorXouO && tabuleiro[1] == valorXouO && tabuleiro[2] == valorXouO){
      setVencedor(valorXouO);
    }

    if(tabuleiro[3] == valorXouO && tabuleiro[4] == valorXouO && tabuleiro[5] == valorXouO){
      setVencedor(valorXouO);
    }
    
    if(tabuleiro[6] == valorXouO && tabuleiro[7] == valorXouO && tabuleiro[8] == valorXouO){
      setVencedor(valorXouO);
    }

    if(tabuleiro[0] == valorXouO && tabuleiro[3] == valorXouO && tabuleiro[6] == valorXouO){
      setVencedor(valorXouO);
    }

    if(tabuleiro[1] == valorXouO && tabuleiro[4] == valorXouO && tabuleiro[7] == valorXouO){
      setVencedor(valorXouO);
    }

    if(tabuleiro[2] == valorXouO && tabuleiro[5] == valorXouO && tabuleiro[8] == valorXouO){
      setVencedor(valorXouO);
    }

    if(tabuleiro[0] == valorXouO && tabuleiro[4] == valorXouO && tabuleiro[8] == valorXouO){
      setVencedor(valorXouO);
    }

    if(tabuleiro[2] == valorXouO && tabuleiro[4] == valorXouO && tabuleiro[6] == valorXouO){
      setVencedor(valorXouO);
    }

    var array = tabuleiro.filter((e) => {
      if(e != "X" || e != "O"){
        return e;
      }
    })

    if(array.length == 0){
      setVencedor("Empate");
    }
  }

  function findNumbersInText(text) {
    text = text.toLowerCase();

    const numberMatches = text.match(/\d+|\bum\b|\bdois\b|\btrês\b|\bquatro\b|\bcinco\b|\bseis\b|\bsete\b|\boito\b|\bnove\b|\bdez\b/g);

    if (numberMatches) {
      const numbers = numberMatches.map(match => {
        if (!isNaN(match)) {
          return parseInt(match);
        } else {
          // Converter números por extenso em números
          switch (match) {
            case 'um':
              return 1;
            case 'dois':
              return 2;
            case 'três':
              return 3;
            case 'quatro':
              return 4;
            case 'cinco':
              return 5;
            case 'seis':
              return 6;
            case 'sete':
              return 7;
            case 'oito':
              return 8;
            case 'nove':
              return 9;
            default:
              return NaN; // Caso não haja correspondência
          }
        }
      });

      return numbers;
    }

    return [];
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
    if(vencedor){
      if(vencedor == "Empate"){
        alert("Deu empate");
        return;
      }

      alert("O vencedor é: " + vencedor);
    }
  }, [jogoDaVelha])

  useEffect(() => {
    openModal();
  }, [])


  return (
    <div style={{ display: 'flex' }}>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover              
        />
        {/* Same as */}
        <ToastContainer />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Schedule Event Modal"
      >
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
          <span style={{color:'#3662A8', fontSize:'24px', fontWeight:'bold'}}>Como jogar?</span>
          <FaTimes color='red' size={22} style={{ cursor: 'pointer' }} onClick={closeModal}/>
        </div>
        <div>
          <p>Para iniciar o jogo diga:</p>
          <p>Ex: "Iniciar Jogo"</p>
        </div>
        <div>
          <p>Para Jogar diga "Casa" e o número da casa:</p>
          <p>Ex: "Casa 1"</p>
        </div>
      </Modal>
      <Helmet>
        <style>{"body { width:auto; padding:0; margin:0; overflow:hidden }"}</style>
      </Helmet>
      <section className='homeBackground'>
        <div style={{ height: 50, width: '100%', position: 'absolute', top: 0, backgroundColor: 'green', zIndex: -1 }}></div>
        <nav className='leftNavBar'>
          <div className='leftMenuContainer'>
            <FontAwesomeIcon color='white' icon={faMessage} onClick={() => { navigate('/home') }} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} />
            <FontAwesomeIcon color='white' icon={faBook} onClick={() => { navigate('/schedule') }} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} />
            <FontAwesomeIcon color='white' icon={faGamepad} onClick={() => { navigate('/game') }} style={{ cursor: 'pointer', marginTop: 30, height: 40 }} />
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
          <div className='gameBackground'>
            <div className='gameRow' style={{ borderBottom: '1px solid black' }}>
              <div style={{ height: '100%', width: '33.3%', borderRight: '1px solid black', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[0] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[0]}</span>
              </div>
              <div style={{ height: '100%', width: '33.3%', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[1] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[1]}</span>
              </div>
              <div style={{ height: '100%', width: '33.3%', borderLeft: '1px solid black', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[2] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[2]}</span>
              </div>
            </div>
            <div className='gameRow' style={{ borderBottom: '1px solid black' }}>
              <div style={{ height: '100%', width: '33.3%', borderRight: '1px solid black', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[3] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[3]}</span>
              </div>
              <div style={{ height: '100%', width: '33.3%', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[4] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[4]}</span>
              </div>
              <div style={{ height: '100%', width: '33.3%', borderLeft: '1px solid black', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[5] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[5]}</span>
              </div>
            </div>
            <div className='gameRow' style={{ borderBottom: '1px solid black' }}>
              <div style={{ height: '100%', width: '33.3%', borderRight: '1px solid black', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[6] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[6]}</span>
              </div>
              <div style={{ height: '100%', width: '33.3%', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[7] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[7]}</span>
              </div>
              <div style={{ height: '100%', width: '33.3%', borderLeft: '1px solid black', display: "flex", justifyContent: 'center', alignItems: 'center', fontSize: 120 }}>
                <span style={{ color: typeof jogoDaVelha[8] === "number" ? '#cfcfcf' : "blue" }}>{jogoDaVelha[8]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}