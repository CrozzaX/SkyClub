/* eslint-disable react/prop-types */

import { Box, Chip, Grid, Modal, Typography } from "@mui/material";
import { Airports } from "../../data";
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import LensRoundedIcon from '@mui/icons-material/LensRounded';
import { secondsToHoursMinutes } from "../../functions";


function FlightDetailModal(props) {
    // Defensive check
    let open = props.open;
    let close = props.close;
    let flight = props.flight || {};

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        color: 'var(--dark)',
        borderRadius: '0.4em'
    };

    /* --------------------------- AIRLINE & CITY DATA -------------------------- */
    let airline = Array.isArray(flight.airlines) && flight.airlines.length > 0 ? flight.airlines[0] : "UNK";
    let departure = flight.cityCodeFrom || "N/A";
    let arrival = flight.cityCodeTo || "N/A";
    let departueCity = flight.cityFrom || "Unknown";
    let arrivalCity = flight.cityTo || "Unknown";
    let depAirport = ""
    let arrAirport = ""
    
    if (Array.isArray(Airports)) {
      for (let i = 0; i < Airports.length; i++) {
        if (Airports[i] && Airports[i].code === flight.flyFrom) {
          depAirport = Airports[i].name
        } 
        if (Airports[i] && Airports[i].code === flight.flyTo) {
          arrAirport = Airports[i].name
        }
      }
    }

  /* -------------------------- AIRCRAFT DATE & TIME -------------------------- */
  const formatDateTime = (dateStr) => {
    if (!dateStr) {
        console.warn("Missing date string in formatDateTime");
        return { time: "00:00", date: "DD/MM/YY" };
    }

    try {
        // Create date object and adjust for IST
        const utcDate = new Date(dateStr);
        if (isNaN(utcDate.getTime())) {
            console.error("Invalid date:", dateStr);
            return { time: "00:00", date: "DD/MM/YY" };
        }

        // Log raw date for debugging
        console.log("Processing date:", {
            input: dateStr,
            utcDate: utcDate.toISOString(),
            localString: utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        });

        // Format time in IST
        const time = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata'
        }).format(utcDate);

        // Format date as DD/MM/YY in IST
        const date = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            timeZone: 'Asia/Kolkata'
        }).format(utcDate);

        return { time, date };
    } catch (error) {
        console.error("Error formatting date/time:", error);
        return { time: "00:00", date: "DD/MM/YY" };
    }
};

// Parse departure and arrival times separately
const departureDateTime = formatDateTime(flight.local_departure);
const arrivalDateTime = formatDateTime(flight.local_arrival);

// Add debug logging
console.log("Flight timing details:", {
    duration: flight.duration?.total,
    departure: departureDateTime,
    arrival: arrivalDateTime,
    rawDeparture: flight.local_departure,
    rawArrival: flight.local_arrival
});

  /* ---------------------------- AIRCRAFT DETAILS ---------------------------- */
const getFlightNumber = () => {
    try {
        // Navigate through the nested structure
        const segmentData = flight.sector?.sectorSegments?.[0]?.segment;
        console.log("Full segment data:", segmentData);

        if (segmentData) {
            const flightCode = segmentData.code; // Direct access to code
            const carrierCode = segmentData.carrier?.code; // Access carrier code

            console.log("Flight number components:", {
                flightCode,
                carrierCode,
                segment: segmentData
            });

            if (flightCode && carrierCode) {
                return `${carrierCode} ${flightCode}`;
            }
        }

        return "N/A";
    } catch (error) {
        console.error("Error extracting flight number:", error);
        return "N/A";
    }
};

