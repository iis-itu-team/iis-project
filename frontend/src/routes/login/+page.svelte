
<script>
    function loginButtonClick() {
        alert("Login button clicke!");
    }
</script>

<div class="bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center justify-center">
    <input type="text" placeholder="Enter your Username" name="uname" required>
</div>

<div class="bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center justify-center">
    <input type="password" placeholder="Enter your Password" name="pswd" required>
</div>

<div class="mx-auto  max-w-sm">
    <p><a href="/password_reset">Forgot your password?</a></p>
</div>

<div class="bg-primary  hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center justify-center">
    <button on:click={loginButtonClick} class="text-2xl " type="button"><p><b>Login</b><p/></button>
</div>

<div class="mx-auto mx-10 my-10 max-w-sm">
    <label><input type="checkbox" checked="checked" name="remember">Remember me</label>
    <p><a href="/register">Not registered yet? Create your acount here!</a></p>
</div>
