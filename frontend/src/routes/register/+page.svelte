
<script>
    function registerButtonClick() {
        alert("Register button clicke!");
    }
</script>

<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
    <p>Choose a username:</p>
    <input type="text" placeholder="Enter your Username" name="uname" required>
</div>

<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
    <p>Create a password:</p>
    <input type="password" placeholder="Enter your Password" name="pswd" required>
</div>

<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
    <p>Verify password:</p>
    <input type="password" placeholder="Enter your Password again" name="pswd" required>
</div>    

<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
    <p>Write your email:</p>
    <input type="email" placeholder="Enter your Email" name="email" required>
</div>

<div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
    <p>Verify email:</p>
    <input type="email" placeholder="Enter your Email again" name="email" required>
</div>

<div class="bg-primary  hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center justify-center">
    <button on:click={registerButtonClick} class="text-2xl " type="button"><p><b>Register</b><p/></button>
</div>

<div class="mx-auto mx-10 my-10 max-w-sm">
    <p><a href="/login">Already have a account? Login here!</a></p>
</div>
