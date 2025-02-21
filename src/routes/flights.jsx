import axios from 'axios';
import { Alert, Container, Grid, Snackbar, Typography } from "@mui/material";
import { useState } from "react";
import { ResultBox, FlightDeal, MobileSearchContainer, MobileResultBox, MobileResultDeals, FlightSearchContainer, MobileFlightNotFound, Filler } from "../components";
import './css/flights.css';
import MobileTicket from "../components/Mobile/MobileTickets/mobileticket";
import { tabTitle } from '../functions';

function Flights() {
  tabTitle('Flights | SkyClub India')

  const [isLoaded, setIsLoaded] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);

  const [flightData, setFlightData] = useState([]);
  const [index, setIndex] = useState([]);
  const [dep, setDep] = useState('');
  const [arr, setArr] = useState('');
  const [params, setParams] = useState({
    date_from: '',
    date_to: '',
  });

  // Add trip type state
  const [tripType, setTripType] = useState('one-way'); // Add this with other state declarations

 // Improved date formatting for API requests
 const formatDateForApi = (dateString) => {
  if (!dateString) return null;

  try {
    // Handle DD/MM/YY format
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      let fullYear = year.length === 2 ? `20${year}` : year;
      
      // Validate parts are numbers
      if (isNaN(parseInt(day)) || isNaN(parseInt(month)) || isNaN(parseInt(fullYear))) {
        console.error("Invalid date parts:", day, month, fullYear);
        return null;
      }
      
      // Ensure parts are padded with leading zeros
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      
      // Use UTC to avoid timezone issues
      return `${fullYear}-${paddedMonth}-${paddedDay}T00:00:00Z`;
    }
    
    // If it's already in ISO format, return as is
    if (dateString.includes('T') && dateString.includes('-')) {
      return dateString;
    }
    
    // Attempt to parse as Date object and format
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0] + 'T00:00:00';
    }
    
    // Fallback
    console.error("Could not parse date string:", dateString);
    return null;
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return null;
  }
};
  
  // Configure the RapidAPI endpoint - single implementation
  const getRapidApiConfig = () => {
    if (!dep?.code || !arr?.code) {
      console.error("Missing departure or arrival code");
      return null;
    }

    try {
      // Parse dates
      const formatDateForAPI = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      const fromDate = formatDateForAPI(params.date_from);
      const toDate = formatDateForAPI(params.date_to);

      console.log("Dates for API:", { fromDate, toDate });

      const config = {
        method: 'GET',
        url: 'https://kiwi-com-cheap-flights.p.rapidapi.com/one-way', // Updated endpoint
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_REACT_APP_RAPIDAPI_KEY, // Take API key only from .env
          'X-RapidAPI-Host': 'kiwi-com-cheap-flights.p.rapidapi.com'
        },
        params: {
          source: `airport:${dep.code}`,
          destination: `airport:${arr.code}`,
          outboundDepartmentDateStart: `${fromDate}T00:00:00`,
          outboundDepartmentDateEnd: `${toDate}T23:59:59`,
          currency: "INR",
          locale: "en",
          adults: "1",
          children: "0",
          infants: "0",
          handbags: "1",
          holdbags: "0",
          cabinClass: "ECONOMY",
          sortBy: "PRICE",
          sortOrder: "ASCENDING",
          transportTypes: "FLIGHT",
          limit: "50",  // Increased from 20 to 50
          page: "1"     // Added pagination support
        }
      };

      console.log("API Request Config:", config);
      return config;
    } catch (error) {
      console.error("Error creating API config:", error);
      return null;
    }
  };

// In extractFlightData function in flights.jsx
// Add better error logging and more robust data extraction

