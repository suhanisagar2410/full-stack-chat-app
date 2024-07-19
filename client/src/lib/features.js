import moment from "moment";

const fileFormate = (url = "") => {
  const fileExtention = url.split(".").pop();
  if (
    fileExtention === "mp4" ||
    fileExtention === "webm" ||
    fileExtention === "ogg"
  )
    return "video";

    if (
      fileExtention === "png" ||
      fileExtention === "jpg" ||
      fileExtention === "jpeg" ||
      fileExtention === "gif"
    )
      return "image";
  if (fileExtention === "mp3" || fileExtention === "wav") return "audio";


 return "file";
};
const transformImage = (url = "", width = 100) => {
  const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);
  return newUrl;
};
const getLast7Days = () => {
  const currentDate = moment();
  const last7days = [];
  for (let i = 0; i < 7; i++) {
    // last7days.unshift(currentDate.clone().subtract(i, 'days').format('MMM D'))
    const dayDate = currentDate.clone().subtract(i, "days");
    const dayName = dayDate.format("MMM D");
    last7days.unshift(dayName);
  }
  return last7days;
};
const getOrSaveFromStorage = ({ key, value, get }) => {
  if (get)
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : null;
  else localStorage.setItem(key, JSON.stringify(value));
};
export { fileFormate, transformImage, getLast7Days, getOrSaveFromStorage };
