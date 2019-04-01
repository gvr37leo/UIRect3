class ClickManager{
    rects:Map<Rect,(pos:Vector) => void> = new Map()

    listenToDocument(){
        document.addEventListener('mousedown',e => {
            this.click(getMousePos(canvas,e))
        })
    }

    click(pos:Vector){
        for(var pair of this.rects.entries()){
            if(pair[0].collidePoint(pos)){
                pair[1](pos)
                break
            }
        }
    }

    listen(rect:Rect,cb:(pos:Vector) => void){
        this.rects.set(rect,cb)
    }

    delisten(rect:Rect){
        this.rects.delete(rect)
    }
}