/* eslint-disable react/prop-types */

import { Button, Chip, Grid, Typography, Tooltip } from "@mui/material";
import { numberWithCommas, openInNewTab, secondsToHoursMinutes } from "../../functions";
import FlightDetailModal from "../FlightDetailModal/flightdetailmodal";
import { useState } from "react";

function FlightDeal(props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  let flight = props.flight;
  let index = props.index;

  /* --------------------------- AIRLINE & CITY DATA -------------------------- */
  let airline = Array.isArray(flight.airlines) && flight.airlines.length > 0 ? flight.airlines[0] : "UNK";
  let departure = flight.cityCodeFrom || "N/A";
  let arrival = flight.cityCodeTo || "N/A";
  let departureCity = flight.cityFrom || "Unknown City";
  let arrivalCity = flight.cityTo || "Unknown City";

  /* ---------------------------- AIRCRAFT DETAILS ---------------------------- */
  let flightQuality = flight.quality ? Math.trunc(flight.quality) : 0;
  
  // Improved price extraction
  const extractPrice = () => {
    if (typeof flight.price === 'number' && !isNaN(flight.price)) {
      return flight.price;
    }
    if (flight.price?.amount) {
      const parsed = parseFloat(flight.price.amount);
      if (!isNaN(parsed)) return parsed;
    }
    if (flight.conversion?.INR) {
      return flight.conversion.INR;
    }
    console.warn("Could not extract price for flight:", flight);
    return null;
  };

  const formatPrice = (price) => {
    if (price === null) return "Price not available";
    return `₹${numberWithCommas(price)}`;
  };

  const price = extractPrice();
  const displayPrice = formatPrice(price);

  // Ensure route is valid
  let route = Array.isArray(flight.route) && flight.route.length > 0 ? flight.route : [{ fare_category: "M" }];
  let cabin = (route[0] && route[0].fare_category) ? route[0].fare_category : "M";
  let bookingLink = flight.deep_link || "#";

  /* -------------------------- AIRCRAFT DATE & TIME -------------------------- */
  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Parse dates with better error handling
  const parseDateSafely = (dateString) => {
    if (!dateString) {
      console.warn("Missing date string");
      return new Date();
    }
    
    try {
      // Parse the ISO string and convert to Indian time
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return new Date();
      }

      // Log for debugging
      console.log("Parsing date:", {
        input: dateString,
        parsedLocal: date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        isoString: date.toISOString()
      });

      return date;
    } catch (e) {
      console.error("Date parsing error:", e);
      return new Date();
    }
  };

  // Format time with proper timezone handling
  const formatTime = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn("Invalid date for time formatting:", date);
        return "00:00";
      }
      
      // Use local time formatting with explicit options
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata' // Use Indian timezone explicitly
      }).format(date);
    } catch (e) {
      console.error("Time formatting error:", e);
      return "00:00";
    }
  };

  // Parse dates from flight data
  const departureDateTime = parseDateSafely(flight.local_departure);
  const arrivalDateTime = parseDateSafely(flight.local_arrival);

  // Format times
  const departureTime = formatTime(departureDateTime);
  const arrivalTime = formatTime(arrivalDateTime);
  
  // Format date with better error handling
  const departureDate = (() => {
    if (!(departureDateTime instanceof Date) || isNaN(departureDateTime.getTime())) {
      return "Invalid Date";
    }
    
    // Format date in Indian timezone
    const options = { 
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(departureDateTime);
  })();

  // Safe duration handling
  let duration = "N/A";
  if (flight.duration && typeof flight.duration.total === 'number') {
    duration = secondsToHoursMinutes(flight.duration.total);
  }

  /* ------------------------- CONDITION VARIABLES ------------------------ */
  // Remove the old declarations since we'll use getCabinInfo instead
  let recommended = false;
  let qualityLabel = false;
  let stopovers = '';

  /* ------------------------------- CONDITIONS ------------------------------- */
  const getCabinInfo = () => {
    // Get cabin class from segment data
    const segment = flight.route?.[0] || {};
    const fareCategory = segment.fare_category || 'M';
    
    // Default to economy
    if (!fareCategory || fareCategory === 'M' || fareCategory === 'W') {
      return {
        label: 'Economy',
        style: 'economy-label'
      };
    }
    
    // Business class
    if (fareCategory === 'C') {
      return {
        label: 'Business',
        style: 'upgrade-label'
      };
    }
    
    // First class
    if (fareCategory === 'F') {
      return {
        label: 'First Class',
        style: 'upgrade-label'
      };
    }
    
    // Fallback to economy
    return {
      label: 'Economy',
      style: 'economy-label'
    };
  };

  // Rename destructured variables to avoid conflict
  const { label: cabinLabel, style: cabinStyle } = getCabinInfo();
  const isRecommended = index === 0;
  const isPremiumQuality = flightQuality >= 130;
  const stopoverText = route.length > 1 
    ? `${route.length - 1} Stop${route.length > 2 ? 's' : ''}` 
    : 'Non-stop';

  return (
    <> 
    <div style={{ backgroundColor: 'var(--text)', paddingInline: '2%', paddingTop: '4%', paddingBottom: '2%', borderRadius: '0.8em', marginBottom: '7%' }}>
          <Grid container sx={{ paddingInline: '2%' }}>
            <Grid item xs={6}>
              <img src={`https://pics.avs.io/200/80/${airline}.svg`} alt="airlines" style={{width: '40%'}} />
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              {isRecommended ? (<Tooltip title="Cheapest Flight"><Chip label="Recommended" className="recommended-label" size="small" /></Tooltip>) : <></> } 
              {isPremiumQuality ? (<>&nbsp; <Tooltip title="Flight Quality more than 130"><Chip label="Premium Flying" className="quality-label" size="small" /></Tooltip></>) : <></> }
          
            </Grid>
          </Grid>

          <Grid container sx={{ color: 'var(--dark)', mt:4, textAlign: 'center', borderBottomLeftRadius: '50%', justifyContent: 'center', alignItems: 'center' }}>
            <Grid item xs={3}>
              <Typography>{departureCity}</Typography>
              <Typography variant="h5" sx={{ fontWeight: '700' }}>{departure}</Typography>
              <Typography>{departureTime}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography>{departureDate}</Typography>
              <Typography sx={{ borderTop: '2px dashed #c4c4c4', marginBlock: '2%' }}></Typography>
              <Typography>{duration}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography>{arrivalCity}</Typography>
              <Typography variant="h5" sx={{ fontWeight: '700' }}>{arrival}</Typography>
              <Typography>{arrivalTime}</Typography> 
            </Grid>
            <Grid item xs={3} sx={{ borderLeft: '1.5px solid var(--muted)' }}>
              <Typography variant="h5" sx={{ fontWeight: '700', color: '#19a096' }}>
                {displayPrice}
              </Typography> 
              <Button 
                className='indigo-btn' 
                sx={{mt:1, width:'60%'}} 
                onClick={() => {openInNewTab(bookingLink)}}
                disabled={!price} // Disable if no valid price
              >
                BOOK
              </Button>
            </Grid>
          </Grid>

          <Grid container sx={{ mt: 2, borderTop: '1.2px dashed var(--muted)', paddingTop: '2%', borderWidth: '0.12rem', color: 'var(--dark)' }}>
            <Grid item xs={8}>
              <Chip 
                label={cabinLabel} 
                className={cabinStyle} 
                sx={{ mr: 1 }}
              />
              <Chip label={stopoverText} />
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Button sx={{textTransform: 'none'}} onClick={handleOpen}>&nbsp;View Details</Button>
            </Grid>

            <div>
            <FlightDetailModal open={open} close={handleClose} flight={flight} />
            </div>
            
          </Grid>
        </div>
        
    </>
  )
}

export default FlightDeal;