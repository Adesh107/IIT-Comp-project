import React, { forwardRef, useEffect, useRef, useState } from 'react'
import type { Project } from '../types';
import { iframeScript } from '../assets/assets';
import { Edit } from 'lucide-react';

interface ProjectPreviewProps{
    project: Project;
    isGenrating: boolean;
    device?: 'phone' | 'tablet' | 'desktop';
    showEditorialPanel?: boolean;
}

export interface ProjectPreviewRef {
  getCode: ()=> string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>( ({project, isGenrating, device = 'desktop',showEditorialPanel =true}, ref) => {

   const iframeRef =useRef<HTMLIFrameElement>(null)
   const [selectedElement, setSelectedElement] = useState<any>(null)

   const resolutions ={
    phone: 'w-[412px]',
    tablet: 'w-[762px]',
    desktop:'w-full'
   }

   useEffect(()=>{
    const handleMessage = (event: MessageEvent)=>{
        if(event.data.type === 'ELEMENT_SELECTED'){
            setSelectedElement(event.data.payload);
        }else if(event.data.type === 'CLEAR_SELECTION'){
            setSelectedElement(null)
        }
    }
    window.addEventListener('message', handleMessage);
    return ()=> window.removeEventListener('message', handleMessage)
   },[])

   const injectPreview = (html: string) =>{
    if(!html) return '';
    if(!showEditorialPanel) return html
    if(html.includes('</body>')){
        return html.replace('</body>',iframeScript + '</body>')
    }else{
        return html + iframeScript
    }

   }


  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
        {project.current_code ? (
        <>
        <iframe 
        ref={iframeRef} 
        srcDoc={injectPreview(project.current_code)}
        className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}/>
        {showEditorialPanel && selectedElement && (
            <
        )}
        </>
        ):isGenrating &&(
            <div>loading</div>

        )}
    </div>
  )
})

export default ProjectPreview