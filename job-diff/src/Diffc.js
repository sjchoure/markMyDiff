import { parseDiff, Diff, Hunk } from "react-diff-view";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import React from "react";
import "react-diff-view/style/index.css";
const randomCommitHash = () => Math.random().toString(36).slice(2, 9);

const Diffc = ({ diffText, title, stat }) => {
  const [expand, setExpand] = React.useState();
  const files = parseDiff(diffText.split("\n").join("\n"));
  // console.log(files);
  const renderFile = ({
    oldRevision = randomCommitHash(),
    newRevision = randomCommitHash(),
    type,
    hunks,
    newPath,
  }) => (
    <div key={oldRevision + "-" + newRevision}>
      <Diff
        gutterAnchor
        optimizeSelection
        viewType="split"
        diffType={type}
        hunks={hunks}
      >
        {(hunks: any[]) =>
          hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
        }
      </Diff>
    </div>
  );

  const dateTime = new Date(stat);

  return (
    <Container maxWidth={false} disableGutters={true}>
      <Box py={1}>
        <Card raised={true}>
          <CardHeader
            title={title}
            subheader={"Last Checked: " + dateTime.toLocaleString()}
          />
          {diffText ? (
            <>
              <CardActions>
                <Button onClick={() => setExpand(!expand)}>
                  {expand ? (
                    <>
                      <Typography>Hide Result</Typography>
                      <KeyboardArrowUpIcon />
                    </>
                  ) : (
                    <>
                      <Typography>Show Result</Typography>
                      <KeyboardArrowDownIcon />
                    </>
                  )}
                </Button>
              </CardActions>
              <Collapse in={expand}>
                <CardContent>{files.map(renderFile)}</CardContent>
              </Collapse>
            </>
          ) : (
            <CardContent>No Change</CardContent>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default Diffc;
