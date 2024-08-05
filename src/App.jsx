import Nav from "./components/Nav";
import Jumbotron from "./components/Jumbotron";
import SoundSection from "./components/SoundSection";
import DisplaySection from "./components/DisplaySection";
import WebgiViewer from "./components/WebgiViewer";
import { useRef } from "react";
import Loader from "./components/Loader";

function App() {
  const contentref=useRef()
  const webgiViewRef=useRef()
  const handlePreview=()=>{
    webgiViewRef.current.triggerPreview()
  }
  return (
    <div className="App">
      <Loader/>
      <div ref={contentref} id="content">
      <Nav/>
      <Jumbotron/>
      <SoundSection/>
      <DisplaySection triggerPreview={handlePreview}/>
      </div>
      <WebgiViewer contentref={contentref} ref={webgiViewRef}/>
    </div>
  );
}

export default App;
