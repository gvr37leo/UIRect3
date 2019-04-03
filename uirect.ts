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
            this.absRect.setH(PEvent.create(false,this.calcAbsRect(this.parent.get())))
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
        var offsethandles = [handleoffsetmin,handleoffsetmax]
        var anchorhandles = [handleanchormin,handleanchormax]




        this.parent.onchange.listen((val,old) => {
            handleanchormin.pos.setHP(false,this.calcAbsAnchorPos(this.anchormin.get()))
            handleanchormax.pos.setHP(false,this.calcAbsAnchorPos(this.anchormax.get()))
            var absrect = this.calcAbsRect(this.parent.get())
            handleoffsetmin.pos.setHP(false,absrect.min.c())
            handleoffsetmax.pos.setHP(false,absrect.max.c())
            this.absRect.setHP(false,absrect)
        })

        this.absRect.onchange.listen((e,old) => {
            handleoffsetmin.pos.setHP(e.handled,e.val.min.c())
            handleoffsetmax.pos.setHP(e.handled,e.val.max.c())
        })

        //when the inner data changes update the handles and the absrect

        var updateAnchor = (anchor: PEvent<Vector>,minormax:number) => {
            var handle = anchorhandles[minormax]
            handle.pos.setHP(anchor.handled,this.calcAbsAnchorPos(anchor.val))
            this.absRect.setHP(anchor.handled,this.calcAbsRect(this.parent.get()))
            // todo - update offset handle(s)
        }

        var updateOffset = (offset: PEvent<Vector>,minormax:number) => {
            var handle = offsethandles[minormax]
            this.absRect.setHP(offset.handled,this.calcAbsRect(this.parent.get()))

            var absrectvals = [this.absRect.get().min,this.absRect.get().max]
            handle.pos.setHP(offset.handled,absrectvals[minormax])
        }

        this.anchormin.onchange.listen(e => {
            updateAnchor(e,0)
        })

        this.anchormax.onchange.listen(e => {
            updateAnchor(e,1)
        })
        
        this.offsetmin.onchange.listen(e => {
            updateOffset(e,0)
        })

        this.offsetmax.onchange.listen(e => {
            updateOffset(e,1)
        })


        //when the handles change update the inner data
        var processAnchorChange = (anchorhandle,minormax:number) => {
            //update anchor
            //update absrect
            //update handleoffset


            // var pos = this.uirectInvlerp(this.parent.get().min,this.parent.get().max,e.val)
            // anchor.setH(PEvent.create(e.handled,pos))
        }

        var processOffsetChange = (e:PEvent<Vector>,minormax:number) => {
            //update offset
            //update absrect

            var offsethandle = offsethandles[minormax]
            var anchorhandle = anchorhandles[minormax]
            var pos = this.calcAbsAnchorPos(offsethandle.pos.get()).to(e.val)
            // offset.setH(PEvent.create(e.handled,pos))
        }

        handleanchormin.pos.onchange.listen(e => {
            processAnchorChange(e,0)
        })

        handleanchormax.pos.onchange.listen(e => {
            processAnchorChange(e,1)
        })

        handleoffsetmin.pos.onchange.listen(e => {
            processOffsetChange(e,0)
        })

        handleoffsetmax.pos.onchange.listen(e => {
            processOffsetChange(e,1)
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