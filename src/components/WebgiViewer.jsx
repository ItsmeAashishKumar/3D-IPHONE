import React,{useRef,useState,useCallback,forwardRef,useImperativeHandle, useEffect} from 'react'
import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    BloomPlugin,
    CanvasSnipperPlugin,
    GammaCorrectionPlugin,
    addBasePlugins,
    mobileAndTabletCheck,
    
} from "webgi";
import scrollAnimation from '../lib/scrollAnimation';
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)


const WebgiViewer=forwardRef((props,ref)=>{
    const canvasRef = useRef(null)
    const [viewerRef,setViewerRef]=useState(null)
    const [targetRef,setTargetRef]=useState(null)
    const [cameraRef,setCameraRef]=useState(null)
    const [positionRef,setPositionRef]=useState(null)
    const [previewMode,setPreviewMode]=useState(false)
    const [isMobile,setisMobile]=useState(null)
    const canvasContainerRef=useState(null)
    
    useImperativeHandle(ref,()=>({
        triggerPreview(){
            setPreviewMode(true)
            canvasContainerRef.current.style.pointerEvents="all"
            props.contentref.current.style.opacity="0";
            gsap.to(positionRef,{
                x:13.04,
                y:-2.01,
                z:2.29,
                duration:2,
                onUpdate:()=>{
                    viewerRef.setDirty();
                    cameraRef.positionTargetUpdated(true)
                }
            })

            gsap.to(targetRef,{
                x:0.11,
                y:0.0,
                z:0.0,
                duration:2
            })
            viewerRef.scene.activeCamera.setCameraOptions({controlsEnabled:true})
        }
    }))
    
    
    const memoizedAnimation=useCallback(
        (position,target,isMobile,onUpdate)=>{
            if(position&&target&&onUpdate){
                scrollAnimation(position,target,isMobile,onUpdate)
            }
        }
    )
    const setupViewer=useCallback(async()=>{
        // Initialize the viewer
        const viewer = new ViewerApp({
            canvas: canvasRef.current
        })

        setViewerRef(viewer)
         const camera=viewer.scene.activeCamera;

         const isMobileOrTablet=mobileAndTabletCheck();
         setisMobile(isMobileOrTablet)

        const position=camera.position
        const target=camera.target
        setCameraRef(camera)
        setTargetRef(target)
        setPositionRef(position)

        await viewer.addPlugin(GBufferPlugin)
        await viewer.addPlugin(new ProgressivePlugin(32))
        await viewer.addPlugin(new TonemapPlugin(true))
        await viewer.addPlugin(GammaCorrectionPlugin)
        await viewer.addPlugin(SSRPlugin)
        await viewer.addPlugin(SSAOPlugin)
        await viewer.addPlugin(BloomPlugin)

    
        const manager=await viewer.addPlugin(AssetManagerPlugin)

        await addBasePlugins(viewer)
        await viewer.addPlugin(CanvasSnipperPlugin)

        viewer.renderer.refreshPipeline()

        await manager.addFromPath('/scene-black.glb')
        //const model=await manager.addFromPath('/scene-black.glb')
    

        viewer.getPlugin(TonemapPlugin).config.clipBackground=true
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled:false})


        if(isMobileOrTablet){
            position.set(-16.7,1.17,11.7)
            target.set(0,1.37,0)
            props.contentref.current.className='mobile-or-tablet'
        }


        window.scroll(0,0)

        let needsUpdate=true
        const onUpdate=()=>{
            needsUpdate=true
            viewer.setDirty()
        }
        viewer.addEventListener("preFrame",()=>{
            if(needsUpdate){
                camera.positionTargetUpdated(true)
                needsUpdate=false
            }
            
        })

        memoizedAnimation(position,target,
            isMobileOrTablet,onUpdate)

    },[])

    useEffect(()=>{
        setupViewer()
    },[])
    const handleExit=useCallback(()=>{
        canvasContainerRef.current.style.pointerEvents="none"
        props.contentref.current.style.opacity="1";
        viewerRef.scene.activeCamera.setCameraOptions({controlsEnabled:false})
        setPreviewMode(false)

        gsap.to(positionRef,{
            x:!isMobile?1.56:9.36,
            y:!isMobile?5.0:10.95,
            z:!isMobile?0.01:0.09,
            scrollTrigger:{
                trigger:'.display-section',
                start:'top bottom',
                end:"top top",
                scrub:2,
                immediateRender:false
            },
            onUpdate:()=>{
                viewerRef.setDirty()
                cameraRef.positionTargetUpdated(true)
            }
        });
        gsap.to(targetRef,{
              x:!isMobile?-0.55:-1.62,
            y:!isMobile?0.32:0.02,
            z:!isMobile?0.0:-0.06,
            scrollTrigger:{
                trigger:'.display-section',
                start:'top bottom',
                end:"top top",
                scrub:2,
                immediateRender:false
            }
        })
    },[canvasContainerRef,viewerRef,positionRef,cameraRef,targetRef])
        

    return (
        <div ref={canvasContainerRef}id='webgi-canvas-container'>
            <canvas id='webgi-canvas' ref={canvasRef}/>
            {
                previewMode && (
                    <button className="button"
                    onClick={handleExit}>Exit</button>
                )
            }
        </div>
    )
})



export default WebgiViewer
