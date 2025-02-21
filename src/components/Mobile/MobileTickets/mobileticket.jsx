import { useState } from 'react';
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import LensRoundedIcon from '@mui/icons-material/LensRounded';
import { Button, Chip, Container, Grid, Typography } from "@mui/material";
import { numberWithCommas, openInNewTab, secondsToHoursMinutes } from '../../../functions';
import MobileFlightDetails from '../MobileFlightDetails/mobileflightdetails';

function MobileTicket(props) {
    const { flight, index } = props;
    const [open, setOpen] = useState(false);
    
    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    /* --------------------------- AIRLINE & CITY DATA -------------------------- */
    const airline = Array.isArray(flight.airlines) && flight.airlines.length > 0 
        ? flight.airlines[0] 
        : "UNK";
    const departure = typeof flight.cityFrom === 'string' ? flight.cityFrom : 
        (flight.route && flight.route[0] && flight.route[0].cityFrom) || "Unknown Departure";
    const arrival = typeof flight.cityTo === 'string' ? flight.cityTo : 
        (flight.route && flight.route[flight.route.length-1] && flight.route[flight.route.length-1].cityTo) || "Unknown Arrival";
    
    /* ---------------------------- AIRCRAFT DETAILS ---------------------------- */
    const flightQuality = flight.quality ? Math.trunc(flight.quality) : 0;
    
    // Extract price
    const cost = (() => {
        if (typeof flight.price === 'number' && !isNaN(flight.price)) {
            return `₹${numberWithCommas(flight.price)}`;
        } else if (flight.conversion?.INR) {
            return `₹${numberWithCommas(flight.conversion.INR)}`;
        } else if (flight.price?.amount) {
            const amount = parseFloat(flight.price.amount);
            return !isNaN(amount) ? `₹${numberWithCommas(amount)}` : "Price not available";
        }
        return "Price not available";
    })();

    const route = Array.isArray(flight.route) && flight.route.length > 0 ? flight.route : [];
    const bookingLink = flight.deep_link || "#";

    /* -------------------------- AIRCRAFT DATE & TIME -------------------------- */
    const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    // Parse dates with timezone handling
    const parseDateSafely = (dateString) => {
        if (!dateString) {
            console.warn("Missing date string");
            return new Date();
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.error("Invalid date:", dateString);
                return new Date();
            }

            console.log("Parsed date:", {
                input: dateString,
                localTime: date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
                isoString: date.toISOString()
            });

            return date;
        } catch (e) {
            console.error("Date parsing error:", e);
            return new Date();
        }
    };

    // Format time in 24-hour format
    const formatTime = (date) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Kolkata'
            }).format(date);
        } catch (e) {
            console.error("Time formatting error:", e);
            return "00:00";
        }
    };

    const departureDateTime = parseDateSafely(flight.local_departure);
    const arrivalDateTime = parseDateSafely(flight.local_arrival);

    const departureTime = formatTime(departureDateTime);
    const arrivalTime = formatTime(arrivalDateTime);
    
    const departureDate = departureDateTime instanceof Date && !isNaN(departureDateTime)
        ? `${day[departureDateTime.getDay()]}, ${departureDateTime.getDate()} ${month[departureDateTime.getMonth()]}`
        : "Invalid Date";

    // Duration handling
    const duration = flight.duration?.total 
        ? secondsToHoursMinutes(flight.duration.total)
        : "Duration not available";

    /* --------------------------- CONDITION VARIABLES -------------------------- */
    const recommended = index === 0;
    const qualityLabel = flightQuality >= 130;
    const stopovers = route.length > 1 
        ? `${route.length - 1}-Stop${route.length > 2 ? 's' : ''}` 
        : 'Non-Stop';

    // Debug logging
    console.log("MobileTicket rendering with data:", {
        departure, arrival, departureTime, arrivalTime, departureDate,
        rawDeparture: flight.local_departure,
        parsedDeparture: departureDateTime,
        flightCity: flight.cityTo
    });

    return (
        <>
            <Container sx={{ 
                backgroundColor: '#FFF', 
                borderRadius: '0.5em', 
                mb: 5, 
                paddingInline: '5%', 
                paddingBlock: '4%' 
            }} className='shadow'>
                <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Grid item xs={8}>
                        <img 
                            src={`https://pics.avs.io/200/80/${airline}.svg`} 
                            alt={`${airline} airlines`} 
                            style={{ width: '60%' }} 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://pics.avs.io/200/80/XX.svg"; // Fallback image
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Chip 
                            sx={{ color: 'var(--dark)', fontWeight: '500', borderRadius: '0.4em' }} 
                            label={departureDate} 
                            size="small" 
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={1} sx={{ color: 'var(--dark)', mt: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Grid item xs={7}>
                        <Typography variant="h6">
                            <PanoramaFishEyeRoundedIcon sx={{ fontSize: '1rem', color: 'var(--indigo)' }} /> {departure} ({departureTime})
                        </Typography>
                        <div style={{ paddingLeft: '3%' }}>
                            <Typography sx={{ borderLeft: '1.5px dashed #cdd5d9', pl: 1, pt: 1, fontSize: '0.8rem', color: 'gray' }}>
                                {duration}
                            </Typography>
                            <Typography sx={{ borderLeft: '1.5px dashed #cdd5d9', pl: 1, pb: 1, fontSize: '0.8rem', color: 'gray' }}>
                                {stopovers}
                            </Typography>
                        </div>
                        <Typography variant="h6">
                            <LensRoundedIcon sx={{ fontSize: '1rem', color: 'var(--indigo)' }} /> {arrival} ({arrivalTime})
                        </Typography>
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: 'center', borderLeft: '1.2px solid var(--muted)' }}>
                        <Typography variant="h5" sx={{ fontWeight: '700', color: 'var(--green)' }}>
                            {cost}
                        </Typography>
                        <Button 
                            size="small" 
                            className="indigo-btn" 
                            sx={{ mt: 1, fontSize: '0.8rem', width: '60%' }} 
                            onClick={() => { openInNewTab(bookingLink) }}
                            disabled={bookingLink === "#"}
                        >
                            BOOK
                        </Button>
                    </Grid>
                    <Grid container sx={{ borderTop: '1.2px dashed var(--muted)', pt: 1, mt: 1 }}>
                        <Grid item xs={8}>
                            {recommended ? 
                                <Chip label="Recommended" className="recommended-label" size="small" /> : 
                                <Chip label="Economy" size="small" className="economy-labelMobile" />
                            } &nbsp;
                            {qualityLabel ? <Chip label="Premium" className="quality-label" size="small" /> : null}
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                            <Button onClick={toggleDrawer(true)} size="small" sx={{ fontSize: '0.7rem' }}>
                                View Details
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>

            <MobileFlightDetails open={open} toggle={toggleDrawer} flight={flight} />
        </>
    );
}

export default MobileTicket;