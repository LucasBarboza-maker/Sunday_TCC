import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CgProfile } from "react-icons/cg"

import { env } from '../../helpers/envconfig';
import './login.css';
import { useParams } from 'react-router-dom';

import background from "../../images/SundayImage.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword({ history }) {
  const { userId } = useParams();

  const [resetPasswordData, setResetPasswordData] = useState({ id:userId, password: "", confirmPassword: "" });
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

  useEffect(() =>{

    console.log(userId);
  })

  async function resetPassword() {

    if (!validarResetPassword()) {
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetPasswordData)
    };
    const response = await fetch(`${env.APIURL}/v0/user/resetPassword`, requestOptions).then((e) => {

      if (e.status == 401) {
        notify("Senha inválida", "error");
      }

      return e
    })
    const data = await response.json()

    if (data.status === "success") {
      localStorage.setItem('user', JSON.stringify(data.data.user))
      navigate('/');
    }
  }


  function validarResetPassword() {

    return true;
  }

  document.body.style.overflow = 'hidden'

  return (
    <>
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
          <form className='loginFormHeader'>
            <div className='titleContainer'>
              <h1>ASSISTENTE SUNDAY</h1>
            </div>
            <div className='profileImage'>
              <CgProfile color='white' size={128} />
            </div>
            <div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={verSenha? 'text' : 'password' } onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })} value={resetPasswordData.password} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Senha"></input>
              </div>
              <div className='loginInput'>
                <input className='loginInputFocus' type={verSenha? 'text' : 'password' } onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })} value={resetPasswordData.confirmPassword} style={{ fontSize: 22, borderLeft: 0, borderTop: 0, borderRight: 0, borderBottom: 0, borderRadius: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' }} placeholder="Confirmar Senha"></input>
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
                <input className='loginInputFocus' type={'submit'} onClick={(e) => { e.preventDefault(); resetPassword(); }} style={{ cursor: 'pointer', fontSize: 25, backgroundColor: '#09BC8A', border: 'none', borderRadius: 20, height: 50, color: 'white' }} value="Alterar a Senha"></input>
              </div>
            </div>
            <span style={{ position: 'absolute', bottom: 10, color: 'white' }}>Powered by <span style={{ fontWeight: 'bold' }}>Lucas Barboza</span></span>
          </form>
        <div className='sundayLoginHalf' style={{ backgroundImage: `url(${background})` }} />
      </div>
    </>
  );
}