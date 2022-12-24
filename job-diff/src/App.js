import axios from "axios";
import "./App.css";
import React from "react";
import Diffc from "./Diffc.js";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WorkIcon from "@mui/icons-material/Work";
import Stack from "@mui/material/Stack";

const App = () => {
  const [companies, setCompanies] = React.useState(null);
  const [fileContents, setFileContents] = React.useState(null);
  const [fileStats, setFileStats] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        await axios
          .get("https://horrible-falcon-29.telebit.io/folders/", {
            params: {
              offset: 0,
              limit: 4,
            },
          })
          .then((resp) => {
            setCompanies(resp.data);
          });
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    async function fetchFile() {
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
    }
    fetchFile();
  }, [setCompanies, companies]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box flexGrow={1}>
        <Stack px={3} py={1} direction="row" spacing={1} sx={{ color: "#0080FB"}}>
          <WorkIcon sx={{ fontSize: 34 }} />
          <Typography  variant="h4" component="h1">
            MarkMyDiff
          </Typography>
        </Stack>
        <div>
          {companies != null && fileContents != null && fileStats != null
            ? companies.map((company, i) => {
                return (
                  <div key={company.name}>
                    <Diffc
                      diffText={fileContents[i]}
                      title={company.name}
                      stat={fileStats[i]}
                    />
                  </div>
                );
              })
            : null}
        </div>
      </Box>
    </Box>
  );
};

export default App;
