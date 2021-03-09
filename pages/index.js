import React, { useState } from 'react';
const axios = require('axios');

   export default function Home(props) {
  const getSignedURL = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("https://videoback.herokuapp.com/v1/video")
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    });
  };
  
  const uploadMediaToS3 = () => {
    const config = {
      onUploadProgress: function(progressEvent) {
        var percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(percentCompleted);
      }
    };
  
    let fd = new FormData();
    fd.append("file", selectedFile);
    getSignedURL().then(data => {
      axios
        .put(data.data.data.urls[0], fd, config)
        .then(res => console.log("Upload Completed", res))
        .catch(err => console.log( err));
    });
  };
  
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);
  
  const changeHandler = (event) => {
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
              lastModifiedDate:{' '}
              {selectedFile.lastModifiedDate.toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p>Select a file to show details</p>
        )}
        <div>
          <button onClick={uploadMediaToS3}>Submit</button>
        </div>
      </div>
  );
  
  
  
  }
  

