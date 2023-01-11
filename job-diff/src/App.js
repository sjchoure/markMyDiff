import axios from "axios";
import "./App.css";
import React from "react";
// import Diffc from "./Diffc.js";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import WorkIcon from "@mui/icons-material/Work";
// import Stack from "@mui/material/Stack";
// import CircularProgress from "@mui/material/CircularProgress";
// import Button from "@mui/material/Button";
// import ArticleIcon from "@mui/icons-material/Article";
// import Grid from "@mui/material/Grid";
// import Pagination from "@mui/material/Pagination";
// import Docs from "./Docs.js"
import Heatmap from "./Heatmap";
// import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import TypeaheadSearch from "./Typeahead";
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';

const App = () => {
  const theme = useTheme();
  const [companies, setCompanies] = React.useState(null);
  const [fileContents, setFileContents] = React.useState(null);
  const [fileStats, setFileStats] = React.useState(null);
  // const [showDocumentation, setShowDocumentation] = React.useState(false);

  const data1 = [];
  for (let i = 0; i < 25; i++) {
    data1[i] = [];
    for (let j = 0; j < 20; j++) {
      data1[i][j] = { value: Math.random(), x: i, y: j };
    }
  }

  const fetchData = React.useCallback(async () => {
    setCompanies(null);
    try {
      await axios
        .get("https://horrible-falcon-29.telebit.io/folders/", {
          params: {
            offset: 0,
            limit: 10,
          },
        })
        .then((resp) => {
          setCompanies(resp.data);
        });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchFile = React.useCallback(async () => {
    if (companies != null) {
      const requests = companies.map((company) =>
        axios.get(
          `https://horrible-falcon-29.telebit.io/results/${company.name}/diff`
        )
      );
      const responses = await Promise.all(requests);
      const temp = responses.map((response) => response.data);
      const data = await Promise.all(temp);
      setFileContents(data);

      const requestsStat = companies.map((company) =>
        axios.get("https://horrible-falcon-29.telebit.io/stats/", {
          params: { path: company.name },
        })
      );
      const responseStat = await Promise.all(requestsStat);
      const tempStat = responseStat.map((response) => response.data);
      const dataStat = await Promise.all(tempStat);
      setFileStats(dataStat);
    }
  }, [companies]);

  React.useEffect(() => {
    fetchData();
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "scroll");
  }, [fetchData]);

  React.useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  return (
    <Box>
      <CssBaseline />
      {/* <Paper
        sx={{
          p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, position: "fixed", left: 15, top: 10, [theme.breakpoints.down('md')]: {
            width: "calc(100% - 30px)",
          },
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}><TypeaheadSearch /></Box>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
          <MapIcon />
        </IconButton>
      </Paper> */}
      <Box sx={{ flexGrow: 1, height: "calc(100vh + 100px)" }}>
        <iframe title="helloJobs" src="https://www.google.com/maps/d/u/0/embed?mid=1YJ-4LUY0oqneBwS88XuYmYUY42p0-ug&ehbc=2E312F" width="100%" height="100%" frameborder="0"
          style={{ border: 0, marginTop: "-100px" }}></iframe>
      </Box>
    </Box >
  );
};

export default App;
