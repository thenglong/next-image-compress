"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * Convert BASE64 to BLOB
 * @param base64Image Pass Base64 image data to convert into the BLOB
 */
function convertBase64ToBlob(base64Image: string) {
  // Split into two parts
  const parts = base64Image.split(";base64,");

  // Hold the content type
  const imageType = parts[0].split(":")[1];

  // Decode Base64 string
  const decodedData = window.atob(parts[1]);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((previousFiles) => [...previousFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
    },
  });

  return (
    <main className="flex flex-col relative w-full">
      <section
        className="flex flex-col justify-center items-center max-w-full h-40 my-4 mx-auto w-[384px] rounded ring-2 ring-black"
        {...getRootProps()}>
        <i className="far fa-images"></i>
        <p className="text-xs font-extrabold">
          Drop your .png or .jpg files here!
        </p>
        <input type="hidden" {...getInputProps()} />
      </section>

      {files.length > 0 && (
        <section className="flex bg-white p-3 w-full my-4 mx-auto ring-2 max-w-[960px]">
          <ul className="w-full flex flex-col gap-2">
            {files.map((file, index) => (
              <ImageItem file={file} key={index} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

interface ImageItemProps {
  file: File;
}

const ImageItem = ({ file }: ImageItemProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<Blob>();
  useEffect(() => {
    const uploadImage = async () => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post("/api/compress-image", formData, {
        onUploadProgress: (event) => {
          const { loaded, total } = event;
          const percentage = Math.floor((loaded * 100) / total!);
          setUploadProgress(percentage);
        },
      });
      const blob = convertBase64ToBlob(data.base64);
      setResult(blob);
    };

    uploadImage();
  }, [file]);

  return (
    <li key={file.name} className="grid grid-cols-3 gap-3 items-center">
      <div key={file.name} className="flex items-center justify-between">
        <p className="overflow-hidden text-ellipsis font-extrabold whitespace-nowrap">
          {file.name}
        </p>
        <p className="text-yellow-700 text-xs min-w-[52px]">
          {getFileSizeString(file.size)}
        </p>
      </div>
      <progress
        className={`h-8 relative appearance-none w-full before:absolute before:mt-1 before:text-center before:block before:w-full before:content-['Finished']`}
        max={100}
        value={uploadProgress}
      />
      <div className="flex items-center">
        <p className="text-yellow-700 text-xs min-w-[52px]">
          {result?.size && getFileSizeString(result.size)}
        </p>
        <div className="flex w-full justify-between">
          <p className="">
            {result && (
              <a
                className="underline hover:text-blue-400 block ml-4"
                download={`compressed-${file.name}`}
                href={window.URL.createObjectURL(result)}>
                Download
              </a>
            )}
          </p>
          <p>
            {result &&
              `-${Math.round(getPercentSaved(file.size, result.size))}%`}
          </p>
        </div>
      </div>
    </li>
  );
};

const getFileSizeString = (filesize: number) => {
  const sizeInKB = filesize / 1024;
  const sizeInMB = sizeInKB / 1024;
  return sizeInKB > 1024
    ? `${sizeInMB.toFixed(1)} MB`
    : `${sizeInKB.toFixed(1)} KB`;
};

const getPercentSaved = (origFileSize: number, newFileSize: number) => {
  return ((origFileSize - newFileSize) / origFileSize) * 100;
};
