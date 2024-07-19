import React, { useState } from "react";
import {
  Avatar,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Face as FaceIcon,
  AlternateEmail as UserNameIcon,
  CalendarMonth as CalendarIcon,
  Edit as EditIcon,
  Done as DoneIcon,
  CameraAlt as CameraAltIcon,
} from "@mui/icons-material";
import moment from "moment";
import { transformImage } from "../../lib/features";
import { useRenameUserDataMutation } from "../../redux/api/api";
import toast from "react-hot-toast";
import { useAsyncMutation } from "../../hooks/hook";

const Profile = ({ user: initialUser }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState(initialUser);
  
  
  const [bio, setBio] = useState(user?.bio || "");
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [selectedImage, setSelectedImage] = useState(null);

  const [updateUser, isLoadingUpdateUser] = useAsyncMutation(useRenameUserDataMutation);

  const handleEdit = async () => {
    if (isEdit) {
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("name", name);
      formData.append("username", username);
      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }
      try {
        await updateUser("Updating Profile...", formData);
        setUser((prevUser) => ({
          ...prevUser,
          bio,
          name,
          username,
          avatar: selectedImage ? selectedImage : user.avatar,
        }));
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update profile");
      }
    }
    setIsEdit(!isEdit);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
      {isEdit ? (
        <IconButton
          sx={{
            color: "white",
            marginLeft: "",
            border: "3px solid white",
          }}
          onClick={handleEdit}
        >
          <DoneIcon />
        </IconButton>
      ) : (
        <IconButton
          sx={{
            color: "white",
            marginLeft: "",
            border: "3px solid white",
          }}
          onClick={() => setIsEdit(true)}
        >
          <EditIcon />
        </IconButton>
      )}
      <Stack position="relative">
        <Avatar
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : transformImage(user?.avatar?.url)
          }
          sx={{
            width: 200,
            height: 200,
            objectFit: "contain",
            marginBottom: "1rem",
            border: "5px solid white",
          }}
        />
        {isEdit && (
          <IconButton
            sx={{
              position: "absolute",
              bottom: "0",
              right: "0",
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              ":hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
            component="label"
          >
            <CameraAltIcon />
            <input type="file" hidden onChange={handleFileChange} />
          </IconButton>
        )}
      </Stack>
      {isEdit ? (
        <>
          <TextField
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            sx={{
              width: "100%",
              border: "2px solid white",
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
            InputProps={{
              endAdornment: <EditIcon sx={{ color: "white" }} />,
            }}
          />
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              width: "100%",
              border: "2px solid white",
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
            InputProps={{
              endAdornment: <FaceIcon sx={{ color: "white" }} />,
            }}
          />
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              width: "100%",
              border: "2px solid white",
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
            InputProps={{
              endAdornment: <UserNameIcon sx={{ color: "white" }} />,
            }}
          />
        </>
      ) : (
        <>
          <ProfilCard heading={"Bio"} text={user?.bio} />
          <ProfilCard
            heading={"Username"}
            text={user?.username}
            Icon={<UserNameIcon />}
          />
          <ProfilCard heading={"Name"} text={user?.name} Icon={<FaceIcon />} />
          <ProfilCard
            heading={"Joined"}
            text={moment(user?.createdAt).fromNow()}
            Icon={<CalendarIcon />}
          />
        </>
      )}
    </Stack>
  );
};

const ProfilCard = ({ text, Icon, heading }) => (
  <Stack
    direction={"row"}
    alignItems={"center"}
    spacing={"1rem"}
    color={"white"}
    textAlign={"center"}
  >
    {Icon && Icon}

    <Stack>
      <Typography variant="body1">{text}</Typography>
      <Typography color={"gray"} variant="caption">
        {heading}
      </Typography>
    </Stack>
  </Stack>
);

export default Profile;
