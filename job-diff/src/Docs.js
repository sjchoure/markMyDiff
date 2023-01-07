import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

function Docs() {
  const markdown = `# Career's Page Differential  
  This app uses Spark Cluster to fetch job postings from Tech Companies sorted by date and queried for _Software Engineer_
  using the official career's API.    
  The worker nodes will create a seperate file for the api's response and store it. For each response, it 
  finds the difference between current and previous response, helping in finding what changed, like new openings or
  closed positions.    
  The backend is developed in Golang and hosted in ECSS Lab behind a private secured NAT network. Tunneling is used to expose the 
  backend API resulting in *~200ms* latency.
  `;

  return (
    <Paper>
      <Card>
        <CardContent>
          <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
        </CardContent>
      </Card>
    </Paper>
  );
}

export default Docs;
