const Progress = ({ item }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const isCompleted = item.progress === 100;

    if (item.type === 'album') {
        return (
            <div id={`album-${item.id}`} className={`status-item ${isCompleted ? 'completed' : ''}`}>
                <strong onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                    {isCollapsed ? '▶' : '▼'} {item.type}: {item.title}
                </strong>
                <div>{item.message}</div>
                <progress value={item.progress} max="100" />
                {!isCollapsed && (
                    <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                        {item.tracks.map((track) => (
                            <Progress key={`${track.type}-${track.id}`} item={track} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div id={`track-${item.id}`} className={`status-item ${isCompleted ? 'completed' : ''}`}>
            <strong>{item.type}: {item.title}</strong>
            <div>{item.message}</div>
            <progress value={item.progress} max="100" />
        </div>
    );
};

const App = () => {
    const [url, setUrl] = React.useState('');
    const [progress, setProgress] = React.useState({});
    const socketRef = React.useRef(null);

    React.useEffect(() => {
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            console.log(`connected: ${socketRef.current.id}`);
        });

        socketRef.current.on('disconnect', () => {
            console.log(`disconnected: ${socketRef.current.id}`);
        });

        socketRef.current.on('progress', (data) => {
            setProgress(prev => {
                const newProgress = { ...prev };

                if (data.type === 'album') {
                    const existingAlbum = newProgress[data.id] || { tracks: [] };
                    newProgress[data.id] = {
                        ...existingAlbum,
                        ...data,
                    };
                } else if (data.albumId) {
                    const existingAlbum = newProgress[data.albumId] || {
                        type: 'album',
                        id: data.albumId,
                        title: 'Loading album...',
                        progress: 0,
                        message: '',
                        tracks: [],
                    };

                    const newTracks = [...existingAlbum.tracks];
                    const existingIndex = newTracks.findIndex(p => p.id === data.id && p.type === data.type);

                    if (existingIndex !== -1) {
                        newTracks[existingIndex] = data;
                    } else {
                        newTracks.push(data);
                    }
                    
                    newProgress[data.albumId] = {
                        ...existingAlbum,
                        tracks: newTracks,
                    };
                } else {
                    newProgress[`${data.type}-${data.id}`] = data;
                }
                return newProgress;
            });
        });
        socketRef.current.on('error', (error) => {
            console.error(error);
            setProgress(prev => ({ ...prev, [`error-${Date.now()}`]: { type: 'error', title: 'Error', message: error, progress: 100 } }));
        });

        return () => socketRef.current.disconnect();
    }, []);

    const handleDownload = () => {
        setProgress({});
        socketRef.current.emit('download', url);
    };

    return (
        <div>
            <h1>TiddlExpressJs - WebUI Example</h1>
            <div className="url-bar">
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter a Tidal URL" />
                <button onClick={handleDownload}>Download</button>
            </div>
            <div className="status">
                {Object.values(progress)
                    .filter(p => p.type !== 'track' || !p.albumId)
                    .map((p) => (
                        <Progress key={`${p.type}-${p.id}`} item={p} />
                    ))}
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));