const Track = ({ item }) => {
    const isCompleted = item.progress === 100;
    return (
        <div id={`track-${item.id}`} className={`status-item ${isCompleted ? 'completed' : ''}`}>
            <strong>{item.type}: {item.title}</strong>
            <div>{item.message}</div>
            <progress value={item.progress} max="100" />
        </div>
    );
};

const Album = ({ item }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const isCompleted = item.progress === 100;
    return (
        <div id={`album-${item.id}`} className={`status-item ${isCompleted ? 'completed' : ''}`}>
            <strong onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                {isCollapsed ? '▶' : '▼'} {item.type}: {item.title}
            </strong>
            <div>{item.message}</div>
            <progress value={item.progress} max="100" />
            {!isCollapsed && (
                <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                    {Object.values(item.items || {}).map((track) => (
                        <Track key={`${track.type}-${track.id}`} item={track} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Playlist = ({ item }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const isCompleted = item.progress === 100;
    return (
        <div id={`playlist-${item.id}`} className={`status-item ${isCompleted ? 'completed' : ''}`}>
            <strong onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                {isCollapsed ? '▶' : '▼'} {item.type}: {item.title}
            </strong>
            <div>{item.message}</div>
            <progress value={item.progress} max="100" />
            {!isCollapsed && (
                <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                    {Object.values(item.items || {}).map((track) => (
                        <Track key={`${track.type}-${track.id}`} item={track} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Artist = ({ item }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    const isCompleted = item.progress === 100;
    return (
        <div id={`artist-${item.id}`} className={`status-item ${isCompleted ? 'completed' : ''}`}>
            <strong onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                {isCollapsed ? '▶' : '▼'} {item.type}: {item.title}
            </strong>
            <div>{item.message}</div>
            <progress value={item.progress} max="100" />
            {!isCollapsed && (
                <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                    {Object.values(item.items || {}).map((album) => (
                        <Album key={`${album.type}-${album.id}`} item={album} />
                    ))}
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [url, setUrl] = React.useState('');
    const [progress, setProgress] = React.useState({});
    const [isAuthed, setIsAuthed] = React.useState(false);
    const [deviceCode, setDeviceCode] = React.useState(null);
    const [timer, setTimer] = React.useState(null);
    const socketRef = React.useRef(null);

    React.useEffect(() => {
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            console.log(`connected: ${socketRef.current.id}`);
            socketRef.current.emit('getAuthStatus');
        });

        socketRef.current.on('disconnect', () => {
            console.log(`disconnected: ${socketRef.current.id}`);
        });

        socketRef.current.on('initialState', (data) => {
            setProgress(data);
        });

        socketRef.current.on('authStatus', (status) => {
            setIsAuthed(status);
            if (status) {
                setDeviceCode(null);
                setTimer(null);
            }
        });

        socketRef.current.on('deviceCode', (code) => {
            setDeviceCode(code);
            setTimer(300);
        });

        socketRef.current.on('progress', (data) => {
            setProgress(prev => {
                const newProgress = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation
                let currentLevel = newProgress;

                for (const link of data.chain) {
                    if (!currentLevel[link.id]) {
                        currentLevel[link.id] = { type: link.type, id: link.id, title: 'Loading...', progress: 0, message: '', items: {} };
                    }
                    currentLevel = currentLevel[link.id].items;
                }

                const existingItem = currentLevel[data.id] || {};
                currentLevel[data.id] = {
                    ...existingItem,
                    ...data,
                    items: existingItem.items || {}
                };

                return newProgress;
            });
        });
        socketRef.current.on('error', (error) => {
            console.error(error);
            setProgress(prev => ({ ...prev, [`error-${Date.now()}`]: { type: 'error', title: 'Error', message: error, progress: 100 } }));
        });

        return () => socketRef.current.disconnect();
    }, []);

    React.useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleDownload = () => {
        setProgress({});
        socketRef.current.emit('download', url);
    };

    const handleLogin = () => socketRef.current.emit('login');
    const handleLogout = () => socketRef.current.emit('logout');
    const handleRefresh = () => socketRef.current.emit('refresh');

    return (
        <div>
            <h1>TiddlExpressJs - WebUI Example</h1>
            <div className="auth-buttons">
                {isAuthed ? (
                    <>
                        <button onClick={handleLogout}>Logout</button>
                        <button onClick={handleRefresh}>Refresh</button>
                    </>
                ) : (
                    <button onClick={handleLogin}>Login</button>
                )}
            </div>
            {deviceCode && (
                <div className="login-block">
                    <h2>Login with Tidal</h2>
                    <button className="login-button" onClick={() => window.open(`https://${deviceCode.verificationUriComplete}`, '_blank')}>Click to Login with Tidal</button>
                    {timer > 0 && <p>Expires in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>}
                </div>
            )}
            {isAuthed && (
                <div className="url-bar">
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter a Tidal URL" />
                    <button onClick={handleDownload}>Download</button>
                </div>
            )}
            <div className="status">
                {Object.values(progress).map((p) => {
                    if (p.type === 'artist') {
                        return <Artist key={`${p.type}-${p.id}`} item={p} />;
                    }
                    if (p.type === 'album') {
                        return <Album key={`${p.type}-${p.id}`} item={p} />;
                    }
                    if (p.type === 'playlist') {
                        return <Playlist key={`${p.type}-${p.id}`} item={p} />;
                    }
                    return <Track key={`${p.type}-${p.id}`} item={p} />;
                })}
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));