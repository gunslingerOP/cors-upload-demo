
  

  
  
  
  self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved...");
    console.log(data.body);
    self.registration.showNotification(data.title, {
      body: data.body,
    });
  });