const flightNumber = getFlightNumber();
console.log("Final flight number:", flightNumber);

  // Safe access to nested properties
  const routes = Array.isArray(flight.route) ? flight.route : [];
    
  let luggage = flight.baglimit && flight.baglimit.hold_weight ? 
    flight.baglimit.hold_weight : 
    'N/A';
    
  let quality = flight.quality ? Math.trunc(flight.quality) : 'N/A';

  // Safe route processing
  let route = Array.isArray(flight.route) ? flight.route : [];
  let routeLength = route.length > 0 ? route.length - 1 : 0;
  var index = []
  for (let i = 0; i < routeLength; i++) {
      index.push(i);
  }

  return (
    <>
        <Modal
        open={open}
        onClose={close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
        <Grid container>
            <Grid item xs={12}><img src={`https://pics.avs.io/200/80/${airline}.svg`} alt="airlines" style={{width: '20%'}} /></Grid>
        </Grid>
        <Grid container spacing={1} sx={{ color: 'var(--dark)', mt:'2%'}}>
                <Grid item xs={8}>
                    <Typography variant="h6"><PanoramaFishEyeRoundedIcon sx={{fontSize: '1rem', color: 'var(--indigo)'}} /> {departueCity} ({departure})</Typography>
                    <Typography sx={{fontSize: '0.8rem', ml: 3, color: 'gray'}}>{depAirport}</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{fontWeight: '700'}}>{departureDateTime.time}</Typography>
                    <Typography sx={{color:'gray', fontSize: '0.8rem'}}>Departure</Typography>
                </Grid>


                <Grid item xs={8}>
                    <Typography variant="h6"><LensRoundedIcon sx={{fontSize: '1rem', color: 'var(--indigo)'}} /> {arrivalCity} ({arrival})</Typography>
                    <Typography sx={{fontSize: '0.8rem', ml: 3, color: 'gray'}}>{arrAirport}</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{fontWeight: '700'}}>{arrivalDateTime.time}</Typography>
                    <Typography sx={{color:'gray', fontSize: '0.8rem'}}>Arrival</Typography>
                </Grid>
            </Grid>

            {routeLength !== 0 ? 
                <Grid container sx={{mt:2, mb:1}}>
                    <Chip label="Stopovers at:" />
                    {index?.map((i) => {
                        if (!route[i] || !route[i+1] || !route[i].local_arrival || !route[i+1].local_departure) {
                            return <Chip key={i} className="stopover-label" label="No stopover details" sx={{ml: 1}} />;
                        }
                        let arrivalTime = new Date(route[i].local_arrival);
                        let departureTime = new Date(route[i+1].local_departure);
                        var diff = Math.abs(departureTime - arrivalTime);
                        return (<Chip key={i} className="stopover-label" label={`${route[i].cityTo || 'Unknown'} | ${secondsToHoursMinutes(diff/1000)}`} sx={{ml: 1}} />);
                    })}
                </Grid> 
            : <></>}

            <Grid container spacing={2} sx={{mt:1}}>
                <Grid item xs={4}>
                    <div style={{backgroundColor: '#f5f7fa', borderRadius: '0.4em', paddingInline: '5%', paddingBlock: '10%'}}>
                        <Typography sx={{fontSize: '0.8rem', color: 'gray'}}>Class Type</Typography>
                        <Typography sx={{ fontWeight: '700' }}>Economy</Typography>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div style={{backgroundColor: '#f5f7fa', borderRadius: '0.4em', paddingInline: '5%', paddingBlock: '10%'}}>
                        <Typography sx={{fontSize: '0.8rem', color: 'gray'}}>Flight Number</Typography>
                        <Typography sx={{ fontWeight: '700' }}>{flightNumber}</Typography>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div style={{backgroundColor: '#f5f7fa', borderRadius: '0.4em', paddingInline: '5%', paddingBlock: '10%'}}>
                        <Typography sx={{fontSize: '0.8rem', color: 'gray'}}>Luggage</Typography>
                        <Typography sx={{ fontWeight: '700' }}>{typeof luggage === 'number' ? `${luggage}kg` : luggage}</Typography>
                    </div>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{mt:1}}>
                <Grid item xs={4}>
                    <div style={{backgroundColor: '#f5f7fa', borderRadius: '0.4em', paddingInline: '5%', paddingBlock: '10%'}}>
                        <Typography sx={{fontSize: '0.8rem', color: 'gray'}}>Departure Date</Typography>
                        <Typography sx={{ fontWeight: '700' }}>{departureDateTime.date}</Typography>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div style={{backgroundColor: '#f5f7fa', borderRadius: '0.4em', paddingInline: '5%', paddingBlock: '10%'}}>
                        <Typography sx={{fontSize: '0.8rem', color: 'gray'}}>Arrival Date</Typography>
                        <Typography sx={{ fontWeight: '700' }}>{arrivalDateTime.date}</Typography>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div style={{backgroundColor: '#f5f7fa', borderRadius: '0.4em', paddingInline: '5%', paddingBlock: '10%'}}>
                        <Typography sx={{fontSize: '0.8rem', color: 'gray'}}>Flight Quality</Typography>
                        <Typography sx={{ fontWeight: '700' }}>{quality}</Typography>
                    </div>
                </Grid>
            </Grid>
        </Box>
        </Modal>
    </>
  )
}

export default FlightDetailModal;