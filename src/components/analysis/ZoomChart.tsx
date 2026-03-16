'use client'

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

export default function ZoomChart({src}){

return(

<TransformWrapper
initialScale={1}
minScale={0.5}
maxScale={5}
centerOnInit
>

<TransformComponent>

<img
src={src}
className='w-full rounded-lg cursor-grab'
/>

</TransformComponent>

</TransformWrapper>

)

}
