/* eslint-disable react/prop-types */
import { Button, Chip, Container, Typography, Box } from "@mui/material";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Airports } from "../../data";
import { numberWithCommas } from "../../functions";

function ResultBox(props) {
  let flight = props.flight;
  let index = props.index;

  // Safely get first and last flight
  const getFirstFlight = () => {
    return Array.isArray(flight) && flight.length > 0 ? flight[0] : {};
  };
  
  const getLastFlight = () => {
    return Array.isArray(flight) && flight.length > 0 ? flight[flight.length - 1] : {};
  };

  const firstFlight = getFirstFlight();
  const lastFlight = getLastFlight();

  // Safely extract required fields
  let departure = firstFlight?.cityCodeFrom || "N/A";
  let arrival = firstFlight?.cityCodeTo || "N/A";
  
  // Improved price extraction
  const extractPrice = (flightData) => {
    if (!flightData) return null;
    
    if (typeof flightData.price === 'number' && !isNaN(flightData.price)) {
      return flightData.price;
    }
    if (flightData.price?.amount) {
      const parsed = parseFloat(flightData.price.amount);
      if (!isNaN(parsed)) return parsed;
    }
    if (flightData.conversion?.INR) {
      return flightData.conversion.INR;
    }
    return null;
  };

  const formatPrice = (price) => {
    if (price === null) return "N/A";
    return numberWithCommas(price);
  };

  const startPrice = extractPrice(firstFlight);
  const endPrice = extractPrice(lastFlight);
  
  let depCity = firstFlight?.cityFrom || "Unknown City";
  let arrCity = lastFlight?.cityTo || "Unknown City";

  let depAirport = "";
  let arrAirport = "";
  
  // Safe airport lookup
  if (Array.isArray(Airports)) {
    for (let i = 0; i < Airports.length; i++) {
      if (Airports[i].code === firstFlight?.flyFrom) {
        depAirport = Airports[i].name;
      }
      if (Airports[i].code === firstFlight?.flyTo) {
        arrAirport = Airports[i].name;
      }
    }
  }

  // If airports weren't found, provide fallbacks
  if (!depAirport) depAirport = `${depCity} Airport`;
  if (!arrAirport) arrAirport = `${arrCity} Airport`;

  return (
    <>
      <Container sx={{ mt: 2, paddingBlock: '5%', borderRadius: '0.4rem', position: 'sticky', top: 20, bottom: 20 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: '800' }}>
          {departure} <CompareArrowsIcon /> {arrival}
        </Typography>
        <Typography sx={{ textAlign: 'center', mt: 1, borderBottom: '1.5px solid var(--gray)', pb: 2 }}>
          {index.length} Flights Found
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          <Chip label="Departure City" className="upgrade-label" size="small" />
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>{depCity}</Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip label="Airport" className="upgrade-label" size="small" />
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>{depAirport}</Typography>

        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          <Chip label="Arrival City" className="upgrade-label" size="small" />
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>{arrCity}</Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip label="Airport" className="upgrade-label" size="small" />
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>{arrAirport}</Typography>

        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          <Chip label="Price Range" className="economy-label" size="small" />
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>
          ₹{formatPrice(startPrice)} - ₹{formatPrice(endPrice)}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip label="Fare Category" className="economy-label" size="small" />
        </Box>
        <Typography variant="body1" sx={{ mt: 1 }}>Economy</Typography>

        <Button sx={{ mt: 10 }} onClick={() => { window.location.href = "#" }} className='indigo-btn' fullWidth>
          Scroll To Top
        </Button>
      </Container>
    </>
  );
}

export default ResultBox;