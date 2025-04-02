import { useEffect, useRef } from "react";
const UploadWidget = () => {
  const cloudinaryRef = useRef();
  useEffect(() =>{
    cloudinaryRef.current = window.cloudinary;
    console.log(cloudinaryRef.current);
  },[])
}
export default UploadWidget;