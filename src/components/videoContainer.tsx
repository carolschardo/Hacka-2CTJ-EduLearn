import { useState, useRef, useEffect } from 'react';
import { Button, Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import VideoList from './videoList';
import instance from '../services/supabase';

interface Video {
    id_video: number;
    nome_video: string;
    video_url: string;
    comentario: string;
}

const VideoContainer = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const videoRef = useRef<HTMLDivElement>(null);

    const [isTeacher, setIsTeacher] = useState<boolean>(false);

    useEffect(() => {
        const fetchVideos = async () => {
            const token = JSON.parse(localStorage.getItem("sb-yhuhhyjrbuveavowpwlj-auth-token") || '""');
            let endpoint = "aluno";
            if (token.user.role === "teacher") {
                endpoint = "professor";
                setIsTeacher(true); // Set isTeacher to true if the user is a teacher
            }
            try {
                const response = await instance.get(`/videos/${endpoint}`, {
                    headers: { Authorization: `Bearer ${token.access_token}` }
                });
                const videoData = response.data.data;
                if (videoData.length > 0) {
                    setVideos(videoData);
                    setCurrentVideo(videoData[0]);
                } else {
                    setVideos([]);
                    setCurrentVideo(null);
                }
            } catch (error) {
                console.error("Error fetching videos:", error);
                alert("Erro ao buscar vídeos!");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const handleVideoChange = (video: Video) => {
        setCurrentVideo(video);
        if (videoRef.current) {
            videoRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Container className="text-center" style={{ position: 'relative' }}>
            {loading && (
                <div
                    style={{
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {!loading && (
                <Row className="mb-4">
                    <Col xs={12} md={8}>
                        {currentVideo ? (
                            <Card ref={videoRef}>
                                <Card.Title style={{ paddingBlock: "30px", fontWeight: "700", color: "rgb(0,200,250)", fontSize: "28px" }}>
                                    {currentVideo.nome_video}
                                </Card.Title>
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentVideo.video_url}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
                                ></iframe>
                                <Card.Text style={{ padding: "20px" }}>{currentVideo.comentario}</Card.Text>
                                {isTeacher && (
                                    <>
                                        <Button variant="primary" style={{backgroundColor:"rgb(0, 200, 250)",width:"120px",marginInline:"auto",marginBottom:"20px"}}>Editar Aula</Button>
                                    </>
                                )}
                            </Card>
                        ) : (
                            <Card>
                                <Card.Body>
                                    <Card.Title>Nenhum vídeo disponível</Card.Title>
                                    <Card.Text>Seu professor ainda não postou nenhum vídeo. Entre em contato com nosso suporte ao aluno!</Card.Text>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                    <Col xs={12} md={4}>
                        <VideoList
                            videos={videos}
                            currentVideo={currentVideo}
                            handleVideoChange={handleVideoChange}
                            isTeacher={isTeacher}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default VideoContainer;