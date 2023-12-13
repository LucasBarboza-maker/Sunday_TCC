import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CgProfile } from "react-icons/cg"

import { env } from '../../helpers/envconfig';
import './login.css';

import background from "../../images/SundayImage.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css'
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '30%',
    overflow:'hidden'
  },
};

export default function Login({ history }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState({ name: "", passwordConfirm: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: ""});
  const [verSenha, setVerSenha] = useState(false);

  const navigate = useNavigate();
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

  const [modalIsOpen, setIsOpen] = React.useState(false);


  function openModal() {
    setIsOpen(true);
  }


  function closeModal() {
    setIsOpen(false);
  }

  async function register() {
    if (!validarORegistro()) {
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    };
    const response = await fetch(`${env.APIURL}/v0/user/signup`, requestOptions);
    const data = await response.json();

    if (data.status === "success") {
      localStorage.setItem('user', JSON.stringify(data.data.user))
      navigate('/home');
    }
  }

  async function login() {

    if (!validarLogin()) {
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    };
    const response = await fetch(`${env.APIURL}/v0/user/login`, requestOptions).then((e) => {

      if (e.status == 401) {
        notify("Email ou senha inválidos", "error");
      }

      return e
    })
    const data = await response.json()

    if (data.status === "success") {
      localStorage.setItem('user', JSON.stringify(data.data.user))
      navigate('/home');
    }
  }

  async function resetPassword() {

    if (!validarResetPassword()) {
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email: forgotPasswordData.email})
    };
    const response = await fetch(`${env.APIURL}/v0/user/forgotPassword`, requestOptions).then((e) => {

      if (e.status == 401) {
        notify("Email ou senha inválidos", "error");
      }

      return e
    })
    const data = await response.json()

    if (data.status === "success") {
      localStorage.setItem('user', JSON.stringify(data.data.user))
      navigate('/home');
    }
  }

  function validarResetPassword() {

    if (forgotPasswordData.email == "") {
      notify("O email não pode ser vazio!!", "error")
      return false;
    }

    if (forgotPasswordData.email != "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(forgotPasswordData.email)) {
        notify("O email não está em um formato aceitável", "error")
        return false;
      }

    }

    return true;
  }


  function validarLogin() {

    if (loginData.email == "") {
      notify("O email não pode ser vazio!!", "error")
      return false;
    }

    if (loginData.password == "") {
      notify("A senha não pode ser vazia!!", "error")
      return false;
    }

    if (login.email != "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(loginData.email)) {
        notify("O email não está em um formato aceitável", "error")
        return false;
      }

    }

    return true;
  }

  function validarORegistro() {

    if (user.name == "") {
      notify("O nome não pode ser vazio!!", "error")
      return false;
    }

    if (user.email == "") {
      notify("O email não pode ser vazio!!", "error")
      return false;
    }

    if (user.password == "") {
      notify("A senha não pode ser vazia!!", "error")
      return false;
    }

    if (user.email != "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(user.email)) {
        notify("O email não está em um formato aceitável", "error")
        return false;
      }

    }

    if (user.password != "") {
      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\-]).{10,}$/;

      if (!senhaRegex.test(user.password)) {
        notify("A senha deve conter no minimo 10 caracteres uma letra maiúscula uma minúscula e caractere especial", "error")
        return false;
      }

    }

    if (user.password != user.passwordConfirm) {
      notify("As senhas devem ser iguais!", "error")
      return false;
    }

    return true;
  }

  document.body.style.overflow = 'hidden'

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Schedule Event Modal"
      ><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <span style={{ color: '#3662A8', fontSize: '24px', fontWeight: 'bold' }}>Resgatar a senha</span>
          <FaTimes color='red' size={22} style={{ cursor: 'pointer' }} onClick={closeModal} />
        </div>
        <div>
          <p>Digite seu email para alterar a sua senha</p>
        </div>
        <div className='loginInput' style={{ border: 'solid gray 1px' }}>
          <input className='loginInputFocus' type={'text'} onChange={(e) => setForgotPasswordData({ email: e.target.value })} value={forgotPasswordData.email} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Email"></input>
        </div>
        <div className='loginInput' style={{display:'flex', justifyContent:'center', alignItems:'end'}}>
          <input className='loginInputFocus' type={'submit'} onClick={(e) => { e.preventDefault(); resetPassword(); }} style={{ cursor: 'pointer', fontSize: 18, backgroundColor: '#09BC8A', border: 'none', borderRadius: 20, height: 25, width:'25%', color: 'white' }} value="Enviar"></input>
        </div>
      </Modal>
      <div style={{ display: 'flex', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
        <Helmet>
          <style>{"body { background-color: #75DDDD; }"}</style>
        </Helmet>
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
        {isSignUp === false ?
          <form className='loginFormHeader'>
            <div className='titleContainer'>
              <h1>ASSISTENTE SUNDAY</h1>
            </div>
            <div className='profileImage'>
              <CgProfile color='white' size={128} />
            </div>
            <div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={'text'} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} value={loginData.email} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Email"></input>
              </div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={verSenha? 'text' : 'password' } onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} value={loginData.password} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Senha"></input>
              </div>
              <div style={{display:'flex', flexDirection:'row', alignContent:'center', justifyContent:'center', marginTop:10}}>
                <span style={{fontWeight:'bold', fontSize:14, color:'white'}}>Visualizar a senha:</span>
                {verSenha?
                    <FaEye onClick={() => setVerSenha(!verSenha)} color='white' size={22} style={{ cursor: 'pointer', marginLeft:5}} />
                  :

                  <FaEyeSlash onClick={() => setVerSenha(!verSenha)} color='white' size={22} style={{ cursor: 'pointer', marginLeft:5}} />
                }
                </div>

              <div className='loginInput'>
                <input className='loginInputFocus' type={'submit'} onClick={(e) => { e.preventDefault(); login(); }} style={{ cursor: 'pointer', fontSize: 25, backgroundColor: '#09BC8A', border: 'none', borderRadius: 20, height: 50, color: 'white' }} value="Login"></input>
              </div>
            </div>
            <span style={{ marginTop: 10, color: 'white' }}>Não tem uma conta?<span style={{ cursor: 'pointer', color: '#84ff04', marginLeft: 5 }} onClick={() => setIsSignUp(true)}>Registre-se</span></span>
            <span style={{ marginTop: 10, color: 'white' }}>Esqueceu a senha?<span style={{ cursor: 'pointer', color: '#84ff04', marginLeft: 5 }} onClick={() => setIsOpen(true)}>Resgatar a senha</span></span>
            <span style={{ position: 'absolute', bottom: 10, color: 'white' }}>Powered by <span style={{ fontWeight: 'bold' }}>Lucas Barboza</span></span>
          </form>
          :
          <form className='loginFormHeader'>
            <div className='titleContainer'>
              <h1>ASSISTENTE SUNDAY</h1>
            </div>
            <div className='profileImage'>
              <CgProfile color='white' size={128} />
            </div>
            <div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={'text'} value={user.name} onChange={(e) => { setUser({ ...user, name: e.target.value }) }} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Nome"></input>
              </div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={'text'} value={user.email} onChange={(e) => { setUser({ ...user, email: e.target.value }) }} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Email"></input>
              </div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={verSenha? 'text' : 'password' } value={user.password} onChange={(e) => { setUser({ ...user, password: e.target.value }) }} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Senha"></input>
              </div>

              <div className='loginInput'>
                <input className='loginInputFocus' type={verSenha? 'text' : 'password' } value={user.passwordConfirm} onChange={(e) => { setUser({ ...user, passwordConfirm: e.target.value }) }} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Confirmar Senha"></input>
              </div>

              <div style={{display:'flex', flexDirection:'row', alignContent:'center', justifyContent:'center', marginTop:10}}>
                <span style={{fontWeight:'bold', fontSize:14, color:'white'}}>Visualizar a senha:</span>
                {verSenha?
                    <FaEye onClick={() => setVerSenha(!verSenha)} color='white' size={22} style={{ cursor: 'pointer', marginLeft:5}} />
                  :

                  <FaEyeSlash onClick={() => setVerSenha(!verSenha)} color='white' size={22} style={{ cursor: 'pointer', marginLeft:5}} />
                }
                </div>
                
              <div className='loginInput'>
                <input className='loginInputFocus' type={'submit'} onClick={(e) => { e.preventDefault(); register(); }} style={{ fontSize: 25, backgroundColor: '#09BC8A', border: 'none', borderRadius: 20, height: 50, color: 'white', cursor: 'pointer' }} value="Register"></input>
              </div>
            </div>
            <span style={{ marginTop: 10, color: 'white' }}>Já tem uma conta ?<span style={{ cursor: 'pointer', color: '#84ff04', marginLeft: 5 }} onClick={() => setIsSignUp(false)}>Voltar</span></span>
            <span style={{ position: 'absolute', bottom: 10, color: 'white' }}>Powered by <span style={{ fontWeight: 'bold' }}>Lucas Barboza</span></span>
          </form>
        }
        <div className='sundayLoginHalf' style={{ backgroundImage: `url(${background})` }} />
      </div>
    </>
  );
}