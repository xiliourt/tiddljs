const Progress = ({ item }) => {
    const isCompleted = item.progress === 100;
    return (
        <div className={isCompleted ? 'completed' : ''}>
            <strong>{item.type}: {item.title}</strong>
            <div>{item.message}</div>
            <progress value={item.progress} max="100" />
        </div>
    );
};

const App = () => {
    const [url, setUrl] = React.useState('');
    const [progress, setProgress] = React.useState([]);
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
                const existingIndex = prev.findIndex(p => p.id === data.id && p.type === data.type);
                if (existingIndex !== -1) {
                    const newProgress = [...prev];
                    newProgress[existingIndex] = data;
                    return newProgress;
                }
                return [...prev, data];
            });
        });
        socketRef.current.on('error', (error) => {
            console.error(error);
            setProgress(prev => [...prev, { type: 'error', title: 'Error', message: error, progress: 100 }]);
        });

        return () => socketRef.current.disconnect();
    }, []);

    const handleDownload = () => {
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
                {progress.map((p, i) => (
                    <div key={`${p.type}-${p.id}`} className={`status-item ${p.progress === 100 ? 'completed' : ''}`}>
                        <Progress item={p} />
                    </div>
                ))}
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
