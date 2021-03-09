import React, { useState } from 'react';
import axios from 'axios'

   export default function Home(props) {
   
  const getSignedURL = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("http://localhost:4000/v1/video")
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
  };
  const upload=()=>{

    getSignedURL().then(data => {
     doUpload(data.data.data.uploadUrl, data.data.data.authorizationToken, selectedFile)
    })
  }
  const doUpload = async(url, token, data)=>{
    console.log(url);
    const response = await axios({
      method:'post',
      url, 
      data,
      headers: {
        Authorization: token,
        'Content-Type': 'b2/x-auto',
        'X-Bz-File-Name': `some-folder/${selectedFile.name}`,
        'X-Bz-Content-Sha1': 'do_not_verify' // Yes, you probably should.
      },

      onUploadProgress: ({ loaded, total }) => {
        const totalProgress = parseInt((loaded / total) * 100)
        console.log(`${totalProgress}%`)
      }
    } )
    console.log( response )
  
  }
  
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
          <button onClick={upload}>Submit</button>
        </div>
      </div>
  );
  
  
  
  }
  

