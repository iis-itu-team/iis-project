
<script>
    let password = ''
    let nickname = ''
    let email = ''
    let message = ''
  
    const register = async () => {
        try {
            const response = await fetch('http://127.0.0.1:9000/api/v1/register', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname, password, email}),
            })
            const data = await response.json()
            alert(data.message)
        } catch (error) {
            console.error('An error occurred:', error)
            alert('An error occurred. Please check the console for details.')
        }
    }
</script>

<form on:submit={register}>
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Choose a uniqe nickname:</p>
        <input type="text" class="text-input" placeholder="Enter your Username" name="nickname" required>
    </div>
    
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Create a password:</p>
        <input type="password" class="text-input" placeholder="Enter your Password" name="password" required>
    </div>
    
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Verify password:</p>
        <input type="password" class="text-input" placeholder="Enter your Password again" name="password" required>
    </div>    
    
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Write your email:</p>
        <input type="email" class="text-input" placeholder="Enter your Email" name="email" required>
    </div>
    
    <div class="bg-secondary rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm">
        <p>Verify email:</p>
        <input type="email" class="text-input" placeholder="Enter your Email again" name="email" required>
    </div>
    
    <div class="bg-primary  hover:bg-secondary box-border rounded-xl p-6 mx-auto mx-10 my-10 max-w-sm flex items-center justify-center">
        <button type="submit" class="text-2xl">
            <p><b>Register</b><p/>
        </button>
    </div>
    
    <div class="mx-auto mx-10 my-10 max-w-sm">
        <p><a href="/login">Already have a account? Login here!</a></p>
    </div>    
</form>
