class Handle{
    selected:boolean
    pos:PBox<Vector>
    rect: Rect;

    constructor(pos:Vector,clickmanager:ClickManager){
        this.pos = new PBox(pos)
        
        this.pos.onchange.listen(e => {
            this.rect.moveEdgeTo(e.val,new Vector(0.5,0.5))
        })
        this.rect = Rect.fromWidthHeight(10,10,pos)
        clickmanager.listen(this.rect, () => {
            this.selected = true
        })

        document.addEventListener('mouseup', e => {
            this.selected = false
        })

        document.addEventListener('mousemove', e => {
            var mousepos = getMousePos(canvas,e)
            if(this.selected){
                
                this.pos.set(mousepos)
            }
        })
    }

    draw(ctxt:CanvasRenderingContext2D){
        this.pos.get().draw(ctxt)
        this.rect.draw(ctxt)
    }
}