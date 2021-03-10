import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";
var hash = require('object-hash');
export default function Home(props) {
  const getUrl = () => {
    return new Promise((resolve, reject) => {
      axios
        .post('https://videoback.herokuapp.com/v1/video')
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          reject(err);
        });
    });
  };
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
            }
     else{
       console.log(result);
        setDownloadUrl(result.data)
      }})
    
  };

  const upload = () => {
    getUrl().then((data) => {
      doUpload(
        data.data.data.uploadUrl,
        data.data.data.authorizationToken,
        selectedFile
      )
    });
  };
  const doUpload = async (url, token, data) => {
 console.log(selectedFile.size);
 console.log(data);
 axios(      
      {
      method: "post",
      data,
      url,
      headers: {
        Authorization: token,
        "X-Bz-File-Name": selectedFile.name,
        "Content-Type": "b2/x-auto",
        "X-Bz-Content-Sha1": hash(selectedFile,{algorithm:"sha1"}),


      },

      onUploadProgress: ({ loaded, total }) => {
        const totalProgress = parseInt((loaded / total) * 100);
        console.log(`${totalProgress}%`);
      },
    }).then((response) => {
      console.log(response);
      console.log('reached here');
      getDownloadUrl(response.data.bucketId, response.data.fileId);
    }).catch((err)=>{
 
      console.log(JSON.stringify(err));
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
