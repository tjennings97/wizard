import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import wizardLogo from './assets/wizard-logo-big.svg'
import wizardLogoSmall from './assets/wizard-logo-small.svg'
import './Login.css'

function handleChange(e) {
  console.log(e.target.value)
}

function LoginForm() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <form>
        <div className="input-form">
          <input placeholder="Email" required autoComplete="email" onChange={e => setEmail(e.target.value)}/>
        </div>
        <div className="input-form">
          <input placeholder="Password" required autoComplete="current-password" onChange={e => setPassword(e.target.value)}/>
        </div>
        <button className="submit-button" type="submit">Login</button>
      </form>
    </>
  )
}

function Login() {

  return (
    <>
      <div>
        <img src={wizardLogo} className="logo" alt="Wizard logo" />
      </div>
      <div className="login-page">
        Welcome
        <LoginForm />
        <p className="forgot-password">
          Forgot password?
        </p>
      </div>
    </>
  )
}

export default Login
