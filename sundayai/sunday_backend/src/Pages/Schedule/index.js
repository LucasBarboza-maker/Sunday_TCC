import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import './schedule.css';
import '../../index.css';
import { useSpeechSynthesis } from "react-speech-kit";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useSpeechToText from 'react-hook-speech-to-text';
import { env } from '../../helpers/envconfig';
import { useNavigate } from 'react-router-dom';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import FullCalendar from '@fullcalendar/react'
import Modal from 'react-modal';


import { faMicrophoneSlash, faMicrophone, faVolumeMute, faVolumeHigh, faMessage, faSun, faArrowRight, faDoorOpen, faBook, faGamepad } from '@fortawesome/free-solid-svg-icons'

import { FaHouseUser, FaRocketchat, FaPlus, FaTimes } from 'react-icons/fa';

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
  const [events, setEvents] = useState([]);
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

  function extrairDatasComHoras(dataString) {
    const meses = {
      'janeiro': '01',
      'fevereiro': '02',
      'março': '03',
      'abril': '04',
      'maio': '05',
      'junho': '06',
      'julho': '07',
      'agosto': '08',
      'setembro': '09',
      'outubro': '10',
      'novembro': '11',
      'dezembro': '12'
    };

    const datasEncontradas = [];

    // Use uma expressão regular global para encontrar todas as correspondências na string
    const regex = /(\d+)\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?(?:\s+às\s+(\d{2})\s+horas)?/g;
    let match;

    while ((match = regex.exec(dataString)) !== null) {
      const dia = match[1];
      const mes = meses[match[2].toLowerCase()];
      const ano = match[3] || new Date().getFullYear(); // Use o ano atual se não for fornecido
      const horas = match[4] || '00'; // Use 00 se as horas não forem fornecidas

      // Formate a data com ano, mês, dia e horas
      const dataISO8601 = `${ano}-${mes}-${dia}T${horas}:00:00.000Z`;
      datasEncontradas.push(dataISO8601);
    }

    return datasEncontradas;
  }

  async function submitMessage(message) {

    if (message == "") {
      return;
    }


    let dates = extrairDatasComHoras(message.toLowerCase());

    let body = {
      inicialDate: dates[0],
      endDate: dates.length == 2 ? dates[1] : dates[0],
      description: message
    }

    if (dates.length == 0) {
      return;
    }


    if (message.toLowerCase().includes("remover") || message.toLowerCase().includes("deletar") || message.toLowerCase().includes("apagar")) {
      const requestOptions = {
        method: 'DELETE',
      };
      const response = await fetch(`${env.APIURL}/v0/schedule/event/${user._id}/${body.inicialDate}`, requestOptions);
      response.json().then((e) => {
        if (e.status == 'success') {
          if (voice) {
            speak({ text: "Eventos apagados", voice: voices[1] })
          }
          getEvents();
        }
      }).finally(() => {
        setMessage("");
        setMute(false);
      })

      return;
    }

    if (message.toLowerCase().includes("retornar") || message.toLowerCase().includes("qual") || message.toLowerCase().includes("quais") || message.toLowerCase().includes("selecione")) {

      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      };
      const response = await fetch(`${env.APIURL}/v0/schedule/event/${user._id}/${body.inicialDate}/${body.endDate}`, requestOptions);
      response.json().then((e) => {
        if (e.status == 'success') {
          if (voice) {
            var eventsVoiceMessage;

            e.data.result.map((f, i) => {
              eventsVoiceMessage += "Evento " + (i + 1) + f.description;
            })

            speak({ text: eventsVoiceMessage, voice: voices[1] })
          }

          getEvents();
        }
      }).finally(() => {
        setMessage("");
        setMute(false);
      })

      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(`${env.APIURL}/v0/schedule/event/${user._id}`, requestOptions);
    response.json().then((e) => {
      if (e.status == 'success') {
        if (voice) {
          speak({ text: "Data adicionada ao Banco", voice: voices[1] })
        }
        getEvents();
      }
    }).finally(() => {
      setMessage("");
      setMute(false);
    })



  }

  async function getEvents() {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    const response = await fetch(`${env.APIURL}/v0/schedule/event/${user._id}`, requestOptions)

    response.json().then((e) => {

      const formattedEvents = e.data.result.map((event) => {

        const startDate = new Date(event.inicialDate);
        startDate.setDate(startDate.getDate() + 1);

        const endDate = new Date(event.endDate);
        endDate.setDate(endDate.getDate() + 1);

        console.log(startDate);
        console.log(endDate);

        return {
          title: event.description,
          start: startDate,
          end: endDate
        }
      });

      setEvents(formattedEvents)
      console.log(e);
    })
  }

  useEffect(() => {
    getEvents();
  }, [])

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
    openModal();
  }, [])

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


  return (
    <div style={{ display: 'flex' }}>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Schedule Event Modal"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <span style={{ color: '#3662A8', fontSize: '24px', fontWeight: 'bold' }}>Como adicionar um Evento?</span>
          <FaTimes color='red' size={22} style={{ cursor: 'pointer' }} onClick={closeModal} />
        </div>
        <div>
          <p>Para adicionar um evento diga:</p>
          <p>Ex: "Evento do dia 25 de Abril de 2023 ao dia 29 de Abril de 2023"</p>
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
          <div className='calendarBackground'>
            {
              modalIsOpen ?
                <></>
                :
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                />
            }
          </div>
        </div>
      </section>
    </div>
  );
}