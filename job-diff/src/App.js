import axios from "axios";
import "./App.css";
import React from "react";
import Diffc from "./Diffc.js";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WorkIcon from "@mui/icons-material/Work";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import ArticleIcon from "@mui/icons-material/Article";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Docs from "./Docs.js"
import Heatmap from "./Heatmap";

const App = () => {
  const [companies, setCompanies] = React.useState(null);
  const [fileContents, setFileContents] = React.useState(null);
  const [fileStats, setFileStats] = React.useState(null);
  const [showDocumentation, setShowDocumentation] = React.useState(false);

  const data1 = [];
  for (let i = 0; i < 25; i++) {
    data1[i] = [];
    for (let j = 0; j < 20; j++) {
      data1[i][j] = { value: Math.random(), x: i, y: j };
    }
  }

  const fetchData = React.useCallback(async () => {
    setCompanies(null)
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
  }, [fetchData]);

  React.useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box>
        <Heatmap />
        
      </Box>
    </Box >
  );
};

export default App;
