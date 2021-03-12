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
          if (error.response) {
            console.log(error.response.data);
          } else {
            console.log(error);
          }
          reject(err);
        });
    });
  };
  const publicVapidKey =
    "BEEOxYg_W-_JH53EKi46_jI6iUnLMq8fKQgeClerSt6HAWGxv_FtinrLXRQgwGFcWvSA31S71NCUoEjo9vZufMQ"; //for local

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
  // const publicVapidKey = "BLnxu898MlJVXsa98LYClFhxkyPUnyRu0W19Z9HvXDtDUSecWgLEGfGTfirNYXDJRTma7k07c-fnQZZEO2Ydpgo" //herkou
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState();
  const [text, setText] = useState();
  const [doRequest, setdoRequest] = useState(false);
  const [fileId, setFileId] = useState();
  const [fileName, setFileName] = useState();
  const [bucketId, setBucketId] = useState();
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    let url;
    let token;
    if (busy)
      return alert("YOU ARE ALREADY UPLOADING SOMETHING YOU GREEDY FUCK");
    console.log(`Size of the file: ${selectedFile.size}`);

    await getUrl().then((data) => {
      (url = data.data.data.uploadUrl),
        (token = data.data.data.authorizationToken);
    });

    let fileName = selectedFile.name.replace(/\s+/g, "");
    let data = selectedFile;
    setBusy(true);
    axios({
      method: "post",
      data,
      url,
      headers: {
        Authorization: token,
        "Content-Type": selectedFile.type,
        "X-Bz-File-Name": fileName,
        "X-Bz-Content-Sha1": "do_not_verify",
      },

      onUploadProgress: ({ loaded, total }) => {
        const totalProgress = parseInt((loaded / total) * 100);
        console.log(`${totalProgress}%`);
        setProgress(totalProgress);
      },
    })
      .then((response) => {
        console.log("reaches here");
        setBucketId(response.data.bucketId);
        setFileId(response.data.fileId);
        setFileName(response.data.fileName);
        setdoRequest(true);
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
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for service worker
      if ("serviceWorker" in navigator) {
        if (doRequest) {
          console.log(fileId, fileName);
          //registers service worker
          console.log("Registering service worker...");
          navigator.serviceWorker
            .register("/sw.js", {
              scope: "/",
            })
            .then((data) => {
              console.log("Service Worker Registered...");
              send(data).catch((err) => console.error(err));
            });

          async function send(register) {
            // Register Push
            let publicKey = urlBase64ToUint8Array(publicVapidKey);
            const subscription = await register.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: publicKey,
            });

            let bodyObj = { subscription, bucketId, fileId, fileName };
            let url = "http://localhost:5000/v1/video/process";
            // Send Push Notification
            console.log("Sending Push...");
            await fetch(url, {
              method: "POST",
              body: JSON.stringify(bodyObj),
              headers: {
                "content-type": "application/json",
              },
            }).then((res) => {
              console.log(res.json());
            });
            console.log(`Push Sent to ${url}`);
            const channel = new BroadcastChannel("sw-messages");
            channel.addEventListener("message", async (event) => {
              setText("Processing complete and files are ready for download!");
              setBusy(false);
              console.log("event data", event.data, typeof event.data);
              setDownloadUrls(event.data);
              console.log(downloadUrls);
            });
          }
        }
        setdoRequest(false);
      }
    }
  }, [doRequest]);

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
          <p>{text}</p>
          <p>{progress + `%`}</p>

          <p>
            {downloadUrls
              ? downloadUrls.map((el, index) => <p>{` ${index})  ${el}`}</p>)
              : null}
          </p>
        </div>
      ) : (
        <>
          <p>Select a file to show details</p>
        </>
      )}
      <div>
        <button onClick={upload}>Submit</button>
      </div>
    </div>
  );
}