const extractFlightData = (apiResponse) => {
  if (!apiResponse?.itineraries) {
    console.error("Invalid API response:", apiResponse);
    return [];
  }

  return apiResponse.itineraries.map((flight, index) => {
    try {
      const sector = flight.sector;
      const segment = sector.sectorSegments[0].segment;

      // Extract source and destination times
      const source = segment.source;
      const destination = segment.destination;

      // Get station details
      const sourceStation = source.station;
      const destinationStation = destination.station;

      // Extract price information
      const priceAmount = (() => {
        if (flight.price?.amount) {
          return parseFloat(flight.price.amount);
        }
        if (typeof flight.price === 'number') {
          return flight.price;
        }
        console.warn("No valid price found for flight:", flight);
        return 0;
      })();

      console.log("Price extraction:", {
        rawPrice: flight.price,
        extracted: priceAmount
      });

      // Extract flight number properly
      const flightNumber = (() => {
        const carrier = segment.carrier?.code || segment.marketingCarrier?.code;
        const number = segment.number;
        if (carrier && number) {
          return `${carrier} ${number}`;
        }
        console.warn("Missing flight number data:", segment);
        return "Flight number unavailable";
      })();

      console.log("Flight number data:", {
        segment,
        carrier: segment.carrier,
        marketingCarrier: segment.marketingCarrier,
        number: segment.number,
        extracted: flightNumber
      });

      // Extract all required data
      const flightData = {
        id: `${index}-${flight.legacyId || Date.now()}`,
        cityFrom: sourceStation.city.name,
        cityTo: destinationStation.city.name,
        cityCodeFrom: sourceStation.code,
        cityCodeTo: destinationStation.code,
        local_departure: source.localTime || source.utcTime,
        local_arrival: destination.localTime || destination.utcTime,
        price: priceAmount,
        conversion: { INR: priceAmount },
        airlines: [segment.carrier?.code || 'UNK'],
        route: [{
          airline: segment.carrier?.code || segment.marketingCarrier?.code || 'UNK',
          flight_no: flightNumber,
          local_departure: source.localTime || source.utcTime,
          local_arrival: destination.localTime || destination.utcTime,
          cityFrom: sourceStation.city.name,
          cityTo: destinationStation.city.name,
          fare_category: segment.cabinClass || 'M'
        }],
        quality: flight.quality || Math.floor(Math.random() * 50) + 50,
        flyFrom: sourceStation.code,
        flyTo: destinationStation.code,
        baglimit: { 
          hold_weight: flight.bagsInfo?.includedCheckedBags || 15 
        },
        duration: { 
          total: segment.duration || sector.duration || 7200
        },
        deep_link: flight.bookingOptions?.edges?.[0]?.node?.bookingUrl || '#'
      };

      console.log("Processed flight data:", flightData);
      return flightData;

    } catch (error) {
      console.error("Error processing flight:", error, flight);
      return null;
    }
  }).filter(flight => flight !== null);
};

