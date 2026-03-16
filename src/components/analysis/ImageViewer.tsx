'use client'

import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

export default function ImageViewer({ src }: { src: string }) {
const [open,setOpen] = useState(false)

return(

<>

<img
src={src}
className="w-full rounded-lg cursor-pointer"
onClick={()=>setOpen(true)}
/>

{open && (

<div
className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
onClick={()=>setOpen(false)}
>

<div
className="w-[90%] max-w-6xl"
onClick={(e)=>e.stopPropagation()}
>
<TransformWrapper
initialScale={1}
minScale={0.5}
maxScale={5}
centerOnInit
>

<TransformComponent>

<img
src={src}
className="w-full object-contain"
/>

</TransformComponent>

</TransformWrapper>

</div>

</div>

)}

</>

)

}
