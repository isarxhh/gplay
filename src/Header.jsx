import cross from './assets/cross.svg';
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useState } from "react";

export default function Header({ onImportLocal, onSearchOnline }) {
    const [showMenu, setShowMenu] = useState(false);

    const handleClose = () => {
        window.electronAPI.closeWindow();

    }
    return (
        <div className="flex justify-between items-center mb-2 select-none">
            <div className='relative'>
                <button onClick={() => setShowMenu(!showMenu)}>
                    <PiDotsThreeVerticalBold className="absolute -left-8 -top-1 w-8 h-7.5 text-pink-700" />
                </button>
                {showMenu && (
                    <div className="absolute mt-2 -left-4.5 bg-white rounded shadow-lg w-48 z-50">
                        <button onClick={() => { onImportLocal(); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-pink-100">Import Local</button>
                        <button onClick={() => { onSearchOnline(); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-100">Search Online</button>
                    </div>
                )}
            </div>
            <button
                onClick={handleClose}
                className="absolute left-80 top-2 cursor-pointer justify-left text-pink-500 font-bold px-3 py-1 rounded hover:bg-pink-100"
            >
                <img src={cross} alt="close" />
            </button>
        </div>
    );
}