// Add validation before API call
const fetchData = async () => {
  try {
    setButtonLoading(true);
    setError(false);

    // Better validation with helpful error messages
    if (!dep) {
      throw { message: "Please select a departure city/airport", response: { status: 422 } };
    }
    if (!arr) {
      throw { message: "Please select an arrival city/airport", response: { status: 422 } };
    }
    if (!params.date_from) {
      throw { message: "Please select a departure date", response: { status: 422 } };
    }
    if (!params.date_to) {
      throw { message: "Please select a return date", response: { status: 422 } };
    }

    const formattedDateFrom = formatDateForApi(params.date_from);
    const formattedDateTo = formatDateForApi(params.date_to);
    
    if (!formattedDateFrom || !formattedDateTo) {
      throw { message: "Invalid date format. Please use DD/MM/YY format.", response: { status: 400 } };
    }

    // Log the parsed dates for debugging
    console.log("Formatted dates for API:", {
      original: { from: params.date_from, to: params.date_to },
      formatted: { from: formattedDateFrom, to: formattedDateTo }
    });

      const rapidApiConfig = getRapidApiConfig();
      if (!rapidApiConfig) {
        throw { message: "Invalid search parameters", response: { status: 400 } };
      }
      
      const response = await axios.request(rapidApiConfig);
      
      // Updated validation
      if (!response.data || !response.data.itineraries) {
        throw new Error("Invalid API response structure");
      }
  
      if (response.data.itineraries.length === 0) {
        setFlightData([]);
        setIndex([]);
        setIsLoaded(true);
        setError(true);
        setErrorMessage({ message: "No flights available for this route and date combination." });
        return;
      }
  
      console.log("Raw API response:", response.data);
      console.log("API Request Params:", rapidApiConfig.params);
  
      // Extract formatted flight data using our new parser
      const formattedData = extractFlightData(response.data);
  
      // Handle case where API returns no results
      if (!formattedData.length) {
        console.warn("No flights found.");
        setFlightData([]);
        setIndex([]);
        setIsLoaded(true);
        setError(true);
        setErrorMessage({ message: "No flights available for this route and date." });
        return;
      }
  
      setFlightData(formattedData);
      setIndex(Array.from({ length: formattedData.length }, (_, i) => i));
      setButtonLoading(false);
      setIsLoaded(true);
      setError(false);
      console.log("Formatted flight data:", formattedData);
      console.log("First flight item details:", formattedData[0]);
    } 
    catch (error) {
      setButtonLoading(false);
      setIsLoaded(false);
      setError(true);
      setErrorMessage(error?.response?.data?.message || error.message || "An unknown error occurred");
      console.error("API Error:", error);
    }
  };

  const handleDepChange = (e, v, r) => {
    if (r === "selectOption") {
      setDep(v);
    }
  }

  const handleArrChange = (e, v, r) => {
    if (r === "selectOption") {
      setArr(v);
    }
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setParams((prev) => {
      return {...prev, [name]: value};
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  }

  // Add trip type handler
  const handleTripTypeChange = (event) => {
    setTripType(event.target.value);
  };

  return (
    <>
      <section style={{ padding: '1%' }}>
        <Container className="search-container" sx={{ display: {xs:'none', md:'block'}}}>
          <Container fixed className="search-wrapper" sx={{ mt: 0, pr: 2, pl: 2 }}>
            <form onSubmit={handleSubmit}>   
              <FlightSearchContainer 
                buttonLoading={buttonLoading} 
                change={handleChange}
                depChange={handleDepChange}
                arrChange={handleArrChange}
              />
            </form>
          </Container>
        </Container>
      </section>

      { error ?
        <Snackbar open={true} autoHideDuration={5000} >
          <Alert severity="error" sx={{ width: '100%' }}>
            {errorMessage.response?.status === 400 ? 'The dates entered are absurd.' : 
             errorMessage.response?.status === 422 ? 'Please fill in all required fields.' :
             `${errorMessage.message}`}
          </Alert>
        </Snackbar>
      :
      <></>
      }


      { isLoaded ? 
          <section style={{display: {xs: 'block', md: 'none'}}}>
            <Container sx={{pt:2, pb:2, pl:4, pr:4, display: {xs: 'block', md: 'none'} }}>
              {flightData.length !== 0 ? 
                <MobileResultBox flight={flightData} depChange={handleDepChange} arrChange={handleArrChange} handleChange={handleChange} loadStatus={setIsLoaded} /> 
                :
                <></>
              }
              
            </Container>

            {flightData.length !== 0 ? 
                <Container sx={{ marginTop: '7%', backgroundColor: '#f5f7fa', display: {xs: 'block', md: 'none'}, pb:1 }}>
                    {flightData.length !== 0 ? <MobileResultDeals flight={flightData} /> : <></>}
                    <div style={{marginTop: '5%'}}>
                      {index?.map((i) => {
                            if (flightData.length === 0) {
                              return (<h1 key={i}>No flights found</h1>)
                            } else {
                              var flight = flightData[i]
                              return (<MobileTicket key={i} flight={flight} index={i} />) 
                            }
                      })}
                    </div>
                </Container> 
            :<MobileFlightNotFound />}

          </section>
        : 
          <section style={{ paddingInline: '5%' }}>
            <Container fixed sx={{ display:{xs:'block', md: 'none'}, bgcolor:'var(--gray2)', borderRadius:'0.4em', px:2, py:1, mt:2}}>
              <Typography variant="h6">Search Flights</Typography>
            </Container>
            <Container fixed sx={{ display:{xs:'block', md: 'none'}, backgroundColor: 'var(--text)', padding: '4%', borderRadius: '0.5em', mt:1 }}>
              <form onSubmit={handleSubmit}>
                <MobileSearchContainer depChange={handleDepChange} arrChange={handleArrChange} handleChange={handleChange} />
              </form>
            </Container>
          </section>
      }  

      <section>
        <Container fixed>
          { isLoaded ? 
            <>
              <Grid container sx={{mt:2, display: {xs:'none', md:'flex'}}}>
                  <Grid item xs={8} sx={{paddingInline: '5%', paddingBlock: '2%'}}>
                    {index?.map((i) => {
                      if (flightData.length === 0) {
                        return (<h1 key={i}>No flights found</h1>)
                      } else {
                        var flight = flightData[i]
                        return (<FlightDeal key={i} index={i} flight={flight} />)
                      }
                    })}
                  </Grid>
                  <Grid item xs={4}>
                    {flightData.length === 0 ? <></> : <ResultBox flight={flightData} index={index} />}
                  </Grid>
              </Grid>

              <Container sx={{display: {xs:'block', md:'none'}}}>

              </Container>
            </>
          :
          <>
            <Filler />
          </>
          }
        </Container>
      </section>
    </>
  )
}

export default Flights;