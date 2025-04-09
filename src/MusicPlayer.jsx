import { useState, useEffect } from "react";
import { clickSound } from "./sounds/click";
import { motion } from 'framer-motion';
import { parseBlob } from 'music-metadata-browser';

import Header from "./Header";

import previous from './assets/previous.svg';
import play from './assets/play.png';
import like from './assets/like.png';
import next from './assets/next.svg';
import pause from './assets/pause.png';
import shuffleenew from './assets/shuffleenew.svg';
import download from './assets/download.svg';
import repeat from './assets/repeat.svg';
import testSong from './assets/test.mp3';


export default function MusicPlayer() {
    const [songPath, setSongPath] = useState(testSong);
    const [songName, setSongName] = useState("No file Selected");
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [artistName, setArtistName] = useState("");
    const [albumName, setAlbumName] = useState("");
    const [albumCover, setAlbumCover] = useState(null);



    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            // For now, mock search results
            const dummyResults = [
                {
                    title: "Blinding Lights",
                    artist: "The Weeknd",
                    album: "After Hours",
                    cover: "https://i.scdn.co/image/ab67616d0000b273b11e6f6769e4f5fd197f785f",
                    duration: "3:20",
                },
                {
                    title: "Levitating",
                    artist: "Dua Lipa",
                    album: "Future Nostalgia",
                    cover: "https://i.scdn.co/image/ab67616d0000b2730c5b71cf176b23b66df4565e",
                    duration: "3:23",
                },
            ];

            setSearchResults(dummyResults);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const handleClick = () => {
        clickSound.currentTime = 0;
        clickSound.play();
    };

    const handleStop = () => {
        const audio = document.querySelector('audio');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        }
    };



    useEffect(() => {
        const audio = document.querySelector('audio');

        const updateProgress = () => {
            if (audio && audio.duration && !audio.paused) {
                const current = audio.currentTime;
                const total = audio.duration;
                const percent = (current / total) * 100;

                setCurrentTime(current);
                setDuration(total);
                setProgress(prev => {
                    if (percent === 0) return 0;
                    return percent > prev ? percent : prev;
                });
            }
        };

        if (audio) {
            audio.addEventListener("timeupdate", updateProgress);
        }

        return () => {
            if (audio) {
                audio.removeEventListener("timeupdate", updateProgress);
            }
        };
    }, [songPath]);


    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const audio = document.querySelector('audio');

            if (audio && audio.duration && !isNaN(audio.duration) && !audio.paused) {
                const currentProgress = (audio.currentTime / audio.duration) * 100;
                setProgress(prev => {
                    if (currentProgress === 0) return 0;
                    return currentProgress > prev ? currentProgress : prev;
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const [prevProgress, setPrevProgress] = useState(0);

    useEffect(() => {
        if (progress >= prevProgress) {
            setPrevProgress(progress);
        }
    }, [progress]);

    const controls = [
        { icon: previous, name: 'Previous' },
        { icon: play, name: 'Play' },
        { icon: next, name: 'Next' },
        { icon: pause, name: 'Pause' },
        { icon: like, name: 'Like' },
        { icon: shuffleenew, name: 'Shuffle' },
        { icon: download, name: 'Download' },
        { icon: repeat, name: 'Repeat' },
    ];
    const openOnlineSearchModal = () => {
        setShowSearchModal(true);
    };


    const handlePickFile = async () => {
        if (!window.electronAPI) {
            alert("This feature only works in the desktop app!");
            return;
        }
    
        try {
            const result = await window.electronAPI.pickFile();
            if (!result || result.canceled) {
                console.log("No file selected.");
                return;
            }
    
            const fullPath = result.filePaths[0];
            const cleanedPath = fullPath.replace(/\\/g, "/");
    
            // Read file as blob
            const buffer = await window.electronAPI.readFileAsBlob(fullPath);
            const blob = new Blob([buffer]);
    
            const blobURL = URL.createObjectURL(blob);
            setSongPath(blobURL);
    
            const metadata = await parseBlob(blob);
            console.log("Extracted metadata:", metadata);
    
            const common = metadata.common || {};
            setSongName(common.title || "Unknown Title");
            setArtistName(common.artist || "Unknown Artist");
            setAlbumName(common.album || "Unknown Album");
    
            if (common.picture && common.picture.length > 0) {
                const picture = common.picture[0];
                console.log("Album art format:", picture.format);
    
                try {
                    const base64String = btoa(
                        new Uint8Array(picture.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );
                    setAlbumCover(`data:${picture.format};base64,${base64String}`);
                } catch (e) {
                    console.error("Error processing image:", e);
                    setAlbumCover(null);
                }
            } else {
                setAlbumCover(null);
            }
    
        } catch (error) {
            console.error("Error picking or reading metadata:", error);
        }
    };
    

    return (
        <div className="bg-pink-200 rounded-2xl p-9 w-[350px]  mx-auto">
            <Header onImportLocal={handlePickFile} onSearchOnline={openOnlineSearchModal} />
            <div className="w-full aspect-sqaure rounded-md overflow-hidden">
                <div className="bg-blue-200 rounded-xl border-2 border-white h-56 w-3/3 mb-6 flex items-center justify-center text-gray-800 text-sm">
                    {albumCover ? (
                        <img
                            src={albumCover}
                            alt="Album Cover"
                            className="rounded-xl border-2 border-white h-56 w-full object-cover mb-6"
                        />
                    ) : (
                        <div className="bg-blue-200 rounded-xl border-2 border-white h-56 w-full mb-6 flex items-center justify-center text-gray-800 text-sm">
                            No Cover
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center mb-4">
                <h2 className="font-['Press_Start_2P'] *:text-xl text-pink-600 font-bold">{songName}</h2>
                <p className="font-['Press_Start_2P'] text-[9px] mt-4 text-blue-400">{artistName} • {albumName}</p>
            </div>



            <div className="space-y-3">
                <div className="font-['Press_Start_2P'] flex justify-between text-xs text-slate-100">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>


                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-pink-500"
                        animate={{ width: `${progress}%` }}
                        transition={{
                            duration: 0.5,
                            ease: "linear",
                        }}
                    />
                </div>


            </div>


            <div className="relative h-26 mt-6 flex items-center justify-center">
                <div className="flex items-center gap-8 absolute top-0 transform -translate-y-2 ml-1.5">
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={handleClick}
                    >
                        <img src={previous} alt="Previous" className="w-9 h-9" />
                    </motion.button>

                    <div className="flex items-center gap-6">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => {
                                handleClick();
                                const audio = document.querySelector('audio');
                                if (audio) {
                                    if (isPlaying) {
                                        audio.pause();
                                        setIsPlaying(false);
                                    } else {
                                        audio.play();
                                        setIsPlaying(true);
                                    }
                                }
                            }}
                        >
                            <img src={isPlaying ? pause : play} alt="Play/Pause" className="w-16 h-16" />
                        </motion.button>

                    </div>


                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={handleClick}
                    >
                        <img src={next} alt="Next" className="w-9 h-9" />
                    </motion.button>
                </div>

                <div className="absolute bottom-0 left-0 flex flex-col gap-5 items-center translate-y-1">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleClick}>
                        <img src={like} alt="Like" className="w-7 h-7" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleClick}>
                        <img src={repeat} alt="Repeat" className="w-6 h-6" />
                    </motion.button>
                </div>

                <div className="absolute bottom-0.25 right-0 flex flex-col gap-5 items-center translate-y-1">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleClick}>
                        <img src={download} alt="Download" className="w-7 h-6" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleClick}>
                        <img src={shuffleenew} alt="Shuffle" className="w-7 h-7" />
                    </motion.button>
                </div>
            </div>
            {songPath && (
                <audio
                    src={songPath}
                    autoPlay
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            )}

            {showSearchModal && (
                <div className="fixed inset-0 bg-blue-200 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative">
                        <button
                            className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
                            onClick={() => setShowSearchModal(false)}
                        >
                            ×
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-pink-600">Search Music Online</h2>

                        <input
                            type="text"
                            placeholder="Search for a song, artist..."
                            className="w-full p-2 border border-pink-300 rounded mb-4"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <button
                            onClick={handleSearch}
                            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition"
                        >
                            Search
                        </button>

                        {/* Placeholder for results */}
                        <div className="mt-4 space-y-2">
                            {searchResults.map((track, index) => (
                                <div key={index} className="p-2 border rounded flex items-center gap-2 hover:bg-pink-50 cursor-pointer">
                                    <img src={track.image} className="w-10 h-10 rounded" />
                                    <div>
                                        <p className="font-semibold text-sm">{track.title}</p>
                                        <p className="text-xs text-gray-500">{track.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
