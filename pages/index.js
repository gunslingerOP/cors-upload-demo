import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";

export default function Home(props) {
  const getUrl = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("http://localhost:4000/v1/video")
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState();
  const getDownloadUrl = (bucketId, fileId) => {
    const urlApi = (data, callback) => {
      fetch("http://localhost:4000/v1/video/url", {
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
    console.log(data);
    let formData = new FormData();
    formData.append(selectedFile.name, data);
    console.log(formData);
    axios({
      url,
      method: "POST",
      data,
      headers: {
        Authorization: token,
        "X-Bz-File-Name": "file",
        "Content-Type": "b2/x-auto",
        "X-Bz-Content-Sha1": "do_not_verify",
      },

      onUploadProgress: ({ loaded, total }) => {
        const totalProgress = parseInt((loaded / total) * 100);
        console.log(`${totalProgress}%`);
      },
    }).then((response) => {
      console.log(response);
      getDownloadUrl(response.data.bucketId, response.data.fileId);
    });
  };

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
            lastModifiedDate:{" "}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>
          <a href={downloadUrl}>Download your uploaded file!</a>
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
