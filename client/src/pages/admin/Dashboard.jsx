import React from "react";
import AdminLayout from "../../Components/layout/AdminLayout";
import { Box, Container, Paper, Skeleton, Stack, Typography } from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import moment from "moment";
import {
  SearchField,
  CurveButton,
} from "../../Components/style/StyledComponents";
import { matBlack } from "../../constants/color";
import { DoughnutChart, LineChart } from "../../Components/specific/Charts";
import { useFetchData } from "6pp";
import { server } from "../../constants/config";
import { LayoutLoader } from "../../Components/layout/Loaders";
import { useErrors } from "../../hooks/hook";

const Dashboard = () => {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/stats`,
    "dashboard-stats"
  );
  const { messages } = data || {};
  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);
  const Appbar = (
    <Paper
      elevation={3}
      sx={{ padding: "2rem", margin: "2rem 0", borderRadius: "1rem" }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />
        <SearchField placeholder="Search.." />
        <CurveButton>Search</CurveButton>
        <Box flexGrow={1} />
        <Typography
          display={{ xs: "none", lg: "block" }}
          color={"rgba(0,0,0,0.7)"}
          textAlign={"center"}
        >
          {moment().format("dddd,D MMMM YYYY")}
        </Typography>
        <NotificationIcon />
      </Stack>
    </Paper>
  );
  const widgets = (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing="2rem"
      justifyContent="space-between"
      alignItems="center"
      margin={"2rem 0"}
    >
      <Widgets
        title={"Users"}
        value={messages?.usersCount || 0}
        Icon={<PersonIcon />}
      />
      <Widgets
        title={"Chats"}
        value={messages?.totalChatsCount || 0}
        Icon={<GroupIcon />}
      />
      <Widgets
        title={"Messages"}
        value={messages?.messagesCount || 0}
        Icon={<MessageIcon />}
      />
    </Stack>
  );
  return loading ? (
    <LayoutLoader />
  ) : (
    <AdminLayout>
{
  loading?(<Skeleton height={"100vh"}/>):(      <Container component={"main"}>
    {Appbar}
    <Stack
      direction={{ xs: "column", lg: "row" }}
      sx={{ gap: "2rem" }}
      flexWrap={"wrap"}
      justifyContent={"center"}
      alignItems={{
        xs: "center",
        lg: "stretch",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "2rem 3.5rem",
          borderRadius: "1rem",
          width: "100%",
          maxWidth: "45rem",
          //   height: "25rem",
        }}
      >
        <Typography margin={"2rem"} variant="h4">
          Last Messages
        </Typography>
        <LineChart value={messages?.messagesChart || []} />
      </Paper>
      <Paper
        elevation={3}
        sx={{
          padding: "1rem",
          borderRadius: "1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: { xs: "100%", sm: "50%" },
          position: "relative",
          // width: "100%",
          maxWidth: "25rem",
        }}
      >
        <DoughnutChart
          labels={["Single chats", "Group Chats"]}
          value={[messages?.totalChatsCount - messages?.groupsCount || 0
            , messages?.groupsCount || 0
            ]}
        />
        <Stack
          position={"absolute"}
          direction={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={"0.5rem"}
          width={"100%"}
          height={"100%"}
        >
          <GroupIcon />
          <Typography>Vs</Typography>
          <PersonIcon />
        </Stack>
      </Paper>
    </Stack>
    {widgets}
  </Container>)
}
    </AdminLayout>
  );
};
const Widgets = ({ title, value, Icon }) => (
  <Paper
    elevation={3}
    sx={{
      padding: "2rem",
      margin: "2rem 0",
      borderRadius: "1.5rem",
      width: "20rem",
    }}
  >
    <Stack alignItems={"center"} spacing={"1rem"}>
      <Typography
        sx={{
          color: "rgba(0,0,0,0.7)",
          borderRadius: "50%",
          border: `5px solid ${matBlack}`,
          width: "5rem",
          height: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value}
      </Typography>
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        {Icon}
        <Typography>{title}</Typography>
      </Stack>
    </Stack>
  </Paper>
);

export default Dashboard;
