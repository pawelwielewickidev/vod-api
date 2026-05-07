import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CustomPlayer from './CustomPlayer'; // Twój odtwarzacz

function WatchPage() {
    const { id } = useParams();
    const [videoData, setVideoData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Uderzamy do endpointu, który przed chwilą zrobiliśmy

        const fetchVideoLink = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/watch/${id}`);
                if (!response.ok) throw new Error(`Server responded with ${response.status}`);
                const data = await response.json();
                setVideoData(data); // data powinna mieć { url: "...", type: "iframe" lub "mp4" }
            } catch (error) {
                console.error("Błąd pobierania linku:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoLink();
    }, [id]);

    if (isLoading) return <div>Ładowanie odtwarzacza...</div>;
    if (!videoData) return <div>Nie znaleziono wideo.</div>;

    return (
        <div className="watch-page-container">
            {videoData.type === 'iframe' ? (
                /* Jeśli to link z Shindena (iframe) */
                <iframe 
                    src={videoData.url} 
                    width="100%" 
                    height="600px" 
                    frameBorder="0" 
                    allowFullScreen
                    title="External Video Player"
                />
            ) : (
                /* Jeśli to czysty plik MP4, używamy Twojego CustomPlayera */
                <CustomPlayer videoUrl={videoData.url} />
            )}
        </div>
    );
}

export default WatchPage;