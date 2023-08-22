import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { changeProfile, logout } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { AppProps } from "../../types";
import { ReadStream } from 'fs';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import app from "../../firebase";

type EditProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditProfile = ({ setOpen }: EditProps) => {
  const { currentUser } = useSelector((state: AppProps) => state.user);

  const [img, setImg] = useState<File | null>(null);
  const [imgUploadProgress, setImgUploadProgress] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const deleteProfile = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/users/${currentUser._id}`);
    dispatch(logout());
    navigate("/signin");
  };

  useEffect(() => {
    const uploadImg = (file: File) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot: { bytesTransferred: number; totalBytes: number; state: any; }) => {
  
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImgUploadProgress(Math.round(progress));
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        () => {},
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL: string) => {
            try {
              const updateProfile = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/users/${currentUser._id}`, {
                profilePicture: downloadURL,
              });
  
              console.log(updateProfile);
            } catch (error) {
              console.log(error);
            }
  
            console.log("downloaded " + downloadURL);
            dispatch(changeProfile(downloadURL));
          });
        }
      );
    };
  
        img && uploadImg(img);
      }, [currentUser._id, dispatch, img]);

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]; // Use optional chaining to access files
        if (selectedFile) {
          setImg(selectedFile);
        }
      };

  return (
    <div className="absolute w-full h-full top-0 left-0 bg-transparent flex items-center justify-center">
      <div className="w-[600px] h-[600px] bg-slate-200 rounded-lg p-8 flex flex-col gap-4 relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 cursor-pointer"
        >
          X
        </button>
        <h2 className="font-bold text-xl">Edit Profile</h2>
        <p>Choose a new profile picture</p>
        {imgUploadProgress > 0 ? (
          "Uploading " + imgUploadProgress + "%"
        ) : (
          <input
            type="file"
            className="bg-transparent border border-slate-500 rounded p-2"
            accept="image/*"
            onChange={handleFileChange}
          />
        )}

        <p>Delete Account</p>
        <button
          className="bg-red-500 text-white py-2 rounded-full"
          onClick={handleDelete}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default EditProfile;