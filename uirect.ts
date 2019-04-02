class UIRect{

    parent:Box<Rect>
    absRect:PBox<Rect>
    anchormax:PBox<Vector>
    anchormin:PBox<Vector>
    offsetmax:PBox<Vector>
    offsetmin:PBox<Vector>
    children:UIRect[] = []
    shouldupdateAbsRect = true

    constructor(anchormin:Vector,anchormax:Vector,offsetmin:Vector,offsetmax:Vector,parent:Box<Rect>){
        this.parent = parent
        this.anchormin = new PBox(anchormin)
        this.anchormax = new PBox(anchormax)
        this.offsetmin = new PBox(offsetmin)
        this.offsetmax = new PBox(offsetmax)
        this.absRect = new PBox(this.calcAbsRect(this.parent.get()))

        this.parent.onchange.listen((val,old) => {
            this.absRect.set(this.calcAbsRect(this.parent.get()))
        })
    }

    addChild(uirect:UIRect){
        this.children.push(uirect)
        uirect.parent.value = this.absRect.get()
    }


    attachHandles2UIRect(clickmanager:ClickManager):Handle[]{
        var absrect = this.absRect.get()
        
        var handleoffsetmin = new Handle(absrect.min,clickmanager)
        var handleoffsetmax = new Handle(absrect.max,clickmanager)
        var handleanchormin = new Handle(this.calcAbsAnchorPos(this.anchormin.get()),clickmanager)
        var handleanchormax = new Handle(this.calcAbsAnchorPos(this.anchormax.get()),clickmanager)

        
        this.parent.onchange.listen((val,old) => {
            handleanchormin.pos.set(this.calcAbsAnchorPos(this.anchormin.get()))
            handleanchormax.pos.set(this.calcAbsAnchorPos(this.anchormax.get()))
            //offset anchors are changed in absrect change
        })

        this.absRect.onchange.listen((e,old) => {
            this.shouldupdateAbsRect = false
            //these shouldnt trigger if event is handled
            handleoffsetmin.pos.setH(PEvent.create(e.handled,e.val.min.c()))
            handleoffsetmax.pos.setH(PEvent.create(e.handled,e.val.max.c()))
            this.shouldupdateAbsRect = true
        })

        //when the inner data changes update the handles and the absrect

        var updateAnchor = (e: PEvent<Vector>,handle: Handle) => {
            var pos = this.uirectlerp(this.parent.get().min,this.parent.get().max,e.val)
            handle.pos.setH(PEvent.create(e.handled,pos))
            if(this.shouldupdateAbsRect){
                this.absRect.set(this.calcAbsRect(this.parent.get()))
            }
        }

        var updateOffset = (e: PEvent<Vector>,anchor: PBox<Vector>,offset: PBox<Vector>,handleoffset: Handle) => {
            var pos = this.calcAbsAnchorPos(anchor.get()).add(offset.get())
            handleoffset.pos.setH(PEvent.create(e.handled,pos))
            if(this.shouldupdateAbsRect){
                this.absRect.set(this.calcAbsRect(this.parent.get()))
            }
        }

        this.anchormin.onchange.listen(e => {
            updateAnchor(e,handleanchormin)
        })

        this.anchormax.onchange.listen(e => {
            updateAnchor(e,handleanchormax)
        })
        
        this.offsetmin.onchange.listen(e => {
            updateOffset(e,this.anchormin,this.offsetmin,handleoffsetmin)
        })

        this.offsetmax.onchange.listen(e => {
            updateOffset(e,this.anchormax,this.offsetmax,handleoffsetmax)
        })


        //when the handles change update the inner data
        var processAnchorChange = (anchor,e) => {
            var pos = this.uirectInvlerp(this.parent.get().min,this.parent.get().max,e.val)
            anchor.setH(PEvent.create(e.handled,pos))
        }

        var processOffsetChange = (offset,anchor,e) => {
            var pos = this.calcAbsAnchorPos(anchor.get()).to(e.val)
            offset.setH(PEvent.create(e.handled,pos))
        }

        handleanchormin.pos.onchange.listen(e => {
            processAnchorChange(this.anchormin,e)
        })

        handleanchormax.pos.onchange.listen(e => {
            processAnchorChange(this.anchormax,e)
        })

        handleoffsetmin.pos.onchange.listen(e => {
            processOffsetChange(this.offsetmin,this.anchormin,e)
        })

        handleoffsetmax.pos.onchange.listen(e => {
            processOffsetChange(this.offsetmax,this.anchormax,e)
        })

        return [handleanchormin,handleanchormax,handleoffsetmin,handleoffsetmax]
    }

    draw(ctxt:CanvasRenderingContext2D){
        var absrect = this.absRect.get() //this.calcAbsRect(this.parent.get())
        var size = absrect.size()
        ctxt.strokeRect(absrect.min.x + 0.5,absrect.min.y + 0.5,size.x,size.y)
        this.children.forEach(c => c.draw(ctxt))
    }

    calcAbsAnchorPos(anchor:Vector){
        return this.uirectlerp(this.parent.get().min,this.parent.get().max,anchor)
    }

    calcAbsRect(absRectPar:Rect){
        var absmin = this.calcAbsAnchorPos(this.anchormin.get()).add(this.offsetmin.get())
        var absmax = this.calcAbsAnchorPos(this.anchormax.get()).add(this.offsetmax.get())
        return new Rect(absmin,absmax)
    }

    uirectlerp(a:Vector,b:Vector,w:Vector){
        return new Vector(lerp(a.x,b.x,w.x),lerp(a.y,b.y,w.y))
    }

    uirectInvlerp(a:Vector,b:Vector,w:Vector){
        return new Vector(inverselerp(a.x,b.x,w.x),inverselerp(a.y,b.y,w.y))
    }

}