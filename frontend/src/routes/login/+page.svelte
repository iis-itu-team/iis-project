
<script>
    let username = ''
    let password = ''
    let message = ''
  
    const login = async () => {
      const response = await fetch('http://localhost:9000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        message = data.message
      } else {
        message = 'Invalid credentials'
      }

      alert(message);
      alert("Response is back!");
    }

  </script>

<form on:submit={login}>
    <label class="bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center">
        Enter your Username:
        <input type="text" bind:value={username} required/>
    </label>
  
    <label class="bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center">
        Password:
        <input type="password" bind:value={password} required/>
    </label>

    <div class="mx-auto  max-w-sm">
        <p><a href="/password_reset">Forgot your password?</a></p>
    </div>

    <button type="submit" class="bg-primary hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center">
        <p>
            <b>Log in</b>
        <p/>
    </button>

    <div class="mx-auto mx-10 my-10 max-w-sm">
        <label>
            <input type="checkbox" checked="unchecked" name="remember">Remember me
        </label>
        <p>
            <a href="/register">Not registered yet? Create your acount here!</a>
        </p>
    </div>

</form>