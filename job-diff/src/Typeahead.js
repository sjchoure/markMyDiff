import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from "@mui/material/TextField"
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import Box from "@mui/material/Box";
import { Typography } from '@mui/material';

function TypeaheadSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        const debouncedSearch = () => {
            fetch(`https://horrible-falcon-29.telebit.io/search/?q=${searchTerm}`)
                .then((response) => response.json())
                .then((results) => { if (results != null) { setSearchResults(results) } else { setSearchResults([]) } });
        }

        if (searchTerm.length < 2) {
            setSearchResults([])
            return;
        }
        debouncedSearch()
    }, [searchTerm])

    return (
        <Autocomplete
            noOptionsText="No results"
            selectOnFocus
            clearOnBlur
            options={searchResults}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography>Search Heatmap</Typography>
                        </Box>
                    }
                    variant="outlined"
                    sx={{
                        "& fieldset": { border: 'none' },
                    }}
                    size="small"
                />
            )}
            onInputChange={(event, value) => setSearchTerm(value)}
            freeSolo
        />
    );
}

export default TypeaheadSearch;
