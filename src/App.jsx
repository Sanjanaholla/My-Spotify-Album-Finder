import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react"; // for sound icons

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true); // default playing

  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });

    // Autoplay music
    const audio = document.getElementById("bg-music");
    if (audio) {
      audio.volume = 0.5; // not too loud
      audio.play().catch(() => {
        console.log("Autoplay blocked by browser, user must interact first.");
      });
    }
  }, []);

  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => data.artists.items[0]?.id);

    if (!artistID) return;

    await fetch(
      "https://api.spotify.com/v1/artists/" +
        artistID +
        "/albums?include_groups=album&market=US&limit=50",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        setAlbums(data.items);
      });
  }

  function toggleMusic() {
    const audio = document.getElementById("bg-music");
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  return (
    <>
      {/* Background Music */}
      <audio id="bg-music" loop autoPlay>
        <source src="/SwanLake.mp3" type="audio/mp3" />
      </audio>

      {/* Sound Toggle Icon - bottom right */}
      <div
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "40px",
          right: "60px",
          cursor: "pointer",
          background: "#1DB954",
          padding: "18px",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >

        {isPlaying ? (
          <Volume2 size={30} color="black" fill="black" />
        ) : (
          <VolumeX size={30} color="black" fill="black" />
        )}
      </div>

      {/* Header with Logo */}
      <Container style={{ textAlign: "center", marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
            fontFamily: "'Rock Salt', cursive",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
            alt="Spotify Logo"
            style={{ width: "60px", marginRight: "10px" }}
          />
          <h1 style={{ color: "#1DB954", fontWeight: "bold" }}>
            Spotify Album Finder
          </h1>
        </div>
        <p
  style={{
    color: "#b3b3b3",
    fontSize: "18px",
    fontFamily: "'Lobster', cursive",
  }}
>
  Find. Play. Groove.
</p>
      </Container>

      {/* Shimeji Character (GIF) */}
      <img
  src="/shimeji.png"
  alt="Shimeji Character"
  style={{
    position: "absolute",
    middle: "500px",
    right: "400px",
    width: "150px",
    height: "150px",
    marginLeft: "80px",
    marginTop: "-40px",
    zIndex: 500,
    pointerEvents: "none", // so it doesn't block clicks
  }}
/>


      {/* Search Section */}
      <Container className="search-box">
        <InputGroup className="justify-content-center">
          <FormControl
            placeholder="Who’s on your playlist today?"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") search();
            }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              width: "350px",
              height: "40px",
              borderRadius: "20px",
              marginRight: "10px",
              paddingLeft: "15px",
              border: "2px solid #1DB954",
            }}
          />
          <Button
            onClick={search}
            style={{ backgroundColor: "#1DB954", border: "none" }}
          >
            Search
          </Button>
        </InputGroup>
      </Container>

      {/* Results Section */}
      <Container>
        <h2
  style={{
    color: "#1DB954",
    marginTop: "40px",
    marginBottom: "15px",
    fontFamily: "'Rock Salt', cursive", // rock-style heading
    fontSize: "2rem",
  }}
>
  {albums.length > 0 ? "Albums Found" : "Start Your Search 🎶"}
</h2>
<p
  style={{
    color: "#b3b3b3",
    marginBottom: "50px",
    fontFamily: "'Lobster', cursive", // aesthetic paragraph font
    fontSize: "1.1rem",
  }}
>
  {albums.length > 0
    ? "Click on an album to listen on Spotify."
    : "Every album has a story. Discover it."}
</p>


        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {albums.map((album) => (
            <Card
              key={album.id}
              style={{
                backgroundColor: "#282828",
                borderRadius: "12px",
                margin: "15px",
                width: "220px",
                color: "white",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              className="album-card"
            >
              <Card.Img
                variant="top"
                src={album.images[0]?.url}
                style={{
                  borderRadius: "12px 12px 0 0",
                  height: "220px",
                  objectFit: "cover",
                }}
              />
              <Card.Body>
                <Card.Title
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    minHeight: "50px",
                  }}
                >
                  {album.name}
                </Card.Title>
                <Card.Text style={{ color: "#b3b3b3" }}>
                  Release Date: {album.release_date}
                </Card.Text>
                <Button
                  href={album.external_urls.spotify}
                  target="_blank"
                  style={{
                    backgroundColor: "#2bde6aff",
                    border: "none",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                >
                  Open in Spotify
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;
