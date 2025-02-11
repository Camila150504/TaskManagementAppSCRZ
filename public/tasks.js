document.querySelector(".add-task-btn")?.addEventListener("click", ()=>{
    window.location.href = "/addTask";
})



document.querySelector(".edit-task-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pathSegments = window.location.pathname.split("/"); 
  const id = pathSegments[pathSegments.length - 1]; 
  console.log(id);


  const res = await fetch(`http://localhost:8000/api/editTask/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ///Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      title: e.target.elements.title.value,
      description: e.target.elements.description.value,
      priority: e.target.elements.priority.value,
      dueDate: e.target.elements.dueDate.value,
      status: e.target.elements.status.value,
    }),
  });

  const resJson = await res.json();
  if (resJson.status === "ok") {
    console.log('se está entrando')
    window.location.href = resJson.redirect;
  } else {
    console.error(resJson.message);
  }
});

document.querySelector(".task-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const res = await fetch("http://localhost:8000/api/addTasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ///Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title: e.target.elements.title.value,
        description: e.target.elements.description.value,
        priority: e.target.elements.priority.value,
        dueDate: e.target.elements.dueDate.value,
      }),
    });
  
    const resJson = await res.json();
    if (resJson.status === "ok") {
      console.log('se está entrando')
      window.location.href = resJson.redirect;
    } else {
      console.error(resJson.message);
    }
  });