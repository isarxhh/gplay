
import MusicPlayer from "./MusicPlayer";

function App(){
  return(
    <div className="h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-pink-200 to-blue-200">
      <div className=" bg-pink-200 shadow-lg rounded-lg p-6 ">
        <MusicPlayer />
      </div>
    </div>
  );
}

export default App;