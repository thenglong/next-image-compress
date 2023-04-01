import axios from "axios";

const IMAGE_COMPRESSOR_ENDPOINT = process.env.IMAGE_COMRPESSOR_API_BASE_URL;

export const compressImage = async (formData: FormData) => {
  const res = await axios.post(
    `${IMAGE_COMPRESSOR_ENDPOINT}/api/v1/compress-one?min=20&max=60`,
    formData,
    {
      headers: {
        accept: "application/json",
      },
    }
  );
  return res.data;
};
