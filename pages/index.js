import React, { useState } from "react";
import axios from "axios";
// import service from "../public/sw"
import { useEffect } from "react";
import { message } from "antd";
export default function Home() {
  const getUrl = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("https://videoback.herokuapp.com/v1/video")
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          reject(err);
        });
    });
  };
  const publicVapidKey =
    "BEEOxYg_W-_JH53EKi46_jI6iUnLMq8fKQgeClerSt6HAWGxv_FtinrLXRQgwGFcWvSA31S71NCUoEjo9vZufMQ";
  if (typeof window !== "undefined") {
    console.log("works!");
    // Check for service worker
    if ("serviceWorker" in navigator) {
      send().catch(err => console.error(err));
    }

    // Register SW, Register Push, Send Push
    async function send() {
      // Register Service Worker
      console.log("Registering service worker...");
      const register = await navigator.serviceWorker.register(
        "/sw.js",
        {
          scope: "/",
        }
      );
      console.log("Service Worker Registered...");

      // Register Push
      console.log("Registering Push...");
     console.log(urlBase64ToUint8Array(publicVapidKey))
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      console.log("Push Registered...");

      // Send Push Notification
      console.log("Sending Push...");
      await fetch("http://localhost:5000/v1/sub", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "content-type": "application/json",
        },
      }).then((res)=>{
        console.log(JSON.stringify(res));
      })
      console.log("Push Sent...");
    }

    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  }
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState();
  const getDownloadUrl = (bucketId, fileId) => {
    const urlApi = (data, callback) => {
      fetch("https://videoback.herokuapp.com/v1/video/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((resp) => resp.json())
        .then((result) => callback(null, result))
        .catch((err) => callback(err, null));
    };

    urlApi({ bucketId, fileId }, (err, result) => {
      if (err) throw err;
      if (!result.status) {
        Object.keys(result.errMsg).forEach((key) => {
          message.error(result.errMsg[key]);
        });
      } else {
        console.log(result);
        setDownloadUrl(result.data);
      }
    });
  };

  const upload = () => {
    getUrl().then((data) => {
      doUpload(
        data.data.data.uploadUrl,
        data.data.data.authorizationToken,
        selectedFile
      );
    });
  };
  const doUpload = async (url, token, data) => {
    console.log(selectedFile.size);
    console.log(data);

    let fileName = data.name.replace(/\s+/g, "");
    axios({
      method: "post",
      data,
      url,
      headers: {
        Authorization: token,
        "X-Bz-File-Name": fileName,
        "Content-Type": "b2/x-auto",
        "X-Bz-Content-Sha1": "do_not_verify",
      },

      onUploadProgress: ({ loaded, total }) => {
        const totalProgress = parseInt((loaded / total) * 100);
        console.log(`${totalProgress}%`);
      },
    })
      .then((response) => {
        getDownloadUrl(response.data.bucketId, response.data.fileId);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data);
        } else {
          console.log(error);
        }
      });
  };

  const changeHandler = (event) => {
    console.log(event.target);
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };
  return (
    <div>
      <input type="file" name="file" onChange={changeHandler} />
      {isSelected ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
          <p>Filetype: {selectedFile.type}</p>
          <p>Size in bytes: {selectedFile.size}</p>
          <p>
            lastModifiedDate:{" "}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>
          <a href={downloadUrl}>{downloadUrl}</a>
        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <div>
        <button onClick={upload}>Submit</button>
      </div>
    </div>
  );
}

// export default function Home() {
//   console.log("server work");
//   return <h1>with-service-worker</h1>;
// }
