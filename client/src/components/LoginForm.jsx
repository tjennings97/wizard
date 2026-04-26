import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userLogin } from '../services/users'

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    setError(false)
    e.preventDefault();
    // Handle login logic here, like calling an API
    console.log('Logging in with:', { username, password });

    try {
      const data = await userLogin(username, password);
      if (data.status !== 200) {
        throw { error: data.data.error }
      }
      login(data.data)

    } catch (err) {
      console.error(err);
      setError(true)
    }

  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <h2>Login</h2>
      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" style={{ marginTop: '10px' }}>Sign In</button>
      {(error) && <>There was an error signing in.</> }

    </form>
  );
}

export default LoginForm;
