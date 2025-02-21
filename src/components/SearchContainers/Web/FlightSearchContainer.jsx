/* eslint-disable react/prop-types */

import { CircularProgress, Grid, IconButton, Tooltip, FormControl, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import AutoComplete from "../../SearchFields/AutoComplete/autocomplete";
import DateField from "../../SearchFields/DateField/datefield";
import SearchRounded from "@mui/icons-material/SearchRounded";

function FlightSearchContainer(props) {
  return (
    <>
        <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', mt:0 }}>
              <Grid item xs={12}>
                <FormControl>
                  <RadioGroup
                    row
                    name="trip-type"
                    value={props.tripType}
                    onChange={props.onTripTypeChange}
                  >
                    <FormControlLabel value="one-way" control={<Radio />} label="One Way" />
                    <FormControlLabel value="round-trip" control={<Radio />} label="Round Trip" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <AutoComplete key="departure" type="Departure" changeType={props.depChange} />
              </Grid>
              <Grid item xs={3}>
                <AutoComplete key="arrival" type="Arrival" changeType={props.arrChange} />
              </Grid>
              <Grid item xs={2}>
                <DateField label="Search From" changeType={props.change} name="date_from" />
              </Grid>
              <Grid item xs={2}>
                <DateField 
                  label={props.tripType === 'round-trip' ? "Return Date" : "Search To"} 
                  changeType={props.change} 
                  name="date_to"
                  disabled={props.tripType === 'one-way'}
                />
              </Grid>
              <Grid item xs={1} sx={{ textAlign: 'center' }}>
                { 
                  props.buttonLoading ? (<IconButton disabled size="small"><CircularProgress sx={{ fontSize: '1rem', color: 'var(--indigo)' }} /></IconButton>)
                :
                  (<Tooltip title="Search Flights"><IconButton size="large" type="submit" className="indigo-btn"><SearchRounded /></IconButton></Tooltip>)
                }
              </Grid>
        </Grid>
    </>
  )
}

export default FlightSearchContainer;