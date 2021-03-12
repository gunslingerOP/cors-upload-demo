
  

  
  self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved...");
   
    const channel = new BroadcastChannel('sw-messages');
    channel.postMessage(data);



    // self.clients.matchAll().then(client=>{
    //   clients.forEach(client=>{
    //     client.postMessage(data)
    //   })
    // })
    
    // self.registration.showNotification(data.title, {
    //   body: data.body,
    // });
  });
