const errorMessage = document.getElementsByClassName("error")[0];

document.getElementById("login-form").addEventListener("submit", async (e)=> {
    e.preventDefault();
    console.log(e.target.children.user.value)

    const res = await fetch("http://localhost:8000/api/login",{
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
            user: e.target.children.user.value, 
            password: e.target.children.password.value,
            tasks: []
        })
    });
    if(!res.ok) return errorMessage.classList.toggle("hidden", false);
    const resJson = await res.json();
    if(resJson.redirect){
        window.location.href = resJson.redirect;
    }
})