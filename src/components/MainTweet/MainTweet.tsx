import React, { useState, useEffect } from "react";
import TimelineTweet from "../TimelineTweet/TimelineTweet";

import axios from "axios";
import { AppProps } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import app from "../../firebase";

type HandleSubmitFunction = (
  e: React.FormEvent<HTMLFormElement>
) => Promise<void>;

const MainTweet = () => {
  const [tweetText, setTweetText] = useState<string>("");

  const { currentUser } = useSelector((state: AppProps) => state.user);


  const [img, setImg] = useState<File | null>(null);
  const [imgUploadProgress, setImgUploadProgress] = useState(0);
  const [imgUrl, setImgUrl] = useState<string>("");

  const dispatch = useDispatch();

  useEffect(() => {
    const uploadImg = (file: File) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot: {
          bytesTransferred: number;
          totalBytes: number;
          state: any;
        }) => {
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
          getDownloadURL(uploadTask.snapshot.ref).then(
            async (downloadURL: string) => {
              try {
                const updateProfile = await axios.put(
                  `${process.env.REACT_APP_BACKEND_URL}/users/${currentUser._id}`,
                  {
                    profilePicture: downloadURL,
                  }
                );

                console.log(updateProfile);
              } catch (error) {
                console.log(error);
              }

              console.log("downloaded " + downloadURL);
              setImgUrl(downloadURL);
              // dispatch(changeProfile(downloadURL));
            }
          );
        }
      );
    };

    img && uploadImg(img);
  }, [currentUser._id, dispatch, img]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImg(selectedFile);
    }
  };

  const handleSubmit: HandleSubmitFunction = async (e) => {
    e.preventDefault();
    try {
      const submitTweet = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/tweets`, {
        userId: currentUser._id,
        description: tweetText,
        imgUrl: imgUrl
      });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div>
      {currentUser && (
        <p className="font-bold pl-2 my-2">{currentUser.username}</p>
      )}

      <form onSubmit={handleSubmit} className="border-b-2 pb-6">
        <textarea
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setTweetText(e.target.value)
          }
          // type="text"
          placeholder="What's happening"
          maxLength={280}
          className="bg-slate-200 rounded-lg w-full p-2"
        ></textarea>
        {imgUploadProgress > 0 ? "Uploading " + imgUploadProgress + "%" : null}
        <input
          type="file"
          className="bg-transparent border border-slate-500 rounded p-2"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-full ml-auto"
        >
          Tweet
        </button>
      </form>
      <TimelineTweet />
    </div>
  );
};

export default MainTweet;
